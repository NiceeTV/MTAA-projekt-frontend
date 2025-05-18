import React, {useEffect, useRef, useState} from 'react';
import {
	View, Text, TextInput, TouchableOpacity,
	FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard
} from 'react-native';

import { useChatStore, Message } from '@/services/chatStore';
import {useOffline} from "@/context/OfflineContext";
import {useTheme} from "@/app/(tabs)/themecontext";
import {getBaseUrl} from "@/api/client";
import {MarkerData} from "@/types/Marker";
import {useAppNavigation} from "@/app/navigation";
import Constants from "expo-constants";
import { Dimensions } from 'react-native';
import { api } from '@/api/client';
import { AuthService } from '@/services/auth';


/**
 * Popis obrazovky Chat
 * Obrazovka Chat umožňuje užívateľovi komunikovať s AI asistentom v štýle chatovacej aplikácie. Je navrhnutá tak, aby zobrazovala históriu správ, umožňovala písať a odosielať nové správy, a tiež reagovala na špecifické odpovede asistenta zobrazovaním interaktívnych prvkov (napr. miest na mape).
 *
 * Hlavné funkcie a ich účel
 * Zobrazovanie správ
 * Používa FlatList na efektívne zobrazenie konverzácie medzi užívateľom a asistentom. Správy môžu byť od užívateľa alebo od asistenta a sú vizuálne odlíšené (farbou a zarovnaním).
 *
 * Odosielanie správ
 * Textové pole na zadanie správy a tlačidlo „Odoslať“. Po stlačení sa správa odošle na backend (API) a odpoveď asistenta sa automaticky načíta a zobrazí.
 *
 * Spracovanie odpovedí asistenta
 * Asistent môže vrátiť rôzne typy dát:
 *
 * Markers (miesta) – zobrazí zoznam miest s možnosťou otvoriť ich na mape.
 *
 * Trips (plány na viac dní) – zobrazí itinerár s možnosťou zobraziť všetky miesta daného dňa na mape.
 *
 * Správy – bežné textové odpovede bez štruktúrovaných dát.
 *
 * Interakcia s mapou
 * Pri kliknutí na „Ukázať na mape“ sa naviguje na mapovú obrazovku s predanými súradnicami (jedno miesto alebo viaceré).
 *
 * Ukladanie a načítanie správ
 * Používa vlastný chatStore (pravdepodobne cez Zustand alebo podobný state management) na správu stavu konverzácie.
 *
 * Automatické posúvanie
 * Po pridaní novej správy alebo po otvorení klávesnice sa chat automaticky posúva na spodok, aby bol zobrazený najnovší obsah.
 *
 * Podpora tmavého režimu
 * Dynamické štýly sa menia podľa toho, či je zapnutý tmavý režim, vrátane farieb pozadia, textu a okrajov.
 *
 * Spracovanie a validácia dát od asistenta
 * Paruje odpovede z JSON-u, identifikuje typ odpovede (dni, marker, správa) a na základe toho upravuje zobrazenie.
 *
 * Získavanie geolokačných súradníc
 * Pomocou Google Maps Geocoding API vie doplniť alebo overiť súradnice miest podľa ich názvov.
 *
 */


const screenWidth = Dimensions.get('window').width;

const inputWidth = screenWidth * 0.75;
const calculatedWidth = screenWidth - inputWidth;

const Chat = () => {
	const navigation = useAppNavigation();

	const messages = useChatStore((state) => state.messages);
	const addMessage = useChatStore((state) => state.addMessage);
	const setMessages = useChatStore((state) => state.setMessages);
	const loadMessages = useChatStore((state) => state.loadMessages);

	const [input, setInput] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const flatListRef = useRef<FlatList>(null);

	const { darkMode } = useTheme();
	const jeOffline = useOffline();
	const base_url = getBaseUrl();

	const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey || '';


	/* spracovanie správy od asistenta */
	type PlaceEntry = {
		name: string;
		lat: number;
		lng: number;
	};


	type TripDay = {
		day: string;
		markers: PlaceEntry[];
	}



	function parseAIResponse(response: string): 'markers' | 'trips' | 'message' {
		try {

			const dayKeys = Object.keys(response).filter(key => key.toLowerCase().startsWith('day'));
			const numberOfDays = dayKeys.length;

			if (numberOfDays === 1) {
				return 'markers';
			} else if (numberOfDays > 1) {
				return 'trips';
			} else {
				return 'message'; // JSON bez dní => niečo iné, považuj za message
			}
		} catch {
			// Nevalidný JSON => typ 3+
			return 'message';
		}
	}



	function getData(data: Record<string, PlaceEntry[]>): TripDay[] {
		return Object.entries(data)
			.filter(([key]) => key.startsWith('day'))
			.map(([day, markers]) => ({
				day,
				markers: markers.map(marker => ({
					...marker,
				})),
			}));
	}


	const fetchCoordinates = async (placeName: string) => {
		const encodedPlace = encodeURIComponent(placeName);
		const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedPlace}&key=${GOOGLE_MAPS_API_KEY}`;

		const response = await fetch(url);
		const data = await response.json();

		if (data.status === 'OK' && data.results.length > 0) {
			const location = data.results[0].geometry.location;
			return {
				lat: location.lat,
				lng: location.lng,
			};
		} else {
			throw new Error(`Nenájdené súradnice pre ${placeName}`);
		}
	};




	const handleShowOnMap = async (place: PlaceEntry) => {
		/* používa geolocation api na získanie reálnych súradníc */

		const markerData: MarkerData = {
			marker_id: '', // prázdne, ako si chcel
			marker_title: place.name,
			marker_description: '',
			location_x: place.lat,
			location_y: place.lng,
		};

		navigation.navigate('Map', {
			type: 'single',
			marker: markerData,
		});
	};




	/* načítanie správ pri loade */
	useEffect(() => {
		const load = async () => {
			await loadMessages();
		}

		load();
	}, []);

	useEffect(() => {
		setTimeout(() => {
			flatListRef.current?.scrollToEnd({ animated: true });
		}, 100);
	});

	useEffect(() => {
		const keyboardShowListener = Keyboard.addListener(
			Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
			() => {
				setTimeout(() => {
					flatListRef.current?.scrollToEnd({ animated: true });
				}, 100);
			}
		);

		return () => {
			keyboardShowListener.remove();
		};
	}, []);


	const themedStyles = getStyles(darkMode);

	/* poslať správu asistentovi */
	const sendMessage = async () => {
		if (!input.trim()) return;

		const userMessage: Message = { role: 'user', content: input };
		setInput('');
		setLoading(true);

		// Pridáme užívateľovu správu do konverzácie
		await addMessage(userMessage);

		try {
			const response = await fetch(`${base_url}/chat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: [userMessage] }),
			});

			const data = await response.json();

			if (data?.reply) {
				console.log("odpoved je ", data.reply);
				await addMessage(data.reply);
			}
		} catch {
			await addMessage({
				role: 'assistant',
				content: 'Chyba pri komunikácii so serverom.',
			});
		} finally {
			setLoading(false);
		}
	};

	const cleanSpecialChars = (text: string) => text.replace(/[\s]*[#\$%&]+$/, '').trim();


	/* vykreslenie správ */
	const renderItem = ({item}: { item: Message  }) => {

		if (item.role === 'assistant') {
			const type = parseAIResponse(item.content);


			if (type === "markers") {
				let parsedData: Record<string, PlaceEntry[]>;

				if (typeof item.content === 'string') {
					parsedData = JSON.parse(item.content);
				} else {
					parsedData = item.content;
				}

				let places = getData(parsedData);

				const day1Markers = places.find(entry => entry.day === "day1")?.markers || [];

				const newPlaces = day1Markers;

				if (newPlaces.length > 0) {
					return (
						<View style={[themedStyles.message, themedStyles.botMessage]}>
							{newPlaces.map((place, i) => {
								const isLastPlace = i === newPlaces.length - 1;

								return (
									<View
										key={i}
										style={[!isLastPlace && themedStyles.placeCard]}
									>
										<View style={themedStyles.placeHeader}>
											<Text selectable={true} style={themedStyles.placeName}>{place.name}</Text>
											<TouchableOpacity
												style={themedStyles.title_btn}
												onPress={() => handleShowOnMap(place)}
											>
												<Text style={themedStyles.buttonText}>Ukázať na mape</Text>
											</TouchableOpacity>
										</View>
									</View>
								);
							})}
						</View>
					);
				}
			}

			if (type === "trips") {
				let parsedTrips: Record<string, PlaceEntry[]>;

				if (typeof item.content === 'string') {
					parsedTrips = JSON.parse(item.content);
				} else {
					parsedTrips = item.content;
				}

				const trips = getData(parsedTrips);

				if (trips.length > 0) {
					return (
					<View style={[themedStyles.message, themedStyles.botMessage]}>
						{trips.map((day, index) => {
							const isLast = index === trips.length - 1;

							return (
								<View key={index} style={[!isLast && themedStyles.placeCard]}>

									<View style={themedStyles.placeHeader}>
										<Text style={themedStyles.placeName}>{day.day.replace(/^day(\d+)$/i, 'Day $1:')}</Text>

										<TouchableOpacity
											style={themedStyles.title_btn}
											onPress={() => {
												const markerData: MarkerData[] = day.markers
													.map(marker => {
														if (marker.lat != null && marker.lng != null) {
															return {
																marker_id: "",
																marker_title: marker.name,
																marker_description: '',
																location_x: marker.lat,
																location_y: marker.lng,
															};
														}
														return null;
													})
													.filter((m): m is MarkerData => m !== null);


												navigation.navigate('Map', {
													type: 'multiple',
													markers: markerData,
												});
											}}
										>
											<Text style={themedStyles.buttonText}>Zobraziť na mape</Text>
										</TouchableOpacity>
									</View>


									{day.markers.map((marker, i) => (
										<View key={i}>
											<Text style={themedStyles.tripMarkerName}>✶ {marker.name}</Text>
										</View>
									))}
								</View>
							);
						})}

					</View>
				)}

			}

			if (type === "message") {
				return (
					<View style={[themedStyles.message, themedStyles.botMessage]}>
						<Text selectable={true} style={themedStyles.messageText}>
							{cleanSpecialChars(item.content)}
						</Text>
					</View>
				);
			}
		}

		return (
			<View style={[themedStyles.message, themedStyles.userMessage]}>
				<Text selectable={true} style={themedStyles.messageText}>
					{item.content}
				</Text>
			</View>
		);
	}


	return (
		<View style={themedStyles.container}>
			<FlatList
				ref={flatListRef}
				data={messages}
				renderItem={renderItem}
				keyExtractor={(_, index) => index.toString()}
				contentContainerStyle={themedStyles.chatContainer}
				removeClippedSubviews={false}
				initialNumToRender={messages.length}
				maxToRenderPerBatch={messages.length}
				keyboardShouldPersistTaps="handled"
			/>

			{loading && <ActivityIndicator size="small" color="#888" style={{ marginBottom: 10 }} />}

		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}

		>
			<View style={themedStyles.inputContainer}>
				<TextInput
					value={input}
					onChangeText={setInput}
					style={themedStyles.input}
					placeholder="Napíš správu..."
					placeholderTextColor={darkMode ? "#aaa" : "#555"}
				/>
				<TouchableOpacity onPress={sendMessage} style={themedStyles.sendButton}>
					<Text style={themedStyles.sendText}>Odoslať</Text>
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>

		</View>
	);

};

const getStyles = (dark: boolean) =>
	StyleSheet.create({
		container: { flex: 1,
			backgroundColor: dark ? '#1a1a1a' : '#fff',
		},
		chatContainer: { padding: 10 },
		message: {
			padding: 10,
			marginVertical: 4,
			borderRadius: 8,
			maxWidth: '80%',
			backgroundColor: dark ? '#444' : '#fff',
			borderColor: dark ? '#555' : '#333',
			borderWidth: 1,
		},
		userMessage: {
			alignSelf: 'flex-end',
			borderColor: dark ? '#dcf8c6' : '#689F38',
			backgroundColor: dark ? 'transparent' : '#dcf8c6',
		},
		botMessage: {
			alignSelf: 'flex-start',
			marginVertical: 5,
			borderColor: dark ? '#2E5AAC' : '#2C3E50',
			backgroundColor: dark ? 'transparent' : '#EAF2F8',
		},
		lastMessage: {
			paddingBottom: 0,
		},
		messageText: {
			fontSize: 16,
			color: dark ? 'white' : 'black',
		},
		inputContainer: {
			flexDirection: 'row',
			padding: 10,
			borderTopWidth: 1,
			borderColor: dark ? '#444444' : '#ccc',
			backgroundColor: dark ? '#1a1a1a' : '#fff',
			gap: 10
		},
		input: {
			flex: 1,
			backgroundColor: dark ? '#2a2a2a' : '#fff',
			borderWidth: 1,
			borderColor: dark ? '#555' : '#888',
			borderRadius: 8,
			paddingHorizontal: 15,
			fontSize: 16,
			maxWidth: inputWidth,
			width: inputWidth,
			color: dark ? "#aaa" : "#555"
		},
		sendButton: {
			backgroundColor: dark ? '#444' : '#fff',
			borderColor: dark ? '#555' : '#888',
			borderWidth: 1,
			paddingVertical: 8,

			width: calculatedWidth,
			borderRadius: 8,
			alignItems: 'center',
			justifyContent: 'center',
		},
		sendText: {
			color: dark ? '#aaa' : '#555',
			fontSize: 17,
			fontWeight: 'bold',
		},

		placeCard: {
			marginBottom: 16,
			borderBottomWidth: 1,
			borderBottomColor: '#ccc',
			paddingBottom: 8,
		},
		placeHeader: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
		},
		placeName: {
			fontSize: 17,
			fontWeight: 'bold',
			flexShrink: 1,
			marginRight: 12,
			color: dark ? 'white' : 'black',
		},
		placeDescription: {
			marginTop: 4,
			color: dark ? 'white' : 'black',
		},
		tripMarkerName: {
			fontSize: 14,
			fontWeight: 'bold',
			flexShrink: 1,
			marginRight: 12,
			color: dark ? 'white' : 'black',
		},
		tripMarkerDescription: {
			color: dark ? 'white' : 'black',
			marginBottom: 10
		},
		title_btn: {
			borderWidth: 1,
			borderColor: dark ? '#2E5AAC' : '#2C3E50',  // Tmavá alebo svetlá farba okraja
			borderRadius: 10,
			paddingHorizontal: 15,
			paddingVertical: 5,
			alignItems: 'center',
			justifyContent: 'center',
		},
		buttonText: {
			color: dark ? '#fff' : '#000',  // Farba textu podľa režimu
		},
	})



export default Chat;
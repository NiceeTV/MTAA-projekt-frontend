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
		lon: number;
		description: string;
	};

	const parseAIResponse = (response: string) => {
		const trimmed = response.trim(); // odstráni medzery alebo nové riadky na konci
		const lastChar = trimmed.charAt(trimmed.length - 1);


		if (lastChar === '#') {
			return "markers";
		}

		if (lastChar === '&') {
			return "trips";
		}

	};


	const parseMarker = (response: string): PlaceEntry[] => {
		const entries: PlaceEntry[] = [];
		const lines = response.trim().split('\n');
		let current: Partial<PlaceEntry> = {};

		console.log(response);

		const cleanEnd = (text: string) => text.replace(/[\s]*[$#%&]+$/, '').trim();

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();

			// Miesto + súradnice
			const match = line.match(/^(.+)\s*\[(\d+\.\d+),\s*(\d+\.\d+)\]$/);
			if (match) {
				if (current.name) {
					entries.push(current as PlaceEntry);
				}

				current = {
					name: cleanEnd(match[1]),
					lat: parseFloat(match[2]),
					lon: parseFloat(match[3]),
					description: '',
				};
			} else if (current && current.name) {
				const cleanLine = cleanEnd(line);
				current.description += (current.description ? ' ' : '') + cleanLine;
			}
		}

		if (current.name && current.description) {
			current.description = cleanEnd(current.description);
			entries.push(current as PlaceEntry);
		}

		return entries;
	}



	const parseTripMarkers = (responseText: string) => {
		const days = responseText.split(/Deň\s\d:/).filter(Boolean);

		return days.map((dayText, index) => {
			const lines = dayText.trim().split('\n').filter(Boolean);
			const markers = [];

			for (let i = 0; i < lines.length; i += 2) {
				const nameMatch = lines[i].match(/^(.*)\s\[\d{2}\.\d+,\s\d{2}\.\d+\]$/);
				if (!nameMatch) continue;

				const name = nameMatch[1].trim();
				markers.push(name);
			}

			return {
				day: `Deň ${index + 1}`,
				markers // zoznam názvov miest
			};
		});
	};




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
		const coords = await fetchCoordinates(place.name);

		const markerData: MarkerData = {
			marker_id: '', // prázdne, ako si chcel
			marker_title: place.name,
			marker_description: place.description,
			location_x: coords ? coords.lat : place.lat,
			location_y: coords ? coords.lng : place.lon,
		};

		navigation.navigate('Map', {
			type: 'single',
			marker: markerData,
		});
	};




	/* načítanie správ pri loade */
	useEffect(() => {
		loadMessages();
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
				body: JSON.stringify({ messages: [...messages, userMessage] }),
			});

			const data = await response.json();

			if (data?.reply) {
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
			const lastChar = parseAIResponse(item.content);

			if (lastChar === "markers") {
				const places = parseMarker(item.content);
				if (places.length > 0) {
					return (
						<View style={[themedStyles.message, themedStyles.botMessage]}>
							{places.map((place, i) => {
								const isLastPlace = i === places.length - 1;

								return (
									<View
										key={i}
										style={[!isLastPlace && themedStyles.placeCard]} // použije iba ak NIE JE posledná správa
									>
										<View style={themedStyles.placeHeader}>
											<Text selectable={true} style={themedStyles.placeName}>{place.name}</Text>
											<TouchableOpacity style={themedStyles.title_btn} onPress={() => handleShowOnMap(place)}>
												<Text style={themedStyles.buttonText}>Ukázať na mape</Text>
											</TouchableOpacity>
										</View>
										{place.description !== '' && (
											<Text selectable={true} style={themedStyles.placeDescription}>{place.description}</Text>
										)}
									</View>
								);
							})}
						</View>
					);
				}
			}

			if (lastChar === "trips") {

			}






			return (
				<View style={[themedStyles.message, themedStyles.botMessage]}>
					<Text selectable={true} style={themedStyles.messageText}>
						{cleanSpecialChars(item.content)}
					</Text>
				</View>
			);

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
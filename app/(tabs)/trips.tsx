import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, FlatList, ListRenderItem, StyleSheet, Alert, ImageBackground} from 'react-native';
import { useTheme } from './themecontext';
import {useAppNavigation} from "@/app/navigation";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from "expo-secure-store";
import {AuthService} from "@/services/auth";
import { api, getBaseUrl } from '@/api/client';
import { useOffline } from '@/context/OfflineContext';
import * as FileSystem from 'expo-file-system';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {MarkerData} from "@/types/Marker";




type Trip = {
	trip_id: string;
	trip_title: string;
	start_date?: string;
	isNew?: boolean;
};

interface ImageSource {
	trip_id: string;
	imageUrl: string;
}



const Trips = () => {
	const { darkMode } = useTheme();
	const themedStyles = getStyles(darkMode);
	const navigation = useAppNavigation()


	const [myTrips, setMyTrips] = useState<any[]>([]);



	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const jeOffline = useOffline();

	let trip_ids;
	const [imageSources, setImageSources] = useState<ImageSource[]>([]);




	const askDelete = (): Promise<boolean> => {
		return new Promise((resolve) => {
			Alert.alert(
				'Potvrdiť vymazanie',
				'Skutočne chcete vymazať tento trip?',
				[
					{
						text: 'Zrušiť',
						onPress: () => {
							console.log('Zmazanie zrušené');
							resolve(false);
						},
						style: 'cancel',
					},
					{
						text: 'Zmazať',
						onPress: () => {
							resolve(true);
						},
					},
				],
				{ cancelable: false }
			);
		});
	};




	const deleteTrip = async (id: string) => {
		const result = await askDelete();
		if (!result) return;

		try {
			if (!jeOffline) {
				const user_id = await AuthService.getUserIdFromToken();
				const response = await api.delete(`/users/${user_id}/trip/${id}`,{});

				if (response) {
					Alert.alert("Úspech", "Trip bol úspešne vymazaný.")
				}
			}
			else {

				/* vymazanie trip info */
				const tripInfo = await SecureStore.getItemAsync('tripInfo');

				let newTrips: Trip[] = [];

				if (tripInfo) {
					newTrips = JSON.parse(tripInfo);
				}

				const updatedTrips = newTrips.filter(trip => trip.trip_id.toString() !== id);
				await SecureStore.setItemAsync('tripInfo', JSON.stringify(updatedTrips));



				/* vymazanie trip images */
				const tripImages = await SecureStore.getItemAsync('tripImages');
				let newImages: Trip[] = [];

				if (tripImages) {
					newImages = JSON.parse(tripImages);
				}

				const filteredImages = newImages.filter(img => img.trip_id.toString() !== id);
				await SecureStore.setItemAsync('tripImages', JSON.stringify(filteredImages));





				/* vymazanie trip markerov */
				const markers = await SecureStore.getItemAsync('tripMarkers');

				interface TripMarker {
					trip_id: string;
					markerIds: string[];
				}


				let newMarkers: TripMarker[] = [];

				if (markers) {
					newMarkers = JSON.parse(markers);
				}

				const updatedMarkers = newMarkers.filter(marker => marker.trip_id.toString() !== id);
				await SecureStore.setItemAsync('tripMarkers', JSON.stringify(updatedMarkers));



				Alert.alert("Úspech", "Trip bol úspešne vymazaný.")
			}

			navigation.navigate('Map');
		}
		catch (error) {
			throw error;
		}
	}



	/* načítanie tripov usera */
	useEffect(() => {
		if (jeOffline) {
			const loadTripData = async () => {
				try {
					// Načítanie uložených trip info a trip images zo Secure Store
					const tripInfo = await SecureStore.getItemAsync('tripInfo');
					const tripImages = await SecureStore.getItemAsync('tripImages');

					if (tripInfo) {
						const parsedTripInfo = JSON.parse(tripInfo);
						const parsedTripImages = tripImages ? JSON.parse(tripImages) : [];


						const allTripsWithDetails = parsedTripInfo.map((trip: any) => {
							const tripImageData = parsedTripImages.filter((image: any) => image.trip_id === trip.trip_id);


							const imageSources = tripImageData.flatMap((image: any) =>
								image.photos
									? image.photos
										.filter((photo: any) => photo && photo.uri)
										.map((photo: any) => ({
											trip_id: image.trip_id.toString(),
											imageUrl: photo.uri,
										}))
									: []
							);


							const formattedTrips: Trip[] = parsedTripInfo.map((trip: any) => ({
								trip_id: trip.trip_id.toString(),  // Prevod na string, ak je trip_id number
								trip_title: trip.tripData.trip_title,
								start_date: trip.tripData.start_date,
								isNew: false,
							}));

							setMyTrips(formattedTrips);
							setImageSources(imageSources);
						});

						return allTripsWithDetails;
					} else {
						console.log('No trip data found in Secure Store');
						return null;
					}
				} catch (error) {
					console.error('Error loading trip data:', error);
					return null;
				}
			};
			loadTripData();
		}
		else {

			const loadTrips = async () => {
				try {
					const user_id = await AuthService.getUserIdFromToken();
					const response = await api.get(`/users/${user_id}/trip`);


					/* ak sú markery, tak ich uložíme */
					if (response && response.length > 0) {
						const simplifiedTrips = response.map(({ trip_id, trip_title, start_date } : Trip) => ({
							trip_id,
							trip_title,
							start_date
						}));
						setMyTrips(simplifiedTrips);


						const trip_ids: string[] = simplifiedTrips.map((trip: any) => trip.trip_id);
						const imageResponses = await Promise.all(
							trip_ids.map(async (trip_id: string) => {
								try {
									const res = await api.get(`/trip/${trip_id}/images`);
									return { images: res.images ?? [] };
								} catch (error) {
									console.warn(`Nepodarilo sa načítať obrázky pre trip ${trip_id}:`, error);
									return { images: [] }; // fallback
								}
							})
						);



						const imagesByTripId = trip_ids.map((id, index) => ({
							trip_id: id,
							images: imageResponses[index].images
						}));



						const token = await AuthService.getToken();
						const newImageSources: ImageSource[] = [];
						const base_url = getBaseUrl();

						for (const response of imagesByTripId) {
							if (response.images && response.images.length > 0) {
								const firstImage = response.images[0];
								const imageUrl = `${base_url}${firstImage}`;
								const fileUri = FileSystem.documentDirectory + `trip_${response.trip_id}.jpg`;


								try {
									const downloadResumable = FileSystem.createDownloadResumable(
										imageUrl,
										fileUri,
										{
											headers: {
												Authorization: `Bearer ${token}`,
												Accept: 'image/jpeg',
											},
										}
									);

									const result = await downloadResumable.downloadAsync();


									if (result && result.uri) {
										newImageSources.push({ trip_id: response.trip_id, imageUrl: result.uri });
									} else {
										console.warn(`Sťahovanie obrázka zlyhalo pre trip ${response.trip_id}`);
									}

								} catch (error) {
									console.error(`Chyba pri sťahovaní obrázka pre trip ${response.trip_id}:`, error);
								}
							}
						}
						setImageSources(newImageSources);

					}
					else {
						setMyTrips([]);
					}
				} catch (error) {
					console.error('Chyba pri načítaní markerov:', error);
					Alert.alert('Chyba', 'Nepodarilo sa načítať markery.');
				}

			};
			loadTrips();
		}
	}, []);




	const hasNewTrip = myTrips.some((trip) => trip.isNew);

	if (!hasNewTrip) {
		myTrips.push({ trip_id: "0", trip_title: 'New Trip', isNew: true });
	}




	const renderTrip: ListRenderItem<Trip> = ({ item }) => {
		const tripImage = imageSources.find(image => image.trip_id === item.trip_id);

		return (
			<TouchableOpacity
				style={themedStyles.card}
				onPress={() => {
					if (item.isNew) {
						navigation.navigate('AddTrip', { markers: [] });
					} else {
						navigation.navigate('Trip', { trip_id: item.trip_id });
					}
				}}
			>

				{!item.isNew && (
					<TouchableOpacity onPress={() => deleteTrip(item.trip_id)} style={themedStyles.trash}>
						<FontAwesome name="trash" size={25} color={darkMode ? 'white' : 'black'} />
					</TouchableOpacity>
				)}

				{tripImage ? (
					<ImageBackground
						source={{ uri: tripImage.imageUrl }}
						style={themedStyles.tripImageBackground}
						resizeMode="cover"
						onError={(error) => {
							console.log('Image load error:', error.nativeEvent.error);
						}}
					>

						<View style={themedStyles.textOverlay}>
							<Text
								style={themedStyles.title}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{item.trip_title}
							</Text>

							{item.start_date ? (
								<Text style={themedStyles.date}>
									{new Date(item.start_date).toLocaleDateString('sk-SK', {
										day: 'numeric',
										month: 'numeric',
										year: 'numeric',
									})}
								</Text>
							) : null}
						</View>
					</ImageBackground>
				) : (


					<View style={themedStyles.tripImagePlaceholder}>

						{item.isNew ? (
							<AntDesign
								name="plus"
								size={50}
								color={darkMode ? 'white' : 'black'}
								style={themedStyles.plus}
							/>
						) : (
							<View style={{alignItems: 'center'}}>
								<Text
									style={themedStyles.title}
									numberOfLines={1}
									ellipsizeMode="tail"
								>
									{item.trip_title}
								</Text>

								{item.start_date ? (
									<Text style={themedStyles.date}>
										{new Date(item.start_date).toLocaleDateString('sk-SK', {
											day: 'numeric',
											month: 'numeric',
											year: 'numeric',
										})}
									</Text>
								) : null}
							</View>
						)}
					</View>
				)}
			</TouchableOpacity>
		);
	};


	return (
		<View style={themedStyles.container}>
			<Text style={themedStyles.header}>All Trips</Text>

			<View style={themedStyles.pickerContainer}>
				<Picker
					selectedValue={sortOrder}
					onValueChange={(value) => setSortOrder(value)}
					style={{color: darkMode ? 'white' : 'black'}}
				>
					<Picker.Item label="Vzostupne" value="asc" />
					<Picker.Item label="Zostupne" value="desc" />
				</Picker>
			</View>


			<FlatList
				data={myTrips}
				renderItem={renderTrip}
				keyExtractor={(item) => item.trip_id.toString()}
				numColumns={2}
				contentContainerStyle={themedStyles.list}
			/>
		</View>
	);
}

const getStyles = (dark: boolean) =>
	StyleSheet.create({

	container: {
		flex: 1,
		padding: 20,
		backgroundColor: dark ? '#1a1a1a' : '#fff',

	},
	header: {
		fontSize: 35,
		fontWeight: 'bold',
		marginLeft: 15,
		color: dark ? '#fff' : '#000',
	},
	title: {
		fontSize: 16,
		fontWeight: 'bold',
		color: dark ? 'white' : 'black',
		textAlign: 'left'
	},

	sync: {
		fontSize: 14
	},
	trash: {
		position: 'absolute',
		top: 10,
		right: 10,
		zIndex: 99,
	},
	sortButton: {
		marginVertical: 10,
		padding: 8,
		borderWidth: 1,
		borderRadius: 10,
		alignSelf: 'flex-start',
		width: '42%',
		height: 50,
		backgroundColor: 'white',
	},
	list: {
		padding: 10,
	},
	card: {
		backgroundColor: dark ? '#444' : 'white',
		borderRadius: 10,
		margin: 10,
		width: '42%',
		aspectRatio: 1,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
		borderColor: dark ? '#555' : '#333',
		borderWidth: 1,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	pickerContainer: {
		height: 40,
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: dark ? '#555' : '#C3C3C3',
		width: 165,
		backgroundColor: dark ? '#444' : '#f9f9f9',
		fontSize: 16,
		marginLeft: 20,
		borderRadius: 8,
		marginTop: 10,
		marginBottom: 10
	},




	plus: { margin: "auto"},
	date: {
		fontSize: 16,
		color: dark ? '#f2f2f2' : 'black',
		alignSelf: "center"
	},
	tripImageBackground: {
		width: 150, // Square size (adjust as needed)
		height: 150, // Equal to width for square
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden', // Prevent image overflow
		borderRadius: 10,
		borderColor: dark ? '#777' : '#333',
		borderWidth: 1,
	},
	textOverlay: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.1)', // Semi-transparent overlay
		width: '100%',
		height: '100%',
		padding: 10, // Padding for text
	},
	tripImagePlaceholder: {
		width: 150, // Match tripImageBackground size
		height: 150,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: dark ? '#444' : '#fff',
		borderColor: dark ? '#777' : '#333',
		borderWidth: 1,
		borderRadius: 10,
	},
	placeholderText: {
		fontSize: 16,
		color: dark ? '#f2f2f2' : 'black',
		textAlign: 'center',
	},
});


export default Trips;

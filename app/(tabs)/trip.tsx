import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Image, FlatList, ScrollView} from 'react-native';
import { useAppNavigation } from '../navigation';
import { api, getBaseUrl } from '@/api/client';
import { useTheme } from './themecontext';

import * as FileSystem from 'expo-file-system';
import {useOffline} from "@/context/OfflineContext";

import {AuthService} from "@/services/auth";
import * as SecureStore from "expo-secure-store";
import {Ionicons} from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import {MarkerData} from "@/types/Marker";



const Trip = ({ route }: any) => {
	const navigation = useAppNavigation();

	const { trip_id } = route?.params;
	const [title, setTitle] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const [rating, setRating] = useState<number>(1);
	const [date, setDate] = useState<string>('');

	const [visibility, setVisibility] = useState<'public' | 'private' | 'friends'>('public');
	const {darkMode} = useTheme();
	const styles = getStyles(darkMode);
	const jeOffline = useOffline();
	const [imageSources, setImageSources] = useState<ImageSource[]>([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedImage, setSelectedImage] = useState('');
	const [markers, setMarkers] = useState<MarkerData[]>();

	interface ImageSource {
		trip_id: string;
		imageUrl: string;
	}



	const openImage = (imageUrl: string) => {
		setSelectedImage(imageUrl);
		setModalVisible(true);
	};


	/* načítame info o tripe */
	useEffect(() => {
		if (jeOffline) {
			const loadTripOffline = async () => {
				const tripInfo = await SecureStore.getItemAsync('tripInfo');

				let filteredTripInfo = [];

				if (tripInfo) {
					const parsedTripInfo = JSON.parse(tripInfo);
					filteredTripInfo = parsedTripInfo.filter((trip: any) => trip.trip_id.toString() === trip_id);
					const trip_info = filteredTripInfo[0].tripData;


					setTitle(trip_info.trip_title);
					setDescription(trip_info.trip_description);
					setRating(parseInt(trip_info.rating, 10));
					setVisibility(trip_info.visibility);
					setDate(new Date(trip_info.start_date).toLocaleDateString('sk-SK', {
						day: 'numeric',
						month: 'numeric',
						year: 'numeric',
					}));
				}
			}

			loadTripOffline();
		}
		else {
			const loadTrip = async () => {
				const trip_get = await api.get(`/trip/${trip_id}`);

				if (trip_get) {
					setTitle(trip_get.trip.trip_title);
					setDescription(trip_get.trip.trip_description);
					setRating(parseInt(trip_get.trip.rating, 10));
					setVisibility(trip_get.trip.visibility);
					setDate(new Date(trip_get.trip.start_date).toLocaleDateString('sk-SK', {
						day: 'numeric',
						month: 'numeric',
						year: 'numeric',
					}));
				}

			}
			loadTrip();
		}
	}, []);


	useEffect(() => {
		const loadTripImages = async () => {
			if (jeOffline) {
				try {
					const tripImages = await SecureStore.getItemAsync('tripImages');
					let filteredTripImages = [];

					if (tripImages) {
						const parsedTripImages = JSON.parse(tripImages);
						filteredTripImages = parsedTripImages.filter((image: any) => image.trip_id.toString() === trip_id);

						const imageSources = filteredTripImages.flatMap((image: any) =>
							image.photos
								? image.photos
									.filter((photo: any) => photo && photo.uri)
									.map((photo: any) => ({
										trip_id: image.trip_id.toString(),
										imageUrl: photo.uri,
									}))
								: []
						);

						setImageSources(imageSources);
					}

				} catch (error) {
					console.error('Chyba pri načítaní offline dát:', error);
				}
				return;
			}

			try {
				const res = await api.get(`/trip/${trip_id}/images`);
				const images = res.images ?? [];

				if (images.length > 0) {
					const token = await AuthService.getToken();
					const base_url = getBaseUrl();
					const newImageSources: ImageSource[] = [];

					// Process each image
					for (let index = 0; index < images.length; index++) {
						const imagePath = images[index];
						const imageUrl = `${base_url}${imagePath}`;
						const fileUri = `${FileSystem.documentDirectory}trip_${trip_id}_${index}.jpg`;

						console.log(`Downloading image ${index + 1}/${images.length} from:`, imageUrl);

						try {
							const downloadResumable = FileSystem.createDownloadResumable(imageUrl, fileUri, {
								headers: {
									Authorization: `Bearer ${token}`,
									Accept: 'image/jpeg',
								},
							});

							const result = await downloadResumable.downloadAsync();

							if (result && result.uri) {
								newImageSources.push({ trip_id, imageUrl: result.uri });
							}
						} catch (error) {
							console.error(
								`Chyba pri sťahovaní obrázka ${index + 1} pre trip ${trip_id}:`,
								error
							);
						}
					}

					setImageSources(newImageSources);
					}
				} catch (error) {
					console.error(`Chyba pri sťahovaní obrázka pre trip ${trip_id}:`, error);
					setImageSources([]);
			}
		};

		loadTripImages();
	}, [jeOffline, trip_id]);



	/* markery */
	useEffect(() => {
		if (jeOffline) {
			const loadTripOffline = async () => {
				const tripMarkers = await SecureStore.getItemAsync('tripMarkers');

				let filteredMarkerInfo = [];

				if (tripMarkers) {
					const parsedTripMarkers = JSON.parse(tripMarkers);
					filteredMarkerInfo = parsedTripMarkers.filter((marker: any) => marker.trip_id.toString() === trip_id);
					const marker_ids = filteredMarkerInfo[0].markerIds;



					const storedMarkers = await SecureStore.getItemAsync('offlineMarkers');
					let markersNew = [];

					// Ak existujú nejaké markery, zparsingujeme ich, inak vytvoríme prázdny zoznam
					if (storedMarkers) {
						markersNew = JSON.parse(storedMarkers);
					}


					const filteredMarkers: MarkerData[] = markersNew.filter((marker: any) =>
						marker_ids.includes(marker.marker_id)
					).map((marker: any) => ({
						marker_id: marker.marker_id,
						marker_title: marker.marker_title,
						marker_description: marker.marker_description,
						location_x: marker.x_pos,
						location_y: marker.y_pos,
					}));


					setMarkers(filteredMarkers);
				}
			}

			loadTripOffline();
		}
		else {
			const loadTrip = async () => {
				const trip_get = await api.get(`/trip/${trip_id}`);

				if (trip_get) {
					setTitle(trip_get.trip.trip_title);
					setDescription(trip_get.trip.trip_description);
					setRating(parseInt(trip_get.trip.rating, 10));
					setVisibility(trip_get.trip.visibility);
					setDate(new Date(trip_get.trip.start_date).toLocaleDateString('sk-SK', {
						day: 'numeric',
						month: 'numeric',
						year: 'numeric',
					}));
				}


				/* načítanie markerov tripu */
				try {
					const trip_markers = await api.get(`/markers/${trip_id}`);

					if (trip_markers) {
						const filteredMarkers: MarkerData[] = trip_markers.map((marker: any) => ({
							marker_id: marker.marker_id,
							marker_title: marker.marker_title,
							marker_description: marker.marker_description,
							location_x: marker.x_pos,
							location_y: marker.y_pos,
						}));
						setMarkers(filteredMarkers);
					}
				}
				catch (error) {
					throw error;
				}
			}
			loadTrip();
		}
	}, []);




	return (
		<View style={styles.container}>
			<View style={styles.title_container}>
				<Text style={styles.header}>{title || 'Bez názvu'}</Text>
				<TouchableOpacity style={styles.title_btn} onPress={() => {
					if (markers && markers.length > 0) {
                        navigation.navigate('Map', {
                            type: 'multiple',
                            markers: markers,
                        });
                    }
				}}
				>
					<Text style={styles.buttonText}>Ukázať na mape</Text>
				</TouchableOpacity>
				<Text style={styles.header}>{date || ''}</Text>
			</View>


			<TouchableOpacity
				onPress={() => {
					navigation.navigate("Markers", {trip_id: trip_id});
				}}
				style={[
					styles.markerItem,
				]}
				activeOpacity={0.7}>

				<Ionicons
					name="location-sharp"
					size={37}

					color="red"
					style={{ marginRight: 10 }}
				/>
				<Text style={styles.markerText}>Zobraziť markery tripu</Text>
			</TouchableOpacity>


			<Text style={styles.descriptionInput}>
				{description || 'Bez popisu'}
			</Text>


			<View style={styles.ratingContainer}>
				<Text style={styles.ratingText}>Hodnotenie:</Text>
				<Text style={styles.ratingText2}>{rating}</Text>
				<AntDesign name="star" size={25} color='gold' />

				<View style={styles.visPicker}>
					<Text style={{color: darkMode ? 'white' : 'black'}}>{visibility.charAt(0).toUpperCase() + visibility.slice(1)}</Text>
				</View>
			</View>


			<View style={styles.photoContainer}>
				{Array.from({ length: 4 }).map((_, index) => {
					const img = imageSources[index];
					return (
						<TouchableOpacity
							key={`${trip_id}_${index}`}
							onPress={() => openImage(img?.imageUrl)}
							disabled={!img?.imageUrl} // Zakáže kliknutie, ak nie je obrázok
							style={styles.photoInput}
						>
							<Image
								source={{ uri: img?.imageUrl || 'https://via.placeholder.com/100' }} // Placeholder, ak nie je obrázok
								style={{width: '100%', height: '100%'}}
							/>
						</TouchableOpacity>
					);
				})}

				<Modal
					visible={modalVisible}
					transparent={true}
					animationType="fade"
					onRequestClose={() => setModalVisible(false)}
				>
					<TouchableOpacity
						style={styles.modalContainer}
						onPress={() => setModalVisible(false)}
					>
						<Image
							source={{ uri: selectedImage }}
							style={styles.fullScreenImage}
							resizeMode="contain"
						/>
					</TouchableOpacity>
				</Modal>


			</View>
		</View>
	);
};

const getStyles = (dark: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
			padding: 20,
			paddingTop: 0,
			backgroundColor: dark ? '#1a1a1a' : '#fff',
			justifyContent: 'flex-end',
			alignItems: 'center',
		},
		header: {
			fontSize: 24,
			fontWeight: 'bold',

			alignSelf: 'flex-start',
			marginLeft: 1,
			color: dark ? '#fff' : '#000',
			maxWidth: 120
		},
		title_container: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			width: '100%',
			marginBottom: 10,
			marginTop: 10,
		},
		input: {
			height: 40,
			borderColor: dark ? '#555' : '#ccc',
			borderWidth: 1,
			borderRadius: 8,
			marginBottom: 15,
			paddingHorizontal: 10,
			fontSize: 16,
			width: '100%',
			verticalAlign: 'middle',
			color: dark ? '#fff' : '#000', // Opravené
			backgroundColor: dark ? '#333' : '#f9f9f9',
		},

		descriptionInput: {
			flex: 1,
			width: '100%',
			minHeight: 100,
			maxHeight: '100%',
			textAlignVertical: 'top',
			padding: 10,
			fontSize: 16,
			borderRadius: 8,
			borderWidth: 1,
			color: dark ? '#fff' : '#000',
			backgroundColor: dark ? '#333' : '#f9f9f9',
		},

		button: {
			height: 50,
			borderColor: dark ? '#777' : '#333',
			borderWidth: 2,
			width: '100%',
			paddingLeft: 10,
			paddingRight: 10,
			borderRadius: 15,
			backgroundColor: dark ? '#444' : '#fff',
			justifyContent: 'center',
			alignItems: 'center',
		},


		photo: {
			width: '100%',
			height: '100%',
			resizeMode: 'cover',
		},

		markerText: {
			flex: 1,
			fontSize: 16,
			color: dark ? '#fff' : '#000',
		},

		markerItem: {
			flexDirection: 'row',
			alignItems: 'center',
			borderRadius: 20,
			paddingHorizontal: 10,
			height: 60,
			marginTop: 10,

			borderWidth: 2,
			borderColor: dark ? '#555' : '#C3C3C3',
			backgroundColor: dark ? '#444' : '#f9f9f9',
			marginBottom: 15,
		},

		list: {
			paddingBottom: 20,
		},
		photoContainer: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			justifyContent: 'space-between',
			width: '100%',
			marginBottom: 0,
		},
		photoInput: {
			width: '48%', // Dve fotky vedľa seba
			height: 100,
			borderWidth: 1,
			borderColor: dark ? '#555' : '#ccc',
			borderRadius: 8,
			justifyContent: 'center',
			alignItems: 'center',
			marginBottom: 10,
			backgroundColor: dark ? '#333' : '#f9f9f9',
		},
		ratingInput: {
			width: 50,
		},
		visPicker: {
			height: 40,
			justifyContent: 'center',

			borderWidth: 1,
			borderColor: dark ? '#555' : '#C3C3C3',
			width: 140,
			backgroundColor: dark ? '#444' : '#f9f9f9',
			fontSize: 16,
			marginLeft: "auto",
			borderRadius: 8,
			marginRight: 4,
			paddingLeft: 15,
			textTransform: 'capitalize',
		},
		ratingContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			width: '100%',
			justifyContent: 'flex-start',
			height: 40,
			marginVertical: 5,
			gap: 20,
			marginLeft: 5,
			marginTop: 15,
			marginBottom: 15,
		},
		ratingText: {
			color: dark ? '#fff' : '#000',
			fontSize: 16,
			fontWeight: 'bold',
			marginRight: -10
		},
		ratingText2: {
			color: 'gold',
			fontSize: 20,
			fontWeight: 'bold',
			marginRight: -15
		},
		modalContainer: {
			flex: 1,
			backgroundColor: 'rgba(0, 0, 0, 0.9)',
			justifyContent: 'center',
			alignItems: 'center',
		},
		fullScreenImage: {
			width: '90%',
			height: '90%',
		},
		title_btn: {
			borderWidth: 1,
			borderColor: dark ? '#555' : '#ccc',  // Tmavá alebo svetlá farba okraja
			borderRadius: 10,
			paddingHorizontal: 15,
			paddingVertical: 5,
			alignItems: 'center',
			justifyContent: 'center',
		},
		buttonText: {
			color: dark ? '#fff' : '#000',  // Farba textu podľa režimu
		},
	});


export default Trip;
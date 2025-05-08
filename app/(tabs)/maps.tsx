import React, {useEffect, useState, useRef} from 'react';
import {View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, Dimensions, Button, Alert, KeyboardAvoidingView, Keyboard} from 'react-native';
import { useAppNavigation } from '../navigation';
import MapView, { Marker, MapPressEvent, LatLng  } from 'react-native-maps';
import MapEvent from "react-native-maps";
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Location from 'expo-location';
import axios from "axios";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Maps = () => {
	const navigation = useAppNavigation()


	const [isKeyboardVisible, setKeyboardVisible] = useState(false);

	const [userLocation, setUserLocation] = useState<LatLng | null>(null);
	const [marker, setMarker] = useState<LatLng | null>(null);
	const [initialRegion, setInitialRegion] = useState({
		latitude: 35.2271, // Fallback súradnice
		longitude: -80.8431,
		latitudeDelta: 0.01,
		longitudeDelta: 0.01,
	});



	const [region, setRegion] = useState<any>(null); // Bude obsahovať aktuálnu polohu
	const [error, setError] = useState<string | null>(null);

	const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
	const mapRef = useRef<MapView | null>(null);
	const [isSelectingFromAutocomplete, setIsSelectingFromAutocomplete] = useState(false);



	const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey || '';


	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener(
			'keyboardDidShow',
			() => {
				setKeyboardVisible(true);
			}
		);
		const keyboardDidHideListener = Keyboard.addListener(
			'keyboardDidHide',
			() => {
				setKeyboardVisible(false);
			}
		);

		return () => {
			keyboardDidShowListener.remove();
			keyboardDidHideListener.remove();
		};
	}, []);




	useEffect(() => {
		const getLocation = async () => {
			try {
				// Požiadať o povolenie na prístup k polohe
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status !== 'granted') {
					setError('Permission to access location was denied');
					return;
				}

				// Získanie aktuálnej polohy
				const location = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.High,
				});


				const userCoords = {
					latitude: location.coords.latitude,
					longitude: location.coords.longitude,
				};
				setUserLocation(userCoords);

				setRegion({
					latitude: location.coords.latitude,
					longitude: location.coords.longitude,
					latitudeDelta: 0.01,
					longitudeDelta: 0.01,
				});
			} catch (error) {
				let message = "Chyba pri získavaní polohy.";
				if (axios.isAxiosError(error)) {
					message = error.response?.data?.message || message;
				}

				setError('Error fetching location: ' + message);
			}
		};

		getLocation(); // Zavoláme funkciu na získanie polohy
	}, []);



	const handleAddMarker = () => {
		setMarker({
			latitude: initialRegion.latitude,
			longitude: initialRegion.longitude,
		});
	};

	const handleDeleteMarker = () => {
		setMarker(null);
	};

	const handleMapPress = (event: MapPressEvent) => {
		if (isSelectingFromAutocomplete) return;

		const { coordinate } = event.nativeEvent; // Získame súradnice kliknutia
		setMarker(coordinate); // Nastavíme marker na tieto súradnice
	};

	const handlePlaceSelect = async (data: any, details: any) => {
		setIsSelectingFromAutocomplete(true);

		if (details && details.geometry && details.geometry.location) {
			const { lat, lng } = details.geometry.location;
			const newRegion = {
				latitude: lat,
				longitude: lng,
				latitudeDelta: 0.01,
				longitudeDelta: 0.01,
			};
			setMarker({
				latitude: lat,
				longitude: lng,
			});
			setInitialRegion(newRegion);

			Keyboard.dismiss();

			console.log("presuvame sa na ", newRegion.latitude, newRegion.longitude, mapRef);

			setTimeout(() => {
				// Uistíme sa, že máme správnu referenciu na mapu pred animovaním
				if (mapRef.current) {
					mapRef.current.animateToRegion(newRegion, 1000);
				}
				setIsSelectingFromAutocomplete(false);
			}, 300);
		} else {
			Alert.alert('Chyba', 'Nepodarilo sa získať súradnice vybraného miesta.');
			setIsSelectingFromAutocomplete(false);
		}
	};


	return (
		<View style={styles.container}>
			<View>
				<GooglePlacesAutocomplete
					placeholder="Hľadať miesto"
					onPress={handlePlaceSelect}
					fetchDetails={true}
					query={{
						key: GOOGLE_MAPS_API_KEY,
						language: 'sk',
						components: 'country:sk',
					}}
					styles={{
						container: styles.searchBarContainer,
						textInput: styles.searchBar,
						listView: styles.autocompleteList,
						description: styles.description,
					}}
					enablePoweredByContainer={false}
					debounce={200}
					onFail={(error) => console.error('Autocomplete error:', error)}
				/>
			</View>

			{(isSelectingFromAutocomplete || !isKeyboardVisible) ? (
				<>
					<View style={styles.mapContainer}>
						{region ? (
							<MapView
								ref={mapRef}
								style={styles.map}
								region={region}
								onPress={handleMapPress}
								pointerEvents={isSelectingFromAutocomplete ? 'none' : 'auto'}
							>
								{marker && (
									<Marker coordinate={marker} />
								)}
								{userLocation?.latitude && userLocation?.longitude && (
									<Marker
										coordinate={userLocation}
										pinColor="#40C4FF"
										title="Moja poloha"
									/>
								)}
							</MapView>
						) : (
							<Text style={styles.loadingText}>Loading your location...</Text>
						)}
					</View>
					<View style={styles.buttonContainer}>
						<TouchableOpacity style={styles.button} onPress={handleAddMarker}>
							<Text style={styles.buttonText}>Add marker</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.button} onPress={handleDeleteMarker}>
							<Text style={styles.buttonText}>Delete marker</Text>
						</TouchableOpacity>
					</View>
				</>
			) : null}
			{typeof error === 'string' && !!error ? (
				<Text style={styles.errorText}>{error}</Text>
			) : null}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: '#fff',
		justifyContent: 'space-between', // Zaručuje, že tlačidlá sú na spodnej časti
	},

	mapContainer: {
		flex: 1, // Mapa teraz zaberie čo najviac miesta
		borderRadius: 5,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: '#ccc',
		marginBottom: 20,
	},
	map: {
		width: '100%',
		height: '100%',
	},
	buttonContainer: {
		width: '100%',
		gap: 10,

	},
	button: {
		flexDirection: 'row',
		height: 50,
		borderColor: '#333',
		borderWidth: 2,

		paddingLeft: 10,
		paddingRight: 10,
		borderRadius: 15,
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
	},
	buttonText: {
		color: 'black',
		fontSize: 18,
		marginLeft: 5,
		fontWeight: 'bold',
	},
	errorText: {
		color: 'red',
		fontSize: 14,
		textAlign: 'center',
		marginTop: 10,
	},
	loadingText: {
		fontSize: 14,
		textAlign: 'center',
		marginTop: 10,
	},

	searchBarContainer: {
		width: '100%',
		flex: 1,
		marginBottom: 50,
	},
	searchBar: {
		height: 40,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		paddingHorizontal: 10,
		fontSize: 16,
		backgroundColor: '#fff',
	},
	autocompleteList: {
		position: 'absolute',
		top: 40,
		left: 0,
		right: 0,
		backgroundColor: '#fff',
		borderWidth: 1,
		borderRadius: 5,
		borderColor: '#ccc',
		zIndex: 20,
	},
	description: {
		fontSize: 14,
		color: '#333',
		paddingVertical: 5,
	},
});

export default Maps;

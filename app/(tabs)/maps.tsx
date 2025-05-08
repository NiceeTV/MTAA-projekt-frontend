import React, {useEffect, useState} from 'react';
import {View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, Dimensions, Button, Alert} from 'react-native';
import { useAppNavigation } from '../navigation';
import MapView, { Marker, MapPressEvent, LatLng  } from 'react-native-maps';
import MapEvent from "react-native-maps";
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Location from 'expo-location';
import axios from "axios";


const Maps = () => {
	const navigation = useAppNavigation()



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
		const { coordinate } = event.nativeEvent; // Získame súradnice kliknutia
		setMarker(coordinate); // Nastavíme marker na tieto súradnice
	};

	 return (
		 <View style={styles.container}>
			 <TextInput
				 placeholder="Search location"
				 style={styles.searchBar}
			 />
			 <View style={styles.mapContainer}>
				 {region ? (
					 <MapView
						 style={styles.map}
						 region={region} // Nastavenie mapy na aktuálnu polohu
						 onPress={handleMapPress} // Zavoláme handleMapPress pri kliknutí na mapu
					 >
						 {marker && (
							 <Marker coordinate={marker} />
						 )}
						 {userLocation && userLocation.latitude && userLocation.longitude && (
							 <Marker
								 coordinate={userLocation}
								 pinColor="white" // Modrý marker
								 title="Moja poloha"
							 />
						 )}
					 </MapView>
				 ) : (
					 <Text style={styles.loadingText}>Loading your location...</Text> // Zobrazenie, kým sa nenačíta lokalita
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
			 {error && <Text style={styles.errorText}>{error}</Text>} {/* Zobrazenie chyby, ak nastane */}
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
	searchBar: {
		height: 45,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 10,
		paddingHorizontal: 15,
		marginBottom: 20,
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
		marginBottom: 20,
	},
	button: {
		flexDirection: 'row',
		height: 50,
		borderColor: '#333',
		borderWidth: 2,

		paddingLeft: 10,
		paddingRight: 10,
		borderRadius: 20,
		backgroundColor: 'white',
		justifyContent: 'space-between',
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
	}
});

export default Maps;

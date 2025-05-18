import React, {useEffect, useState, useRef} from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Alert,
	Keyboard,
} from 'react-native';
import { useAppNavigation } from '../navigation';
import MapView, {Marker, MapPressEvent, LatLng, Polyline, UrlTile, Region, Polygon} from 'react-native-maps';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';



import { useOffline } from '@/context/OfflineContext';
import { useLocationPermission } from '@/context/PermissionProvider';


import * as Location from 'expo-location';
import axios from "axios";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { AuthService } from '@/services/auth';
import { api } from '@/api/client';
import { MarkerData } from '@/types/Marker';
import { useTheme } from './themecontext';

import Constants from 'expo-constants';





// Konštanta pre OpenStreetMap dlaždice
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const CACHE_DIR = `${FileSystem.documentDirectory}mapTiles/`;
const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey || '';




const Maps = React.memo(({ route }: any) => {
	const navigation = useAppNavigation()
	const params = route?.params;


	const jeOffline = useOffline();
	const { permissionGranted, requestPermission } = useLocationPermission();


	const [myMarkers, setMyMarkers] = useState<any[]>([]);

	const [isKeyboardVisible, setKeyboardVisible] = useState(false);
	const [isGridVisible, setIsGridVisible] = useState(false);

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

	const mapRef = useRef<MapView | null>(null);
	const [isSelectingFromAutocomplete, setIsSelectingFromAutocomplete] = useState(false);
	const [selectedPoiInfo, setSelectedPoiInfo] = useState<{ name: string, coordinate: LatLng } | null>(null);
	const [canMarker, setCanMarker] = useState(true);

	const [polylineCoords, setPolylineCoords] = useState<LatLng[]>([]);
	const [multipleMarkerCoords, setMultipleMarkerCoords] = useState<LatLng[]>([]);
	const [multipleMarkers, setMultipleMarkers] = useState<MarkerData[]>([]);
	const { darkMode } = useTheme();



	/*** OFFLINE REZIM ***/
	const cacheTile = async (x: number, y: number, z: number) => {
		const tileUrl = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
		const tilePath = `${CACHE_DIR}${z}_${x}_${y}.png`;
		console.log("Tile path:", tilePath);

		console.log("stahujem");

		try {
			// Skontroluj, či dlaždica už existuje
			const fileInfo = await FileSystem.getInfoAsync(tilePath);
			if (!fileInfo.exists) {
				await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
				const downloadResult = await FileSystem.downloadAsync(tileUrl, tilePath);
				console.log("Stiahnuté:", downloadResult);
			}
		} catch (error) {
			console.error('Chyba pri cachovaní dlaždice:', error);
		}
	};




	function tile2latlngBounds(x: number, y: number, z: number): [[number, number], [number, number]] {
		const n = Math.pow(2, z);
		const lonLeft = (x / n) * 360 - 180;
		const lonRight = ((x + 1) / n) * 360 - 180;

		function tile2lat(y: number) {
			const rad = Math.PI - (2 * Math.PI * y) / n;
			return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(rad) - Math.exp(-rad)));
		}

		const latTop = tile2lat(y);
		const latBottom = tile2lat(y + 1);

		return [
			[latBottom, lonLeft], // southwest
			[latTop, lonRight],   // northeast
		];
	}


	const loadCachedTiles = async () => {
		const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
		const tiles: PolygonData[] = [];

		files.forEach((file) => {
			const match = file.match(/^(\d+)_(\d+)_(\d+)\.png$/);
			if (match) {
				const [_, z, x, y] = match.map(Number);
				const [[south, west], [north, east]] = tile2latlngBounds(x, y, z);

				tiles.push({
					id: file,
					coordinates: [
						{ latitude: north, longitude: west },
						{ latitude: north, longitude: east },
						{ latitude: south, longitude: east },
						{ latitude: south, longitude: west },
					],
				});
			}
		});

		return tiles;
	};

	type PolygonData = {
		id: string;
		coordinates: { latitude: number; longitude: number }[];
	};

	const [tilePolygons, setTilePolygons] = useState<PolygonData[]>([]);
	useEffect(() => {
		loadCachedTiles().then(setTilePolygons);
	}, []);


	const mapCustomStyle = [ { "elementType": "geometry", "stylers": [ { "color": "#242f3e" } ] }, { "elementType": "labels.text.fill", "stylers": [ { "color": "#746855" } ] }, { "elementType": "labels.text.stroke", "stylers": [ { "color": "#242f3e" } ] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [ { "color": "#263c3f" } ] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#6b9a76" } ] }, { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#38414e" } ] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [ { "color": "#212a37" } ] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#9ca5b3" } ] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#746855" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#1f2835" } ] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [ { "color": "#f3d19c" } ] }, { "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#2f3948" } ] }, { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#17263c" } ] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#515c6d" } ] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [ { "color": "#17263c" } ] } ]


	const loadMarkersFromStorage = async () => {
		try {
			const markers = await SecureStore.getItemAsync('offlineMarkers');
			if (markers) {
				setMyMarkers(JSON.parse(markers));
			}
		} catch (error) {
			console.error('Chyba pri načítaní markerov:', error);
		}
	};


	useEffect(() => {
		if (params) {
			if (params.type === 'single') {
				const singleMarker = params.marker;
				focusOnSingleMarker(singleMarker);

			} else if (params.type === 'multiple') {
				const multipleMarkers = params.markers;
				drawMultipleMarkersWithPolyline(multipleMarkers);
			}
		}
	}, [params]);



	const focusOnSingleMarker = (marker: MarkerData) => {
		const coordinate = {
			latitude: marker.location_x,
			longitude: marker.location_y,
		};

		console.log(marker);

		if (mapRef.current) {
			mapRef.current.animateToRegion({
				...coordinate,
				latitudeDelta: 0.01,
				longitudeDelta: 0.01,
			}, 1000);
		}

		setRegion({
			...coordinate,
			latitudeDelta: 0.01,
			longitudeDelta: 0.01,
		});

		setMarker(coordinate);
	};


	const drawMultipleMarkersWithPolyline = (markers: MarkerData[]) => {
		if (markers.length === 0) return;

		setMultipleMarkers(markers);

		const coordinates = markers.map(marker => ({
			latitude: marker.location_x,
			longitude: marker.location_y,
		}));



		setMultipleMarkerCoords(coordinates);
		setPolylineCoords(coordinates);

		const averageLatitude = coordinates.reduce((sum, coord) => sum + coord.latitude, 0) / coordinates.length;
		const averageLongitude = coordinates.reduce((sum, coord) => sum + coord.longitude, 0) / coordinates.length;


		setRegion({
			latitude: averageLatitude,
			longitude: averageLongitude,
			latitudeDelta: 0.01,  // Priblíženie mapy
			longitudeDelta: 0.01, // Priblíženie mapy
		});


		/* počkáme kým sa načíta mapa */
		setTimeout(() => {
			if (mapRef.current) {
				mapRef.current.fitToCoordinates(coordinates, {
					edgePadding: {
						top: 50,
						right: 50,
						bottom: 50,
						left: 50,
					},
					animated: true,
				});
			}
		}, 500);
	};


	useEffect(() => {
		const loadMarkers = async () => {
			try {
				if (!jeOffline) {
					const user_id = await AuthService.getUserIdFromToken();
					const response = await api.get(`/markers/getUserMarkers/${user_id}`);
					if (response && response.length > 0) {
						setMyMarkers(response);
					}
					else {
						setMyMarkers([]);

					}
				} else {
					await loadMarkersFromStorage();
				}
			} catch (error) {
				console.error('Chyba pri načítaní markerov:', error);
				Alert.alert('Chyba', 'Nepodarilo sa načítať markery.');
				await loadMarkersFromStorage();
			}
		};

		loadMarkers();
	}, [jeOffline]);



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

				if (!permissionGranted) {
					requestPermission(); /* ak nie je povolené, bude sa pýtať */
				} else {
					const { status } = await Location.requestForegroundPermissionsAsync();
					if (status !== 'granted') {
						setError('Permission to access location was denied');
						return;
					}
				}

				// Získanie aktuálnej polohy
				const location = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.Balanced,
				});


				const userCoords = {
					latitude: location.coords.latitude,
					longitude: location.coords.longitude,
				};
				setUserLocation(userCoords);

			if (params === undefined) {
				setRegion({
					latitude: location.coords.latitude,
					longitude: location.coords.longitude,
					latitudeDelta: 0.01,
					longitudeDelta: 0.01,
				});
			}


			} catch (error) {
				let message = "Chyba pri získavaní polohy.";
				if (axios.isAxiosError(error)) {
					message = error.response?.data?.message || message;
				}

				setError('Error fetching location: ' + message);
			}
		};

		getLocation(); // Zavoláme funkciu na získanie polohy
	}, [userLocation]);



	const handleAddMarker = (coords: LatLng) => {
		if (canMarker) {
			setMarker({
				latitude: coords.latitude,
				longitude: coords.longitude,
			});
		}
	};


	const handleDeleteMarker = () => {
		setMarker(null);
	};


	const handleMapPress = (event: MapPressEvent) => {
		if (isSelectingFromAutocomplete) return;

		if (selectedPoiInfo) {
			handleDeleteMarker();
			setSelectedPoiInfo(null);
		}

		const { coordinate } = event.nativeEvent; // Získame súradnice kliknutia
		handleAddMarker(coordinate);
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

			setInitialRegion(newRegion);

			Keyboard.dismiss();

			setTimeout(() => {
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


	const centerOnUser = async () => {
		try {

			if (userLocation) {
				const region = {
					latitude: userLocation.latitude,
					longitude: userLocation.longitude,
					latitudeDelta: 0.01,
					longitudeDelta: 0.01,
				};

				mapRef.current?.animateToRegion(region, 500);
			}

		} catch (error) {
			console.error('Chyba pri získaní polohy:', error);
		}
	};

	const smoothZoom = (direction: 'in' | 'out') => {
		const factor = direction === 'in' ? 0.8 : 1.25;
		let steps = 5;
		let delay = 40;


		const zoomStep = (step: number, currentRegion: any) => {
			if (step === 0) {
				return;
			}


			const nextRegion = {
				...currentRegion,
				latitudeDelta: currentRegion.latitudeDelta * factor,
				longitudeDelta: currentRegion.longitudeDelta * factor,
			};


			mapRef.current?.animateToRegion(nextRegion, delay);

			setTimeout(() => {
				zoomStep(step - 1, nextRegion);
			}, delay);
		};

		zoomStep(steps, initialRegion);
	};



	const clearCache = async () => {
		try {
			const files = await FileSystem.readDirectoryAsync(CACHE_DIR);

			if (files.length > 0) {
				for (const file of files) {
					await FileSystem.deleteAsync(`${CACHE_DIR}${file}`);
				}
				console.log('Všetky cacheované dlaždice boli odstránené');
			} else {
				console.log('Nenašli sa žiadne cacheované dlaždice');
			}
		} catch (error) {
			console.error('Chyba pri odstraňovaní cacheovaných dlaždíc:', error);
		}
	};



	const styles = getStyles(darkMode);


	return (
		<View style={styles.container}>
			<View>
				{jeOffline ? (
					<View style={styles.noConnectionContainer}>
						<MaterialCommunityIcons name="connection" size={24} color = {darkMode ? 'white' : 'black'} />
						<Text style={{ padding: 10, fontSize: 16, color: darkMode ? '#fff' : '#000' }}>
							Offline režim
						</Text>
					</View>
				) : (
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
						textInputProps={{
							placeholderTextColor: darkMode ? '#aaa' : '#888',
						}}
						enablePoweredByContainer={false}
						debounce={200}
						onFail={(error) => console.error('Autocomplete error:', error)}
					/>
				)}
			</View>

			{(isSelectingFromAutocomplete || !isKeyboardVisible) ? (
				<>
					<View style={styles.mapContainer}>
						{region ? (
							<MapView
								ref={mapRef}
								style={styles.map}
								region={region}
								customMapStyle={darkMode ? mapCustomStyle : []}
								onPress={handleMapPress}
								onPoiClick={(e) => {
									const { name, coordinate } = e.nativeEvent;

									setSelectedPoiInfo({
										name,
										coordinate,
									});

									setMarker(coordinate);
								}}
								pointerEvents={isSelectingFromAutocomplete ? 'none' : 'auto'}
								onRegionChangeComplete={(newRegion) => {setInitialRegion(newRegion);}}
							>


								<UrlTile
									urlTemplate={TILE_URL}
									tileSize={256}
									zIndex={1}
									tileCachePath={CACHE_DIR}
									tileCacheMaxAge={60 * 60 * 24 * 30} // 30 dní
									offlineMode={jeOffline} // Offline režim, ak nie je pripojenie
								/>

								{isGridVisible && tilePolygons.map((tile) => (
									<Polygon
										key={tile.id}
										coordinates={tile.coordinates}
										strokeColor="red"
										strokeWidth={1}
										fillColor="rgba(255, 0, 0, 0.1)"
									/>
								))}


								{marker && <Marker coordinate={marker} />}


								{userLocation?.latitude && userLocation?.longitude && (
									<Marker
										coordinate={userLocation}
										pinColor="#40C4FF"
										title="Moja poloha"
									/>
								)}


								{myMarkers.length > 0 && myMarkers.map((marker, index) => (
									<Marker
										key={index}
										coordinate={{ latitude: marker.x_pos, longitude: marker.y_pos }}
										title={marker.marker_title}
										description={marker.marker_description}
										pinColor="green"
										onCalloutPress={() => {
											navigation.navigate('Marker', { marker_id: marker.marker_id });
										}}
									/>
								))}


								{multipleMarkers.map((marker, index) => (
									<Marker
										key={index}
										coordinate={{
											latitude: marker.location_x,
											longitude: marker.location_y,
										}}
										title={marker.marker_title}
										description={marker.marker_description}
										pinColor="aqua"
										onCalloutPress={() => {
											navigation.navigate('Marker', { marker_id: marker.marker_id });
										}}
									/>
								))}


								{polylineCoords.length > 1 && (
									<Polyline
										coordinates={polylineCoords}
										strokeColor="aqua"
										strokeWidth={3}
									/>
								)}
							</MapView>
						) : (
							<Text style={styles.loadingText}>Loading your location...</Text>
						)}


						{userLocation?.latitude && userLocation?.longitude && (
							<>
								<View style={styles.mapBtn_Container}>
									<View style={styles.plusMinus}>

										<TouchableOpacity
											style={ styles.mapBtnNoBorder}

											onPress={() => {
												smoothZoom('in');
												}
											}>

											<Entypo name="plus" size={30} color={darkMode ? "white" : "black"} />
										</TouchableOpacity>

										<View style={{ height: 1, width: '70%', backgroundColor: '#ccc' }} />


										<TouchableOpacity
											style={styles.mapBtnNoBorder}

											onPress={() => {
												smoothZoom('out');
											}
											}>

											<Entypo name="minus" size={24} color={darkMode ? "white" : "black"} />
										</TouchableOpacity>
									</View>



									<TouchableOpacity
										activeOpacity={0.8}
										style={styles.mapBtn}
										onPress={() => {
											if (userLocation) {
												centerOnUser();
												console.log("centrujem");
											}
										}}
									>
										<MaterialCommunityIcons name="target" size={24} color={darkMode ? "white" : "black"} />
									</TouchableOpacity>


									<TouchableOpacity
										activeOpacity={0.8}
										style={styles.mapBtn}
										onPress={() => {
											navigation.navigate("Chat");
										}}
									>
										<Text style={{fontSize: 20, color: darkMode ? 'white' : 'black'}}>AI</Text>
									</TouchableOpacity>
								</View>


								<TouchableOpacity
									activeOpacity={0.8}
									style={styles.mapBtnGrid}
									onPress={() => {
										setIsGridVisible(!isGridVisible);
									}}
								>
									{isGridVisible ? (
										<Entypo name="grid" size={30} color={darkMode ? 'white' : 'black'} />
									) : (
										<Feather name="grid" size={30} color={darkMode ? 'white' : 'black'} />
									)}
								</TouchableOpacity>


								<TouchableOpacity
									activeOpacity={0.8}
									style={styles.mapBtnDownload}
									onPress={() => {
										if (!jeOffline) {
											const zoom = Math.round(Math.log(360 / initialRegion.longitudeDelta) / Math.LN2);

											const x = Math.floor((initialRegion.longitude + 180) / 360 * Math.pow(2, zoom));
											const y = Math.floor((1 - Math.log(Math.tan((initialRegion.latitude * Math.PI) / 180) + 1
													/ Math.cos((initialRegion.latitude * Math.PI) / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
											cacheTile(x, y, zoom);
										}
									}}

									>
									<Feather name="download" size={30} color={darkMode ? "white" : "black"} />

								</TouchableOpacity>
							</>
						)}


						{selectedPoiInfo && (
							<View style={styles.poiInfoPanel}>
								<Text style={styles.poiText}>{selectedPoiInfo.name}</Text>
								<TouchableOpacity
									onPress={() => {
										setSelectedPoiInfo(null);
										handleDeleteMarker();
									}}
								>
									<Text style={styles.closeButton}>Zavrieť</Text>
								</TouchableOpacity>
							</View>
						)}
					</View>


					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={[styles.button, { opacity: marker ? 1 : 0.5 }]}
							disabled={!marker}
							onPress={() => {
								const poiTitle = selectedPoiInfo ? selectedPoiInfo.name : '';
								if (marker) {
									navigation.navigate('AddMarker', {
										latitude: marker.latitude,
										longitude: marker.longitude,
										name: poiTitle,
									});
								} else {
									console.log('Invalid marker or POI information');
								}
							}}
						>
							<Text style={styles.buttonText}>Add marker</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.button, { opacity: marker ? 1 : 0.5 }]}
							disabled={!marker}
							onPress={() => {
								handleDeleteMarker();
								setSelectedPoiInfo(null);
								setCanMarker(true);
							}}
						>
							<Text style={styles.buttonText}>Delete marker</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.button}
							onPress={() => {
								navigation.navigate('Markers', {marker_ids: []});
							}}
						>
							<Text style={styles.buttonText}>My markers</Text>
						</TouchableOpacity>
					</View>
				</>
			) : null}


			{typeof error === 'string' && !!error ? (
				<Text style={styles.errorText}>{error}</Text>
			) : null}
		</View>

	);
})






const getStyles = (dark: boolean) => StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: dark ? '#1a1a1a' : '#fff',
		justifyContent: 'space-between',
	},

	mapContainer: {
		flex: 1,
		borderRadius: 5,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: dark ? '#555' : '#ccc',
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
		borderColor: dark ? '#555' : '#333',
		borderWidth: 2,

		paddingLeft: 10,
		paddingRight: 10,
		borderRadius: 15,
		backgroundColor: dark ? '#444' : 'white',
		justifyContent: 'center',
		alignItems: 'center',
	},
	buttonText: {
		color: dark ? 'white' : 'black',
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
		color: dark ? '#ccc' : '#000',
	},

	searchBarContainer: {
		width: '100%',
		flex: 1,
		marginBottom: 50,
	},
	searchBar: {
		height: 40,
		borderWidth: 1,
		borderColor: dark ? '#555' : '#ccc',
		borderRadius: 8,
		paddingHorizontal: 10,
		fontSize: 16,
		backgroundColor: dark ? '#2a2a2a' : '#fff',
		color: dark ? '#fff' : '#000',
	},
	autocompleteList: {
		position: 'absolute',
		top: 40,
		left: 0,
		right: 0,
		backgroundColor: dark ? '#2a2a2a' : '#fff',
		borderWidth: 1,
		borderRadius: 5,
		borderColor: dark ? '#555' : '#ccc',
		zIndex: 20,
	},
	description: {
		fontSize: 14,
		color: dark ? '#333' : '#333',
		paddingVertical: 5,
	},
	poiInfoPanel: {
		position: 'absolute',
		bottom: 30,
		left: 20,
		right: 20,
		backgroundColor: dark ? '#2a2a2a' : 'white',
		padding: 15,
		borderRadius: 10,
		elevation: 5,
	},
	poiText: {
		fontSize: 16,
		fontWeight: '500',
		color: dark ? '#fff' : '#000',
	},
	closeButton: {
		color: dark ? '#66f' : 'blue',
		marginTop: 10,
	},
	noConnectionContainer: {
		flexDirection: 'row',
		height: 45,
		borderWidth: 1,
		borderColor: dark ? '#555' : '#ccc',
		borderRadius: 8,
		paddingHorizontal: 10,
		fontSize: 16,
		backgroundColor: dark ? '#8B0000' : '#FF6347',
		color: dark ? '#fff' : '#000',
		marginBottom: 10,
		alignItems: 'center',
	},
	mapBtn: {
		backgroundColor: dark ? '#555' : 'white',
		padding: 5,
		borderRadius: 3,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 5,
		marginTop: 10,
		height: 40,
		width: 40
	},
	mapBtnNoBorder: {
		backgroundColor: dark ? '#555' : 'white',
		padding: 5,
		borderRadius: 0,
		alignItems: 'center',
		justifyContent: 'center',
	},
	mapBtnDownload: {
		position: 'absolute',
		bottom: 15,
		right: 15,
		backgroundColor: dark ? '#555' : 'white',
		padding: 5,
		borderRadius: 3,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 2,
	},
	mapBtnGrid: {
		position: 'absolute',
		bottom: 65,
		right: 15,
		backgroundColor: dark ? '#555' : 'white',
		padding: 5,
		borderRadius: 3,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 2,
	},
	mapBtn_Container: {
		position: 'absolute',
		flexDirection: 'column',
		top: 15,
		right: 15,
		borderWidth: 0,
		height: 'auto'
	},
	plusMinus: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: dark ? '#555' : 'white',
		borderRadius: 3,
		elevation: 2,
		paddingBottom: 1
	}
});

export default Maps;

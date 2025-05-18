import React, {useEffect, useState} from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAppNavigation } from '../navigation';
import { api } from '@/api/client';
import { MarkerData } from '@/types/Marker';
import { useTheme } from './themecontext';
import {useOffline} from "@/context/OfflineContext";
import * as SecureStore from "expo-secure-store";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {AuthService} from "@/services/auth";

/**
 * Detailná obrazovka pre zobrazenie a správu markeru.
 * 
 * Tento komponent zobrazuje:
 * - Podrobné informácie o konkrétnom markeri (názov, popis, dátum)
 * - Možnosť zobrazenia markera na mape
 * - Funkciu na vymazanie markera
 * 
 * Hlavné funkcie:
 * - Načítanie dát markera podľa ID (online/offline režim)
 * - Validácia a spracovanie údajov markera
 * - Potvrdzovací dialóg pre vymazanie markera
 * - Synchronizácia zmien s backendom/offline úložiskom
 * 
 * Štýly:
 * - Prispôsobenie pre dark/light režim
 * - Responzívny dizajn pre rôzne veľkosti obrazoviek
 * - Konzistentné vizuálne prvky v celej aplikácii
 */

const Marker = ({ route }: any) => {
	const navigation = useAppNavigation();
	const { marker_id } = route.params;

	const [markerData, setMarkerData] = useState<MarkerData | null>(null);

	const [title, setTitle] = useState<string>(''); // Predvyplnený title, ak existuje
	const [description, setDescription] = useState<string>(''); // Popis

	const [date, setDate] = React.useState(new Date());
	const {darkMode} = useTheme();
	const styles = getStyles(darkMode);
    const jeOffline = useOffline();



	/* request na marker podla marker_id */
	useEffect(() => {
		const loadMarkers = async () => {

			try {
                let response;
                if (!jeOffline) {
                    response = await api.get(`/markers/getMarkerByMarkerID/${marker_id}`);
                }
                else {
                    const markers = await SecureStore.getItemAsync('offlineMarkers');
                    let markersJSON = [];
                    if (markers) {
                        markersJSON = JSON.parse(markers);
                    }

                    const filteredMarker = markersJSON.filter((marker: any) => marker.marker_id === marker_id);
                    response = filteredMarker[0];
                }


				if (response) {
					const markerData: MarkerData = {
						marker_id: response.marker_id,
						marker_title: response.marker_title,
						marker_description: response.marker_description,
						location_x: response.x_pos,
						location_y: response.y_pos,
					};

					setMarkerData(markerData);

					/* načítame z response dáta */
					setTitle(markerData.marker_title);
					setDescription(markerData.marker_description);

					const tripDate = new Date(response.trip_date);
					setDate(tripDate);
				} else {
					Alert.alert('Marker neexistuje', 'Takýto marker neexistuje alebo nepatrí používateľovi..');
				}
			} catch (error) {
				console.error('Chyba pri načítaní markera:', error);
				Alert.alert('Chyba', 'Nepodarilo sa načítať marker.');
			}
		};

		loadMarkers();
	}, []);


    const askDelete = (): Promise<boolean> => {
        return new Promise((resolve) => {
            Alert.alert(
                'Potvrdiť vymazanie',
                'Skutočne chcete vymazať tento marker?',
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




    const deleteMarker = async () => {
        const result = await askDelete();
        if (!result) return;

        try {
            if (!jeOffline) {
                const response = await api.delete(`/markers/${marker_id}`,{});

                if (response) {
                    Alert.alert("Úspech", "Marker bol úspešne vymazaný.")
                }
            }
            else {
                const markers = await SecureStore.getItemAsync('offlineMarkers');

                let newMarkers: MarkerData[] = [];

                if (markers) {
                    newMarkers = JSON.parse(markers);
                }

                const updatedMarkers = newMarkers.filter(marker => marker.marker_id !== marker_id);
                await SecureStore.setItemAsync('offlineMarkers', JSON.stringify(updatedMarkers));

                Alert.alert("Úspech", "Marker bol úspešne vymazaný.")
            }

            navigation.navigate('Map');
        }
        catch (error) {
            throw error;
        }
    }




	 return (
		 <View style={styles.container}>
			 <View style={styles.title_container}>
				 <Text style={styles.header}>Marker</Text>

				 <TouchableOpacity style={styles.title_btn} onPress={() => {
					 if (markerData !== null) {
						 navigation.navigate('Map', {
							 type: 'single',
							 marker: markerData,
						 });
					 	}
					 }}
				 >
					 <Text style={styles.buttonText}>Ukázať na mape</Text>
				 </TouchableOpacity>


                 <TouchableOpacity onPress={deleteMarker}>
                    <FontAwesome name="trash" size={30} color={darkMode ? 'white' : 'black'} />
                 </TouchableOpacity>
			 </View>



			 <TextInput
				 style={styles.input}
				 placeholder="Názov markeru"
				 value={title}
				 onChangeText={setTitle}
				 editable={false} // Nech je title iba na zobrazenie
			 />

			 {/* Popis */}
			 <TextInput
				 style={[styles.input, styles.descriptionInput]}
				 placeholder="Popis"
				 value={description}
				 onChangeText={setDescription}
				 editable={false}
				 multiline
			 />


			 {date && (
				 <Text style={styles.selectedDate}>Dátum: {date.toLocaleDateString()}</Text>
			 )}
		 </View>
	 );
};

const getStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: dark ? '#1a1a1a' : '#fff',  // Tmavá alebo svetlá farba pozadia
      justifyContent: 'flex-end', // Zabezpečí, že tlačidlo bude na spodku
      alignItems: 'center',
    },
    title_container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      width: '100%',
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
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      color: dark ? '#fff' : '#000',  // Farba textu hlavičky podľa režimu
    },
    input: {
      height: 40,
      borderColor: dark ? '#555' : '#ccc',  // Tmavá alebo svetlá farba okraja
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 15,
      paddingHorizontal: 10,
      fontSize: 16,
      width: '100%',
      color: dark ? '#fff' : '#000',  // Farba textu vo vstupe podľa režimu
      backgroundColor: dark ? '#333' : '#f9f9f9',  // Farba pozadia vstupu
    },
    descriptionInput: {
      flex: 1,
      width: '100%',
      minHeight: 100,  // Začína od určitej výšky, ale môže rásť
      maxHeight: '100%', // Nech sa nezastaví pred koncom obrazovky
      textAlignVertical: 'top', // Aby text začínal zhora
      padding: 10,
      fontSize: 16,
      color: dark ? '#fff' : '#000',  // Farba textu podľa režimu
      backgroundColor: dark ? '#333' : '#f9f9f9',  // Farba pozadia podľa režimu
    },
    selectedDate: {
      fontSize: 16,
      marginBottom: 15,
      color: dark ? '#ccc' : '#333',  // Farba textu dátumu podľa režimu
    },
    button: {
      height: 50,
      borderColor: dark ? '#777' : '#333',  // Tmavá alebo svetlá farba okraja
      borderWidth: 2,
      width: '100%',
      paddingLeft: 10,
      paddingRight: 10,
      borderRadius: 15,
      backgroundColor: dark ? '#444' : '#fff',  // Tmavá alebo svetlá farba pozadia
      justifyContent: 'center',
      alignItems: 'center',
    },
  });


export default Marker;

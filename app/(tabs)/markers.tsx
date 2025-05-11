import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, FlatList, StyleSheet, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {useAppNavigation} from "@/app/navigation";
import AntDesign from '@expo/vector-icons/AntDesign';
import {AuthService} from "@/services/auth";
import {api} from "@/api/client";
import { useTheme } from './themecontext';
import { useOffline } from '@/context/OfflineContext';
import {addTripMarker, MarkerData} from "@/types/Marker";
import * as SecureStore from "expo-secure-store";




const Markers = ({route} : any) => {
    const navigation = useAppNavigation()
    const [selected, setSelected] = useState<addTripMarker[]>([]);
    const [myMarkers, setMyMarkers] = useState<addTripMarker[]>([]);


    const {darkMode} = useTheme();
    const jeOffline = useOffline();

    const { marker_ids, trip_id } = route.params;


    useEffect(() => {
        if (marker_ids) {
            if (jeOffline) {
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
                loadMarkersFromStorage();
            }
            else {

                const loadMarkers = async () => {
                    try {
                        const user_id = await AuthService.getUserIdFromToken();
                        const response = await api.get(`/markers/getUserMarkers/${user_id}`);


                        /* ak sú markery, tak ich uložíme */
                        if (response && response.length > 0) {
                            const simplifiedMarkers: addTripMarker[] = response.map((item: any) => ({
                                marker_id: String(item.marker_id),
                                marker_title: item.marker_title,
                                marker_date: item.trip_date,
                            }));
                            setMyMarkers(simplifiedMarkers);
                        }
                        else {
                            setMyMarkers([]);
                        }
                    } catch (error) {
                        console.error('Chyba pri načítaní markerov:', error);
                        Alert.alert('Chyba', 'Nepodarilo sa načítať markery.');
                    }
                };
                loadMarkers();
            }
        }
    }, []);


    useEffect(() => {
        if (trip_id) {
            const filterMarkers = async () => {
                const response = await api.get(`/markers/${trip_id}`);
                if (response) {
                    const mappedMarkers: addTripMarker[] = response.map((marker: any) => ({
                        marker_id: marker.marker_id.toString(),
                        marker_title: marker.marker_title,
                        marker_date: marker.trip_date,
                        isNew: false
                    }));

                    setMyMarkers(mappedMarkers);
                }
            }
            filterMarkers();
        }
    }, []);





    const toggleSelect = (marker: addTripMarker) => {
        setSelected((prev) =>
            prev.some(m => m.marker_id === marker.marker_id)
                ? prev.filter(m => m.marker_id !== marker.marker_id)
                : [...prev, marker]
        );
    };

    useEffect(() => {
        if (marker_ids) {
            const toggleSelectMarkers = (ids: addTripMarker[]) => {
                ids.forEach((marker) => {
                    setSelected((prev) => {
                        if (prev.some(m => m.marker_id === marker.marker_id)) return prev;
                        return [...prev, marker];
                    });
                });
            };

            if (marker_ids?.length > 0 && myMarkers.length > 0) {
                const matchedMarkers = myMarkers.filter(m =>
                    marker_ids.some((id: any) => id.marker_id === m.marker_id)
                );
                toggleSelectMarkers(matchedMarkers);
            }
        }
    }, [myMarkers]);



    const renderItem = ({ item }: { item: addTripMarker }) => {
        const isSelected = (marker_ids) ? selected.some((s) => s.marker_id === item.marker_id) : false;

        return (
            <TouchableOpacity
                onPress={() => {

                    if (marker_ids) {
                        toggleSelect(item);
                    }


                }}
                style={[
                    styles.markerItem,
                    isSelected && styles.selectedMarkerItem,
                ]}
                activeOpacity={0.7}>

                <Ionicons
                    name="location-sharp"
                    size={37}

                    color="red"
                    style={{ marginRight: 10 }}
                />
                <Text style={styles.markerText}>{item.marker_title}</Text>
                <TouchableOpacity
                    style={styles.infoButton}
                    onPress={() => navigation.navigate("Marker", {
                        marker_id: item.marker_id,
                    })}>


                    <AntDesign name="arrowright" size={27} color={darkMode ? 'white' : 'black'} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };


    const styles = getStyles(darkMode);



    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{trip_id ? "Trip markers" : "My markers"}</Text>
                <Ionicons name="search" size={24} color={darkMode ? 'white' : 'black'} />
            </View>

            {myMarkers && myMarkers.length > 0 ? (
            <FlatList<addTripMarker>
                data={myMarkers}
                keyExtractor={(item) => item.marker_id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
            ) : (
            <Text style={[styles.list, {color: darkMode ? 'white' : 'black'}]}>Žiadne markery.</Text>
            )}


            {marker_ids && (
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        navigation.popTo("AddTrip", {markers: selected});
                    }}
                >
                    <Text style={styles.buttonText}>Add to trip</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const getStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: dark ? '#1a1a1a' : '#fff',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: dark ? '#fff' : '#000',
    },
    list: {
      paddingBottom: 20,
      flex: 1,
      borderRadius: 10,
    },
    markerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      paddingHorizontal: 10,
      height: 60,
      marginTop: 10,
      marginHorizontal: 5,
      borderWidth: 2,
      borderColor: dark ? '#555' : '#C3C3C3',
      backgroundColor: dark ? '#444' : '#f9f9f9',
    },
    selectedMarkerItem: {
      borderColor: '#199FFF',
      borderWidth: 2,
    },
    markerText: {
      flex: 1,
      fontSize: 16,
      color: dark ? '#fff' : '#000',
    },
    infoButton: {
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderRadius: 10,
    },
    button: {
      backgroundColor: dark ? '#444' : '#fff',
      borderColor: dark ? '#555' : '#333',
      borderWidth: 2,
      padding: 16,
      marginTop: 20,
      borderRadius: 20,
      alignItems: 'center',
    },
    buttonText: {
      color: dark ? '#fff' : '#000',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });


export default Markers;


import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, FlatList, ScrollView} from 'react-native';
import { useAppNavigation } from '../navigation';
import { api, getBaseUrl } from '@/api/client';
import axios, { AxiosError } from 'axios';
import { useTheme } from './themecontext';

import * as FileSystem from 'expo-file-system';

import {MarkerData} from "@/types/Marker";
import {useOffline} from "@/context/OfflineContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import {Picker} from "@react-native-picker/picker";
import {AuthService} from "@/services/auth";



const AddTrip = ({ route }: any) => {
    const navigation = useAppNavigation();
    const { Markers } = route?.params;


    const [tripMarkers, setTripMarkers] = useState<MarkerData[]>([]);

    useEffect(() => {
        if (Markers) {
            setTripMarkers(Markers);
        }
    }, [Markers]);


    const [title, setTitle] = useState<string>(''); // Predvyplnený title, ak existuje
    const [description, setDescription] = useState<string>(''); // Popis

    const [rating, setRating] = useState('');

    const [photos, setPhotos] = useState<Array<any>>(new Array(4).fill(null));
    const [visibility, setVisibility] = useState<'public' | 'private' | 'friends'>('public');



    const markers: Marker[] = [
        { marker_id: '1', marker_title: 'Mesto A', date: '2025-06-01' },
        { marker_id: '2', marker_title: 'Mesto B', date: '2025-06-02' },
        { marker_id: '3', marker_title: 'Mesto C', date: '2025-06-03' },
        { marker_id: '4', marker_title: 'Mesto D', date: '2025-06-04' },
        { marker_id: '5', marker_title: 'Mesto E', date: '2025-06-05' },
        { marker_id: '6', marker_title: 'Mesto F', date: '2025-06-06' },
        { marker_id: '7', marker_title: 'Mesto D', date: '2025-06-07' },
        { marker_id: '8', marker_title: 'Mesto E', date: '2025-06-08' },
        { marker_id: '9', marker_title: 'Mesto F', date: '2025-06-09' },
        { marker_id: 'add-marker', marker_title: 'Pridať marker', isAddMarker: true },
    ];


    const handleChoosePhoto = async (index: number) => {
        const permissionResponse = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResponse.granted) {
            alert('Permission to access gallery is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets?.length > 0) {
            const newPhotos = [...photos];
            newPhotos[index] = result.assets[0];
            setPhotos(newPhotos);

        }

        console.log(photos);
    };

    // Renderovanie fotky alebo ikony "+"
    const renderPhotoOrPlus = (index: number) => {
        if (photos[index]) {
            return <Image source={{ uri: photos[index].uri }} style={styles.photo} />;
        } else {
            return <Text style={styles.plusIcon}>+</Text>;
        }
    };

    const handleRatingChange = (text: string) => {
        const num = parseInt(text);
        if (text === '' || (num >= 1 && num <= 5)) {
            setRating(text);
        }
    };

    const loadImageBase64 = async (image_uri: any) => {
        try {
            const base64Data = await FileSystem.readAsStringAsync(image_uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            return 'data:image/jpeg;base64,' + base64Data;
        } catch (error) {
            console.error('Error converting image to base64:', error);
        }
    };



    const handleSubmit = async () => {
        const formData = new FormData();
        let success = false;

        /* triedenie markerov, aby sme získali start a end date tripu */
        const sortedMarkers = [...markers]
            .slice(0, markers.length - 1)
            .sort((a, b) =>
                new Date(a.date || '').getTime() - new Date(b.date || '').getTime()
            );



        // Ak máme len jeden marker, start_date = end_date
        const start = sortedMarkers[0].date;
        const end = sortedMarkers.length === 1 ? start : sortedMarkers[sortedMarkers.length - 1].date;



        if (!title || !description || !visibility || !rating) {
            Alert.alert('Chyba', 'Všetky polia musia byť vyplnené!');
            return;
        }

        if (markers.length < 2) {
            Alert.alert('Chyba', 'Musí byť zvolený aspoň jeden marker.');
            return;
        }

        const tripData = {
            trip_title: title,
            trip_description: description,
            rating: rating,
            visibility: visibility,
            start_date: start,
            end_date: end
        };



        const user_id = await AuthService.getUserIdFromToken();
        let trip_id = "10";
        try {
            const response = await api.post(`/users/${user_id}/trip`, {tripData});

            if (response) {
                trip_id = response.trip.trip_id;
                success = true;
            }
        }
        catch (error) {
            throw error;
        }


        if (success) {
            if (photos && photos.length > 0) {

                photos.forEach((photo, index) => {
                    if (photo?.uri) {
                        formData.append('images', {
                            uri: photo.uri,
                            type: photo.mimeType || 'image/jpeg', // Použite mimeType, ak je k dispozícii
                            name: `photo_${index}.jpg`, // Názov súboru
                        } as unknown as Blob);
                    }
                });

                try {
                    /* nejde to cez axios, musíme fetchom */
                    const token = await AuthService.getToken();
                    const base_url = getBaseUrl();
                    const response = await fetch(
                        `${base_url}/upload-images/${user_id}/trip_images/${trip_id}`,
                        {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${token}`,

                            },
                            body: formData,
                        }
                    );


                    if (response) {
                        Alert.alert("Úspech","Vytvorenie tripu bolo úspešné ");
                    }
                } catch (error) {
                    throw error;
                }

            } else {
                Alert.alert("Úspech","Vytvorenie tripu bolo úspešné ");
            }
        }
    };





    const {darkMode} = useTheme();
    const styles = getStyles(darkMode);
    const jeOffline = useOffline();


    type Marker = {
        marker_id: string;
        marker_title: string;
        date?: string;
        isAddMarker?: boolean;
    };

    const renderItem = ({ item }: { item: Marker }) => {
        return (
            <TouchableOpacity
                style={[
                    styles.markerItem,
                ]}
                activeOpacity={0.7}
                onPress={() => {
                    if (item.isAddMarker) {
                        navigation.navigate("Markers");
                    }
                }}>

                <Ionicons
                    name="location-sharp"
                    size={37}

                    color="red"
                    style={{ marginRight: 10 }}
                />

                <Text style={styles.markerText}>{item.marker_title}</Text>
            </TouchableOpacity>
        );
    };















    return (
        <View style={styles.container}>
            <Text style={styles.header}>Pridať trip</Text>


            <View style={styles.markerContainer}>
                {markers && markers.length > 0 ? (
                    <FlatList
                        data={markers}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.marker_id}
                        contentContainerStyle={styles.list}
                    />
                ) : (
                    <Text style={styles.list}>Žiadne markery.</Text>
                )}
            </View>


            {/* Predvyplnený title */}
            <TextInput
                style={styles.input}
                placeholder="Názov tripu"
                placeholderTextColor={darkMode ? '#999' : '#888'}
                value={title}
                onChangeText={setTitle}
                editable={true} // Nech je title iba na zobrazenie
            />

            {/* Popis */}
            <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Popis"
                placeholderTextColor={darkMode ? '#999' : '#888'}
                value={description}
                onChangeText={setDescription}
                multiline
            />


            <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>Hodnotenie (1-5):</Text>
                <TextInput
                    style={[styles.input, styles.ratingInput]}
                    placeholderTextColor={darkMode ? '#999' : '#888'}
                    value={rating}
                    onChangeText={handleRatingChange}
                    keyboardType="numeric"
                    maxLength={1}
                />

                <View
                    style={styles.visPicker}
                >
                    <Picker
                        selectedValue={visibility}
                        onValueChange={(value) => setVisibility(value)}
                        style={{ color: darkMode ? '#fff' : '#000' }}
                    >
                        <Picker.Item label="Public" value="public" />
                        <Picker.Item label="Private" value="private" />
                        <Picker.Item label="Friends" value="friends" />
                    </Picker>
                </View>


            </View>


            <View style={styles.photoContainer}>
                {[...Array(4)].map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.photoInput}
                        onPress={() => handleChoosePhoto(index)}
                    >
                        {renderPhotoOrPlus(index)}
                    </TouchableOpacity>
                ))}
            </View>


            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Odoslať</Text>
            </TouchableOpacity>
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
            marginBottom: 10,
            marginTop: 10,
            alignSelf: 'flex-start',
            marginLeft: 1,
            color: dark ? '#fff' : '#000',
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
        submitButtonText: {
            fontSize: 18,
            color: dark ? '#fff' : '#000',
            fontWeight: 'bold',
        },
        btnContainer: {
            width: '100%',
            gap: 10,
            height: 120,
        },
        photo: {
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
        },
        plusIcon: {
            fontSize: 30,
            color: '#aaa',
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
        markerContainer: {
            borderWidth: 1,
            borderColor: dark ? '#555' : '#C3C3C3',
            width: '100%',
            flex: 1,
            borderRadius: 8,
            marginBottom: 15,
            minHeight: 150,
            maxHeight: 150
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
            marginLeft: -5,
            borderRadius: 8,
            marginBottom: 15
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
            marginTop: 5,


        },
        ratingText: {
            color: dark ? '#fff' : '#000',
            fontSize: 16,
            fontWeight: 'bold',

            alignSelf: 'flex-start',

        }
    });


export default AddTrip;
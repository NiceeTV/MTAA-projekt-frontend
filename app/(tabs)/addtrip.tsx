import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, FlatList, ScrollView} from 'react-native';
import { useAppNavigation } from '../navigation';
import { api, getBaseUrl } from '@/api/client';
import { useTheme } from './themecontext';


import {addTripMarker} from "@/types/Marker";
import {useOffline} from "@/context/OfflineContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import {Picker} from "@react-native-picker/picker";
import {AuthService} from "@/services/auth";
import * as SecureStore from 'expo-secure-store';



const AddTrip = ({ route }: any) => {
    const navigation = useAppNavigation();
    const { Markers } = route.params?.markers;


    const [tripMarkers, setTripMarkers] = useState<addTripMarker[]>([]);


    useEffect(() => {
        if (route.params?.markers) {
            setTripMarkers(route.params?.markers);
        }

    }, [route.params?.markers]);




    const [title, setTitle] = useState<string>(''); // Predvyplnený title, ak existuje
    const [description, setDescription] = useState<string>(''); // Popis

    const [rating, setRating] = useState('');

    const [photos, setPhotos] = useState<Array<any>>(new Array(4).fill(null));
    const [visibility, setVisibility] = useState<'public' | 'private' | 'friends'>('public');



    const newMarker = { marker_id: 'add-marker', marker_title: 'Upraviť markery tripu', isNew: true };
    const markerExists = tripMarkers.some(marker => marker.marker_id === newMarker.marker_id);

    if (!markerExists) {
        tripMarkers.push(newMarker);
    }


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





    const handleSubmit = async () => {
        /* triedenie markerov, aby sme získali start a end date tripu */
        const sortedMarkers = [...tripMarkers]
            .slice(0, tripMarkers.length - 1)
            .sort((a, b) =>
                new Date(a.marker_date || '').getTime() - new Date(b.marker_date || '').getTime()
            );


        if (sortedMarkers.length === 0) {
            Alert.alert("Chyba", "Je potrebné vybrať nejaký marker.")
            return;
        }

        // Ak máme len jeden marker, start_date = end_date
        const start = sortedMarkers[0].marker_date || null;
        const end = sortedMarkers.length === 1 ? start : (sortedMarkers[sortedMarkers.length - 1].marker_date || null);


        if (!title || !description || !visibility || !rating) {
            Alert.alert('Chyba', 'Všetky polia musia byť vyplnené!');
            return;
        }

        if (tripMarkers.length < 2) {
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

        const filteredMarkers = tripMarkers.filter(marker => marker.marker_id !== 'add-marker');
        const markerIds = filteredMarkers.map(marker => marker.marker_id);

        let trip_id = Date.now();

        if (jeOffline) {

            const existingTripInfo = await SecureStore.getItemAsync('tripInfo');
            const existingPhotos = await SecureStore.getItemAsync('tripImages');
            const existingMarkers = await SecureStore.getItemAsync('tripMarkers');


            /* trip info */
            const updatedTripInfo = existingTripInfo ? JSON.parse(existingTripInfo) : [];
            updatedTripInfo.push({ trip_id, tripData });
            await SecureStore.setItemAsync('tripInfo', JSON.stringify(updatedTripInfo));


            /* vložíme obrázky */
            const updatedPhotos = existingPhotos ? JSON.parse(existingPhotos) : [];
            updatedPhotos.push({ trip_id, photos });
            await SecureStore.setItemAsync('tripImages', JSON.stringify(updatedPhotos));


            /* vložíme trip_markers */
            const updatedMarkers = existingMarkers ? JSON.parse(existingMarkers) : [];
            updatedMarkers.push({ trip_id, markerIds });
            await SecureStore.setItemAsync('tripMarkers', JSON.stringify(updatedMarkers));

            Alert.alert("Úspech","Vytvorenie tripu bolo úspešné ");
            navigation.goBack();
        }
       else {
            const formData = new FormData();
            let success = false;


            const user_id = await AuthService.getUserIdFromToken();
            try {
                const response = await api.post(`/users/${user_id}/trip`, {tripData});
                if (response) {
                    trip_id = response.trip.trip_id;
                    Alert.alert("Úspech","Vytvorenie tripu bolo úspešné ");
                    navigation.goBack();
                    success = true;
                }
            }
            catch (error) {
                throw error;
            }


            /* pripojíme markery */
            if (success) {
                try {
                    const response = await api.post(`/trips/${trip_id}/markers`, {marker_ids: markerIds});

                    if (response) {
                        success = true;
                    }
                }
                catch (error) {
                    throw error;
                }
            }


            if (success) {
                if (photos && photos.length > 0) {

                    photos.forEach((photo, index) => {
                        if (photo?.uri) {
                            formData.append('images', {
                                uri: photo.uri,
                                type: photo.mimeType || 'image/jpeg',
                                name: `photo_${index}.jpg`,
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

                    } catch (error) {
                        throw error;
                    }

                }
            }

       }
    };



    const {darkMode} = useTheme();
    const styles = getStyles(darkMode);
    const jeOffline = useOffline();




    return (
        <View style={styles.container}>
            <Text style={styles.header}>Pridať trip</Text>


            {tripMarkers && tripMarkers.length > 0 ? (
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate("Markers", {
                            marker_ids: tripMarkers.filter(marker => marker.marker_id !== 'add-marker'),
                        });
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
            ) : (
                <Text style={styles.list}>Žiadne markery.</Text>
            )}


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
                style={styles.descriptionInput}
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
            color: dark ? '#fff' : '#000',
            backgroundColor: dark ? '#333' : '#f9f9f9',
        },

        descriptionInput: {
            flex: 1,
            width: '100%',
            minHeight: 100,
            maxHeight: '100%',
            textAlignVertical: 'top',
            padding: 10,
            marginBottom: 15,
            borderRadius: 8,
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
            marginBottom: 15,
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
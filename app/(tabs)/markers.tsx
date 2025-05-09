import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput, Button, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {useAppNavigation} from "@/app/navigation";
import AntDesign from '@expo/vector-icons/AntDesign';
import {AuthService} from "@/services/auth";
import {api} from "@/api/client";



type Marker = {
    marker_id: string;
    marker_title: string;
};




const Markers = () => {
    const navigation = useAppNavigation()
    const [selected, setSelected] = useState<string[]>([]);
    const [myMarkers, setMyMarkers] = useState<any[]>([]);


    useEffect(() => {
        const loadMarkers = async () => {
            try {
                const user_id = await AuthService.getUserIdFromToken();

                console.log(user_id);

                const response = await api.get(`/markers/getUserMarkers/${user_id}`);

                // Ak odpoveď obsahuje markery, uložíme ich do stavu
                if (response && response.length > 0) {
                    const simplifiedMarkers = response.map(({ marker_id, marker_title } : Marker) => ({
                        marker_id,
                        marker_title,
                    }));

                    setMyMarkers(simplifiedMarkers);
                } else {
                    Alert.alert('Žiadne markery', 'Pre tohto používateľa neexistujú žiadne markery.');
                }
            } catch (error) {
                console.error('Chyba pri načítaní markerov:', error);
                Alert.alert('Chyba', 'Nepodarilo sa načítať markery.');
            }
        };

        loadMarkers();
    }, []);


    console.log(myMarkers);


    const toggleSelect = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const renderItem = ({ item }: { item: Marker }) => {
        const isSelected = selected.includes(item.marker_id);

        return (
            <TouchableOpacity
                onPress={() => toggleSelect(item.marker_id)}
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


                    <AntDesign name="arrowright" size={27} color="black" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My markers</Text>
                <Ionicons name="search" size={24} />
            </View>

            <FlatList
                data={myMarkers}
                keyExtractor={(item) => item.marker_id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />

            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Add to trip</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: 'white'
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
    },
    list: {
        paddingBottom: 20,
        flex: 1,
        borderRadius: 10
    },
    markerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 15,
        paddingHorizontal: 10,

        height: 60,
        marginTop: 10,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#C3C3C3',
    },
    selectedMarkerItem: {
        borderColor: '#199FFF',
        borderWidth: 2,
        paddingHorizontal: 10,
    },
    markerText: {
        flex: 1,
        fontSize: 16,
    },
    infoButton: {
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    infoButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    button: {
        backgroundColor: '#000',
        padding: 16,
        marginTop: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default Markers;


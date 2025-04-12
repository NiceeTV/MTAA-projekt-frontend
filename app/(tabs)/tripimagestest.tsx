import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, ScrollView } from 'react-native';

function TripImages() {
    // State pre trip_id, obrázky a error
    const [tripId, setTripId] = useState('2');
    const [images, setImages] = useState([]);
    const [error, setError] = useState<string | null>(null);

    // Funkcia na získanie obrázkov podľa trip_id
    const fetchImages = async () => {
        const id = parseInt(tripId);  // Konverzia tripId na číslo

        if (!id || isNaN(id)) {
            setError('Prosím zadajte platné Trip ID');
            return;
        }

        try {
            // Fetch požiadavka na backend

            /* zmeniť na svoju host adresu */
            /* nech je rovnaká ako na backende */
            const baseUrl = 'http://192.168.0.105:3000';
            const response = await fetch(`${baseUrl}/trip/${id}/images`);

            // Skontrolovať, či server odpovedal s 2xx stavom
            if (!response.ok) {
                const data = await response.json(); // Ak je odpoveď neúspešná, získaj chybovú správu zo servera
                setImages([]);  // Vymaž obrázky, keď nastane chyba
                setError(data.error || 'Žiadne obrázky pre tento trip.');
                return;  // Ukončiť funkciu, aby sa neprešlo k ďalšiemu kódu
            }

            // Ak je odpoveď ok, spracuj ju
            const data = await response.json();
            const imagesWithBaseUrl = data.images.map((image: string) => `${baseUrl}${image}`);

            console.log(imagesWithBaseUrl);

            setImages(imagesWithBaseUrl);  // Ulož načítané obrázky do stavu
            setError(null);  // Vymazať predchádzajúce chyby
        } catch (err) {
            console.error('Chyba pri načítaní obrázkov:', err);  // Vypíš detailnú chybu
            setError('Chyba pri načítaní obrázkov.');  // Nastav chybovú správu
            setImages([]);  // Vymaž obrázky pri chybe
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Načítaj obrázky pre trip</Text>

            <TextInput
                style={styles.input}
                placeholder="Zadajte Trip ID"
                value={tripId}
                onChangeText={(text) => setTripId(text)}
            />

            <Button title="Načítať obrázky" onPress={fetchImages}/>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {images.length > 0 ? (
                <ScrollView
                    style={styles.imagesContainer}
                    contentContainerStyle={{ alignItems: 'center' }}
                    showsVerticalScrollIndicator={false}>
                    {images.map((image, index) => (
                        <Image
                            key={index}
                            source={{ uri: image }}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    ))}
                </ScrollView>
            ) : (
                <Text>Žiadne obrázky neboli nájdené pre tento trip.</Text>
            )}
        </View>
    )
}
// Pridanie štýlov pre React Native
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    errorText: {
        color: 'red',
        marginBottom: 20,
    },
    imagesContainer: {
        flex: 1,
        width: '100%',
        marginTop: 20,
        overflow: 'hidden',
    },
    image: {
        width: '100%',                  // Obrázok bude mať šírku na 100% kontajnera
        aspectRatio: 1.5,
        resizeMode: 'contain',
    },
});

export default TripImages;

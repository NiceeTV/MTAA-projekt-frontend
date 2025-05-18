import React, {useState} from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAppNavigation } from '../navigation';
import { api } from '@/api/client';
import { AxiosError } from 'axios';
import { useTheme } from './themecontext';


import DateTimePicker from '@react-native-community/datetimepicker';
import {MarkerData} from "@/types/Marker";
import * as SecureStore from "expo-secure-store";
import {useOffline} from "@/context/OfflineContext";

/**
 * Komponent pre pridávanie nového markeru.
 * 
 * Táto obrazovka umožňuje používateľovi:
 * - Nastaviť názov a popis markeru
 * - Vybrať dátum spojený s markerom
 * - Odoslať vytvorený marker
 * 
 * Komponent podporuje:
 * - Online režim - odoslanie dát na server cez API
 * - Offline režim - uloženie dát do lokálneho úložiska (SecureStore)
 * - Automatické predvyplnenie názvu podľa GPS súradníc
 * 
 * Po úspešnom vytvorení markeru presmeruje používateľa späť
 */
const AddMarker = ({ route }: any) => {
  const navigation = useAppNavigation();
  const { latitude, longitude, name } = route.params;

  const [title, setTitle] = useState<string>(name || ''); // Predvyplnený title, ak existuje
  const [description, setDescription] = useState<string>(''); // Popis

  const [date, setDate] = React.useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const {darkMode} = useTheme();
  const styles = getStyles(darkMode);
  const jeOffline = useOffline();




  const handleSubmit = async () => {
    if (!description || !title || !date) {
      Alert.alert('Chyba', 'Vyplň všetky polia vrátane dátumu.');
      return;
    }

    try {
      const markerData = {
        x_pos: latitude,
        y_pos: longitude,
        marker_title: title,
        marker_description: description,
        trip_date: date.toISOString(),
        marker_id: Date.now().toString(),
      };


      if (jeOffline) {
        await saveMarkersToStorage(markerData);
        Alert.alert("Úspech", "Marker bol úspešne pridaný.")
        navigation.goBack();
        return;
      }


      /* backend api request */
      const response = await api.post('/markers', markerData);


      /* odpoveď */
      Alert.alert('Úspech', response.message);
      navigation.goBack();

    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        Alert.alert('Chyba', error.response?.data?.error || error.message);
      } else if (error instanceof Error) {
        Alert.alert('Chyba', error.message);
      } else {
        console.error("Neznáma chyba:", error);
      }
    }
  };


  const saveMarkersToStorage = async (markers: {
    x_pos: any;
    y_pos: any;
    marker_title: string;
    marker_description: string;
    trip_date: string
  }) => {
    try {
      const storedMarkers = await SecureStore.getItemAsync('offlineMarkers');
      let markersNew = [];

      // Ak existujú nejaké markery, zparsingujeme ich, inak vytvoríme prázdny zoznam
      if (storedMarkers) {
        markersNew = JSON.parse(storedMarkers);
      }

      // Uistíme sa, že markersNew je pole
      if (!Array.isArray(markersNew)) {
        markersNew = [];
      }

      // Pridáme nový marker do zoznamu
      markersNew.push(markers);


      await SecureStore.setItemAsync('offlineMarkers', JSON.stringify(markersNew));
    } catch (error) {
      console.error('Chyba pri ukladaní markerov:', error);
    }
  };




  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mesiace sú od 0 do 11, preto +1
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };


  const onChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };






  return (
      <View style={styles.container}>
        <Text style={styles.header}>Pridať marker</Text>

        {/* Predvyplnený title */}
        <TextInput
            style={styles.input}
            placeholder="Názov markeru"
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


        {date && (
            <Text style={styles.selectedDate}>Vybraný dátum: {formatDate(date)}</Text>
        )}


        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.button} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.submitButtonText}>Vyber dátum</Text>
          </TouchableOpacity>

          {showDatePicker && (
              <DateTimePicker
                  mode="date"
                  display={'default'}
                  value={date}
                  onChange={onChange}
              />
          )}

          <TouchableOpacity style={styles.button} onPress={() => handleSubmit()}>
            <Text style={styles.submitButtonText}>Odoslať</Text>
          </TouchableOpacity>
        </View>


      </View>
  );
};

const getStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: dark ? '#1a1a1a' : '#fff',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
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
    dateBtn: {
      backgroundColor: dark ? '#0288D1' : '#40C4FF',
      padding: 10,
      borderRadius: 8,
      marginBottom: 15,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dateButtonText: {
      color: '#fff',
      fontSize: 16
    },
    selectedDate: {
      fontSize: 16,
      marginBottom: 15,
      color: dark ? '#ccc' : '#333',
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
      fontWeight: 'bold'
    },
    btnContainer: {
      width: '100%',
      gap: 10,
      height: 120,
    },
  });


export default AddMarker;
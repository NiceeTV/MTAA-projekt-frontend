import React, {useState} from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAppNavigation } from '../navigation';
import { api } from '@/api/client';
import { AxiosError } from 'axios';


import DateTimePicker from '@react-native-community/datetimepicker';

const AddMarker = ({ route }: any) => {
  const navigation = useAppNavigation();
  const { latitude, longitude, name } = route.params;

  const [title, setTitle] = useState<string>(name || ''); // Predvyplnený title, ak existuje
  const [description, setDescription] = useState<string>(''); // Popis

  const [date, setDate] = React.useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);



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
      };


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
            value={title}
            onChangeText={setTitle}
            editable={true} // Nech je title iba na zobrazenie
        />

        {/* Popis */}
        <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Popis"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'flex-end', // Zabezpečí, že tlačidlo bude na spodku
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
    width: '100%',
  },
  descriptionInput: {
    flex: 1,
    width: '100%',
    minHeight: 100,  // Začína od určitej výšky, ale môže rásť
    maxHeight: '100%', // Nech sa nezastaví pred koncom obrazovky
    textAlignVertical: 'top', // Aby text začínal zhora
    padding: 10,
    fontSize: 16,
  },
  dateBtn: {
    backgroundColor: '#40C4FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dateButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedDate: {
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
  },
  button: {
    height: 50,
    borderColor: '#333',
    borderWidth: 2,
    width: '100%',
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 15,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    color: 'black',
  },
  btnContainer: {
    width: '100%',
    gap: 10,
    height: 120,
  },
});

export default AddMarker;
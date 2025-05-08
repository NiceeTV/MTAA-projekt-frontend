import React, {useState} from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { useAppNavigation } from '../navigation';
import { enGB, registerTranslation } from 'react-native-paper-dates'
import { SafeAreaProvider } from "react-native-safe-area-context";


const AddMarker = ({ route }: any) => {
  const navigation = useAppNavigation();
  const { marker } = route.params;


  const [title, setTitle] = useState<string>(marker?.title || ''); // Predvyplnený title, ak existuje
  const [description, setDescription] = useState<string>(''); // Popis


  const [date, setDate] = React.useState(undefined);


  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const [visible, setVisible] = React.useState(false);
  registerTranslation("en", enGB);



  /*const onChangeDate = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };*/

  // Funkcia na odoslanie formulára
  /*const handleSubmit = () => {
    if (!description) {
      Alert.alert('Chyba', 'Prosím, vyplňte popis.');
      return;
    }

    // Odošleme dáta
    const requestData = {
      title: title,
      description: description,
      date: date?.toISOString(),
      coordinates: marker, // Pošleme aj súradnice
    };*/

    // Tu budeš robiť request (napr. axios.post) na server
    //console.log('Data na odoslanie:', requestData);

    // Ak je odoslanie úspešné, môžeš navigovať späť alebo na ďalší screen
    /*Alert.alert('Úspech', 'Marker bol pridaný!');
    navigation.goBack(); // Alebo naviguj na iný screen*/



  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mesiace sú od 0 do 11, preto +1
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };


  const [open, setOpen] = React.useState(false);

  const onDismissSingle = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirmSingle = React.useCallback(
      (params: { date: any }) => {
        setOpen(false);
        setDate(params.date);
      },
      [setOpen, setDate]
  );


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

        <SafeAreaProvider>
          <View style={{ alignItems: 'center' }}>
            <Button onPress={() => setOpen(true)} uppercase={false} mode="outlined">
              Pick single date
            </Button>
            <DatePickerModal
                locale="en"
                mode="single"
                visible={open}
                onDismiss={onDismissSingle}
                date={date}
                onConfirm={onConfirmSingle}
            />
          </View>
        </SafeAreaProvider>



        {/* Tlačidlo na odoslanie */}
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Odoslať</Text>
        </TouchableOpacity>
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
  dateButton: {
    backgroundColor: '#40C4FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
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
  submitButton: {
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
  },
});

export default AddMarker;
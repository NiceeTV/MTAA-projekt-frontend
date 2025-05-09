import React, {useEffect, useState} from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAppNavigation } from '../navigation';
import { api } from '@/api/client';
import { AxiosError } from 'axios';
import {AuthService} from "@/services/auth";
import markers from "@/app/(tabs)/markers";
import DateTimePicker from "@react-native-community/datetimepicker";




const Marker = ({ route }: any) => {
	const navigation = useAppNavigation();
	const { marker_id } = route.params;

	const [title, setTitle] = useState<string>(''); // Predvyplnený title, ak existuje
	const [description, setDescription] = useState<string>(''); // Popis

	const [date, setDate] = React.useState(new Date());

	/* request na marker podla marker_id */

	useEffect(() => {
		const loadMarkers = async () => {
			try {
				console.log(marker_id);
				const response = await api.get(`/markers/getMarkerByMarkerID/${marker_id}`);



				if (response) {
					console.log(response);

					/* načítame z response dáta */
					setTitle(response.marker_title);
					setDescription(response.marker_description);

					const tripDate = new Date(response.trip_date);
					setDate(tripDate);

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


	 return (
		 <View style={styles.container}>
			 <View style={styles.title_container}>
				 <Text style={styles.header}>Pridať marker</Text>

				 <TouchableOpacity style={styles.title_btn} onPress={() =>null}>
					 <Text style={styles.buttonText}>Odoslať</Text>
				 </TouchableOpacity>
			 </View>




			 {/* Predvyplnený title */}
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
				 <Text style={styles.selectedDate}>Vybraný dátum: {date.toLocaleDateString()}</Text>
			 )}
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
	title_container: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
		width: '100%',
	},
	title_btn: {
		height: 30,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 10,
		width: 100,
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonText: {

	},
	header: {
		fontSize: 24,
		fontWeight: 'bold',

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
});

export default Marker;

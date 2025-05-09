import React, {useEffect, useState} from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAppNavigation } from '../navigation';
import { api } from '@/api/client';
import { MarkerData } from '@/types/Marker';





const Marker = ({ route }: any) => {
	const navigation = useAppNavigation();
	const { marker_id } = route.params;

	const [markerData, setMarkerData] = useState<MarkerData | null>(null);

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


	 return (
		 <View style={styles.container}>
			 <View style={styles.title_container}>
				 <Text style={styles.header}>Pridať marker</Text>

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
				 <Text style={styles.selectedDate}>Dátum: {date.toLocaleDateString()}</Text>
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
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 10,
		paddingHorizontal: 15,
		paddingVertical: 5,
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

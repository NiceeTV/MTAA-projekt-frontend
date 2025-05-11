import React, {useState} from 'react';
import {View, Text, TouchableOpacity, FlatList, ListRenderItem, StyleSheet, TextInput} from 'react-native';
import { useTheme } from './themecontext';
import {useAppNavigation} from "@/app/navigation";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Picker } from '@react-native-picker/picker';



type Trip = {
	trip_id: string;
	trip_title: string;
	start_date?: string;
	isNew?: boolean;
};



const trips: Trip[] = [
	{ trip_id: "1", trip_title: 'Trip to Alps', start_date: '2024-12-10' },
	{ trip_id: "2", trip_title: 'Beach Getaway', start_date: '2025-01-05' },
	{ trip_id: "3", trip_title: 'City Tour', start_date: '2025-03-15' },
	{ trip_id: "4", trip_title: 'Trip to Alps', start_date: '2024-12-10' },
	{ trip_id: "5", trip_title: 'Beach Getaway', start_date: '2025-01-05' },
	{ trip_id: "6", trip_title: 'City Tour', start_date: '2025-03-15' },
	{ trip_id: "7", trip_title: 'Trip to Alps', start_date: '2024-12-10' },
	{ trip_id: "8", trip_title: 'New Trip', isNew: true },
];





const Trips = () => {
	const { darkMode } = useTheme();
	const themedStyles = getStyles(darkMode);
	const navigation = useAppNavigation()

	const [tripName, setTripName] = useState<string>('');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');



	const renderTrip: ListRenderItem<Trip> = ({ item }) => (
		<TouchableOpacity
			style={themedStyles.card}
			onPress={() => {
				if (item.isNew) {
					navigation.navigate("AddTrip", {markers: []});
				} else {
					navigation.navigate("Trip", {
						trip_id: item.trip_id,
					});
				}
			}}
		>

			<Text
				style={item.isNew ? themedStyles.titlePlus : themedStyles.title}
				numberOfLines={1}
				ellipsizeMode="tail"
			>
				{item.trip_title}
			</Text>

			{item.isNew ? (
				<AntDesign name="plus" size={50} color={darkMode ? 'white' : 'black'} style={themedStyles.plus}/>
			) : (
				<Text style={themedStyles.date}>{item.start_date}</Text>
			)}


		</TouchableOpacity>
	);


	return (
		<View style={themedStyles.container}>
			<Text style={themedStyles.header}>All Trips</Text>

			<Picker
				selectedValue={sortOrder}
				onValueChange={(value) => setSortOrder(value)}
				style={{ height: 60, width: 200 }}
			>
				<Picker.Item label="Vzostupne" value="asc" />
				<Picker.Item label="Zostupne" value="desc" />
			</Picker>

			<FlatList
				data={trips}
				renderItem={renderTrip}
				keyExtractor={(item) => item.trip_id.toString()}
				numColumns={2}
				contentContainerStyle={themedStyles.list}
			/>
		</View>
	);
}

const getStyles = (dark: boolean) =>
	StyleSheet.create({

	container: {
		flex: 1,
		padding: 20,
		backgroundColor: dark ? '#1a1a1a' : '#fff',

	},

	header: {
		fontSize: 35,
		fontWeight: 'bold',
		marginLeft: 15,
		color: dark ? '#fff' : '#000',
	},
	searchInput: {
		height: 48,
		borderColor: dark ? '#444' : '#ccc',
		borderWidth: 1,
		borderRadius: 12,
		paddingHorizontal: 10,
		marginBottom: 16,
		marginTop: 10,
		backgroundColor: dark ? '#1e1e1e' : '#ffffff',
		color: dark ? '#ffffff' : '#000000',
		width: '90%',
		marginLeft: 10
	},


	backArrow: { fontSize: 18 },
	title: {
		fontSize: 16,
		fontWeight: 'bold',
		color: dark ? 'white' : 'black',
		textAlign: 'left'
	},
	titlePlus: {
		fontSize: 16,
		fontWeight: 'bold',
		color: dark ? 'white' : 'black',
		textAlign: 'center',

	},
	sync: { fontSize: 14 },
	sortButton: {
		marginVertical: 10,
		padding: 8,
		borderWidth: 1,
		borderRadius: 10,
		alignSelf: 'flex-start',
	},
	list: {
		justifyContent: 'center' },
	card: {
		backgroundColor: dark ? '#444' : 'white',
		borderRadius: 10,
		padding: 20,
		margin: 10,
		width: '42%',
		aspectRatio: 1,
		justifyContent: 'space-between',

		borderColor: dark ? '#555' : '#333',
		borderWidth: 2,
	},
	picker: {
		height: 40,
		width: 200,
		marginTop: 20,
		marginBottom: 20
	},


	menu: { position: 'absolute', bottom: 10, right: 10 },
	plus: { margin: "auto"},
	date: {
		fontSize: 16,
		color: dark ? '#f2f2f2' : 'black',
	}
});


export default Trips;

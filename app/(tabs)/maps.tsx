import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppNavigation } from '../navigation';

const Maps = () => {
	 const navigation = useAppNavigation()

	 return (
	 	 <View style={styles.container}>
	 	 	 <TextInput
	 	 	 	 style={styles.searchInput}
	 	 	 	 placeholder="Search location"
	 	 	 />
	 	 	 <TouchableOpacity style={styles.button} onPress={() => {navigation.navigate("AddMarker")}}>
	 	 	 	 <Text style={styles.buttonText}>Add Marker</Text>
	 	 	 </TouchableOpacity>
	 	 	 <TouchableOpacity style={styles.button} onPress={() => {}}>
	 	 	 	 <Text style={styles.buttonText}>Delete Marker</Text>
	 	 	 </TouchableOpacity>
	 	 </View>
	 );
};

const styles = StyleSheet.create({
	 container: {
	 	 flex: 1,
	 	 paddingVertical: 20,
	 	 paddingHorizontal: 20,
	 },
	 searchInput: {
	 	 height: 50,
	 	 borderColor: 'gray',
	 	 borderWidth: 1,
	 	 paddingLeft: 10,
	 	 marginBottom: 10,
	 	 borderRadius: 20,
	 },
	 itemContainer: {
	 	 borderRadius: 10,
	 	 padding: 10,
	 	 borderWidth: 1,
	 	 borderColor: '#ddd',
	 },
	 button: {
	 	 height: 50,
	 	 borderColor: '#333',
	 	 borderWidth: 0,
	 	 marginBottom: 20,
	 	 paddingLeft: 10,
	 	 paddingRight: 10,
	 	 borderRadius: 20,
	 	 backgroundColor: '#333',
	 	 justifyContent: 'center',
	 	 alignItems: 'center',
	 },
	 buttonText: {
	 	 color: '#fff',
	 	 fontSize: 18,
   fontWeight: 'bold',
	 }
});

export default Maps;

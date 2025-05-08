import React, {useState} from 'react';
import { View, Text, Image, useColorScheme, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppNavigation } from '../navigation';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Feather from '@expo/vector-icons/Feather';


const HomePage = () => {
  const navigation = useAppNavigation();
  
  return (
    <View style={styles.container}>
      <View style={styles.bottomHalf}>
        <Text style={styles.title}>Travel Diary App</Text>
        <View style={styles.form}>
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.buttonText}>Trips</Text>
            <FontAwesome5 name="route" size={24} color="black" style={{ marginRight: 5 }}/>

          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {navigation.navigate("Map")}}>
            <Text style={styles.buttonText}>Map</Text>

            <Feather name="map" size={24} color="black" style={{ marginRight: 3 }}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {navigation.navigate("Profile")}}>
            <Text style={styles.buttonText}>Profile</Text>

            <Ionicons name="person-circle" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.buttonText}>Notifications</Text>

            <Ionicons name="notifications" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  topHalf: {
    flex: 2,

    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Optional, for styling
  },
  bottomHalf: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    paddingBottom: 50,
  },
  form: {
    width: 300,
    padding: 10,
  },
  button: {
    flexDirection: 'row',
    height: 50,
    borderColor: '#333',
    borderWidth: 2,
    marginBottom: 20,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  buttonPressed: {
    backgroundColor: '#e0e0e0',
  },
});

export default HomePage;
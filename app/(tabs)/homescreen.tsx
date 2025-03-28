import React, {useState} from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppNavigation } from '../navigation';

const HomePage = () => {
  const navigation = useAppNavigation();
  
  return (
    <View style={styles.container}>
      <View style={styles.topHalf}>
        <Text style={styles.title}>Travel Diary App</Text>
      </View>
      <View style={styles.bottomHalf}>
        <View style={styles.form}>
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.buttonText}>Trips</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {navigation.navigate("Map")}}>
            <Text style={styles.buttonText}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {navigation.navigate("Profile")}}>
            <Text style={styles.buttonText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.buttonText}>Notifications</Text>
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
  },
  form: {
    width: 300,
    padding: 10,
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

export default HomePage;
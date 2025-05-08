import React, {useState} from 'react';
import { View, Text, Image, useColorScheme, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppNavigation } from '../navigation';



const HomePage = () => {
  const navigation = useAppNavigation();
  
  return (
    <View style={styles.container}>
      <View style={styles.bottomHalf}>
        <Text style={styles.title}>Travel Diary App</Text>
        <View style={styles.form}>
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.buttonText}>Trips</Text>
            <Image
                source={require('@/icons/trip_icon.png')}

                style={{ width: 35, height: 35, marginRight: 5 }}
            />

          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {navigation.navigate("Map")}}>
            <Text style={styles.buttonText}>Map</Text>
            <Image
                source={require('@/icons/map_icon.png')}
                style={{ width: 35, height: 35, marginRight: 5 }}
            />
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
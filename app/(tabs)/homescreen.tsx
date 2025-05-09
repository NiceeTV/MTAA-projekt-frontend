import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppNavigation } from '../navigation';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from './themecontext';  // Importujeme useTheme z ThemeContext

const HomePage = () => {
  const { darkMode } = useTheme();  // Používame hook na prístup k téme
  const navigation = useAppNavigation();

  const themedStyles = getStyles(darkMode);

  return (
    <View style={themedStyles.container}>
      <View style={themedStyles.bottomHalf}>
        <Text style={themedStyles.title}>Travel Diary App</Text>
        <View style={themedStyles.form}>
          <TouchableOpacity style={themedStyles.button} onPress={() => {}}>
            <Text style={themedStyles.buttonText}>Trips</Text>
            <FontAwesome5 name="route" size={24} color={darkMode ? '#fff' : '#000'} style={{ marginRight: 5 }} />
          </TouchableOpacity>

          <TouchableOpacity style={themedStyles.button} onPress={() => {navigation.navigate("Map")}}>
            <Text style={themedStyles.buttonText}>Map</Text>
            <Feather name="map" size={24} color={darkMode ? '#fff' : '#000'} style={{ marginRight: 3 }} />
          </TouchableOpacity>

          <TouchableOpacity style={themedStyles.button} onPress={() => {navigation.navigate("Profile")}}>
            <Text style={themedStyles.buttonText}>Profile</Text>
            <Ionicons name="person-circle" size={30} color={darkMode ? '#fff' : '#000'} />
          </TouchableOpacity>

          <TouchableOpacity style={themedStyles.button} onPress={() => {}}>
            <Text style={themedStyles.buttonText}>Notifications</Text>
            <Ionicons name="notifications" size={30} color={darkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const getStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: dark ? '#1a1a1a' : '#fff',
    },
    bottomHalf: {
      flex: 3,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: dark ? '#333' : '#fff',
    },
    title: {
      fontSize: 35,
      fontWeight: 'bold',
      paddingBottom: 50,
      color: dark ? '#fff' : '#000',
    },
    form: {
      width: 300,
      padding: 10,
    },
    button: {
      flexDirection: 'row',
      height: 50,
      borderColor: dark ? '#555' : '#333',  // Dynamicky meníme farbu orámovania podľa témy
      borderWidth: 2,
      marginBottom: 20,
      paddingLeft: 10,
      paddingRight: 10,
      borderRadius: 20,
      backgroundColor: dark ? '#444' : '#fff',  // Dynamicky meníme pozadie tlačidiel podľa témy
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    buttonText: {
      color: dark ? '#fff' : '#000',  // Dynamicky meníme farbu textu podľa témy
      fontSize: 18,
      marginLeft: 5,
      fontWeight: 'bold',
    },
    buttonPressed: {
      backgroundColor: '#e0e0e0',
    },
  });

export default HomePage;

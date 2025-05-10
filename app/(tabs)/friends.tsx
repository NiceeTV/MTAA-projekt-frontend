import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useAppNavigation } from '../navigation';
import { useTheme } from './themecontext';  // Importujeme useTheme z ThemeContext

const Friends = () => {
  const navigation = useAppNavigation();
  const { darkMode } = useTheme();  // Používame hook na prístup k téme

  const [friends, setFriends] = useState<string[]>(); // Príklad zoznamu priateľov
  const themedStyles = getStyles(darkMode);

  // Funkcia na zobrazenie priateľov
  const renderFriend = ({ item }: { item: string }) => (
    <View style={themedStyles.friendItem}>
      <Text style={themedStyles.friendText}>{item}</Text>
    </View>
  );

  return (
    <View style={themedStyles.container}>
      <Text style={themedStyles.title}>My Friends</Text>

      <TouchableOpacity 
        style={themedStyles.button}
        onPress={() => {navigation.navigate("AddFriend")}}
      >
        <Text style={themedStyles.buttonText}>Add Friend</Text>
      </TouchableOpacity>

      <FlatList
        data={friends} // Tu sa bude zoznam priateľov načítavať
        renderItem={renderFriend}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={themedStyles.friendList}
      />
    </View>
  );
};

const getStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: dark ? '#1a1a1a' : '#fff',  // Dynamické pozadie podľa témy
      paddingTop: 40,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: dark ? '#fff' : '#000',  // Dynamická farba textu
      marginBottom: 20,
    },
    button: {
      flexDirection: 'row',
      height: 50,
      width: 250,
      borderColor: dark ? '#555' : '#333',  // Farba orámovania podľa témy
      borderWidth: 2,
      marginBottom: 20,
      paddingLeft: 10,
      paddingRight: 10,
      borderRadius: 20,
      backgroundColor: dark ? '#444' : '#fff',  // Farba pozadia tlačidla
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 18,
      color: dark ? '#fff' : '#000',  // Farba textu na tlačidle podľa témy
      fontWeight: 'bold',
    },
    friendList: {
      marginTop: 20,
      width: '100%',
      paddingHorizontal: 20,
    },
    friendItem: {
      padding: 10,
      marginBottom: 10,
      backgroundColor: dark ? '#444' : '#f0f0f0',  // Dynamická farba pozadia pre priateľa
      borderRadius: 10,
      borderWidth: 1,
      borderColor: dark ? '#555' : '#ccc',  // Dynamická farba orámovania pre priateľa
    },
    friendText: {
      fontSize: 18,
      color: dark ? '#fff' : '#000',  // Farba textu podľa témy
    },
  });

export default Friends;

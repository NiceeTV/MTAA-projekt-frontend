import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useAppNavigation } from '../navigation';
import { useTheme } from './themecontext';
import { api } from '@/api/client';  // Importujeme useTheme z ThemeContext

/**
 * Komponent pre zobrazenie zoznamu priateľov používateľa.
 * 
 * Táto obrazovka umožňuje:
 * - Zobraziť zoznam aktuálnych priateľov
 * - Presmerovať na pridanie nového priateľa
 * - Kliknutím na priateľa zobraziť jeho profil
 * 
 * Hlavné funkcie:
 * - fetchFriends - načítanie zoznamu priateľov z API
 * - renderFriend - renderovanie jednotlivých položiek zoznamu
 * 
 * Komponent obsahuje:
 * - Nadpis "My Friends"
 * - Tlačidlo "Add Friend" na pridanie nového priateľa
 * - Zoznam priateľov s možnosťou kliknutia
 * - Správu o chybe ak sa nepodarí načítať priateľov
 */
const Friends = () => {
  const navigation = useAppNavigation();
  const { darkMode } = useTheme();

  const [friends, setFriends] = useState<{ id: number; username: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const themedStyles = getStyles(darkMode);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await api.get('/GetUserFriends');
        if (data?.friends) {
  setFriends(data.friends); // celé objekty, nie len username
} else if (data?.message) {
          setError(data.message);
        }
      } catch (err: any) {
        console.error('Chyba pri načítaní priateľov:', err);
        setError('Nepodarilo sa načítať priateľov.');
      }
    };

    fetchFriends();
  }, []);

  const renderFriend = ({ item }: { item: { id: number; username: string } }) => (
  <TouchableOpacity
    style={themedStyles.friendItem}
    onPress={() => {
      navigation.replace("ProfileFriend", { id: item.id });
    }}
  >
    <Text style={themedStyles.friendText}>{item.username}</Text>
  </TouchableOpacity>
);



  return (
    <View style={themedStyles.container}>
      <Text style={themedStyles.title}>My Friends</Text>

      <TouchableOpacity 
        style={themedStyles.button}
        onPress={() => { navigation.navigate("AddFriend") }}
      >
        <Text style={themedStyles.buttonText}>Add Friend</Text>
      </TouchableOpacity>

      {error ? (
        <Text style={[themedStyles.friendText, { color: darkMode ? 'white' : 'black' }] }>{error}</Text>
      ) : (
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={themedStyles.friendList}
        />
      )}
    </View>
  );
};

const getStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: dark ? '#121212' : '#f9f9f9',
      paddingTop: 40,
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: dark ? '#ffffff' : '#111111',
      textAlign: 'center',
      marginBottom: 20,
    },
    button: {
      height: 48,
      borderRadius: 12,
      backgroundColor: dark ? '#2a2a2a' : '#e0e0e0',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: dark ? '#fff' : '#000',
    },
    friendList: {
      paddingBottom: 20,
    },
    friendItem: {
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginBottom: 12,
      backgroundColor: dark ? '#2b2b2b' : '#ffffff',
      borderRadius: 16,
      borderWidth: 2,
      borderColor: dark ? '#3a3a3a' : '#000',
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    friendText: {
      fontSize: 16,
      color: dark ? '#ffffff' : '#111111',
      fontWeight: 'bold'
    },
  });


export default Friends;

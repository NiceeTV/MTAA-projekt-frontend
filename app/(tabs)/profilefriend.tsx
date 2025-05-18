import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';
import { api } from '@/api/client';
import { useTheme } from './themecontext';
import { useAppNavigation } from '../navigation';

/**
 * Profilová obrazovka priateľa
 * 
 * Tento komponent zobrazuje:
 * - Profilové informácie priateľa (fotka, meno, biografia)
 * - Možnosť zobrazenia štatistík a výletov priateľa
 * - Funkciu na zrušenie priateľstva
 * 
 * Hlavné funkcie:
 * - Načítanie profilových údajov priateľa z API
 * - Navigácia na štatistiky a výlety priateľa
 * - Spracovanie žiadosti o zrušenie priateľstva
 * - Automatická aktualizácia zoznamu priateľov po zmazání
 * 
 * Štýly:
 * - Prispôsobenie pre dark/light režim
 * - Responzívny dizajn pre rôzne veľkosti obrazoviek
 * - Konzistentné vizuálne prvky s ostatnými profilovými obrazovkami
 */

type ProfileFriendRouteProp = RouteProp<RootStackParamList, 'ProfileFriend'>;

const ProfileFriend = () => {
  const route = useRoute<ProfileFriendRouteProp>();
  const { id } = route.params;

  const { darkMode } = useTheme();
  const [image, setImage] = useState<string | null>(null);
  const [biography, setBiography] = useState('');
  const navigation = useAppNavigation();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchFriendData = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        if (response.bio) setBiography(response.bio);
        if (response.username) setUsername(response.username);
      } catch (error) {
        console.error('Error fetching friend profile:', error);
      }
    };

    fetchFriendData();
  }, [id]);

  const unfriend = async () => {
    try {
      // API call to delete the friend
      const response = await api.delete('/deleteFriend', { friend_to_delete_id: id } // Correct field name
      );
      navigation.replace("Friends");

      if (response.status === 200) {
        navigation.replace("Friends");
        // After successfully unfriending, go back to the friends list or any other screen
        console.log(response.data.message); // If you want to log the success message
        // Or navigate to another screen as needed
      }
    } catch (error) {
      console.error('Error unfriending:', error);
      navigation.replace("Friends");
    }
};


  const themedStyles = getStyles(darkMode);

  return (
    <View style={themedStyles.container}>
      <View style={themedStyles.topSection}>
        <Image
          source={image ? { uri: image } : require('../../assets/images/default-avatar.png')}
          style={themedStyles.avatar}
        />
        <Text style={themedStyles.username}>{username}</Text>
      </View>

      <View style={themedStyles.middleSection}>
        <Text style={themedStyles.sectionTitle}>Biography</Text>
        <Text style={themedStyles.input}>
          {biography || 'No biography available.'}
        </Text>
      </View>

      <View style={themedStyles.bottomSection}>
        <TouchableOpacity style={themedStyles.button} onPress={() => {navigation.navigate('StatisticsFriend', {id})}}>
          <Text style={themedStyles.buttonText}>Statistics</Text>
        </TouchableOpacity>

        <TouchableOpacity style={themedStyles.button} onPress={() => console.log('Navigate to friend trips')}>
          <Text style={themedStyles.buttonText}>Trips</Text>
        </TouchableOpacity>

        <TouchableOpacity style={themedStyles.button} onPress={unfriend}>
          <Text style={themedStyles.buttonText}>Unfriend</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: dark ? '#1a1a1a' : '#fff',
      padding: 20,
    },
    topSection: {
      alignItems: 'center',
      marginBottom: 30,
    },
    avatar: {
      width: 150,
      height: 150,
      borderRadius: 75,
      borderWidth: 2,
      borderColor: dark ? '#ccc' : '#333',
    },
    username: {
      fontSize: 28,
      fontWeight: '600',
      color: dark ? '#fff' : '#000',
      marginVertical: 10,
    },
    middleSection: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: dark ? '#fff' : '#000',
      marginBottom: 10,
    },
    input: {
      borderWidth: 2,
      borderColor: dark ? '#555' : '#333',
      borderRadius: 20,
      padding: 15,
      fontSize: 16,
      minHeight: 100,
      color: dark ? '#fff' : '#000',
      backgroundColor: dark ? '#444' : '#f9f9f9',
    },
    bottomSection: {
      gap: 10,
    },
    button: {
      backgroundColor: dark ? '#444' : '#fff',
      borderColor: dark ? '#555' : '#333',
      borderWidth: 2,
      padding: 12,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    buttonText: {
      color: dark ? '#fff' : '#000',
      fontWeight: '600',
      fontSize: 16,
    },
  });

export default ProfileFriend;

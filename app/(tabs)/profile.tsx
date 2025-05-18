import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '@/services/auth';
import { useTheme } from './themecontext';
import { api } from '@/api/client';
import { useAppNavigation } from '../navigation';
import {useOffline} from "@/context/OfflineContext";

interface MyJwtPayload {
  username: string;
  userId: number;
}
/**
 * Profilová obrazovka používateľa
 * 
 * Tento komponent umožňuje:
 * - Zobrazenie a úpravu používateľského profilu (fotka, meno, biografia)
 * - Prepínanie medzi tmavým a svetlým režimom
 * - Navigáciu na priateľov a štatistiky
 * - Odhlásenie používateľa
 * 
 * Hlavné funkcie:
 * - Načítanie používateľských údajov po prihlásení
 * - Úprava profilovej fotky z galérie
 * - Aktualizácia používateľskej biografie
 * - Riadenie témy aplikácie (dark/light mode)
 * - Odhlásenie s potvrdzovacím dialógom
 * 
 * Štýly:
 * - Prispôsobenie pre dark/light režim
 * - Responzívny dizajn pre rôzne veľkosti obrazoviek
 * - Konzistentné vizuálne prvky v celej aplikácii
 */
const Profile = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [username, setUsername] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [biography, setBiography] = useState('');
  const [id, setId] = useState('');
  const navigation = useAppNavigation();
  const jeOffline = useOffline();

  const handleLogout = async () => {
    Alert.alert(
      'Potvrdiť odhlásenie',
      'Skutočne sa chcete odhlásiť?',
      [
        {
          text: 'Zrušiť',
          onPress: () => console.log('Odhlásenie zrušené'),
          style: 'cancel',
        },
        {
          text: 'Odhlásiť sa',
          onPress: async () => {
            try {
              // Zavoláme funkciu na odhlásenie používateľa
              await AuthService.logout();

              // Presmerujeme používateľa na login stránku po odhlásení
              navigation.navigate('Login'); // Toto presmerovanie závisí od vašich nastavení navigácie
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
  const fetchUser = async () => {
    if (!jeOffline) {
      try {
        const token = await AuthService.getToken();
        if (token) {
          const decoded = jwtDecode<MyJwtPayload>(token);
          setUsername(decoded.username);
          const userId = decoded.userId.toString();
          setId(userId);

          // Fetch user's current biography after determining the user ID
          const response = await api.get(`/users/${userId}`);

          if (response.bio) {
            setBiography(response.bio);
          } else {
            console.warn('Biography not found in the response');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  };

  fetchUser();
}, []);

  const pickImage = async () => {
    const permissionResponse = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResponse.granted) {
      alert('Permission to access gallery is required!');
      return;
    }

    if (!jeOffline) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    }
  };

  const saveBio = async () => {
    if (!jeOffline) {
      try {
        if (!id) {
          alert('User ID is not loaded yet.');
          return;
        }

        const token = await AuthService.getToken();
        if (!token) throw new Error('Token not found');

        await api.put(`/users/${id}/biography`, { bio: biography });

        alert('Biography updated!');
      } catch (error: any) {
        console.error('Error updating biography:', error?.response?.data || error.message);
        alert('Failed to update biography');
      }
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
        <Text style={themedStyles.username}>{username || 'Loading...'}</Text>
        <TouchableOpacity style={themedStyles.smallButton} onPress={pickImage}>
          <Text style={themedStyles.smallButtonText}>Edit Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={themedStyles.middleSection}>
        <TextInput
          style={themedStyles.input}
          placeholder="Write something about yourself..."
          value={biography}
          onChangeText={setBiography}
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity style={themedStyles.smallButton} onPress={saveBio}>
          <Text style={themedStyles.smallButtonText}>Save Biography</Text>
        </TouchableOpacity>
      </View>

      <View style={themedStyles.bottomSection}>
        <TouchableOpacity style={themedStyles.button} disabled={jeOffline}  onPress={() => {navigation.navigate("Friends")}}>
          <Text style={themedStyles.buttonText}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity style={themedStyles.button} disabled={jeOffline} onPress={() => {navigation.navigate("Statistics")}}>
          <Text style={themedStyles.buttonText}>Statistics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={themedStyles.button} onPress={toggleDarkMode}>
          <Text style={themedStyles.buttonText}>{darkMode ? 'Light Mode' : 'Dark Mode'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={themedStyles.button} disabled={jeOffline} onPress={handleLogout} >
          <Text style={themedStyles.buttonText}>Log Out</Text>
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
    smallButton: {
      backgroundColor: dark ? '#444' : '#fff',
      borderColor: dark ? '#555' : '#333',
      borderWidth: 2,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    smallButtonText: {
      color: dark ? '#fff' : '#000',
      fontWeight: '500',
    },
    middleSection: {
      marginBottom: 30,
    },
    input: {
      borderWidth: 2,
      borderColor: dark ? '#555' : '#333',
      borderRadius: 20,
      padding: 15,
      fontSize: 16,
      height: 120,
      color: dark ? '#fff' : '#000',
      backgroundColor: dark ? '#444' : '#f9f9f9',
      marginBottom: 10,
    },
    bottomSection: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    button: {
      flex: 1,
      backgroundColor: dark ? '#444' : '#fff',
      borderColor: dark ? '#555' : '#333',
      borderWidth: 2,
      padding: 12,
      marginHorizontal: 5,
      marginBottom: 10,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: dark ? '#fff' : '#000',
      fontWeight: '600',
    },
  });


export default Profile;

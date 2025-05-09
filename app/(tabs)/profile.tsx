import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { AuthService } from '@/services/auth';
import { useTheme } from './themecontext';

interface MyJwtPayload {
  username: string;
  userId: number;
}

const Profile = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [username, setUsername] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [biography, setBiography] = useState('');
  const [id, setId] = useState('');

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const token = await AuthService.getToken();
      if (token) {
        const decoded = jwtDecode<MyJwtPayload>(token);
        setUsername(decoded.username);
        const userId = decoded.userId.toString();
        setId(userId);

        // Fetch user's current biography po zistení ID
        const response = await axios.get(`http://192.168.100.215:3000/users/${userId}`);
        if (response.data.bio) {
          setBiography(response.data.bio);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
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

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const saveBio = async () => {
  try {
    if (!id) {
      alert('User ID is not loaded yet.');
      return;
    }

    const token = await AuthService.getToken();
    if (!token) throw new Error('Token not found');

    await axios.put(
      `http://192.168.100.215:3000/users/${id}/biography`,
      { bio: biography },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert('Biography updated!');
  } catch (error: any) {
    console.error('Error updating biography:', error?.response?.data || error.message);
    alert('Failed to update biography');
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
        <TouchableOpacity style={themedStyles.button} onPress={() => {}}>
          <Text style={themedStyles.buttonText}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity style={themedStyles.button} onPress={() => {}}>
          <Text style={themedStyles.buttonText}>Statistics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={themedStyles.button} onPress={toggleDarkMode}>
          <Text style={themedStyles.buttonText}>{darkMode ? 'Light Mode' : 'Dark Mode'}</Text>
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
      backgroundColor: dark ? '#444' : '#e0e0e0',
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 15,
    },
    smallButtonText: {
      color: dark ? '#fff' : '#000',
      fontWeight: '500',
    },
    middleSection: {
      marginBottom: 30,
    },
    input: {
      borderWidth: 1,
      borderColor: dark ? '#666' : '#ccc',
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
      height: 120,
      color: dark ? '#fff' : '#000',
      backgroundColor: dark ? '#333' : '#f9f9f9',
      marginBottom: 10,
    },
    bottomSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    button: {
      flex: 1,
      backgroundColor: dark ? '#555' : '#333',
      padding: 12,
      marginHorizontal: 5,
      borderRadius: 10,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
    },
  });

export default Profile;

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '@/services/auth';

interface MyJwtPayload {
  username: string;
}

const Profile = () => {
  const [username, setUsername] = useState('');
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AuthService.getToken();
        if (token) {
          const decoded = jwtDecode<MyJwtPayload>(token);
          setUsername(decoded.username);
        }
      } catch (error) {
        console.error('Error fetching or decoding token:', error);
      }
    };

    fetchUser();
  }, []);

  const pickImage = async () => {
    // Požiadať o povolenie na prístup k galérii
    const permissionResponse = await ImagePicker.requestMediaLibraryPermissionsAsync(); 
  
    console.log('Current permission status:', permissionResponse);
  
    if (!permissionResponse.granted) {
      alert('Permission to access gallery is required!');
      return;
    }
  
    // Po získaní povolenia, otvor galériu
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
  

  return (
    <View style={styles.container}>
      <View style={styles.topHalf}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={image ? { uri: image } : require('../../assets/images/default-avatar.png')}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <Text style={styles.username}>{username || 'Loading...'}</Text>
      </View>

      <View style={styles.middle}>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Biography"
            multiline
            textAlignVertical='top'
          />
        </View>
      </View>

      <View style={styles.bottomHalf}>
        <View style={styles.form}>
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.buttonText}>Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.buttonText}>Statistics</Text>
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
    backgroundColor: '#fff',
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  bottomHalf: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  username: {
    fontSize: 35,
    fontWeight: '300',
    marginTop: 10,
  },
  avatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#333',
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    padding: 10,
    marginBottom: 20,
    borderRadius: 10,
    width: 300,
    height: 150,
    fontSize: 18,
  },
});

export default Profile;

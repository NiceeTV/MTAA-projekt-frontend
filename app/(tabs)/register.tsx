import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import { AuthService } from '@/services/auth';
import { useAppNavigation } from '../navigation';
import axios from "axios";

const Register = () => {
  const navigation = useAppNavigation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      return Alert.alert('Error', 'Všetky polia musia byť vyplnené.');
    }

    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Heslá sa nezhodujú.');
    }

    try {
      await AuthService.register(username, email, password);
      Alert.alert('Success', 'Účet bol úspešne vytvorený!');
      navigation.navigate('Home');
    } catch (error) {
      let message = 'Chyba pri registrácii.';

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }

      Alert.alert('Registrácia zlýhala', message);
    }
  };

  return (
      <View style={styles.container}>
        <View style={styles.topHalf}>
          <Text style={styles.title}>Travel Diary App</Text>
        </View>
        <View style={styles.bottomHalf}>
          <View style={styles.form}>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Sign Up</Text>
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
    backgroundColor: '#fff', // Optional, for styling
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
  },
  form: {
    width: 300, // Adjust based on your design
    padding: 10,
  },
  input: {
    height: 50,
    borderColor: '#333',
    borderWidth: 2,
    marginBottom: 20,
    paddingLeft: 10,
    borderRadius: 20,
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
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',     // Center content horizontally
  },
  question: {
    opacity: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default Register;
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AuthService } from '@/services/auth';
import { useAppNavigation } from '../navigation';
import axios from 'axios';
import { useTheme } from './themecontext';

const Register = () => {
  const navigation = useAppNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { darkMode } = useTheme();

  const themedStyles = getStyles(darkMode);

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      return Alert.alert('Chyba', 'Všetky polia musia byť vyplnené.');
    }

    if (password !== confirmPassword) {
      return Alert.alert('Chyba', 'Heslá sa nezhodujú.');
    }

    try {
      await AuthService.register(username, email, password);
      Alert.alert('Úspech', 'Účet bol úspešne vytvorený!');
      navigation.navigate('Home');
    } catch (error) {
      let message = 'Chyba pri registrácii.';

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }

      Alert.alert('Registrácia zlyhala', message);
    }
  };

  return (
    <View style={themedStyles.container}>
      <View style={themedStyles.bottomHalf}>
        <Text style={themedStyles.title}>Travel Diary App</Text>
        <View style={themedStyles.form}>
          <TextInput
            style={themedStyles.input}
            placeholder="Username"
            placeholderTextColor={darkMode ? '#aaa' : '#666'}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={themedStyles.input}
            placeholder="Email"
            placeholderTextColor={darkMode ? '#aaa' : '#666'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={themedStyles.input}
            placeholder="Password"
            placeholderTextColor={darkMode ? '#aaa' : '#666'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={themedStyles.input}
            placeholder="Confirm Password"
            placeholderTextColor={darkMode ? '#aaa' : '#666'}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity style={themedStyles.button} onPress={handleRegister}>
            <Text style={themedStyles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <Text style={themedStyles.question}>Already have an account?</Text>
          <TouchableOpacity style={themedStyles.button} onPress={() => navigation.replace('Login')}>
            <Text style={themedStyles.buttonText}>Back to Login</Text>
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
    input: {
      height: 50,
      borderColor: dark ? '#555' : '#333',
      borderWidth: 2,
      marginBottom: 20,
      paddingLeft: 10,
      borderRadius: 20,
      color: dark ? '#fff' : '#000',
      backgroundColor: dark ? '#444' : '#f9f9f9',
    },
    button: {
      height: 50,
      borderColor: dark ? '#555' : '#333',
      borderWidth: 2,
      marginBottom: 20,
      paddingLeft: 10,
      paddingRight: 10,
      borderRadius: 20,
      backgroundColor: dark ? '#444' : '#fff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      color: dark ? '#fff' : '#000',
      fontSize: 18,
      fontWeight: 'bold',
    },
    question: {
      opacity: 0.7,
      color: dark ? '#ccc' : '#555',
      textAlign: 'center',
      marginBottom: 10,
    },
  });

export default Register;

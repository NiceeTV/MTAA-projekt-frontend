import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAppNavigation } from '../navigation';
import { AuthService } from '@/services/auth';
import axios from "axios";
import { useTheme } from './themecontext';

/**
 * Prihlasovacia obrazovka pre aplikáciu.
 * 
 * Tento komponent umožňuje:
 * - Prihlásenie existujúceho používateľa pomocou mena a hesla
 * - Presmerovanie na registráciu pre nových používateľov
 * - Možnosť pokračovať ako hosť bez prihlásenia
 * 
 * Hlavné funkcie:
 * - Validácia vstupných polí (username, password)
 * - Komunikácia s AuthService pre prihlásenie
 * - Spracovanie chybových stavov
 * - Zobrazenie načítavacieho indikátora počas prihlasovania
 * 
 * Štýly:
 * - Prispôsobenie dark/light režimu
 * - Konzistentný dizajn s ostatnými obrazovkami
 * - Farebné odlíšenie aktívnych a neaktívnych stavov
 */
const LoginPage = () => {
  const navigation = useAppNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { darkMode } = useTheme();

  const themedStyles = getStyles(darkMode);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Chyba', 'Prosím vyplňte všetky polia');
      return;
    }

    setIsLoading(true);

    try {
      const success = await AuthService.login(username, password);
      if (success) {
        navigation.replace('Home');
      }
    } catch (error) {
      let message = 'Nesprávne prihlasovacie údaje';

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }

      Alert.alert('Prihlásenie zlyhalo', message);
    } finally {
      setIsLoading(false);
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
            placeholder="Password"
            placeholderTextColor={darkMode ? '#aaa' : '#666'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={[themedStyles.button, isLoading && themedStyles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={themedStyles.buttonText}>
              {isLoading ? 'Prihlasujem...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <Text style={themedStyles.question}>Do not have an account yet?</Text>
          <TouchableOpacity
            style={themedStyles.button}
            onPress={() => navigation.replace("Register")}
            disabled={isLoading}
          >
            <Text style={themedStyles.buttonText}>Register</Text>
          </TouchableOpacity>

          <Text style={themedStyles.question}>Or</Text>
          <TouchableOpacity
            style={themedStyles.button}
            onPress={() => navigation.replace("Home")}
            disabled={isLoading}
          >
            <Text style={themedStyles.buttonText}>Continue as Guest</Text>
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
    disabledButton: {
      opacity: 0.6,
    },
    question: {
      opacity: 0.7,
      color: dark ? '#ccc' : '#555',
      textAlign: 'center',
      marginBottom: 10,
    },
    buttonText: {
      color: dark ? '#fff' : '#000',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

export default LoginPage;

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { api } from '@/api/client';
import { AuthService } from '@/services/auth';
import { useTheme } from './themecontext';  // Importujeme useTheme z ThemeContext

const Statistics = () => {
  const [tripCount, setTripCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { darkMode } = useTheme();  // Používame hook na prístup k téme

  const themedStyles = getStyles(darkMode);

  useEffect(() => {
    const fetchTripCount = async () => {
      try {
        // Získanie user_id z tokenu
        const user_id = await AuthService.getUserIdFromToken();
        console.log(user_id);

        // Volanie API s user_id
        const response = await api.get(`/users/${user_id}/statistics`);

        console.log(response);

        // Skontrolujeme, či odpoveď obsahuje pole a ak áno, nastavíme počet výletov
        if (Array.isArray(response.data)) {
          setTripCount(response.data.length);
        } else {
          setTripCount(0); // Ak odpoveď nie je pole, počet výletov je 0
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Chyba pri získavaní výletov:', err);
        setError('Chyba pri načítavaní štatistík.');
        setLoading(false);
      }
    };

    fetchTripCount();
  }, []); // Tento useEffect sa spustí iba raz pri mountovaní komponentu

  if (loading) {
    return (
      <View style={themedStyles.container}>
        <Text style={themedStyles.text}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={themedStyles.container}>
        <Text style={themedStyles.text}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={themedStyles.container}>
      <View style={themedStyles.borderContainer}>
        <Text style={themedStyles.text}>Počet výletov: {tripCount}</Text>
      </View>
    </View>
  );
};

const getStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: dark ? '#1a1a1a' : '#fff',  // Dynamické pozadie
    },
    borderContainer: {
      marginTop: 20,  // Pridaný margin-top na oddelenie od vrchnej časti
      marginHorizontal: 20,  // Pridané okraje na bokoch
      padding: 15,
      borderColor: dark ? '#555' : '#333',  // Farba orámovania podľa témy
      borderWidth: 2,
      borderRadius: 10,  // Zaoblené rohy orámovania
      backgroundColor: dark ? '#444' : '#fff',  // Dynamická farba pozadia orámovania
    },
    text: {
      fontSize: 18,
      color: dark ? '#fff' : '#000',  // Dynamická farba textu
      fontWeight: 'bold',
      textAlign: 'center',  // Centrovane pre vzhľad v rámci orámovaného boxu
    },
  });

export default Statistics;

import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { api } from '@/api/client';
import { AuthService } from '@/services/auth';

const Statistics = () => {
  const [tripCount, setTripCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTripCount = async () => {
      try {
        // Získanie user_id z tokenu
        const user_id = await AuthService.getUserIdFromToken();
        console.log(user_id);

        // Volanie API s user_id
        const response = await api.get(`/users/${user_id}/trip`);

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
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>Počet výletov: {tripCount}</Text>
    </View>
  );
};

export default Statistics;

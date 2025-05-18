import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from './themecontext';
import { api } from '@/api/client';
import { useAppNavigation } from '../navigation';

/**
 * Komponent pre pridávanie nových priateľov.
 * 
 * Táto obrazovka umožňuje používateľovi:
 * - Vyhľadávať používateľov podľa používateľského mena
 * - Posielať žiadosti o priateľstvo nájdeným používateľom
 * - Zobrazuje stav odosielania žiadostí
 * 
 * Hlavné funkcie:
 * - searchUsers - vyhľadá používateľov na základe zadaného mena
 * - sendFriendRequest - odosiela žiadosť o priateľstvo konkrétnemu používateľovi
 * 
 * Komponent obsahuje:
 * - Vstupné pole pre vyhľadávanie
 * - Tlačidlo pre spustenie vyhľadávania
 * - Zoznam nájdených používateľov s možnosťou pridania
 * - Indikátor načítavania počas vyhľadávania
 * - Oznámenie o úspešnom/neúspešnom odoslaní žiadosti
 * 
 * Štýly sa prispôsobujú aktuálnemu režimu (dark/light)
 */
const AddFriend = () => {
  const [username, setUsername] = useState<string>(''); // Stav pre meno používateľa
  const [searchResults, setSearchResults] = useState<any[]>([]); // Stav pre výsledky hľadania
  const [loading, setLoading] = useState<boolean>(false); // Stav pre načítavanie
  const [sendingIds, setSendingIds] = useState<number[]>([]); // Stav pre práve odosielané žiadosti
  const { darkMode } = useTheme();
  const navigation = useAppNavigation();

  // Vyhľadanie používateľov
  const searchUsers = async () => {
    if (!username.trim()) return;
    setLoading(true);
    try {
      const responseData = await api.get(`/users/search/${username}`);
      if (Array.isArray(responseData)) {
        setSearchResults(responseData);
      } else {
        console.error('Odpoveď nie je v očakávanom formáte');
        setSearchResults([]);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Chyba pri vyhľadávaní používateľov:', error.message);
      } else {
        console.error('Neznáma chyba pri vyhľadávaní používateľov');
      }
    } finally {
      setLoading(false);
    }
  };

  // Odoslanie žiadosti o priateľstvo
  const sendFriendRequest = async (target_user_id: number) => {
    setSendingIds((prev) => [...prev, target_user_id]);
    try {
      const response = await api.post('/sendFriendRequest', { target_user_id });
      Alert.alert('Úspech', 'Žiadosť bola odoslaná.');
    } catch (error: any) {
      if (error.response?.data?.error) {
        Alert.alert('Chyba', error.response.data.error);
      } else {
        Alert.alert('Chyba', 'Nepodarilo sa odoslať žiadosť.');
      }
    } finally {
      setSendingIds((prev) => prev.filter((id) => id !== target_user_id));
    }
  };

  // Render jedného výsledku
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles(darkMode).item}>
      <Text style={styles(darkMode).itemText}>{item.username}</Text>
      <TouchableOpacity
        style={styles(darkMode).infoButton}
        onPress={() => sendFriendRequest(item.id)}
        disabled={sendingIds.includes(item.id)}
      >
        <Text style={styles(darkMode).infoButtonText}>
          {sendingIds.includes(item.id) ? 'Sending...' : 'Add'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles(darkMode).container}>
      <View style={styles(darkMode).header}>
        <Text style={styles(darkMode).title}>Add Friend</Text>
      </View>

      <TextInput
        style={styles(darkMode).searchInput}
        placeholder="Vyhľadaj priateľa"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor={darkMode ? '#888' : '#777'}
      />

      <TouchableOpacity
        style={styles(darkMode).button}
        onPress={searchUsers}
        disabled={loading}
      >
        <Text style={styles(darkMode).buttonText}>Search</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color={darkMode ? '#fff' : '#000'} />}

      {Array.isArray(searchResults) && searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles(darkMode).list}
        />
      )}
    </View>
  );
};

const styles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 24,
      backgroundColor: dark ? '#121212' : '#f5f5f5',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: dark ? '#ffffff' : '#000000',
    },
    searchInput: {
      height: 48,
      borderColor: dark ? '#444' : '#ccc',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 16,
      backgroundColor: dark ? '#1e1e1e' : '#ffffff',
      color: dark ? '#ffffff' : '#000000',
    },
    list: {
      paddingBottom: 20,
      flex: 1,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      paddingHorizontal: 14,
      height: 64,
      marginVertical: 6,
      borderWidth: 1,
      borderColor: dark ? '#444' : '#ddd',
      backgroundColor: dark ? '#1f1f1f' : '#ffffff',
    },
    itemText: {
      flex: 1,
      fontSize: 16,
      color: dark ? '#ffffff' : '#000000',
    },
    infoButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: dark ? '#2a2a2a' : '#eaeaea',
      borderColor: dark ? '#555' : '#ccc',
      borderWidth: 1,
    },
    infoButtonText: {
      color: dark ? '#ffffff' : '#000000',
      fontSize: 14,
      fontWeight: '500',
    },
    button: {
      flexDirection: 'row',
      height: 50,
      width: 250,
      borderColor: dark ? '#555' : '#333',
      borderWidth: 2,
      marginBottom: 20,
      paddingHorizontal: 10,
      borderRadius: 20,
      backgroundColor: dark ? '#444' : '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
    },
    buttonText: {
      fontSize: 18,
      color: dark ? '#fff' : '#000',
      fontWeight: 'bold',
    },
  });

export default AddFriend;

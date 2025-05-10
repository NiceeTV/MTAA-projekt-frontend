import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from './themecontext';  // Importujeme useTheme z ThemeContext
import { api } from '@/api/client'; // Predpokladám, že api je správne importované

const AddFriend = () => {
  const [username, setUsername] = useState<string>(''); // Stav pre meno používateľa
  const [searchResults, setSearchResults] = useState<any[]>([]); // Stav pre výsledky hľadania
  const [loading, setLoading] = useState<boolean>(false); // Stav pre načítavanie
  const { darkMode } = useTheme();  // Používame hook na prístup k téme

  // Funkcia na vyhľadávanie používateľov podľa mena
  const searchUsers = async () => {
    if (!username.trim()) {
      return; // Ak je prázdny reťazec, nerob nič
    }

    setLoading(true); // Nastavíme, že načítavame
    try {
      const responseData = await api.get(`/users/search/${username}`);
      console.log('Odpoveď z API:', responseData); // Zobrazíme odpoveď v konzole

      if (Array.isArray(responseData)) {
        setSearchResults(responseData); // Nastavíme výsledky hľadania
      } else {
        console.error('Odpoveď nie je v očakávanom formáte');
        setSearchResults([]); // Ak je odpoveď neplatná, nastavíme prázdne pole
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Chyba pri vyhľadávaní používateľov:', error.message);
      } else {
        console.error('Neznáma chyba pri vyhľadávaní používateľov');
      }
    } finally {
      setLoading(false); // Po skončení načítavania, vypneme indikátor
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles(darkMode).item}>
      <Text style={styles(darkMode).itemText}>{item.username}</Text>
      <TouchableOpacity style={styles(darkMode).infoButton}>
        <Text style={styles(darkMode).infoButtonText}>Add</Text>
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
      <TouchableOpacity style={styles(darkMode).button} onPress={searchUsers} disabled={loading}>
        <Text style={styles(darkMode).buttonText}>Search</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color={darkMode ? "#fff" : "#000"} />}

      {Array.isArray(searchResults) && searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles(darkMode).list}
        />
      ) : (
        !loading
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

import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { api } from '@/api/client'; // Predpokladám, že api je správne importované

const AddFriend = () => {
  const [username, setUsername] = useState<string>(''); // Stav pre meno používateľa
  const [searchResults, setSearchResults] = useState<any[]>([]); // Stav pre výsledky hľadania
  const [loading, setLoading] = useState<boolean>(false); // Stav pre načítavanie

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
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.username}</Text>
      <TouchableOpacity style={styles.infoButton}>
        <Text style={styles.infoButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Friend</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search for users"
        value={username}
        onChangeText={setUsername} 
      />
      <TouchableOpacity style={styles.button} onPress={searchUsers} disabled={loading}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {Array.isArray(searchResults) && searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      ) : (
        !loading
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  list: {
    paddingBottom: 20,
    flex: 1,
    borderRadius: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 10,
    height: 60,
    marginTop: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#C3C3C3',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
  },
  infoButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#199FFF', // Nastavíme modrú farbu pre tlačidlo
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#000',
    padding: 16,
    marginTop: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AddFriend;

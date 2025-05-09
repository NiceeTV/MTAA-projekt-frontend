import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import axios from 'axios';
import { useAppNavigation } from '../navigation';

const AddFriend = () => {
    const navigation = useAppNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);

    // Funkcia na vyhľadávanie používateľov podľa mena
    const searchUsers = async () => {
        try {
            const response = await axios.get(`https://your-api-url.com/users/search?name=${searchQuery}`);
            setUsers(response.data); // Predpokladáme, že odpoveď obsahuje zoznam používateľov
        } catch (error) {
            console.error("Error searching for users:", error);
        }
    };

    return (
        <View>
            <Text>Add Friends</Text>
            <TextInput
                placeholder="Search by name"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
            />
            <TouchableOpacity onPress={searchUsers}>
                <Text>Search</Text>
            </TouchableOpacity>

            {users.length > 0 && (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View>
                            <Text>{item.name}</Text>
                        </View>
                    )}
                />
            )}

            <TouchableOpacity onPress={() => navigation.navigate("Friends")}>
                <Text>Add Friend</Text>
            </TouchableOpacity>
        </View>
    );
};

export default AddFriend;

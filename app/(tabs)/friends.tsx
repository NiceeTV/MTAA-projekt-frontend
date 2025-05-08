import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAppNavigation } from '../navigation';

const Friends = () => {
    const navigation = useAppNavigation();
	 return (
	 	 <View>
            <Text>My Friends</Text>
            <TouchableOpacity onPress={() => {navigation.navigate("AddFriend")}}>
                <Text>Add Friend</Text>
            </TouchableOpacity>
	 	 </View>
	 );
};

export default Friends;

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAppNavigation } from '../navigation';

const AddFriend = () => {
    const navigation = useAppNavigation();
	 return (
	 	 <View>
	 	 	<Text>Add Friends</Text>
            <TouchableOpacity onPress={() => {navigation.navigate("Friends")}}>
                <Text>Add Friend</Text>
            </TouchableOpacity>
	 	 </View>
	 );
};

export default AddFriend;

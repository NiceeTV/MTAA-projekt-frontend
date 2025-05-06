import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAppNavigation } from '../navigation';

const AddTrip = () => {
    const navigation = useAppNavigation();
  return (
    <View>
      <Text>Create Trip</Text>
        <TouchableOpacity onPress={() => {navigation.navigate("Trips")}}>
                            <Text>Create Trip</Text>
                          </TouchableOpacity>
    </View>
  );
};

export default AddTrip;

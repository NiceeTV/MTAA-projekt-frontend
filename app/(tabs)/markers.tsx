import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAppNavigation } from '../navigation';

const Markers = () => {
    const navigation = useAppNavigation();
  return (
    <View>
      <Text>My Markers</Text>
         <TouchableOpacity onPress={() => {navigation.navigate("Trip")}}>
                                    <Text>Add to Trip</Text>
                                  </TouchableOpacity>
    </View>
  );
};

export default Markers;

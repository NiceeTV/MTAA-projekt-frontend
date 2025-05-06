import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAppNavigation } from '../navigation';

const ProfileFriend = () => {
    const navigation = useAppNavigation ();
  return (
    <View>
      <Text>Friend's Profile</Text>
         <TouchableOpacity onPress={() => {navigation.navigate("TripsFriend")}}>
                                    <Text>Trips</Text>
                                  </TouchableOpacity>
         <TouchableOpacity onPress={() => {navigation.navigate("StatisticsFriend")}}>
                                    <Text>Statistics</Text>
                                  </TouchableOpacity>
    </View>
  );
};

export default ProfileFriend;

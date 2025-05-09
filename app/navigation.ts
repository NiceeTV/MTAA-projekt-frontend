import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Register: undefined;
  Map: undefined;
  Profile: undefined;
  Trips: undefined;
  AddMarker: { latitude: number; longitude: number; name: string };
  TripImagesTest: undefined;
  AddFriend: undefined;
  AddTrip: undefined;
  Chat: undefined;
  Friends: undefined;
  Marker: { marker_id: string };
  Markers: undefined;
  ProfileFriend: undefined;
  Trip: undefined;
  TripsFriend: undefined;
  StatisticsFriend: undefined;
  Notifications: undefined;
  Statistics: undefined;
};

export const useAppNavigation = () => 
	 useNavigation<StackNavigationProp<RootStackParamList>>();

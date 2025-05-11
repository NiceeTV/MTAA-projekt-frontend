import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {addTripMarker, MarkerData} from "@/types/Marker";



export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Register: undefined;
  Map:
      | { type: 'single'; marker: MarkerData }
      | { type: 'multiple'; markers: MarkerData[] }
      | undefined;
  Profile: undefined;
  Trips: undefined;
  AddMarker: { latitude: number; longitude: number; name: string };
  TripImagesTest: undefined;
  AddFriend: undefined;
  AddTrip: { markers: addTripMarker[] } | undefined;
  Chat: undefined;
  Friends: undefined;
  Marker: { marker_id: string };
  Markers: { marker_ids: addTripMarker[] } | { trip_id: string } |undefined;
  ProfileFriend: {id: number};
  Trip: { trip_id: string };
  TripsFriend: undefined;
  StatisticsFriend: {id: number};
  Notifications: undefined;
  Statistics: undefined;
};

export const useAppNavigation = () => 
	 useNavigation<StackNavigationProp<RootStackParamList>>();

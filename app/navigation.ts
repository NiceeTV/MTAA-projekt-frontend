import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Register: undefined;
  Map: undefined;
  Profile: undefined;
  Trips: undefined;
  AddMarker: undefined;
  TripImagesTest: undefined;
};

export const useAppNavigation = () => 
  useNavigation<StackNavigationProp<RootStackParamList>>();

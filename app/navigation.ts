import { useNavigation, NavigationProp } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  Register: undefined;
  Map: undefined;
  Profile: undefined;
  TripImagesTest: undefined;
};

export const useAppNavigation = () => useNavigation<NavigationProp<RootStackParamList>>();
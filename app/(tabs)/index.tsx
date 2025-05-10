import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, TextStyle } from 'react-native';
import { ThemeProvider } from './themecontext';
import { AuthService } from "@/services/auth";
import LoginPage from './loginpage';
import Register from './register';
import HomePage from './homescreen';
import Maps from './maps';
import Profile from './profile';
import TripImagesTest from './tripimagestest';
import Trips from './trips';
import AddMarker from './addmarker';
import AddFriend from './addfriend';
import AddTrip from './addtrip';
import Chat from './chat';
import Friends from './friends';
import Marker from './marker';
import Markers from './markers';
import ProfileFriend from './profilefriend';
import StatisticsFriend from './statisticsfriend';
import Trip from './trip';
import TripsFriend from './tripsfriend';
import Notifications from './notifications';
import Statistics from './statistics';
import 'react-native-get-random-values';
import { useTheme } from './themecontext';
import { OfflineProvider } from '@/context/OfflineContext';
import { AuthProvider } from '@/context/AuthProvider';
import * as Font from 'expo-font';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
const Stack = createStackNavigator();



const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { darkMode } = useTheme();

  useEffect(() => {
    const checkLoggedInStatus = async () => {
      setIsLoading(true);
      const loggedIn = await AuthService.isLoggedIn();
      setIsLoggedIn(loggedIn);
      setIsLoading(false);
        console.log("tu som?");
      console.log("Zistený login status:", loggedIn);
    };

    checkLoggedInStatus();
  }, []);




    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        const loadFonts = async () => {
            await Font.loadAsync({
                ...MaterialCommunityIcons.font,
                ...Entypo.font,
                ...Feather.font,
            });
            setFontsLoaded(true);
        };

        loadFonts();
    }, []);



  if (isLoading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const screenOptionstest = {
    headerStyle: {
      backgroundColor: darkMode ? '#1e1e1e' : '#f2f2f2',
    },
    headerTintColor: darkMode ? '#ffffff' : '#000000',
    headerTitleStyle: {
      fontWeight: 'bold',
    } as TextStyle,
  };

  return (
    <Stack.Navigator initialRouteName={isLoggedIn ? "Home" : "Login"} screenOptions={screenOptionstest}>
      <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={Register} options={{ headerShown: false }}/>
      <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
      <Stack.Screen name="Map" component={Maps} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="TripImagesTest" component={TripImagesTest} />
      <Stack.Screen name="Trips" component={Trips} />
      <Stack.Screen name="AddMarker" component={AddMarker} />
      <Stack.Screen name="AddFriend" component={AddFriend} />
      <Stack.Screen name="AddTrip" component={AddTrip} />
      <Stack.Screen name="Chat" component={Chat} />
      <Stack.Screen name="Friends" component={Friends} />
      <Stack.Screen name="Marker" component={Marker} />
      <Stack.Screen name="Markers" component={Markers} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="ProfileFriend" component={ProfileFriend} />
      <Stack.Screen name="Statistics" component={Statistics} />
      <Stack.Screen name="StatisticsFriend" component={StatisticsFriend} />
      <Stack.Screen name="Trip" component={Trip} />
      <Stack.Screen name="TripsFriend" component={TripsFriend} />
    </Stack.Navigator>
  );
};

const Appl = () => {
  return (
      <AuthProvider>
          <OfflineProvider>
              <ThemeProvider>
                  <AppNavigator />
              </ThemeProvider>
          </OfflineProvider>
      </AuthProvider>
  );
};

export default Appl;

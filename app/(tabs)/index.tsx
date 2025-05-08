import React, {useEffect, useState} from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginPage from './loginpage';
import Register from './register';
import HomePage from './homescreen';
import Maps from './maps';
import Profile from './profile';
import TripImagesTest from './tripimagestest';
import Trips from './trips'
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
import {AuthService} from "@/services/auth";
import {ActivityIndicator, View} from "react-native";


const Stack = createStackNavigator();

const Appl = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Stav prihlásenia
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkLoggedInStatus = async () => {
            const loggedIn = await AuthService.isLoggedIn(); // Skontroluj, či je používateľ prihlásený
            setIsLoggedIn(loggedIn); // Nastav stav podľa toho, či je prihlásený
            setIsLoading(false); // Zastav načítavanie
        };

        checkLoggedInStatus(); // Spusti kontrolu pri načítaní komponentu
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
    <Stack.Navigator initialRouteName={isLoggedIn ? "Home" : "Login"}>
      <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }}/>
      <Stack.Screen name="Register" component={Register}/>
      <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }}  />
      <Stack.Screen name="Map" component={Maps} />
      <Stack.Screen name="Profile" component={Profile}/>
      <Stack.Screen name="TripImagesTest" component={TripImagesTest}/>
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
export default Appl;

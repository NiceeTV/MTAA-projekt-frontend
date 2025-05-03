import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginPage from './loginpage';
import Register from './loginpage2';
import HomePage from './homescreen';
import Maps from './maps';
import Profile from './profile';
import TripImagesTest from './tripimagestest';
import Trip from './trips'

const Stack = createStackNavigator();

const Appl = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }}/>
      <Stack.Screen name="Register" component={Register}/>
      <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }}  />
      <Stack.Screen name="Map" component={Maps} />
      <Stack.Screen name="Profile" component={Profile}/>
      <Stack.Screen name="TripImagesTest" component={TripImagesTest}/>
      <Stack.Screen name="Trips" component={Trip} />
    </Stack.Navigator>
  );
};
export default Appl;

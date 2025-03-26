/*import { registerRootComponent } from 'expo';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginPage from './loginpage';
import HomePage from './homescreen';
import Navigation from './Navigation';

export default function App() {
  return <HomePage />;
}*/

import { registerRootComponent } from 'expo';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginPage from './loginpage';
import HomePage from './homescreen';
import Maps from './maps';

const Stack = createStackNavigator();

const Appl = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Map" component={Maps} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
registerRootComponent(Appl);

/*export default Appl;*/
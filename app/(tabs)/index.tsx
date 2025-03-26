import { registerRootComponent } from 'expo';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginPage from './loginpage';
import HomePage from './homescreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginPage} />
      </Stack.Navigator>
      <Stack.Screen name="Home" component={HomePage} />
    </NavigationContainer>
  );
};
registerRootComponent(App);
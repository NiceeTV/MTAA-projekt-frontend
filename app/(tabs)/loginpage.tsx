import React, {useState} from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import HomePage from './homescreen';

const LoginPage = ({navigation}: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.topHalf}>
        <Text style={styles.title}>Travel Diary App</Text>
      </View>
      <View style={styles.bottomHalf}>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Username"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <Text style={styles.question}>Do not have an account yet?</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
          <Text style={styles.question}>Or</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  topHalf: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Optional, for styling
  },
  bottomHalf: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Optional, for styling
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
  },
  form: {
    width: 300, // Adjust based on your design
    padding: 10,
  },
  input: {
    height: 50,
    borderColor: '#333',
    borderWidth: 2,
    marginBottom: 20,
    paddingLeft: 10,
    borderRadius: 20,
  },
  button: {
    height: 50,
    borderColor: '#333',
    borderWidth: 0,
    marginBottom: 20,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',     // Center content horizontally
  },
  question: {
    opacity: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default LoginPage;
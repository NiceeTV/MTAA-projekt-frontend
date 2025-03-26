import React, {useState} from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';

const Profile = () => {
  return (
    <View style={styles.container}>
      <View style={styles.topHalf}>
        <Text style={styles.username}>Username</Text>
      </View>
      <View style={styles.middle}>
        <View style={styles.form}>
            <TextInput style={styles.input} placeholder="Biography" multiline textAlignVertical='top' />
        </View>
      </View>
      <View style={styles.bottomHalf}>
        <View style={styles.form}>
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.buttonText}>Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.buttonText}>Statistics</Text>
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  middle:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', 
  },
  bottomHalf: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  username: {
    fontSize: 35,
    fontWeight: 'light',
  },
  form: {
    width: 300,
    padding: 10,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    padding: 10,
    marginBottom: 20,
    borderRadius: 10,
    width: 300,
    height: 150,
    fontSize: 18,
  }
});

export default Profile;
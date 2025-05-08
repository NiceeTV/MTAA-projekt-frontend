import React, {useEffect, useState} from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAppNavigation } from '../navigation';
import { api } from '@/api/client';
import { AuthService } from '@/services/auth';
import axios from "axios";



const LoginPage = () => {
	const navigation = useAppNavigation();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);


	const handleLogin = async () => {
		if (!username || !password) {
			Alert.alert('Chyba', 'Prosím vyplňte všetky polia');
			return;
		}

		setIsLoading(true);

		try {
			const success = await AuthService.login(username, password);
			if (success) {
				navigation.replace('Home');
			}
		} catch (error) {
			let message = 'Nesprávne prihlasovacie údaje';

			if (axios.isAxiosError(error)) {
				message = error.response?.data?.message || message;
			}

			Alert.alert('Prihlásenie zlyhalo', message);
		} finally {
			setIsLoading(false);
		}
	};


	 return (
		 <View style={styles.container}>

			 <View style={styles.bottomHalf}>
				 <Text style={styles.title}>Travel Diary App</Text>
				 <View style={styles.form}>
					 <TextInput
						 style={styles.input}
						 placeholder="Username"
						 value={username}
						 onChangeText={setUsername}
						 autoCapitalize="none"
					 />
					 <TextInput
						 style={styles.input}
						 placeholder="Password"
						 secureTextEntry
						 value={password}
						 onChangeText={setPassword}
					 />
					 <TouchableOpacity
						 style={[styles.button, isLoading && styles.disabledButton]}
						 onPress={handleLogin}
						 disabled={isLoading}
					 >
						 <Text style={styles.buttonText}>
							 {isLoading ? 'Prihlasujem...' : 'Sign In'}
						 </Text>
					 </TouchableOpacity>
					 <Text style={styles.question}>Do not have an account yet?</Text>
					 <TouchableOpacity
						 style={styles.button}
						 onPress={() => navigation.navigate("Register")}
						 disabled={isLoading}
					 >
						 <Text style={styles.buttonText}>Register</Text>
					 </TouchableOpacity>
					 <Text style={styles.question}>Or</Text>
					 <TouchableOpacity
						 style={styles.button}
						 onPress={() => navigation.navigate("Home")}
						 disabled={isLoading}
					 >
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
	 	 backgroundColor: '#fff',
	 },
	 bottomHalf: {
	 	 flex: 3,
	 	 justifyContent: 'center',
	 	 alignItems: 'center',
	 	 backgroundColor: '#fff',
	 },
	 title: {
	 	 fontSize: 35,
	 	 fontWeight: 'bold',
	 },
	 form: {
	 	 width: 300,
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
	 	 justifyContent: 'center',
	 	 alignItems: 'center',
	 },
	 disabledButton: {
	 	 opacity: 0.6,
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
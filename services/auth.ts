import * as SecureStore from 'expo-secure-store';
import { api } from '@/api/client';
import { jwtDecode } from 'jwt-decode';
import {Alert} from "react-native";

const AUTH_TOKEN_KEY = 'auth_token';

interface MyJwtPayload {
    userId: number;
    username: string;
    exp: number;
    iat: number;
}



export const AuthService = {
    async login(username: string, password: string) {
        try {
            const response = await api.post('/users/login', { username, password });
            await this.saveToken(response.token); /* uložíme si jwt token */
            return true;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async register(username: string, email: string, password: string) {
        try {
            const response = await api.post('/users/register', { username, email, password });


            /* uložíme jwt token */
            await this.saveToken(response.token);

            return true;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    },

    async getUserIdFromToken() {
        try {
            const token = await this.getToken();
            if (token) {
                const decoded = jwtDecode<MyJwtPayload>(token);
                return decoded.userId || null;
            }
        } catch (error) {
            console.error('Chyba pri dekódovaní tokenu:', error);
            return null;
        }
    },


    async saveToken(token: string) {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    },

    async getToken() {
        return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    },

    async removeToken() {
        return await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    },


    async logout() {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    },

    async isLoggedIn() {
        const token = await this.getToken();

        /* ak nemá token, nie je prihlásený */
        if (!token) {
            return false;
        }

        try {
            /* dekódujeme token a zistíme platnosť */
            const decoded = jwtDecode<MyJwtPayload>(token);
            const currentTime = Math.floor(Date.now() / 1000); // Aktuálny čas v sekundách

            /* ak vypršal token */
            if (decoded.exp < currentTime) {
                Alert.alert('Chyba', 'Token vypršal, prihláste sa znova!');
                return false;
            }

            /* kontrola platnosti tokenu */
            const response = await api.post('/validate-token', {});


            if (!response.valid) {
                Alert.alert('Chyba', 'Token je neplatný, prihláste sa znova!');
            }

            /* token je platný */
            return response.valid;
        } catch (error) {
            Alert.alert('Chyba', 'Chyba pri overovaní prihlásenia!');
            return false; /* používateľ nemá byť prihlásený */
        }
    }
};
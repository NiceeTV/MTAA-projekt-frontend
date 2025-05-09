import * as SecureStore from 'expo-secure-store';
import { api } from '@/api/client';
import { jwtDecode } from 'jwt-decode';

const AUTH_TOKEN_KEY = 'auth_token';


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
        interface MyJwtPayload {
            userId: number;
            username: string;
            exp: number;
            iat: number;
        }

        try {
            const token = await this.getToken();
            if (token) {
                const decoded = jwtDecode<MyJwtPayload>(token);
                console.log(decoded);
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

    async logout() {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    },

    async isLoggedIn() {
        const token = await this.getToken();
        return !!token;
    }
};
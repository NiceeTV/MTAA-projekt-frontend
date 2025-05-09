import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'auth_token';

const apiClient = axios.create({
    baseURL: "http://192.168.0.105:3000",
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});


apiClient.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const api = {
    get: async (endpoint: string) => {
        try {
            const response = await apiClient.get(endpoint);
            return response.data;
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    },

    post: async (endpoint: string, data: any) => {
        try {
            const response = await apiClient.post(endpoint, data);
            console.log(endpoint);
            return response.data;


        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    }
};
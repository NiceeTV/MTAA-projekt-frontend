import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {AuthService} from "@/services/auth";
import Constants from "expo-constants";
const { API_BASE_URL } = Constants.expoConfig?.extra || {};


const AUTH_TOKEN_KEY = 'auth_token';
const PUBLIC_ENDPOINTS = ['/users/login', '/users/register','/validate-token'];


const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
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


const ensureLoggedIn = async (endpoint: string) => {
    const isPublic = PUBLIC_ENDPOINTS.some(publicPath => endpoint.startsWith(publicPath));
    if (isPublic) return;


    const loggedIn = await AuthService.isLoggedIn();
    if (!loggedIn) {
        throw new Error("User is not logged in. Request blocked.");
    }
};


export const getBaseUrl = () => {
    return Constants.expoConfig?.extra?.API_BASE_URL || '';
};


export const api = {
    get: async (endpoint: string) => {
        await ensureLoggedIn(endpoint);
        try {
            const response = await apiClient.get(endpoint);
            return response.data;
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    },

    post: async (endpoint: string, data: any) => {
        await ensureLoggedIn(endpoint);
        try {
            const response = await apiClient.post(endpoint, data);
            return response.data;

        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    },

    put: async (endpoint: string, data: any) => {
        await ensureLoggedIn(endpoint);
        try {
            const response = await apiClient.put(endpoint, data);
            return response.data;

        } catch (error) {
            console.error('API PUT Error:', error);
            throw error;
        }
    },

    delete: async (endpoint: string, data: any) => {
    await ensureLoggedIn(endpoint);
    try {
        const response = await apiClient.delete(endpoint, {
            data,
        });
        console.log(endpoint);
        return response.data;
    } catch (error) {
        console.error('API DELETE Error:', error);
        throw error;
    }
}

};
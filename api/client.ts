import axios from 'axios';

const apiClient = axios.create({
    baseURL: "http://192.168.0.105:3000",
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
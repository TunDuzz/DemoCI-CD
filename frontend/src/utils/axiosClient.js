import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const axiosClient = axios.create({
    baseURL: '/api/', // Changed to relative path for Reverse Proxy
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(
    (config) => {
        // Get token from Zustand store
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access (e.g., clear token, logout)
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default axiosClient;

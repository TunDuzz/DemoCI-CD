import axiosClient from '@/utils/axiosClient';

export const authService = {
    login: async (email, password) => {
        const response = await axiosClient.post('/auth/login', { email, password });
        return response; // axiosClient interceptor already returns response.data
    },

    register: async (email, password, displayName) => {
        const response = await axiosClient.post('/auth/register', { email, password, displayName });
        return response;
    },

    refreshToken: async (token, refreshToken) => {
        const response = await axiosClient.post('/auth/refresh-token', { token, refreshToken });
        return response;
    }
};

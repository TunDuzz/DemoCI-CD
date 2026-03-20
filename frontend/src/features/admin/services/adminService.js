import axiosClient from '../../../utils/axiosClient';

const adminService = {
    getStats: async () => {
        return await axiosClient.get('/Admin/stats');
    },

    getUsers: async () => {
        return await axiosClient.get('/Admin/users');
    },

    updateUserRole: async (userId, role) => {
        return await axiosClient.put(`/Admin/users/${userId}/role`, { role });
    },

    updateUser: async (userId, data) => {
        return await axiosClient.put(`/Admin/users/${userId}`, data);
    },

    deleteUser: async (userId) => {
        return await axiosClient.delete(`/Admin/users/${userId}`);
    },

    changePassword: async (userId, newPassword) => {
        return await axiosClient.put(`/Admin/users/${userId}/password`, { newPassword });
    },

    getSetting: async (key) => {
        return await axiosClient.get(`/Settings/${key}`);
    },

    updateSetting: async (key, value) => {
        return await axiosClient.put(`/Settings/${key}`, value);
    }
};

export default adminService;

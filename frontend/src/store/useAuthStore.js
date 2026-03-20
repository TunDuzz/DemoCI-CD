import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

const useAuthStore = create((set) => ({
    user: (() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        if (storedUser && token && !storedUser.id) {
            try {
                const decoded = jwtDecode(token);
                storedUser.id = decoded.sub || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
                localStorage.setItem('user', JSON.stringify(storedUser));
            } catch (e) {
                console.error('Auto-repair user ID failed:', e);
            }
        }
        return storedUser;
    })(),
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isAdmin: (() => {
        const token = localStorage.getItem('token');
        if (!token) return false;
        try {
            const decoded = jwtDecode(token);
            console.log('Stored Token Decoded:', decoded);
            const role = decoded['role'] || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            return role === 'Admin';
        } catch (e) {
            console.error('Token Decode Error:', e);
            return false;
        }
    })(),

    login: (userData, token, refreshToken) => {
        localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));

        const decoded = jwtDecode(token);
        const role = decoded['role'] || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        const isAdmin = role === 'Admin';
        const userId = decoded.sub || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

        const finalUser = { ...userData, id: userId };
        localStorage.setItem('user', JSON.stringify(finalUser));

        console.log('Login Info:', { decoded, role, isAdmin, userId });

        set({ user: finalUser, token, refreshToken, isAuthenticated: true, isAdmin });
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isAdmin: false });
    },
}));

export default useAuthStore;

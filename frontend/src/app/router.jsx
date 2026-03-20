import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { HomePage, WatchPage, SearchPage } from '@/features/movies';
import { LoginPage, RegisterPage } from '@/features/auth';
import useAuthStore from '@/store/useAuthStore';

// Admin Imports
import AdminLayout from '@/features/admin/layouts/AdminLayout';
import AdminDashboard from '@/features/admin/pages/AdminDashboard';
import AdminUsers from '@/features/admin/pages/AdminUsers';
import AdminSettings from '@/features/admin/pages/AdminSettings';

const ProtectedAdminRoute = ({ children }) => {
    const { isAdmin, isAuthenticated } = useAuthStore();
    if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />;
    return children;
};

// Prevent Admin from accessing regular User pages
const UserRoute = ({ children }) => {
    const { isAdmin, isAuthenticated } = useAuthStore();
    if (isAuthenticated && isAdmin) return <Navigate to="/admin" replace />;
    return children;
};

export default function AppRouter() {
    return (
        <Router>
            <Routes>
                {/* Auth Routes (No Navbar/Footer) */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Main App Routes */}
                <Route element={<UserRoute><AppLayout /></UserRoute>}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/watch/:id" element={<WatchPage />} />
                    <Route path="/search" element={<SearchPage />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="movies" element={<div>Movie Management Coming Soon</div>} />
                </Route>
            </Routes>
        </Router>
    );
}

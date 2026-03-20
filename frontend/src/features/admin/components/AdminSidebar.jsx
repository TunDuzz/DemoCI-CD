import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Film,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Play
} from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
    const { logout } = useAuthStore();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Bảng điều khiển', path: '/admin/dashboard' },
        { icon: Users, label: 'Người dùng', path: '/admin/users' },
        { icon: Film, label: 'Phim ảnh', path: '/admin/movies' },
        { icon: Settings, label: 'Cấu hình', path: '/admin/settings' },
    ];

    return (
        <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-20'}`}>
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-50 mb-4">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-xl shadow-indigo-200 group-hover:shadow-indigo-300 group-hover:-rotate-6 transition-all duration-300">
                        <Play size={20} fill="currentColor" className="ml-0.5" />
                    </div>
                    {isOpen && (
                        <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="font-black text-xl leading-none tracking-tighter text-slate-900">CINE<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">STREAM</span></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-0.5">Admin Suite</span>
                        </div>
                    )}
                </Link>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
            </div>

            {/* Menu */}
            <nav className="px-3 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                            ${isActive
                                ? 'bg-indigo-50 text-indigo-700 font-bold'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                {isOpen && <span className="text-sm">{item.label}</span>}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="absolute bottom-8 left-0 w-full px-3">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                >
                    <LogOut size={20} />
                    {isOpen && <span className="text-sm font-semibold">Đăng xuất</span>}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;

import React from 'react';
import {
    Bell,
    Search,
    User as UserIcon,
    Settings,
    HelpCircle
} from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';

const AdminTopbar = () => {
    const { user } = useAuthStore();

    return (
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
            <div></div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <button className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-500 transition-all relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
                    </button>
                    <button className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-500 transition-all">
                        <HelpCircle size={20} />
                    </button>
                    <button className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-500 transition-all">
                        <Settings size={20} />
                    </button>
                </div>

                <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

                <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 leading-none mb-1">{user?.displayName}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 leading-none">Quản trị viên</p>
                    </div>
                    {user?.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            alt={user.displayName}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-50 group-hover:ring-indigo-200 transition-all"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black group-hover:scale-105 transition-all shadow-lg shadow-indigo-100">
                            {user?.displayName?.charAt(0)}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminTopbar;

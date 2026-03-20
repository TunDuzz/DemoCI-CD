import React from 'react';
import {
    Settings,
    Layout,
    Smartphone,
    Palette,
    ShieldCheck
} from 'lucide-react';
import adminService from '../services/adminService';
import MovieCollectionSetting from '../components/MovieCollectionSetting';

const AdminSettings = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Cấu hình hệ thống</h1>
                    <p className="text-slate-500 font-medium">Tùy chỉnh nội dung hiển thị và các thiết lập website.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <ShieldCheck size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Hệ thống ổn định</span>
                </div>
            </div>

            {/* Settings Sections */}
            <div className="grid grid-cols-1 gap-12">
                {/* Hero Movies Setting */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                        <Layout size={20} />
                        <h2 className="text-xs font-black uppercase tracking-[0.2em]">Trang chủ • Phim Nổi Bật (Hero)</h2>
                    </div>
                    <MovieCollectionSetting
                        label="Phim Hero"
                        settingKey="HeroMovies"
                        adminService={adminService}
                    />
                </section>

                <div className="h-[1px] bg-slate-100"></div>

                {/* Top Movies Week Setting */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                        <Layout size={20} />
                        <h2 className="text-xs font-black uppercase tracking-[0.2em]">Trang chủ • Top Phim Tuần</h2>
                    </div>
                    <MovieCollectionSetting
                        label="Top Phim Tuần"
                        settingKey="TopMoviesWeek"
                        adminService={adminService}
                    />
                </section>

                <div className="h-[1px] bg-slate-100"></div>

                {/* Aesthetic Settings (Placeholder for more) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm opacity-50 grayscale cursor-not-allowed">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                                <Palette size={24} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Giao diện (Themes)</h3>
                        </div>
                        <p className="text-sm text-slate-400 font-medium italic">Tính năng này đang được phát triển...</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm opacity-50 grayscale cursor-not-allowed">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
                                <Smartphone size={24} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Ứng dụng di động</h3>
                        </div>
                        <p className="text-sm text-slate-400 font-medium italic">Tính năng này đang được phát triển...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;

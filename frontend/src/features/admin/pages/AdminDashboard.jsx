import React, { useEffect, useState } from 'react';
import {
    Users,
    Eye,
    Heart,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Calendar
} from 'lucide-react';
import adminService from '../services/adminService';
import PopularMoviesChart from '../components/PopularMoviesChart';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await adminService.getStats();
                setStats(response);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Calculate real % growth: (this - prev) / prev * 100
    const calcGrowth = (current, previous) => {
        if (previous === 0) return current > 0 ? { trend: 'up', label: '+100%' } : { trend: 'up', label: '+0%' };
        const pct = ((current - previous) / previous) * 100;
        return {
            trend: pct >= 0 ? 'up' : 'down',
            label: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
        };
    };

    const StatCard = ({ icon: Icon, label, value, trend, trendValue, color }) => (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-[0.03] group-hover:scale-110 transition-transform duration-500 bg-current text-${color}-600`}></div>
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600 ring-4 ring-${color}-50/50`}>
                    <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'} bg-white px-2 py-1 rounded-full shadow-sm border border-slate-50`}>
                    {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trendValue}
                </div>
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">{label}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
            </div>
        </div>
    );

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Xin chào 👋</h1>
                    <p className="text-slate-500 font-medium">Chào mừng bạn quay lại hệ thống quản trị CineStream.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                    <button className="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl">Hôm nay</button>
                    <button className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors">7 ngày qua</button>
                    <button className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors">30 ngày qua</button>
                    <div className="w-[1px] h-6 bg-slate-100 mx-2"></div>
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Calendar size={18} />
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(() => {
                    const userGrowth = calcGrowth(stats?.newUsersThisWeek ?? 0, stats?.newUsersPrevWeek ?? 0);
                    const viewGrowth = calcGrowth(stats?.viewsThisWeek ?? 0, stats?.viewsPrevWeek ?? 0);
                    const favGrowth = calcGrowth(stats?.favoritesThisWeek ?? 0, stats?.favoritesPrevWeek ?? 0);
                    const activeRate = stats?.totalUsers
                        ? ((stats.activeUserCount / stats.totalUsers) * 100).toFixed(1)
                        : 0;
                    // Active rate: compare active users this week vs prev week
                    const activeGrowth = calcGrowth(stats?.viewsThisWeek ?? 0, stats?.viewsPrevWeek ?? 0);
                    return (
                        <>
                            <StatCard
                                icon={Users}
                                label="Tổng người dùng"
                                value={stats?.totalUsers || 0}
                                trend={userGrowth.trend}
                                trendValue={userGrowth.label}
                                color="indigo"
                            />
                            <StatCard
                                icon={Eye}
                                label="Lượt xem"
                                value={stats?.totalViews || 0}
                                trend={viewGrowth.trend}
                                trendValue={viewGrowth.label}
                                color="sky"
                            />
                            <StatCard
                                icon={Heart}
                                label="Lượt yêu thích"
                                value={stats?.totalFavorites || 0}
                                trend={favGrowth.trend}
                                trendValue={favGrowth.label}
                                color="rose"
                            />
                            <StatCard
                                icon={TrendingUp}
                                label="Tỉ lệ hoạt động"
                                value={`${activeRate}%`}
                                trend={activeGrowth.trend}
                                trendValue={activeGrowth.label}
                                color="emerald"
                            />
                        </>
                    );
                })()}
            </div>

            {/* Charts & Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Popular Movies Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Xu hướng xem phim</h2>
                            <p className="text-sm text-slate-500 font-medium">Dữ liệu thống kê dựa trên lượt xem thực tế.</p>
                        </div>
                        <select className="bg-slate-50 border-none rounded-xl text-sm font-bold px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-100 transition-all">
                            <option>Tất cả danh mục</option>
                            <option>Phim lẻ</option>
                            <option>Phim bộ</option>
                        </select>
                    </div>
                    <div className="h-[400px]">
                        <PopularMoviesChart data={stats?.topMovies} />
                    </div>
                </div>

                {/* Top Movies List */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8">Top phim thịnh hành</h2>
                    <div className="space-y-6">
                        {stats?.topMovies?.map((movie, index) => (
                            <div key={movie.movieId} className="flex items-center gap-4 group cursor-pointer p-2 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                <div className="relative shrink-0">
                                    <div className={`w-12 h-16 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-500 border border-slate-100`}>
                                        <img
                                            src={movie.movieThumbUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop"}
                                            alt={movie.movieName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] shadow-sm ${index === 0 ? 'bg-amber-400 text-white' :
                                        index === 1 ? 'bg-slate-400 text-white' :
                                            index === 2 ? 'bg-orange-400 text-white' :
                                                'bg-slate-200 text-slate-500'
                                        }`}>
                                        {index + 1}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase text-[10px] tracking-tight leading-tight mb-0.5">{movie.movieName}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">{movie.movieSlug}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-600 rounded-full"
                                                style={{ width: `${(movie.viewCount / stats.topMovies[0].viewCount) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] font-black text-indigo-600">{movie.viewCount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-10 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-[1.25rem] text-sm font-black uppercase tracking-widest transition-all">
                        Xem báo cáo chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

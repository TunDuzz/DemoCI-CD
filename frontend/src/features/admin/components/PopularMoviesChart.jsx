import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const PopularMoviesChart = ({ data }) => {
    if (!data) return null;

    const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e'];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{payload[0].payload.movieName}</p>
                    <p className="text-lg font-black text-indigo-600">{payload[0].value.toLocaleString()} <span className="text-xs font-bold text-slate-400">lượt xem</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barSize={40}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                    dataKey="movieSlug"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    interval={0}
                    tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="viewCount" radius={[12, 12, 12, 12]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default PopularMoviesChart;

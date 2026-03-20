import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import useAuthStore from '@/store/useAuthStore';
import { movieService } from '@/features/movies/services/movieService';

const ContinueWatchingSection = () => {
    const { isAuthenticated } = useAuthStore();
    const [historyItems, setHistoryItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            try {
                // To fetch watch history
                const response = await axiosClient.get('/watch-history');
                const data = Array.isArray(response) ? response : (response?.data || []);

                if (!data || data.length === 0) {
                    setLoading(false);
                    return;
                }

                // Filter incomplete and sort by recently watched
                const sorted = data
                    .filter(h => h && h.movieSlug && !h.isCompleted)
                    .sort((a, b) => new Date(b.lastWatchedAt || 0).getTime() - new Date(a.lastWatchedAt || 0).getTime());

                // Get strictly top 3 unique movies
                const uniqueSlugs = new Set();
                const top3 = [];
                for (const item of sorted) {
                    if (!uniqueSlugs.has(item.movieSlug)) {
                        uniqueSlugs.add(item.movieSlug);
                        top3.push(item);
                        if (top3.length === 3) break;
                    }
                }

                if (top3.length === 0) {
                    setHistoryItems([]);
                    setLoading(false);
                    return;
                }

                // Fetch extra details to get origin_name
                const richTop3 = await Promise.all(top3.map(async (h) => {
                    try {
                        const mRes = await movieService.getMovieDetail(h.movieSlug);
                        if (mRes && mRes.movie) {
                            return {
                                ...h,
                                originName: mRes.movie.origin_name || mRes.movie.name,
                                totalDurationStr: mRes.movie.time // might have duration info 
                            };
                        }
                        return h;
                    } catch {
                        return h;
                    }
                }));

                setHistoryItems(richTop3);
            } catch (error) {
                console.error("Error fetching watch history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [isAuthenticated]);

    const handleRemove = (e, movieId) => {
        e.preventDefault();
        e.stopPropagation();
        // Visual removal only since backend might not have DELETE /api/watch-history/{movieId}
        setHistoryItems(prev => prev.filter(item => item.movieId !== movieId));
    };

    if (loading || historyItems.length === 0) return null;

    const getImageUrl = (url) => {
        if (!url) return "https://via.placeholder.com/300x450/1a1a1a/444444?text=No+Image";
        return url.startsWith('http') ? url : `https://img.ophim.live/uploads/movies/${url}`;
    };

    return (
        <div className="mb-8 md:mb-16 relative group/continue animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 lg:px-12 px-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    Xem tiếp của bạn
                </h2>
                <Link to="/profile?tab=history" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-all">
                    <ChevronRight size={16} />
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:px-12 px-2 max-w-5xl">
                {historyItems.map((item) => {
                    const watchedMinutes = Math.floor((item.watchedTimeInSeconds || 0) / 60);
                    // Approximate total time if we don't know it (assuming typical episodes are 24-45 mins depending on watched time)
                    const assumedTotalMinutes = watchedMinutes < 24 ? 24 : (watchedMinutes + 15);
                    const progressPercent = Math.min(100, Math.max(2, (watchedMinutes / assumedTotalMinutes) * 100));

                    return (
                        <Link
                            to={`/watch/${item.movieSlug}`}
                            key={item.movieId}
                            className="relative group/card cursor-pointer flex flex-col items-center"
                        >
                            {/* Poster Wrapper */}
                            <div className="relative w-full aspect-[2/3] md:aspect-[3/4.5] rounded-lg overflow-hidden mb-3 md:mb-4 border border-white/5 transition-transform duration-500 group-hover/card:-translate-y-2 lg:group-hover/card:shadow-2xl">
                                <img
                                    src={getImageUrl(item.movieThumbUrl)}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                                    alt={item.movieName}
                                    style={{ filter: 'brightness(0.95)' }}
                                />

                                {/* Overlay Gradient for Depth */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80" />

                                {/* Remove Button */}
                                <button
                                    onClick={(e) => handleRemove(e, item.movieId)}
                                    className="absolute top-2 right-2 w-6 h-6 rounded-md bg-white/80 hover:bg-white flex items-center justify-center transition-colors z-20 shadow-md opacity-0 group-hover/card:opacity-100"
                                >
                                    <X size={14} strokeWidth={3} className="text-black" />
                                </button>

                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/card:opacity-100 transition-opacity mix-blend-overlay pointer-events-none" />
                            </div>

                            {/* Progress Bar Container - Kept below the poster but with specific spacing */}
                            <div className="w-[85%] mb-4">
                                <div className="w-full h-[3px] md:h-1 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white/80 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Text Info */}
                            <div className="flex flex-col items-center px-2 w-full text-center">
                                <span className="text-[10px] md:text-[11px] text-white/50 font-bold tracking-wide mb-1.5 flex items-center gap-1.5 uppercase">
                                    Tập {item.episode || 'Full'} <span className="w-1 h-1 bg-white/30 rounded-full inline-block" />
                                    <span>{watchedMinutes}m / {assumedTotalMinutes}m</span>
                                </span>

                                <h3 className="text-white font-bold text-sm md:text-base line-clamp-1 group-hover/card:text-primary-yellow transition-colors leading-tight">
                                    {item.movieName}
                                </h3>

                                <p className="text-white/40 text-[9px] md:text-[11px] uppercase tracking-wider line-clamp-1 mt-1 font-medium">
                                    {item.originName || item.movieName}
                                </p>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
};

export default ContinueWatchingSection;
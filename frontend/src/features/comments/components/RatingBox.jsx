import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { ratingApi } from '../api/commentApi';
import useAuthStore from '../../../store/useAuthStore';

export const RatingBox = ({ movieId }) => {
    const [stats, setStats] = useState({ totalRatings: 0, averageScore: 0, currentUserScore: null });
    const [hoverScore, setHoverScore] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const user = useAuthStore(state => state.user);

    useEffect(() => {
        const fetchRatingStats = async () => {
            try {
                const res = await ratingApi.getMovieRatingStats(movieId);
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch rating stats", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRatingStats();
    }, [movieId]);

    const handleRate = async (score) => {
        if (!user) {
            alert('Vui lòng đăng nhập để đánh giá phim!');
            return;
        }
        // Optimistic update
        const oldStats = { ...stats };

        // Very basic recalculation for optimistic UI
        const isNewRating = stats.currentUserScore === null;
        let newTotal = isNewRating ? stats.totalRatings + 1 : stats.totalRatings;
        let currentTotalScore = stats.averageScore * stats.totalRatings;

        if (!isNewRating) {
            currentTotalScore -= stats.currentUserScore;
        }

        let newAvg = (currentTotalScore + score) / newTotal;

        setStats({
            totalRatings: newTotal,
            averageScore: newAvg,
            currentUserScore: score
        });

        setIsSubmitting(true);
        try {
            await ratingApi.createOrUpdateRating(movieId, score);
            // Re-fetch to guarantee accuracy from server
            const res = await ratingApi.getMovieRatingStats(movieId);
            setStats(res.data);
        } catch (error) {
            console.error("Rating failed", error);
            setStats(oldStats); // rollback
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="animate-pulse h-16 bg-zinc-800 rounded-xl w-64"></div>;
    }

    return (
        <div className="flex flex-col gap-2 p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl w-fit">
            <div className="flex items-end justify-between gap-6 mb-2">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-400 leading-none mb-1">Đánh giá phim</span>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold text-amber-500 leading-none">
                            {stats.averageScore.toFixed(1)}
                        </span>
                        <span className="text-sm font-medium text-zinc-500">/ 10</span>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">Lượt đánh giá</span>
                    <span className="text-xl font-bold text-zinc-300">{stats.totalRatings.toLocaleString()}</span>
                </div>
            </div>

            <div
                className={`flex items-center gap-1 ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
                onMouseLeave={() => setHoverScore(0)}
            >
                {[...Array(10)].map((_, index) => {
                    const score = index + 1;
                    const isActive = hoverScore ? score <= hoverScore : (stats.currentUserScore && score <= stats.currentUserScore);

                    return (
                        <button
                            key={score}
                            onMouseEnter={() => setHoverScore(score)}
                            onClick={() => handleRate(score)}
                            className="p-0.5 transform hover:scale-125 transition-transform"
                        >
                            <Star
                                size={22}
                                className={`transition-colors ${isActive
                                    ? 'fill-amber-500 text-amber-500'
                                    : 'fill-zinc-800 text-zinc-700 hover:text-amber-400 hover:fill-amber-400/50'
                                    }`}
                            />
                        </button>
                    );
                })}
            </div>

            {stats.currentUserScore && (
                <div className="mt-1 text-xs text-center font-medium text-emerald-500 bg-emerald-500/10 py-1 rounded-md">
                    Bạn đã đánh giá {stats.currentUserScore} sao
                </div>
            )}
        </div>
    );
};

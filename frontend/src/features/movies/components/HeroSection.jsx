import { Play, Heart, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import './HeroSection.css'; // We'll add custom pagination styles here

export default function HeroSection({ movies = [] }) {
    const { isAdmin } = useAuthStore();
    if (!movies || movies.length === 0) {
        // Return a sleek loading skeleton while waiting for API data
        return <div className="w-full h-screen min-h-[800px] bg-black/40 animate-pulse"></div>;
    }

    // Take top 5 movies for the Hero slider
    const heroMovies = movies.slice(0, 5).map(movie => {
        const getImageUrl = (url) => {
            if (!url) return "https://via.placeholder.com/1200x800/1a1a1a/444444?text=No+Image";
            return url.startsWith('http') ? url : `https://img.ophim.live/uploads/movies/${url}`;
        };

        return {
            id: movie.slug || movie._id,
            name: movie.name,
            originName: movie.origin_name,
            posterUrl: getImageUrl(movie.poster_url),
            thumbUrl: getImageUrl(movie.thumb_url),
            year: movie.year,
            quality: movie.quality || 'HD',
            episodeTotal: movie.episode_total,
            episodeCurrent: movie.episode_current,
            time: movie.time,
            type: movie.type,
            tmdbVote: movie.tmdb?.vote_average || "0.0",
            categories: movie.category?.map(c => c.name) || [],
            content: movie.content ? movie.content.replace(/<[^>]*>?/gm, '') : ""
        };
    });

    const renderBadges = (movie) => {
        const badges = [];

        // 1. IMDb Score
        badges.push(
            <span key="imdb" className="flex items-center gap-1 border border-primary-yellow text-primary-yellow px-2 py-0.5 rounded">
                <span className="bg-primary-yellow text-black px-1 rounded-sm font-black mr-1 text-[8px] md:text-[10px]">IMDB</span> {movie.tmdbVote}
            </span>
        );

        // 2. Year
        if (movie.year) {
            badges.push(<span key="year" className="bg-white/10 backdrop-blur-md px-2 py-0.5 rounded border border-white/5">{movie.year}</span>);
        }

        if (movie.type === 'single') {
            if (movie.time) {
                badges.push(<span key="time" className="bg-white/10 backdrop-blur-md px-2 py-0.5 rounded border border-white/5">{movie.time}</span>);
            }
        } else {
            badges.push(<span key="part" className="bg-white/10 backdrop-blur-md px-2 py-0.5 rounded border border-white/5">Phần 1</span>);

            let epText = movie.episodeCurrent || "";
            const isCompleted = epText.toLowerCase().includes('full') || epText.toLowerCase().includes('hoàn tất');

            if (isCompleted) {
                const total = movie.episodeTotal || "?";
                const currentNum = epText.match(/\d+/) ? epText.match(/\d+/)[0] : total;
                badges.push(<span key="ep" className="bg-white/10 backdrop-blur-md px-2 py-0.5 rounded border border-white/5">Tập Hoàn tất ({currentNum}/{total})</span>);
            } else {
                badges.push(<span key="ep" className="bg-white/10 backdrop-blur-md px-2 py-0.5 rounded border border-white/5">{epText}</span>);
            }
        }

        return (
            <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] md:text-xs font-semibold uppercase tracking-wider">
                {badges}
            </div>
        );
    };

    return (
        <div className="relative w-full h-[100svh] md:h-[85vh] min-h-[700px] bg-dark-bg">
            <Swiper
                modules={[EffectFade, Autoplay, Pagination]}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                    renderBullet: function (index, className) {
                        return `<span class="${className} hero-pagination-bullet"></span>`;
                    },
                }}
                loop={true}
                className="w-full h-full hero-swiper"
            >
                {heroMovies.map((displayMovie, index) => (
                    <SwiperSlide key={displayMovie.id || index}>
                        <div className="relative w-full h-full flex items-center overflow-hidden bg-dark-bg">
                            {/* Background Image & Overlays */}
                            <div className="absolute inset-0 w-full h-full z-0">
                                <img
                                    src={displayMovie.posterUrl}
                                    alt={displayMovie.name}
                                    className="absolute inset-0 w-full h-full object-cover object-center opacity-100"
                                    loading={index === 0 ? "eager" : "lazy"}
                                    onError={(e) => {
                                        if (e.target.src !== 'https://via.placeholder.com/1200x800/1a1a1a/444444?text=No+Image') {
                                            e.target.src = 'https://via.placeholder.com/1200x800/1a1a1a/444444?text=No+Image';
                                        }
                                    }}
                                />
                                {/* Subtle grid pattern overlay */}
                                <div className="absolute inset-0 bg-dot-pattern mix-blend-overlay opacity-30"></div>

                                {/* Adjusted gradients to keep the image bright while text is readable */}
                                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/20 to-transparent"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/50 to-transparent w-[120%] md:w-3/4"></div>
                            </div>

                            {/* Hero Content */}
                            <div className="relative z-10 w-full max-w-[2560px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-16 h-full flex flex-col justify-end pb-12 md:pb-20">
                                <div className="w-[95%] md:w-3/4 lg:w-1/2 flex flex-col items-start gap-3">

                                    <div className="min-h-[2.4em] md:min-h-[2.6em] flex items-end">
                                        <h1 className="font-heading text-[clamp(2rem,5vw,4rem)] font-bold tracking-tight text-white drop-shadow-2xl leading-[1.1] line-clamp-2">
                                            {displayMovie.name}
                                        </h1>
                                    </div>

                                    <div className="min-h-[1.2em] md:min-h-[1.5em] flex items-center">
                                        <h2 className="text-[clamp(0.875rem,1.5vw,1.25rem)] font-light text-primary-yellow drop-shadow-md line-clamp-1">
                                            {displayMovie.originName || displayMovie.name}
                                        </h2>
                                    </div>

                                    {/* Badges Row */}
                                    {renderBadges(displayMovie)}

                                    {/* Categories Row - Fixed Height to prevent jump */}
                                    <div className="min-h-[28px] md:min-h-[32px] mt-1">
                                        {displayMovie.categories && displayMovie.categories.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-2">
                                                {displayMovie.categories.map((cat, idx) => (
                                                    <span key={idx} className="bg-white/5 hover:bg-white/10 backdrop-blur-md text-gray-300 min-h-[44px] inline-flex items-center px-4 rounded-full text-[clamp(0.75rem,1vw,0.875rem)] transition-colors cursor-pointer border border-white/5">
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Synopsis - Fixed Height (for 3 lines) to prevent jump */}
                                    <div className="min-h-[60px] md:min-h-[85px] mt-2">
                                        <p className="text-[clamp(0.875rem,1.2vw,1.125rem)] text-gray-400 leading-relaxed max-w-lg line-clamp-2 md:line-clamp-3">
                                            {displayMovie.content}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-4 mt-8">
                                        {!isAdmin && (
                                            <Link
                                                to={`/watch/${displayMovie.id}`}
                                                tabIndex={0}
                                                className="flex items-center justify-center min-h-[44px] min-w-[44px] w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary-yellow text-black hover:scale-105 hover:bg-primary-yellow-hover transition-all shadow-[0_0_30px_rgba(252,213,63,0.3)] focus:outline-none focus:ring-4 focus:ring-white"
                                            >
                                                <Play fill="currentColor" size={24} className="ml-1" />
                                            </Link>
                                        )}

                                        <button tabIndex={0} className="flex items-center justify-center min-h-[44px] min-w-[44px] w-12 h-12 rounded-full glass-panel hover:bg-white/10 transition-colors text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow">
                                            <Heart size={20} />
                                        </button>
                                        <button tabIndex={0} className="flex items-center justify-center min-h-[44px] min-w-[44px] w-12 h-12 rounded-full glass-panel hover:bg-white/10 transition-colors text-white focus:outline-none focus:ring-2 focus:ring-primary-yellow">
                                            <AlertCircle size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

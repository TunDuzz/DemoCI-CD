import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const TopMoviesSection = ({ movies }) => {
    if (!movies || movies.length === 0) return null;

    const getImageUrl = (url) => {
        if (!url) return "https://via.placeholder.com/300x450/1a1a1a/444444?text=No+Image";
        return url.startsWith('http') ? url : `https://img.ophim.live/uploads/movies/${url}`;
    };

    const renderMovieBadges = (movie) => {
        const epText = movie.episode_current || "";
        const isCompleted = epText.toLowerCase().includes('full') || epText.toLowerCase().includes('hoàn tất');
        const currentEpNum = epText.match(/\d+/) ? epText.match(/\d+/)[0] : (isCompleted ? movie.episode_total : "");
        const tmdbVote = movie.tmdb?.vote_average || "";

        return (
            <div className="absolute bottom-6 right-4 flex items-center gap-1.5 z-30">
                {currentEpNum && (
                    <div className="bg-black/80 backdrop-blur-xl px-2 py-0.5 rounded-md text-[9px] font-black text-white border border-white/10 tracking-widest uppercase shadow-lg">
                        Tập {currentEpNum}
                    </div>
                )}
                {tmdbVote && tmdbVote !== "0.0" && (
                    <div className="bg-[#f5c518] backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-black text-black border border-black/10 flex items-center gap-1 shadow-lg shadow-yellow-500/20">
                        <span className="text-[7px] text-black/70 font-bold uppercase">IMDB</span> {tmdbVote}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div id="top-movies" className="mb-24 pt-12 relative group/section animate-in fade-in slide-in-from-bottom-12 duration-1000 scroll-mt-24">
            {/* Ambient Background Glows */}
            <div className="absolute -top-20 left-1/4 w-[40%] h-[400px] bg-primary-yellow/5 blur-[120px] -z-10 pointer-events-none"></div>

            {/* Header */}
            <div className="flex flex-col items-start mb-10 px-2 lg:px-12">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 mb-4">
                    <Trophy size={14} className="text-primary-yellow" />
                    <span className="text-[10px] font-black text-primary-yellow uppercase tracking-[0.4em]">Bảng Vàng Danh Vọng</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight drop-shadow-2xl">
                    Top 10 Phim Bộ <span className="text-primary-yellow">Được Yêu Thích</span>
                </h2>
                <div className="w-12 h-1 mt-6 bg-primary-yellow/30 rounded-full"></div>
            </div>

            <div className="relative px-2 lg:px-12">
                {/* Navigation Buttons */}
                <button className="top-prev-btn absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 hover:bg-white/10 hover:scale-110 active:scale-95 transition-all z-30 cursor-pointer backdrop-blur-md">
                    <ChevronLeft size={32} strokeWidth={2} />
                </button>
                <button className="top-next-btn absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 hover:bg-white/10 hover:scale-110 active:scale-95 transition-all z-30 cursor-pointer backdrop-blur-md">
                    <ChevronRight size={32} strokeWidth={2} />
                </button>

                <Swiper
                    modules={[Navigation]}
                    navigation={{
                        prevEl: '.top-prev-btn',
                        nextEl: '.top-next-btn',
                    }}
                    spaceBetween={24}
                    slidesPerView={1.2}
                    slidesPerGroup={1}
                    breakpoints={{
                        640: { slidesPerView: 2.5 },
                        768: { slidesPerView: 3.5 },
                        1024: { slidesPerView: 4.5 },
                        1440: { slidesPerView: 6 },
                    }}
                    className="top-movies-swiper !overflow-hidden"
                >
                    {movies.slice(0, 10).map((movie, index) => {
                        const epStatus = movie.type === 'single' ? movie.time : (movie.episode_current || "");
                        const isSeries = movie.type !== 'single';
                        const isCompleted = epStatus.toLowerCase().includes('full') || epStatus.toLowerCase().includes('hoàn tất');

                        let displayStatus = epStatus;
                        if (isSeries) {
                            const totalVal = String(movie.episode_total || "?");
                            const total = totalVal.match(/\d+/) ? totalVal.match(/\d+/)[0] : totalVal;
                            const currentNum = epStatus.match(/\d+/) ? epStatus.match(/\d+/)[0] : (isCompleted ? total : "?");

                            if (isCompleted) {
                                displayStatus = `Phần 1 • Hoàn tất (${total}/${total})`;
                            } else {
                                displayStatus = `Phần 1 • Tập (${currentNum}/${total})`;
                            }
                        }

                        return (
                            <SwiperSlide key={movie.slug} className="group">
                                <Link to={`/watch/${movie.slug}`} className="block">
                                    <div className="flex flex-col gap-6 pt-8">
                                        {/* Poster Area - "Linked" Shape Maintained */}
                                        <div className="relative aspect-[2/3] transition-all duration-700 group-hover:-translate-y-3"
                                            style={{
                                                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))',
                                            }}>
                                            <div className="w-full h-full overflow-hidden transition-all duration-700 bg-white/5"
                                                style={{
                                                    clipPath: 'polygon(0 0, 100% 4%, 100% 100%, 0 96%)',
                                                    borderRadius: '0',
                                                }}>
                                                <img
                                                    src={getImageUrl(movie.thumb_url)}
                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                    alt={movie.name}
                                                />
                                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10 opacity-90 group-hover:opacity-60 transition-opacity duration-500"></div>
                                            </div>

                                            {renderMovieBadges(movie)}

                                            <div className="absolute inset-0 bg-primary-yellow/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-overlay pointer-events-none"></div>
                                        </div>

                                        {/* Info Block - Aligned and fixed width for rank */}
                                        <div className="flex items-start gap-1 md:gap-2 px-0 pb-2">
                                            {/* Rank Number - Light Gold Metallic */}
                                            <div className="w-10 md:w-12 shrink-0 text-3xl md:text-5xl font-black italic mt-[-4px] transition-all duration-500 group-hover:scale-110"
                                                style={{
                                                    background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                                                    fontFamily: 'Outfit, sans-serif'
                                                }}>
                                                {index + 1}
                                            </div>

                                            <div className="flex flex-col gap-1 overflow-hidden">
                                                <h3 className="text-white font-bold text-sm md:text-[15px] line-clamp-1 group-hover:text-primary-yellow transition-colors duration-300 leading-tight">
                                                    {movie.name}
                                                </h3>
                                                <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider line-clamp-1 truncate">
                                                    {movie.origin_name || movie.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 overflow-hidden">
                                                    <span className="text-[9px] font-black text-primary-yellow/60 uppercase tracking-widest whitespace-nowrap">
                                                        {displayStatus}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>
        </div>
    );
};

export default TopMoviesSection;

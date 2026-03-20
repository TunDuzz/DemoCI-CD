import { useState, useEffect } from 'react';
import HeroSection from '@/features/movies/components/HeroSection';
import MovieSlider from '@/features/movies/components/MovieSlider';
import TopMoviesSection from '@/features/movies/components/TopMoviesSection';
import ContinueWatchingSection from '@/features/movies/components/ContinueWatchingSection';
import { movieService } from '@/features/movies/services/movieService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Compass, Flame, Star, PlayCircle, Library, Heart, ChevronRight } from 'lucide-react';

export default function HomePage() {
    const [latestMovies, setLatestMovies] = useState([]);
    const [heroMovies, setHeroMovies] = useState([]);
    const [topMoviesWeek, setTopMoviesWeek] = useState([]);
    const [phimLe, setPhimLe] = useState([]);
    const [phimBo, setPhimBo] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('scrollTo') === 'top-movies') {
            setTimeout(() => {
                const el = document.getElementById('top-movies');
                if (el) {
                    const headerOffset = 100;
                    const elementPosition = el.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }, 500);
        }
    }, [location]);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                setLoading(true);
                // Execute parallel requests for performance
                const [latestRes, phimLeRes, phimBoRes, heroSetting, topWeekSetting] = await Promise.all([
                    movieService.getLatestMovies(1),
                    movieService.getMoviesByType('phim-le', 1),
                    movieService.getMoviesByType('phim-bo', 1),
                    movieService.getSetting('HeroMovies'),
                    movieService.getSetting('TopMoviesWeek')
                ]);

                // Handle Hero Movies
                if (heroSetting && Array.isArray(heroSetting) && heroSetting.length > 0) {
                    // Fetch full details for movies from settings to get 'content' (description)
                    const heroSlugs = heroSetting.map(m => m.slug);
                    const heroDetailsPromises = heroSlugs.map(slug => movieService.getMovieDetail(slug));
                    const heroDetailsRes = await Promise.all(heroDetailsPromises);
                    const richHeroMovies = heroDetailsRes
                        .filter(res => res.status && res.movie)
                        .map(res => res.movie);
                    setHeroMovies(richHeroMovies.length > 0 ? richHeroMovies : heroSetting);
                } else if (latestRes.status) {
                    const basicMovies = latestRes.items || [];
                    const top5Slugs = basicMovies.slice(0, 5).map(m => m.slug);
                    const heroDetailsPromises = top5Slugs.map(slug => movieService.getMovieDetail(slug));
                    const heroDetailsRes = await Promise.all(heroDetailsPromises);
                    const richHeroMovies = heroDetailsRes
                        .filter(res => res.status && res.movie)
                        .map(res => res.movie);
                    setHeroMovies(richHeroMovies.length > 0 ? richHeroMovies : basicMovies.slice(0, 5));
                }

                // Handle Top Week
                if (topWeekSetting && Array.isArray(topWeekSetting)) {
                    // Fetch full details for movies from settings to get origin_name, status, etc.
                    const topSlugs = topWeekSetting.map(m => m.slug);
                    const topDetailsPromises = topSlugs.map(slug => movieService.getMovieDetail(slug));
                    const topDetailsRes = await Promise.all(topDetailsPromises);
                    const richTopMovies = topDetailsRes
                        .filter(res => res.status && res.movie)
                        .map(res => res.movie);
                    setTopMoviesWeek(richTopMovies.length > 0 ? richTopMovies : topWeekSetting);
                }

                if (latestRes.status) setLatestMovies(latestRes.items || []);
                if (phimLeRes.status) setPhimLe(phimLeRes.data?.items || []);
                if (phimBoRes.status) setPhimBo(phimBoRes.data?.items || []);
            } catch (error) {
                console.error("Failed to fetch home page data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    const categories = [
        { name: 'Viễn Tưởng', color: 'from-blue-600 to-indigo-700', icon: Sparkles, slug: 'vien-tuong', param: 'genre', accent: '#3b82f6' },
        { name: 'Thái Lan', color: 'from-orange-500 to-red-600', icon: Compass, slug: 'thai-lan', param: 'country', accent: '#ef4444' },
        { name: 'Hành Động', color: 'from-emerald-500 to-teal-600', icon: Flame, slug: 'hanh-dong', param: 'genre', accent: '#10b981' },
        { name: 'Chiếu Rạp', color: 'from-fuchsia-600 to-purple-600', icon: Star, slug: 'phim-chieu-rap', param: 'type', accent: '#a855f7' },
        { name: 'Kinh Dị', color: 'from-gray-700 to-slate-900', icon: PlayCircle, slug: 'kinh-di', param: 'genre', accent: '#94a3b8' },
        { name: 'Cổ Trang', color: 'from-rose-500 to-pink-600', icon: Library, slug: 'co-trang', param: 'genre', accent: '#f43f5e' },
        { name: 'Tâm Lý', color: 'from-cyan-500 to-blue-600', icon: Heart, slug: 'tam-ly', param: 'genre', accent: '#06b6d4' },
        { name: 'Học Đường', color: 'from-yellow-400 to-orange-500', icon: Sparkles, slug: 'hoc-duong', param: 'genre', accent: '#fbbf24' }
    ];

    if (loading) return <LoadingSpinner />;


    return (
        <div className="w-full flex-1 bg-dark-bg animate-in fade-in duration-1000">
            <HeroSection movies={heroMovies} />

            <div className="w-full max-w-[2560px] flex flex-col mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-16 pt-8 md:pt-12 pb-20 relative z-20">
                {/* Category Selection Row */}
                <div className="mb-16 pt-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 px-2 gap-4">
                        <div>
                            <h2 className="font-heading text-[clamp(1.5rem,4vw,2rem)] font-bold text-white flex items-center gap-3">
                                <Sparkles className="text-primary-yellow animate-pulse" size={28} />
                                Chủ Đề Thịnh Hành
                            </h2>
                            <p className="text-white/40 text-xs mt-1 font-medium tracking-[0.2em] uppercase">Khám phá vũ trụ điện ảnh theo cách của bạn</p>
                        </div>
                        <Link to="/search" className="text-primary-yellow hover:text-white transition-colors text-xs font-black uppercase tracking-widest flex items-center gap-2 group">
                            Xem tất cả <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 px-2">
                        {categories.map((cat, idx) => {
                            const Icon = cat.icon;

                            return (
                                <Link
                                    key={idx}
                                    to={`/search?${cat.param}=${cat.slug}`}
                                    className="group relative w-full aspect-square sm:aspect-video lg:aspect-[4/5] rounded-[2rem] overflow-hidden transition-all duration-700 hover:-translate-y-6 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] active:scale-95"
                                >
                                    {/* Primary Vibrant Canvas (Always visible now) */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110`}></div>

                                    {/* Lustrous Glass Highlight (Shimmer) */}
                                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 via-white/5 to-transparent pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"></div>

                                    {/* Atmospheric Glow (Center focus) */}
                                    <div
                                        className="absolute inset-0 opacity-10 group-hover:opacity-60 transition-opacity duration-700 blur-[50px] rounded-full scale-150"
                                        style={{ backgroundColor: cat.accent }}
                                    ></div>

                                    {/* Interactive Content */}
                                    <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-between z-20">
                                        {/* Stylized Icon Wrapper */}
                                        <div className="flex items-start justify-between">
                                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 group-hover:border-white/70 group-hover:bg-white/30 transition-all duration-500 shadow-lg">
                                                {Icon && <Icon className="text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]" size={26} strokeWidth={2.5} />}
                                            </div>

                                            {/* Electric Corner Accent */}
                                            <div
                                                className="w-2 h-2 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] opacity-60 group-hover:scale-[2.5] group-hover:opacity-100 transition-all duration-700 bg-white"
                                            ></div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-[3px] bg-white rounded-full group-hover:w-12 transition-all duration-500 shadow-md"></div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/90 drop-shadow-sm">Trend</span>
                                            </div>
                                            <h3 className="font-heading font-black text-white text-xl md:text-2xl tracking-tight leading-tight drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)] group-hover:scale-105 origin-left transition-transform duration-500">
                                                {cat.name}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Intense Back-Glow (Appears on Hover) */}
                                    <div
                                        className="absolute -inset-6 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-3xl pointer-events-none"
                                        style={{ backgroundColor: `${cat.accent}60` }}
                                    ></div>

                                    {/* Fine Noise Texture */}
                                    <div className="absolute inset-0 bg-white/[0.03] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* Xem tiếp của bạn (Continue Watching) */}
                <ContinueWatchingSection />

                {/* Phim Top Tuần - New Independent Frame */}
                <TopMoviesSection movies={topMoviesWeek} />

                {/* Unified Movie Sliders Container */}
                <div className="flex flex-col gap-0 bg-[#0f1015]/90 backdrop-blur-xl border border-white/5 rounded-[2rem] p-4 lg:p-8 shadow-2xl overflow-hidden relative">
                    {/* Background glowing effects for the container */}
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-yellow/5 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                    <MovieSlider title="Phim Mới Cập Nhật" movies={latestMovies} isLoading={loading} />

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2"></div>

                    <MovieSlider title="Phim Lẻ Nổi Bật" movies={phimLe} isLoading={loading} />

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2"></div>

                    <MovieSlider title="Phim Bộ Đặc Sắc" movies={phimBo} isLoading={loading} />
                </div>
            </div>
        </div>
    );
}

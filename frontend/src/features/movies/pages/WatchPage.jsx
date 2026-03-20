import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieService } from '@/features/movies/services/movieService';
import VideoPlayer from '@/features/player/components/VideoPlayer';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import useAuthStore from '@/store/useAuthStore';
import { CommentSection } from '@/features/comments/components/CommentSection';
import { RatingBox } from '@/features/comments/components/RatingBox';
import axiosClient from '@/utils/axiosClient';
import {
    ChevronLeft,
    ChevronDown,
    Play,
    Heart,
    Plus,
    Share2,
    MessageCircle,
    Info,
    Star,
    Tv,
    Layout,
    Users,
    Flag,
    ThumbsUp,
    Bookmark,
    Layers,
    SkipBack,
    SkipForward,
    Trophy,
    ArrowRight
} from 'lucide-react';

const EPISODES_PER_RANGE = 100;

export default function WatchPage() {
    const { id } = useParams();
    const [movieData, setMovieData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [activeTab, setActiveTab] = useState('episodes');
    const [recommendations, setRecommendations] = useState([]);
    const [relatedSeasons, setRelatedSeasons] = useState([]);

    // New Advanced Selector States
    const [activeServerIndex, setActiveServerIndex] = useState(0);
    const [isEpisodesCollapsed, setIsEpisodesCollapsed] = useState(true);
    const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
    const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);

    const { isAuthenticated } = useAuthStore();
    const [initialTime, setInitialTime] = useState(0);
    const [resumeLoading, setResumeLoading] = useState(false);
    // Map: actorName -> TMDB profile photo URL
    const [actorPhotos, setActorPhotos] = useState({});

    const handleEpisodeChange = (ep, time = 0) => {
        setCurrentEpisode(ep);
        setInitialTime(time);
    };

    const hasNextEpisode = () => {
        const episodes = movieData?.movie?.episodes?.[activeServerIndex]?.server_data || [];
        if (!currentEpisode || episodes.length === 0) return false;
        const currentIndex = episodes.findIndex(ep => ep.link_m3u8 === currentEpisode.link_m3u8);
        return currentIndex !== -1 && currentIndex < episodes.length - 1;
    };

    const hasPrevEpisode = () => {
        const episodes = movieData?.movie?.episodes?.[activeServerIndex]?.server_data || [];
        if (!currentEpisode || episodes.length === 0) return false;
        const currentIndex = episodes.findIndex(ep => ep.link_m3u8 === currentEpisode.link_m3u8);
        return currentIndex > 0;
    };

    const handleNextEpisode = () => {
        const episodes = movieData?.movie?.episodes?.[activeServerIndex]?.server_data || [];
        if (!currentEpisode || episodes.length === 0) return;
        const currentIndex = episodes.findIndex(ep => ep.link_m3u8 === currentEpisode.link_m3u8);
        if (currentIndex !== -1 && currentIndex < episodes.length - 1) {
            handleEpisodeChange(episodes[currentIndex + 1], 0);
        }
    };

    const handlePrevEpisode = () => {
        const episodes = movieData?.movie?.episodes?.[activeServerIndex]?.server_data || [];
        if (!currentEpisode || episodes.length === 0) return;
        const currentIndex = episodes.findIndex(ep => ep.link_m3u8 === currentEpisode.link_m3u8);
        if (currentIndex > 0) {
            handleEpisodeChange(episodes[currentIndex - 1], 0);
        }
    };

    useEffect(() => {
        const fetchMovieDetail = async () => {
            try {
                setLoading(true);
                // Clear old movie data and episode to prevent stale content/old video playing
                setMovieData(null);
                setCurrentEpisode(null);
                setInitialTime(0);
                setRecommendations([]);
                setRecommendations([]);

                const response = await movieService.getMovieDetail(id);
                if (response.status && response.movie) {
                    setMovieData(response);

                    // Fetch Recommendations with priority: same series > same category > same country
                    const fetchExtraData = async () => {
                        try {
                            const seen = new Set([id]);
                            // Helper to extract items from FilteredMovieListResponse { data: { items: [...] } }
                            const extractItems = (res) => res?.data?.items || [];
                            const addUnique = (list, items) => {
                                (items || []).forEach(item => {
                                    if (item?.slug && !seen.has(item.slug)) {
                                        seen.add(item.slug);
                                        list.push(item);
                                    }
                                });
                            };

                            const finalList = [];

                            // --- Priority 1: Same series/season ---
                            const currentTitle = response.movie.name;
                            const baseName = currentTitle.replace(/\s*(?:-\s*)?(?:Part|Season|Mùa|Phần)\s*\d+.*$/i, '').trim();
                            try {
                                const searchRes = await movieService.searchMovies(baseName);
                                const seriesItems = extractItems(searchRes).filter(item =>
                                    item.name?.toLowerCase().includes(baseName.toLowerCase()) &&
                                    item.slug !== id
                                );
                                addUnique(finalList, seriesItems);
                            } catch (_) { }

                            // --- Priority 2: Same category (up to 2 categories) ---
                            const categoryRequests = (response.movie.category || []).slice(0, 2).map(cat =>
                                movieService.getMoviesByCategory(cat.slug).catch(() => null)
                            );
                            const categoryResults = await Promise.all(categoryRequests);
                            categoryResults.forEach(res => {
                                addUnique(finalList, extractItems(res));
                            });

                            // --- Priority 3: Same country (only if list is short) ---
                            if (finalList.length < 15 && response.movie.country?.[0]) {
                                try {
                                    const countryRes = await movieService.getMoviesByCountry(response.movie.country[0].slug);
                                    addUnique(finalList, extractItems(countryRes));
                                } catch (_) { }
                            }

                            setRecommendations(finalList.slice(0, 6));
                        } catch (err) {
                            console.error("Error fetching extra movie data:", err);
                        }
                    };

                    fetchExtraData();

                    // Fetch real actor photos from TMDB credits (requires TmdbApi:ApiKey in backend config)
                    const tmdbId = response.movie.tmdb?.id;
                    const tmdbType = response.movie.tmdb?.type || 'movie';
                    if (tmdbId) {
                        movieService.getCredits(tmdbId, tmdbType).then(creditsData => {
                            const cast = creditsData?.cast || [];
                            const photoMap = {};
                            cast.forEach(person => {
                                if (person.name && person.profile_path) {
                                    photoMap[person.name] = `https://image.tmdb.org/t/p/w185${person.profile_path}`;
                                }
                            });
                            if (Object.keys(photoMap).length > 0) setActorPhotos(photoMap);
                        }).catch(() => { });
                    }

                    let initialEp = null;
                    const allEpisodes = response.movie.episodes?.[activeServerIndex]?.server_data || [];

                    if (allEpisodes.length > 0) {
                        // Skip items named 'Trailer' if possible
                        const nonTrailerEps = allEpisodes.filter(ep =>
                            !ep.name?.toString().toLowerCase().includes('trailer')
                        );
                        initialEp = nonTrailerEps.length > 0 ? nonTrailerEps[0] : allEpisodes[0];
                    }

                    const currentTitle = response.movie.name;
                    const baseName = currentTitle.replace(/\s*(?:-\s*)?(?:Part|Season|Mùa)\s*\d+.*$/i, '').trim();
                    try {
                        const searchResult = await movieService.searchMovies(baseName);
                        if (searchResult && searchResult.items && searchResult.items.length > 0) {
                            let seasons = searchResult.items.filter(item =>
                                item.name.toLowerCase().includes(baseName.toLowerCase())
                            );

                            seasons = seasons.sort((a, b) => {
                                const getPart = (t) => {
                                    const m = t.match(/(?:Part|Season|Mùa)\s*(\d+)/i);
                                    return m ? parseInt(m[1]) : 0;
                                };
                                return getPart(a.name) - getPart(b.name);
                            });

                            setRelatedSeasons(seasons);
                        } else {
                            setRelatedSeasons([{ ...response.movie, isCurrent: true }]);
                        }

                        if (initialEp && !isAuthenticated) {
                            setCurrentEpisode(initialEp);
                            setInitialTime(0);
                        }
                    } catch (err) {
                        setRelatedSeasons([{ ...response.movie, isCurrent: true }]);
                    }
                }
            } catch (error) {
                console.error("Error fetching movie detail:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchMovieDetail();
            window.scrollTo(0, 0);
        }
    }, [id]);

    // Handle Resume Playback
    useEffect(() => {
        const resumePlayback = async () => {
            if (!isAuthenticated || !movieData?.movie) return;

            const movie = movieData.movie;
            const allEpisodes = movie.episodes?.[activeServerIndex]?.server_data || [];
            const fallbackEp = allEpisodes[0] || null;

            let timeoutId = null;
            try {
                setResumeLoading(true);
                timeoutId = setTimeout(() => setResumeLoading(false), 6000);

                const historyRes = await axiosClient.get(`/watch-history/${movie.slug}`);
                const histories = Array.isArray(historyRes) ? historyRes : (historyRes?.data || []);

                if (!histories.length) {
                    if (fallbackEp) {
                        handleEpisodeChange(fallbackEp, 0);
                    }
                    return;
                }

                const normalized = histories.map(h => {
                    const episodeRaw = h.episode ?? h.Episode ?? null;
                    const watchedTimeInSeconds = h.watchedTimeInSeconds ?? h.WatchedTimeInSeconds ?? 0;
                    const lastWatchedAt = h.lastWatchedAt ?? h.LastWatchedAt ?? null;
                    const episodeStr = episodeRaw ? episodeRaw.toString().replace(/\.$/, '').trim() : null;
                    return {
                        episode: episodeStr,
                        watchedTimeInSeconds,
                        lastWatchedAt
                    };
                });

                let latest = null;
                if (normalized.length > 0) {
                    latest = normalized.reduce((best, cur) => {
                        if (!best) return cur;
                        const bestTime = new Date(best.lastWatchedAt || 0).getTime();
                        const curTime = new Date(cur.lastWatchedAt || 0).getTime();
                        return curTime > bestTime ? cur : best;
                    }, null);
                }

                const savedEpName = latest?.episode || null;

                let savedEp = null;
                if (savedEpName) {
                    const targetNum = parseInt(savedEpName.replace(/\D/g, ''), 10);

                    savedEp = allEpisodes.find(ep => {
                        const rawName = ep.name?.toString() || '';
                        const cleaned = rawName.replace(/\.$/, '').trim();

                        if (cleaned === savedEpName) return true;

                        const cleanedNum = parseInt(cleaned.replace(/\D/g, ''), 10);
                        if (Number.isNaN(targetNum) || Number.isNaN(cleanedNum)) return false;

                        return cleanedNum === targetNum;
                    });
                }

                if (savedEp) {
                    handleEpisodeChange(savedEp, latest.watchedTimeInSeconds || 0);

                    const currentIndex = allEpisodes.findIndex(ep => ep.link_m3u8 === savedEp.link_m3u8);
                    if (currentIndex !== -1) {
                        setSelectedRangeIndex(Math.floor(currentIndex / EPISODES_PER_RANGE));
                    }
                } else if (fallbackEp) {
                    handleEpisodeChange(fallbackEp, 0);
                }
            } catch (hErr) {
                console.error("Error fetching watch history", hErr);
                if (fallbackEp) handleEpisodeChange(fallbackEp, 0);
            } finally {
                if (timeoutId) clearTimeout(timeoutId);
                setResumeLoading(false);
            }
        };

        resumePlayback();
    }, [isAuthenticated, movieData, activeServerIndex]);

    // Update selected range when current episode or server changes
    useEffect(() => {
        if (movieData?.movie?.episodes?.[activeServerIndex]?.server_data) {
            const episodes = movieData.movie.episodes[activeServerIndex].server_data;
            if (currentEpisode) {
                const currentIndex = episodes.findIndex(ep => ep.link_m3u8 === currentEpisode.link_m3u8);
                if (currentIndex !== -1) {
                    setSelectedRangeIndex(Math.floor(currentIndex / EPISODES_PER_RANGE));
                }
            }
        }
    }, [currentEpisode, activeServerIndex, movieData]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!movieData?.movie) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-[#060814] text-white">
                <h1 className="text-2xl font-bold mb-6">Phim không tồn tại</h1>
                <Link to="/" className="glass-panel px-6 py-3 rounded-full text-primary-yellow flex items-center gap-2 border border-white/10">
                    <ChevronLeft size={20} /> Quay lại trang chủ
                </Link>
            </div>
        );
    }

    const { movie } = movieData;
    const episodes = movie.episodes?.[activeServerIndex]?.server_data || [];

    const ranges = [];
    if (episodes.length > EPISODES_PER_RANGE) {
        for (let i = 0; i < episodes.length; i += EPISODES_PER_RANGE) {
            const startLabel = episodes[i].name;
            const lastInIndex = Math.min(i + EPISODES_PER_RANGE - 1, episodes.length - 1);
            const endLabel = episodes[lastInIndex].name;
            ranges.push({ start: startLabel, end: endLabel, index: Math.floor(i / EPISODES_PER_RANGE) });
        }
    }

    const filteredEpisodes = ranges.length > 0
        ? episodes.slice(selectedRangeIndex * EPISODES_PER_RANGE, (selectedRangeIndex + 1) * EPISODES_PER_RANGE)
        : episodes;

    return (
        <div className="w-full min-h-screen bg-[#060814] text-white overflow-x-hidden font-inter">
            <div className="relative pt-24 pb-12 bg-gradient-to-b from-black/40 to-transparent">
                <div
                    className="absolute inset-x-0 top-0 h-[500px] opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `url(${movie.poster_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(100px)'
                    }}
                ></div>

                {/* Watch Section - Mobile/Tablet/TV Optimized Grid */}
                <div className="max-w-[2560px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-16 py-4 sm:py-8 relative z-10">
                    {/* Breadcrumbs / Back */}
                    <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-all text-xs font-bold uppercase tracking-widest mb-6">
                        <ChevronLeft size={16} /> Trang chủ / {movie.name}
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px] 2xl:grid-cols-[1fr_450px] gap-6 xl:gap-10 2xl:gap-12">

                        {/* Player Column */}
                        <div className="flex flex-col gap-6">
                            {/* Player Wrapper */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-primary-yellow/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                <div className="relative aspect-video bg-black rounded-none overflow-hidden shadow-2xl border border-white/5 ring-1 ring-white/10">
                                    {(isAuthenticated && resumeLoading && !currentEpisode?.link_m3u8) ? (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <LoadingSpinner />
                                        </div>
                                    ) : currentEpisode?.link_m3u8 ? (
                                        <>
                                            <VideoPlayer
                                                key={`${currentEpisode.link_m3u8}-${initialTime}`}
                                                videoUrl={currentEpisode.link_m3u8}
                                                movieId={movie.Id || movie._id}
                                                movieName={movie.name}
                                                movieSlug={movie.slug}
                                                movieThumbUrl={movie.thumb_url}
                                                episode={currentEpisode.name.toString().replace(/\.$/, '')}
                                                initialTime={initialTime}
                                                autoPlay={true}
                                                onNext={hasNextEpisode() ? handleNextEpisode : null}
                                                onPrev={hasPrevEpisode() ? handlePrevEpisode : null}
                                            />
                                        </>
                                    ) : movie.trailer_url ? (
                                        <div className="absolute inset-0 w-full h-full group/trailer">
                                            <iframe
                                                src={movie.trailer_url.includes('watch?v=') ? movie.trailer_url.replace('watch?v=', 'embed/') : movie.trailer_url.includes('youtu.be/') ? movie.trailer_url.replace('youtu.be/', 'youtube.com/embed/') : movie.trailer_url}
                                                title={`Trailer ${movie.name}`}
                                                className="w-full h-full border-0 absolute inset-0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                            ></iframe>
                                            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-primary-yellow uppercase tracking-widest">
                                                Trailer
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                                            <Play size={48} className="text-white/20 animate-pulse" />
                                            <p className="text-xl font-medium tracking-wide">Phim sắp chiếu</p>
                                            <span className="text-sm opacity-50">Trailer chưa cập nhật hoặc đang chờ tập 1.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Console */}
                            <div className="glass-panel p-4 px-3 sm:px-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                                <div className="flex items-center justify-around sm:justify-start gap-3 sm:gap-6">
                                    <button className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] sm:text-sm font-bold text-white/80 hover:text-primary-yellow transition-colors shrink-0">
                                        <ThumbsUp size={18} /> <span>{movie.view?.toLocaleString() || '1.2k'}</span>
                                    </button>
                                    <button className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] sm:text-sm font-bold text-white/80 hover:text-primary-yellow transition-colors shrink-0">
                                        <Bookmark size={18} /> <span>Lưu Phim</span>
                                    </button>
                                    <button className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] sm:text-sm font-bold text-white/80 hover:text-primary-yellow transition-colors shrink-0">
                                        <Share2 size={18} /> <span>Chia sẻ</span>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                                    <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] sm:text-xs font-bold transition-all">
                                        <Flag size={14} className="text-white/40" /> Báo lỗi
                                    </button>
                                    <div className="hidden sm:block w-px h-6 bg-white/10"></div>
                                    <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase text-primary-yellow">
                                        <Tv size={14} /> <span className="max-w-[80px] sm:max-w-none truncate">{movie.episodes?.[0]?.server_name || 'PhimAPI'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Details & Episodes Section */}
                            <div className="space-y-8 mt-4">
                                {/* Movie Header Info */}
                                <div className="flex flex-col md:flex-row items-start gap-6 lg:gap-8">
                                    <div className="w-40 xl:w-48 aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shrink-0 hidden md:block transition-all hover:scale-105 duration-500">
                                        <img src={movie.thumb_url} alt={movie.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="text-[clamp(1.5rem,4vw,2.5rem)] font-black mb-2 leading-tight">{movie.name}</h1>
                                        <h2 className="text-[clamp(1rem,2vw,1.25rem)] text-white/40 font-medium mb-4">{movie.origin_name}</h2>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            <span className="px-3 py-1 bg-primary-yellow text-black text-[10px] font-bold rounded-md tracking-wider uppercase">Hot</span>
                                            {movie.tmdb?.vote_average > 0 && (
                                                <span className="px-3 py-1 bg-[#f5c518] text-black text-[10px] font-black rounded-md tracking-wider uppercase border border-[#f5c518] shadow-[0_0_15px_rgba(245,197,24,0.3)] flex items-center gap-1">
                                                    <Star size={10} fill="currentColor" /> IMDB {movie.tmdb.vote_average.toFixed(1)}
                                                </span>
                                            )}
                                            <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold rounded-md tracking-wider uppercase border border-white/10">{movie.quality}</span>
                                            <span className="px-2 py-1 bg-white/5 text-white/80 text-[10px] font-black rounded-sm uppercase border border-white/5">{movie.episode_current}</span>
                                        </div>
                                        <p className="text-sm text-white/60 line-clamp-2 md:line-clamp-none leading-relaxed italic mb-4" dangerouslySetInnerHTML={{ __html: movie.content.slice(0, 300) + '...' }}></p>
                                        <RatingBox movieId={movie.slug || movie.Id || movie._id} />
                                    </div>
                                </div>


                                {/* Advanced Servers & Episodes Deck */}
                                <div className="glass-panel rounded-2xl border border-white/5 shadow-2xl relative overflow-visible">

                                    {/* Action Header Strip */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-b border-white/5 relative z-20 bg-[#0a0a0a]/50 rounded-t-2xl">

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                            {/* Season Dropdown */}
                                            {relatedSeasons.length > 0 && (
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                                                        className="flex items-center justify-between sm:justify-start min-h-[44px] w-full sm:w-auto gap-2 px-4 py-2 bg-white/5 sm:bg-transparent hover:bg-white/5 sm:border-r border-white/10 rounded-xl sm:rounded-none text-white font-bold text-sm transition-colors uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-inset"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Tv size={16} className="text-primary-yellow mb-0.5" />
                                                            <span className="max-w-[150px] sm:max-w-[120px] truncate">
                                                                {movie.name.match(/(?:Phần|Season|Mùa)\s*\d+/i)?.[0] || 'Phần 1'}
                                                            </span>
                                                        </div>
                                                        <ChevronDown size={14} className={`transition-transform duration-300 ${isSeasonDropdownOpen ? 'rotate-180' : ''}`} />
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {isSeasonDropdownOpen && (
                                                        <div className="absolute top-full left-0 right-0 sm:right-auto mt-2 sm:min-w-[220px] bg-[#18181b] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] py-2 z-50">
                                                            <div className="px-4 py-2 text-xs font-black uppercase text-white/30 tracking-widest border-b border-white/5 mb-1">Danh sách phần</div>
                                                            <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                                                                {relatedSeasons.map((season, idx) => {
                                                                    const isCurrentSeason = season.slug === movie.slug;
                                                                    const seasonTag = season.name.match(/(?:Phần|Season|Mùa)\s*\d+/i)?.[0];
                                                                    const displayName = seasonTag || season.name;

                                                                    if (isCurrentSeason) {
                                                                        return (
                                                                            <button key={idx} className="w-full text-left px-4 py-2.5 bg-primary-yellow/20 text-primary-yellow font-bold text-sm transition-colors truncate">
                                                                                {displayName}
                                                                            </button>
                                                                        );
                                                                    }

                                                                    return (
                                                                        <Link
                                                                            key={idx}
                                                                            to={`/watch/${season.slug}`}
                                                                            className="w-full block text-left px-4 py-2.5 text-white/60 hover:bg-white/5 hover:text-white font-medium text-sm transition-colors truncate"
                                                                        >
                                                                            {displayName}
                                                                        </Link>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Server Tabs */}
                                            <div className="flex overflow-x-auto sm:overflow-visible no-scrollbar -mx-2 sm:mx-0 px-2 sm:px-0 items-center gap-1 shrink-0">
                                                {movie.episodes?.map((server, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setActiveServerIndex(idx)}
                                                        className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary-yellow ${activeServerIndex === idx
                                                            ? 'bg-white/10 border-white/20 text-white shadow-inner'
                                                            : 'bg-transparent border-transparent text-white/40 hover:text-white/80 hover:bg-white/5'}`}
                                                    >
                                                        {server.server_name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Collapse Toggle */}
                                        <div className="flex items-center justify-between sm:justify-start gap-3 shrink-0 mt-2 sm:mt-0">
                                            <span className="text-[10px] sm:text-[11px] font-bold text-white/60 uppercase tracking-widest">Rút gọn</span>
                                            <button
                                                onClick={() => setIsEpisodesCollapsed(!isEpisodesCollapsed)}
                                                className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow`}
                                            >
                                                <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 border ${isEpisodesCollapsed ? 'bg-white/10 border-white/20' : 'bg-primary-yellow/20 border-primary-yellow/50'}`}>
                                                    <div className={`w-3.5 h-3.5 rounded-full absolute top-[2px] transition-all duration-300 shadow-sm ${isEpisodesCollapsed ? 'left-[3px] bg-white/40' : 'left-[21px] bg-primary-yellow'}`}></div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Range Selector Bar - Only if more than 100 eps */}
                                    {ranges.length > 0 && (
                                        <div className="flex items-center gap-2 p-4 bg-white/5 border-b border-white/5 overflow-x-auto no-scrollbar">
                                            <div className="flex items-center gap-2 px-3 mr-2 border-r border-white/10 shrink-0">
                                                <Layers size={14} className="text-white/20" />
                                                <span className="text-[9px] sm:text-[10px] font-black uppercase text-white/30 tracking-widest leading-none">Phân đoạn</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {ranges.map((range) => (
                                                    <button
                                                        key={range.index}
                                                        onClick={() => setSelectedRangeIndex(range.index)}
                                                        className={`min-h-[44px] px-4 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary-yellow ${selectedRangeIndex === range.index
                                                            ? 'bg-primary-yellow text-black border-primary-yellow shadow-[0_0_15px_rgba(252,213,63,0.2)] transform scale-105 z-10'
                                                            : 'bg-[#1a1c24] text-white/40 border-white/5 hover:bg-white/10 hover:border-white/20 hover:text-white'
                                                            }`}
                                                    >
                                                        Tập {range.start} - {range.end}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Episodes Grid Box */}
                                    <div className="relative p-6 overflow-hidden transition-all duration-700 ease-in-out bg-black/20">

                                        {/* Thumbnail Card Mode (Rút gọn OFF) */}
                                        <div className={`grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 transition-all duration-500 ease-out ${!isEpisodesCollapsed ? 'opacity-100 translate-y-0 relative z-10' : 'opacity-0 -translate-y-10 absolute inset-x-6 top-6 pointer-events-none'}`}>
                                            {filteredEpisodes.map((ep, i) => {
                                                const isActive = currentEpisode?.link_m3u8 === ep.link_m3u8;
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleEpisodeChange(ep, 0)}
                                                        tabIndex={0}
                                                        className={`group flex flex-col text-left transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-yellow focus:scale-[1.05] rounded-xl ${isActive ? 'scale-[1.02]' : 'hover:scale-[1.02]'}`}
                                                    >
                                                        <div className={`w-full aspect-video rounded-xl overflow-hidden mb-2 relative border-2 transition-all duration-500 ${isActive ? 'border-primary-yellow shadow-[0_0_15px_rgba(252,213,63,0.3)]' : 'border-white/10 group-hover:border-white/30'}`}>
                                                            <img src={movie.thumb_url} alt={ep.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                            {isActive && (
                                                                <div className="absolute inset-x-0 bottom-0 top-auto h-1 bg-primary-yellow"></div>
                                                            )}
                                                            {isActive && (
                                                                <div className="absolute top-2 left-0 bg-primary-yellow text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-r-md">
                                                                    Đang chiếu
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors flex items-center justify-center">
                                                                {isActive ? (
                                                                    <div className="w-10 h-10 rounded-full bg-primary-yellow/20 flex items-center justify-center backdrop-blur-sm">
                                                                        <div className="w-2.5 h-2.5 bg-primary-yellow rounded-full animate-pulse"></div>
                                                                    </div>
                                                                ) : (
                                                                    <Play size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className={`text-[13px] font-bold transition-colors ${isActive ? 'text-primary-yellow' : 'text-white/80 group-hover:text-white'}`}>
                                                            {ep.name}.
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Compact Pill Mode (Rút gọn ON) */}
                                        <div className={`grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 transition-all duration-500 ease-out ${isEpisodesCollapsed ? 'opacity-100 translate-y-0 relative z-10' : 'opacity-0 translate-y-10 absolute inset-x-6 top-6 pointer-events-none'}`}>
                                            {filteredEpisodes.map((ep, i) => {
                                                const isActive = currentEpisode?.link_m3u8 === ep.link_m3u8;
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleEpisodeChange(ep, 0)}
                                                        tabIndex={0}
                                                        className={`group min-h-[44px] rounded-xl text-xs font-bold flex items-center justify-center gap-2 px-2 transition-all duration-300 border focus:outline-none focus:ring-4 focus:ring-primary-yellow focus:scale-105 ${isActive
                                                            ? 'bg-primary-yellow text-black border-primary-yellow/50 shadow-[0_0_20px_rgba(252,213,63,0.2)] shadow-inner transform scale-[1.03] z-10'
                                                            : 'bg-[#1a1c24] text-gray-300 border-white/5 hover:bg-white/10 hover:border-white/20 hover:text-white hover:scale-105'
                                                            }`}
                                                    >
                                                        {isActive ? <Play size={12} fill="currentColor" /> : <Play size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />}
                                                        {ep.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Actual Comments */}
                                <div className="glass-panel p-4 md:p-8 rounded-3xl border border-white/5">
                                    <CommentSection movieId={movie.slug || movie.Id || movie._id} />
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Column */}
                        <div className="flex flex-col gap-8">

                            {/* Cast Selection */}
                            <div className="glass-panel p-6 rounded-3xl border border-white/5">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center justify-between">
                                    Diễn viên
                                    <Users size={16} className="text-white/20" />
                                </h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 gap-4 sm:gap-6">
                                    {movie.actor && movie.actor.length > 0 && (movie.actor[0]?.name || movie.actor[0]) !== "" ? (
                                        movie.actor.slice(0, 9).map((actor, i) => {
                                            const name = actor?.name || actor || '';
                                            const character = actor?.character || '';
                                            // Priority: TMDB credits photo > profile_path from API > default avatar
                                            const realPhoto = actorPhotos[name] || (actor?.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : null);
                                            const DEFAULT_AVATAR = 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg';
                                            return (
                                                <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary-yellow/40 to-purple-500/20 p-0.5 group-hover:p-1 transition-all duration-300">
                                                        <div className="w-full h-full rounded-full bg-[#1a1c24] overflow-hidden border border-white/10">
                                                            <img
                                                                src={realPhoto || DEFAULT_AVATAR}
                                                                alt={name}
                                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                                                                onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="text-[10px] font-bold text-white/60 group-hover:text-white transition-colors line-clamp-1 block">{name}</span>
                                                        {character && <span className="text-[9px] text-white/30 line-clamp-1 block">{character}</span>}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="col-span-3 py-4 text-center text-white/20 text-[10px] font-bold uppercase tracking-widest">
                                            Thông tin đang cập nhật
                                        </div>
                                    )}
                                </div>
                                {movie.actor && movie.actor.length > 9 && (
                                    <button className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 transition-all">Xem tất cả</button>
                                )}
                            </div>

                            {/* Recommendations Selection */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Layers size={14} className="text-primary-yellow" />
                                        Đề xuất cho bạn
                                    </h3>
                                    <Link to="/explore" className="text-[10px] font-bold text-white/20 hover:text-primary-yellow transition-colors uppercase tracking-widest">Khám phá</Link>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {recommendations.length > 0 ? (
                                        recommendations.map((rec) => (
                                            <Link
                                                key={rec.slug || rec._id}
                                                to={`/watch/${rec.slug}`}
                                                className="glass-panel p-2 rounded-2xl border border-white/5 flex gap-4 hover:bg-white/5 hover:border-white/20 transition-all group"
                                            >
                                                <div className="w-20 aspect-[3/4] rounded-xl overflow-hidden shadow-lg shrink-0 relative">
                                                    <img
                                                        src={rec.thumb_url?.startsWith('http') ? rec.thumb_url : `https://img.ophim.live/uploads/movies/${rec.thumb_url}`}
                                                        alt={rec.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/80x107/1a1a1a/444?text=No+Image'; }}
                                                    />
                                                    <div className="absolute top-1 left-1 bg-[#f5c518] text-black text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase">IMDB {rec.tmdb?.vote_average || "8.5"}</div>
                                                </div>
                                                <div className="flex-1 py-1 flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="text-xs font-black text-white group-hover:text-primary-yellow transition-colors line-clamp-2 leading-tight uppercase tracking-tighter">{rec.name}</h4>
                                                        <p className="text-[10px] text-white/30 font-bold mt-1 uppercase">{rec.year} • {rec.episode_current || rec.time}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-white/40 group-hover:text-white transition-colors uppercase">
                                                        Xem ngay <ArrowRight size={10} />
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        [1, 2, 3, 4, 5, 6].map(i => (
                                            <div key={i} className="w-full h-24 rounded-2xl bg-white/5 animate-pulse border border-white/5"></div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Banner / Ad Space */}
                            <div className="rounded-3xl bg-gradient-to-br from-[#1a1c24] to-[#060814] p-8 border border-white/10 relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-yellow/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000"></div>
                                <div className="relative z-10">
                                    <Star className="text-primary-yellow mb-4" size={32} strokeWidth={1.5} />
                                    <h4 className="text-xl font-black mb-2 tracking-tighter">Tham gia Cộng đồng</h4>
                                    <p className="text-sm text-white/40 font-medium leading-relaxed mb-6">Thảo luận phim, vote tập mới và nhận thông báo sớm nhất.</p>
                                    <button className="px-6 py-2.5 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-yellow transition-all">Tham gia</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Space at the bottom */}
            <div className="h-40"></div>
        </div>
    );
}

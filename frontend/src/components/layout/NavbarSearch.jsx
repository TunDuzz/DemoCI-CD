import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Loader2, Film } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { movieService } from '@/features/movies/services/movieService';

const IMAGE_BASE_URL = 'https://img.ophim.live/uploads/movies/';

export default function NavbarSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);
    const [quickResults, setQuickResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const inputRef = useRef(null);
    const debounceRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Parse searching query
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const query = queryParams.get('q');
        if (query) {
            setSearchTerm(query);
        } else if (location.pathname !== '/search') {
            setSearchTerm('');
        }
        // Close dropdown on navigation
        setShowDropdown(false);
    }, [location]);

    // Debounced quick search
    const fetchQuickResults = useCallback(async (keyword) => {
        if (!keyword || keyword.trim().length < 2) {
            setQuickResults([]);
            setShowDropdown(false);
            return;
        }
        setIsSearching(true);
        try {
            const res = await movieService.searchMovies(keyword.trim(), 1);
            const items = res?.data?.items || res?.items || [];
            setQuickResults(items.slice(0, 6));
            setShowDropdown(true);
        } catch {
            setQuickResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        clearTimeout(debounceRef.current);
        if (!val.trim()) {
            setQuickResults([]);
            setShowDropdown(false);
            return;
        }
        debounceRef.current = setTimeout(() => fetchQuickResults(val), 200);
    };

    const handleSearch = (e) => {
        e?.preventDefault();
        if (searchTerm.trim()) {
            setShowDropdown(false);
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
            inputRef.current?.blur();
            if (window.innerWidth < 768) setIsMobileExpanded(false);
        }
    };

    const handleSelectMovie = (slug) => {
        setShowDropdown(false);
        setSearchTerm('');
        if (window.innerWidth < 768) setIsMobileExpanded(false);
        navigate(`/watch/${slug}`);
    };

    const handleBlur = () => {
        // Increase delay to ensure click event fires before unmounting dropdown
        setTimeout(() => {
            setIsFocused(false);
            setShowDropdown(false);
        }, 250);
    };

    const thumbUrl = (movie) => {
        const url = movie.thumb_url || movie.poster_url || '';
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${IMAGE_BASE_URL}${url}`;
    };

    const QuickDropdown = () => (
        <div className="absolute top-full left-0 right-0 mt-2 z-[200]">
            <div className="bg-[#0f1117]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {isSearching && (
                    <div className="flex items-center justify-center gap-2 py-4 text-white/50 text-sm">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Đang tìm...</span>
                    </div>
                )}

                {!isSearching && quickResults.length === 0 && searchTerm.length >= 2 && (
                    <div className="py-4 px-4 text-center text-white/40 text-sm">
                        Không tìm thấy kết quả nào
                    </div>
                )}

                {!isSearching && quickResults.length > 0 && (
                    <>
                        <div className="px-3 py-2 border-b border-white/5">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-white/30">
                                Kết quả nhanh
                            </span>
                        </div>
                        <ul>
                            {quickResults.map((movie) => (
                                <li key={movie._id || movie.slug}>
                                    <button
                                        type="button"
                                        onMouseDown={(e) => {
                                            e.preventDefault(); // Ngăn ô input bị mất focus trước khi chạy hàm navigate
                                            handleSelectMovie(movie.slug);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left group"
                                    >
                                        {/* Thumbnail */}
                                        <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-white/5 border border-white/5">
                                            {thumbUrl(movie) ? (
                                                <img
                                                    src={thumbUrl(movie)}
                                                    alt={movie.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Film size={16} className="text-white/20" />
                                                </div>
                                            )}
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white group-hover:text-primary-yellow transition-colors line-clamp-1">
                                                {movie.name}
                                            </p>
                                            <p className="text-[11px] text-white/40 line-clamp-1 mt-0.5">
                                                {movie.origin_name || ''}
                                                {movie.year ? ` • ${movie.year}` : ''}
                                                {movie.episode_current ? ` • ${movie.episode_current}` : ''}
                                            </p>
                                        </div>
                                        {/* Category badge */}
                                        {movie.type && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/30 shrink-0">
                                                {movie.type === 'series' ? 'Phim Bộ' : movie.type === 'single' ? 'Phim Lẻ' : movie.type}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        {/* View all */}
                        <div className="border-t border-white/5">
                            <button
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSearch(e);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-primary-yellow hover:bg-primary-yellow/5 transition-colors"
                            >
                                <Search size={13} />
                                Xem tất cả kết quả cho "{searchTerm}"
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop and Unexpanded Mobile State */}
            <div className={`relative ${isMobileExpanded ? 'invisible md:visible' : ''}`}>
                <form
                    onSubmit={handleSearch}
                    className={`
                        flex items-center rounded-full overflow-visible h-[44px]
                        w-[44px] md:w-56 xl:w-72 bg-transparent md:bg-white/5 transition-colors
                        relative hover:bg-white/10 md:hover:bg-white/10
                        ${isFocused ? 'md:ring-1 md:ring-primary-yellow/40 md:bg-black/80' : ''}
                    `}
                >
                    {/* Search Button (Triggers expand on mobile) */}
                    <button
                        type="button"
                        tabIndex={0}
                        onClick={() => {
                            if (window.innerWidth < 768) {
                                if (!isMobileExpanded) {
                                    setIsMobileExpanded(true);
                                    setTimeout(() => {
                                        if (inputRef.current) inputRef.current.focus();
                                    }, 10);
                                }
                            } else {
                                handleSearch();
                            }
                        }}
                        className="absolute left-0 z-10 w-[44px] h-[44px] flex items-center justify-center focus:outline-none rounded-full text-gray-400 md:hover:text-white"
                    >
                        <Search size={18} />
                    </button>

                    {/* Input (Desktop only visible, hidden/opacity-0 on mobile) */}
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Tìm kiếm phim, diễn viên..."
                        value={searchTerm}
                        onChange={handleInputChange}
                        onFocus={() => {
                            setIsFocused(true);
                            if (quickResults.length > 0) setShowDropdown(true);
                        }}
                        onBlur={handleBlur}
                        onKeyDown={(e) => { if (e.key === 'Escape') setShowDropdown(false); }}
                        className="w-full h-full bg-transparent border-none focus:outline-none text-[15px] md:text-sm font-medium text-white placeholder-gray-500 opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto pl-[44px] pr-10"
                    />

                    {/* Clear Button (Desktop only) */}
                    {searchTerm && isFocused && (
                        <button
                            type="button"
                            onMouseDown={() => { setSearchTerm(''); setQuickResults([]); setShowDropdown(false); }}
                            className="hidden md:flex absolute right-1 text-gray-400 hover:text-primary-yellow p-1 min-h-[44px] items-center justify-center rounded-full z-10"
                        >
                            <X size={14} />
                        </button>
                    )}
                </form>

                {/* Quick Results Dropdown — Desktop only */}
                {showDropdown && (isFocused || isSearching) && (
                    <div className="hidden md:block">
                        <QuickDropdown />
                    </div>
                )}
            </div>

            {/* Mobile Expanded Overlay */}
            {isMobileExpanded && (
                <div className="absolute inset-0 z-[70] bg-[#0a0a0c] px-4 md:hidden flex flex-col">
                    <div className="flex items-center h-[60px] gap-2">
                        <form onSubmit={handleSearch} className="flex-1 h-[36px] bg-[#1a1c22] border border-white/5 rounded-[12px] flex items-center px-3 mr-1">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Tìm kiếm phim, diễn viên..."
                                value={searchTerm}
                                onChange={handleInputChange}
                                onFocus={() => { if (quickResults.length > 0) setShowDropdown(true); }}
                                className="w-full h-full bg-transparent border-none text-[14px] font-medium text-white placeholder-gray-500 focus:outline-none"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onMouseDown={() => { setSearchTerm(''); setQuickResults([]); setShowDropdown(false); }}
                                    className="text-gray-400 p-1.5 focus:outline-none"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </form>
                        {/* X Button */}
                        <button
                            type="button"
                            onClick={() => { setIsMobileExpanded(false); setShowDropdown(false); }}
                            className="w-[44px] h-[44px] flex items-center justify-center shrink-0 text-[#ef4444]"
                        >
                            <X size={20} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Mobile dropdown results */}
                    {(showDropdown || isSearching) && searchTerm.length >= 2 && (
                        <div className="flex-1 overflow-auto pb-4">
                            <QuickDropdown />
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

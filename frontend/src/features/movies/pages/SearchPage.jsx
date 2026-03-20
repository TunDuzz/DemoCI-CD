import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { movieService } from '@/features/movies/services/movieService';
import MovieCard from '@/features/movies/components/MovieCard';
import { Clapperboard, Filter, FilterX, ChevronDown, Check, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function SearchPage() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const keyword = queryParams.get('q') || '';
    const genreParam = queryParams.get('genre') || '';
    const countryParam = queryParams.get('country') || '';
    const typeParam = queryParams.get('type') || '';

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [countries, setCountries] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [activeFilters, setActiveFilters] = useState({
        country: countryParam,
        year: '',
        type: typeParam
    });

    const [showFilters, setShowFilters] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationData, setPaginationData] = useState(null);
    const [inputPage, setInputPage] = useState('1');

    // Update inputPage when currentPage changes
    useEffect(() => {
        setInputPage(currentPage.toString());
    }, [currentPage]);

    // Staging States (To prevent instant pop/layout-shift)
    const [stagedCategory, setStagedCategory] = useState(null);
    const [stagedFilters, setStagedFilters] = useState({
        country: countryParam,
        year: '',
        type: typeParam
    });

    // Sync selectedCategory with genreParam
    useEffect(() => {
        if (genreParam) {
            setSelectedCategory(genreParam);
            setStagedCategory(genreParam);
        }
    }, [genreParam]);

    // Clear category if search keyword is used from Navbar
    useEffect(() => {
        if (keyword.trim()) {
            setSelectedCategory(null);
            setStagedCategory(null);
            setActiveFilters(prev => ({ ...prev, country: '', year: '', type: '' }));
            setStagedFilters(prev => ({ ...prev, country: '', year: '', type: '' }));
            setCurrentPage(1);
        }
    }, [keyword]);

    // Sync activeFilters when URL params for country/type change directly from Navbar
    useEffect(() => {
        // Only trigger this reset if specifically navigating to a country or type page via URL
        if (countryParam || typeParam) {
            setActiveFilters({
                country: countryParam,
                year: '',
                type: typeParam
            });
            setStagedFilters({
                country: countryParam,
                year: '',
                type: typeParam
            });
            setCurrentPage(1);
        }
    }, [countryParam, typeParam]);

    // Reset page when genreParam changes from URL
    useEffect(() => {
        if (genreParam) {
            setCurrentPage(1);
        }
    }, [genreParam]);

    // Fetch categories and countries on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, countRes] = await Promise.all([
                    movieService.getCategories(),
                    movieService.getCountries()
                ]);

                if (catRes?.status && catRes?.data?.items) {
                    setCategories(catRes.data.items);
                }
                if (countRes?.status && countRes?.data?.items) {
                    setCountries(countRes.data.items);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu lọc:", error);
            }
        };
        fetchData();
    }, []);

    // Sync staging with active when panel opens
    useEffect(() => {
        if (showFilters) {
            setStagedCategory(selectedCategory);
            setStagedFilters(activeFilters);
        }
    }, [showFilters]);

    const handleApplyFilters = () => {
        setSelectedCategory(stagedCategory);
        setActiveFilters(stagedFilters);
        setCurrentPage(1); // Important: reset to page 1 on new filter apply
        setShowFilters(false); // Optionally close panel after apply
    };

    useEffect(() => {
        const fetchResults = async () => {
            const activeKeyword = keyword.trim();
            const activeCategory = selectedCategory || genreParam;
            const hasFilters = Object.values(activeFilters).some(v => v);

            // If nothing is selected and no keyword, clear results
            if (!activeKeyword && !activeCategory && !hasFilters) {
                setResults([]);
                setPaginationData(null);
                return;
            }

            setLoading(true);
            try {
                let response;
                const filterParams = {
                    country: activeFilters.country,
                    year: activeFilters.year,
                    category: activeCategory,
                    type: activeFilters.type
                };

                if (keyword) {
                    response = await movieService.searchMovies(keyword, currentPage, filterParams);
                } else {
                    if (activeFilters.type) {
                        response = await movieService.getMoviesByType(activeFilters.type, currentPage, filterParams);
                    } else if (activeCategory) {
                        response = await movieService.getMoviesByCategory(activeCategory, currentPage, filterParams);
                    } else if (activeFilters.country) {
                        response = await movieService.getMoviesByCountry(activeFilters.country, currentPage, filterParams);
                    } else {
                        // Fallback: Default to latest if only year, rating or sort selected
                        response = await movieService.getMoviesByType('phim-moi', currentPage, filterParams);
                    }
                }

                if (response?.status && response?.data?.items) {
                    setResults(response.data.items);
                    if (response.data.params?.pagination) {
                        setPaginationData(response.data.params.pagination);
                    } else if (response.pagination) {
                        setPaginationData(response.pagination);
                    } else {
                        setPaginationData(null);
                    }
                } else if (response?.status && response?.items) {
                    setResults(response.items);
                    if (response.pagination) {
                        setPaginationData(response.pagination);
                    } else {
                        setPaginationData(null);
                    }
                } else {
                    setResults([]);
                    setPaginationData(null);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                setResults([]);
                setPaginationData(null);
            } finally {
                setLoading(false);
                if (window.scrollY > 300) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        };

        fetchResults();
    }, [keyword, selectedCategory, genreParam, activeFilters, currentPage]);

    return (
        <div className="min-h-screen bg-dark-bg pt-28 pb-20 px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-16 max-w-[2560px] mx-auto animate-in fade-in duration-500">
            {/* Search Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-[clamp(1.5rem,4vw,2.5rem)] font-heading font-medium text-white flex flex-wrap items-center gap-2 sm:gap-3">
                        {keyword ? (
                            <>
                                <span className="opacity-60">Kết quả cho:</span>
                                <span className="text-primary-yellow font-bold uppercase tracking-wide px-3 py-1 sm:px-4 sm:py-1.5 bg-white/5 rounded-xl border border-white/10 text-sm sm:text-base">
                                    "{keyword}"
                                </span>
                            </>
                        ) : selectedCategory ? (
                            <>
                                <span className="opacity-60">Thể loại:</span>
                                <span className="text-primary-yellow font-bold uppercase tracking-wide px-3 py-1 sm:px-4 sm:py-1.5 bg-white/5 rounded-xl border border-white/10 text-sm sm:text-base">
                                    {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                                </span>
                            </>
                        ) : (
                            "Khám phá kho phim"
                        )}
                    </h1>
                    <p className="text-gray-500 mt-2 text-xs flex items-center gap-2 font-medium tracking-wide">
                        <Clapperboard size={14} className="text-primary-yellow/60" />
                        {loading ? "Đang truy xuất dữ liệu..." : `Tìm thấy ${paginationData?.totalItems || results.length} bộ phim phù hợp`}
                    </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 mt-4 md:mt-0">
                    {/* Clear Quick Filters button - Only if something is active */}
                    {(selectedCategory || Object.values(activeFilters).some(v => v)) && (
                        <button
                            onClick={() => {
                                setSelectedCategory(null);
                                setStagedCategory(null);
                                setActiveFilters({ country: '', year: '', type: '' });
                                setStagedFilters({ country: '', year: '', type: '' });
                                setCurrentPage(1);
                            }}
                            className="min-h-[44px] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-red-400 transition-colors bg-white/5 border border-white/10 shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                        >
                            Xóa bộ lọc
                        </button>
                    )}

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`min-h-[44px] flex items-center justify-center gap-2 px-6 py-2 rounded-xl border transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] flex-1 sm:flex-none focus:outline-none focus:ring-2 focus:ring-primary-yellow ${showFilters
                            ? 'bg-primary-yellow text-black border-primary-yellow shadow-[0_10px_30px_-10px_rgba(252,213,63,0.4)]'
                            : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                    >
                        {showFilters ? <FilterX size={14} /> : <Filter size={14} />}
                        <span>{showFilters ? 'Đóng bộ lọc' : 'Lọc nâng cao'}</span>
                        {Object.values(activeFilters).filter(v => v).length + (selectedCategory ? 1 : 0) > 0 && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${showFilters ? 'bg-black/20' : 'bg-primary-yellow text-black'}`}>
                                {Object.values(activeFilters).filter(v => v).length + (selectedCategory ? 1 : 0)}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Advanced Filter Panel - Horizontal Overhaul */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showFilters ? 'max-h-[2000px] opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'}`}>
                <div className="bg-[#0f1015]/95 backdrop-blur-3xl border border-white/5 rounded-[30px] p-6 md:p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative">
                    <div className="flex items-center gap-3 mb-6 text-primary-yellow">
                        <Filter size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Bộ lọc</span>
                    </div>

                    <div className="space-y-6">
                        {/* Row 1: Country */}
                        <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-8">
                            <label className="text-[10px] sm:text-[11px] font-black text-white/30 uppercase tracking-[0.2em] w-24 pt-0 sm:pt-1.5 shrink-0 opacity-50">Quốc gia:</label>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 flex-1">
                                <button
                                    onClick={() => setStagedFilters(prev => ({ ...prev, country: '' }))}
                                    className={`px-3 sm:px-4 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all border ${!stagedFilters.country ? 'border-primary-yellow text-primary-yellow bg-primary-yellow/5' : 'border-white/5 text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                                >
                                    Tất cả
                                </button>
                                {countries.map(c => (
                                    <button
                                        key={c.slug}
                                        onClick={() => setStagedFilters(prev => ({ ...prev, country: c.slug }))}
                                        className={`px-3 sm:px-4 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all border ${stagedFilters.country === c.slug ? 'border-primary-yellow text-primary-yellow bg-primary-yellow/5' : 'border-white/5 text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                                    >
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Row 2: Type */}
                        <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-8">
                            <label className="text-[10px] sm:text-[11px] font-black text-white/30 uppercase tracking-[0.2em] w-24 pt-0 sm:pt-1.5 shrink-0 opacity-50">Loại phim:</label>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 flex-1">
                                {[
                                    { id: '', label: 'Tất cả' },
                                    { id: 'phim-le', label: 'Phim lẻ' },
                                    { id: 'phim-bo', label: 'Phim bộ' }
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setStagedFilters(prev => ({ ...prev, type: type.id }))}
                                        className={`px-3 sm:px-4 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all border ${stagedFilters.type === type.id ? 'border-primary-yellow text-primary-yellow bg-primary-yellow/5' : 'border-white/5 text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Row 3: Genre */}
                        <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-8">
                            <label className="text-[10px] sm:text-[11px] font-black text-white/30 uppercase tracking-[0.2em] w-24 pt-0 sm:pt-1.5 shrink-0 opacity-50">Thể loại:</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-1.5 sm:gap-2 flex-1">
                                <button
                                    onClick={() => setStagedCategory(null)}
                                    className={`px-3 sm:px-4 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all border text-center ${!stagedCategory ? 'border-primary-yellow text-primary-yellow bg-primary-yellow/5' : 'border-white/5 text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                                >
                                    Tất cả
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.slug}
                                        onClick={() => setStagedCategory(cat.slug)}
                                        className={`px-3 sm:px-4 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold truncate transition-all border text-center ${stagedCategory === cat.slug ? 'border-primary-yellow text-primary-yellow bg-primary-yellow/5' : 'border-white/5 text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Row 4: Year */}
                        <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-8">
                            <label className="text-[10px] sm:text-[11px] font-black text-white/30 uppercase tracking-[0.2em] w-24 pt-0 sm:pt-1.5 shrink-0 opacity-50">Năm sản xuất:</label>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 flex-1">
                                <button
                                    onClick={() => setStagedFilters(prev => ({ ...prev, year: '' }))}
                                    className={`px-3 sm:px-4 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all border ${!stagedFilters.year ? 'border-primary-yellow text-primary-yellow bg-primary-yellow/5' : 'border-white/5 text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                                >
                                    Tất cả
                                </button>
                                {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map(yr => (
                                    <button
                                        key={yr}
                                        onClick={() => setStagedFilters(prev => ({ ...prev, year: yr.toString() }))}
                                        className={`px-3 sm:px-4 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all border ${stagedFilters.year === yr.toString() ? 'border-primary-yellow text-primary-yellow bg-primary-yellow/5' : 'border-white/5 text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                                    >
                                        {yr}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/5">
                        <button
                            onClick={handleApplyFilters}
                            className="min-h-[44px] group relative flex items-center justify-center gap-3 px-8 py-3 rounded-full bg-primary-yellow text-black font-black text-[11px] uppercase tracking-[0.2em] overflow-hidden shadow-[0_20px_40px_-10px_rgba(252,213,63,0.3)] hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 transition-all duration-300 flex-1"
                        >
                            <span className="relative z-10">Lọc kết quả</span>
                            <ChevronRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        </button>

                        <button
                            onClick={() => setShowFilters(false)}
                            className="min-h-[44px] px-8 py-3 rounded-full border border-white/20 text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white transition-all flex-1 sm:flex-none"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-primary-yellow/20 via-white/5 to-transparent mb-12"></div>

            {/* Content Area */}
            {loading ? (
                <LoadingSpinner label="Đang lọc phim..." />
            ) : results.length > 0 ? (
                /* Results Grid */
                <div className="space-y-12">
                    <div className="grid grid-cols-2 mx-auto sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 3xl:grid-cols-10 gap-3 sm:gap-4 md:gap-6">
                        {results.map((movie) => (
                            <div key={movie.slug} className="flex justify-center w-full">
                                <MovieCard movie={movie} />
                            </div>
                        ))}
                    </div>

                    {/* Custom Arrow-based Pagination */}
                    {paginationData && paginationData.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-3 sm:gap-6 pb-20 mt-12 sm:mt-20">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all bg-[#1a1b23] border border-white/5 shrink-0 ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 hover:border-white/20 active:scale-90 text-white shadow-xl'}`}
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="px-4 sm:px-8 py-2.5 sm:py-3 rounded-full bg-[#1a1b23] border border-white/5 flex items-center gap-3 sm:gap-4 shadow-xl">
                                <span className="text-[9px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.2em] sm:tracking-[0.3em] hidden xs:inline">Trang</span>
                                <div className="flex items-baseline gap-2 sm:gap-3">
                                    <input
                                        type="text"
                                        value={inputPage}
                                        onChange={(e) => setInputPage(e.target.value)}
                                        onBlur={() => {
                                            const page = parseInt(inputPage);
                                            if (!isNaN(page) && page >= 1 && page <= paginationData.totalPages) {
                                                setCurrentPage(page);
                                            } else {
                                                setInputPage(currentPage.toString());
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') e.target.blur();
                                        }}
                                        className="w-10 sm:w-12 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-center text-xs sm:text-sm font-black text-primary-yellow shadow-inner outline-none focus:border-primary-yellow/50 focus:bg-white/10 transition-all"
                                    />
                                    <span className="text-white/20 font-bold">/</span>
                                    <span className="text-xs sm:text-sm font-black text-white/60">{paginationData.totalPages}</span>
                                </div>
                            </div>

                            <button
                                disabled={currentPage === paginationData.totalPages}
                                onClick={() => setCurrentPage(p => Math.min(paginationData.totalPages, p + 1))}
                                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all bg-[#1a1b23] border border-white/5 shrink-0 ${currentPage === paginationData.totalPages ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 hover:border-white/20 active:scale-90 text-white shadow-xl'}`}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            ) : (keyword || selectedCategory || Object.values(activeFilters).some(v => v)) ? (
                /* No Results State (When Filters OR Keyword used) */
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <Clapperboard size={40} className="text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy phim</h3>
                    <p className="text-gray-400 max-w-md">
                        Rất tiếc, chúng tôi không tìm thấy kết quả nào phù hợp với bộ lọc và từ khóa hiện tại. Vui lòng thử lại với các tiêu chí khác.
                    </p>
                </div>
            ) : (
                /* Empty Initial State */
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-gray-400">Vui lòng nhập từ khóa hoặc chọn bộ lọc để tìm kiếm.</p>
                </div>
            )}
        </div>
    );
}

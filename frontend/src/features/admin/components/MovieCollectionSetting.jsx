import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Trash2,
    GripVertical,
    Save,
    Film,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { movieService } from '../../movies/services/movieService';

const MovieCollectionSetting = ({ label, settingKey, adminService }) => {
    const [selectedMovies, setSelectedMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSetting = async () => {
            try {
                const data = await adminService.getSetting(settingKey);
                if (data) setSelectedMovies(data);
            } catch (error) {
                console.error(`Error fetching ${settingKey}:`, error);
            }
        };
        fetchSetting();
    }, [settingKey]);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await movieService.searchMovies(query);
            // OPhim API v1 returns results in data.items, while other endpoints might use items directly
            const movies = results.data?.items || results.items || [];
            setSearchResults(movies);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const addMovie = (movie) => {
        if (selectedMovies.find(m => m.slug === movie.slug)) {
            alert('Phim này đã có trong danh sách');
            return;
        }
        setSelectedMovies([...selectedMovies, {
            name: movie.name,
            slug: movie.slug,
            thumb_url: movie.thumb_url,
            poster_url: movie.poster_url,
            category: movie.category,
            year: movie.year
        }]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeMovie = (slug) => {
        setSelectedMovies(selectedMovies.filter(m => m.slug !== slug));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await adminService.updateSetting(settingKey, selectedMovies);
            alert('Cập nhật thành công!');
        } catch (error) {
            alert('Lỗi khi lưu cấu hình');
        } finally {
            setIsSaving(false);
        }
    };

    const moveMovie = (index, direction) => {
        const newMovies = [...selectedMovies];
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < newMovies.length) {
            [newMovies[index], newMovies[newIndex]] = [newMovies[newIndex], newMovies[index]];
            setSelectedMovies(newMovies);
        }
    };

    return (
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{label}</h3>
                    <p className="text-sm text-slate-500 font-medium">Tìm kiếm và sắp xếp danh sách phim hiển thị.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Lưu cấu hình
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Search & Results */}
                <div className="space-y-4">
                    <div className="relative group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Nhập tên phim để tìm kiếm..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50/50 transition-all"
                        />
                        {isSearching && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 size={18} className="animate-spin text-indigo-600" />
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 rounded-3xl p-4 min-h-[400px] max-h-[600px] overflow-y-auto space-y-3">
                        {searchResults.length > 0 ? (
                            searchResults.map(movie => (
                                <div key={movie.slug} className="bg-white p-3 rounded-2xl flex items-center gap-4 hover:shadow-md transition-all group">
                                    <img
                                        src={movie.thumb_url?.startsWith('http') ? movie.thumb_url : `https://img.ophim.live/uploads/movies/${movie.thumb_url || ''}`}
                                        className="w-12 h-16 rounded-xl object-cover shadow-sm"
                                        alt=""
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 line-clamp-1 text-xs uppercase tracking-wider">{movie.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1">{movie.year} • {movie.category?.[0]?.name}</p>
                                    </div>
                                    <button
                                        onClick={() => addMovie(movie)}
                                        className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600 hover:text-white"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            ))
                        ) : searchQuery.length >= 2 ? (
                            <div className="flex flex-col items-center justify-center h-80 text-slate-400 gap-3">
                                <Film size={40} strokeWidth={1} />
                                <p className="text-xs font-black uppercase tracking-widest text-center px-8">Không tìm thấy phim nào khớp với tên bạn nhập</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-80 text-slate-300 gap-3">
                                <Search size={40} strokeWidth={1} />
                                <p className="text-xs font-black uppercase tracking-widest">Bắt đầu tìm kiếm phim</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected Movies List */}
                <div className="bg-indigo-600/5 rounded-[2.5rem] border-2 border-dashed border-indigo-100 p-6">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600/50">Danh sách hiển thị ({selectedMovies.length})</span>
                        <Film size={16} className="text-indigo-600/20" />
                    </div>

                    <div className="space-y-3">
                        {selectedMovies.length > 0 ? (
                            selectedMovies.map((movie, index) => (
                                <div key={movie.slug} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-indigo-50 animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => moveMovie(index, -1)}
                                            className="p-1 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-300 transition-colors"
                                            disabled={index === 0}
                                        >
                                            <GripVertical size={14} className="rotate-90" />
                                        </button>
                                        <button
                                            onClick={() => moveMovie(index, 1)}
                                            className="p-1 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-300 transition-colors"
                                            disabled={index === selectedMovies.length - 1}
                                        >
                                            <GripVertical size={14} className="rotate-90" />
                                        </button>
                                    </div>
                                    <img
                                        src={movie.thumb_url?.startsWith('http') ? movie.thumb_url : `https://img.ophim.live/uploads/movies/${movie.thumb_url || ''}`}
                                        className="w-10 h-14 rounded-lg object-cover"
                                        alt=""
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 line-clamp-1 text-xs uppercase tracking-wider">{movie.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1">Vị trí #{index + 1}</p>
                                    </div>
                                    <button
                                        onClick={() => removeMovie(movie.slug)}
                                        className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-80 text-indigo-600/20 gap-3 border-2 border-dashed border-indigo-100 rounded-[2rem]">
                                <Plus size={40} strokeWidth={1} />
                                <p className="text-xs font-black uppercase tracking-widest">Chưa có phim nào được chọn</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieCollectionSetting;

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, PlayCircle, LogOut, ChevronDown, Shield, Menu, X, Search, Heart, Plus, Share2 } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import { useState, useEffect } from 'react';
import NavbarSearch from './NavbarSearch';
import { movieService } from '@/features/movies/services/movieService';

export default function Navbar() {
    const { isAuthenticated, user, logout, isAdmin } = useAuthStore();
    const [showDropdown, setShowDropdown] = useState(false);
    const [categories, setCategories] = useState([]);
    const [countries, setCountries] = useState([]);
    const [showGenreMenu, setShowGenreMenu] = useState(false);
    const [showCountryMenu, setShowCountryMenu] = useState(false);
    const [showListMenu, setShowListMenu] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedSection, setExpandedSection] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const handleTopTrendingClick = (e) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        if (location.pathname === '/') {
            const el = document.getElementById('top-movies');
            if (el) {
                const headerOffset = 100; // Adjust for navbar height
                const elementPosition = el.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        } else {
            navigate('/?scrollTo=top-movies');
        }
    };
    const LIST_TYPES = [
        { name: 'Phim Mới', slug: 'phim-moi' },
        { name: 'Phim Bộ', slug: 'phim-bo' },
        { name: 'Phim Lẻ', slug: 'phim-le' },
        { name: 'Shows', slug: 'tv-shows' },
        { name: 'Hoạt Hình', slug: 'hoat-hinh' },
        { name: 'Phim Vietsub', slug: 'phim-vietsub' },
        { name: 'Phim Thuyết Minh', slug: 'phim-thuyet-minh' },
        { name: 'Phim Lồng Tiếng', slug: 'phim-long-tieng' },
        { name: 'Phim Bộ Đang Chiếu', slug: 'phim-bo-dang-chieu' },
        { name: 'Phim Bộ Đã Hoàn Thành', slug: 'phim-bo-hoan-thanh' },
        { name: 'Phim Sắp Chiếu', slug: 'phim-sap-chieu' },
        { name: 'Phim Chiếu Rạp', slug: 'phim-chieu-rap' }
    ];

    useEffect(() => {
        const fetchFilters = async () => {
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
                console.error("Lỗi khi tải dữ liệu filter:", error);
            }
        };
        fetchFilters();
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isMobileMenuOpen]);

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-4 md:px-6 lg:px-10 2xl:px-16 py-3 transition-all duration-300">
            <div className="relative z-[60] max-w-[2560px] mx-auto bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 rounded-full px-4 md:px-5 py-2 flex items-center justify-between gap-1 shadow-2xl shadow-black/60">

                {/* Left: Mobile Menu Toggle (Visible only on mobile) */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="2xl:hidden text-white p-2 hover:bg-white/10 rounded-full transition-colors z-[60]"
                >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-2 group w-auto shrink-0">
                    <div className="bg-primary-yellow text-black p-1.5 rounded-full group-hover:scale-110 transition-transform shrink-0 flex items-center justify-center">
                        <PlayCircle size={22} strokeWidth={2.5} />
                    </div>
                    <span className="font-heading font-bold text-xl md:text-2xl tracking-tighter text-white whitespace-nowrap">
                        Cine<span className="text-white/40 font-light">Stream</span>
                    </span>
                </Link>

                {/* Center Links (Hidden on small/medium screens, logic updated for 1280px) */}
                <div className="hidden 2xl:flex items-center gap-1 xl:gap-2 2xl:gap-6 font-medium text-[clamp(0.875rem,0.9vw,0.95rem)] text-gray-300 whitespace-nowrap shrink-0">
                    <Link to="/" tabIndex={0} className="px-2 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors">Trang chủ</Link>
                    <div
                        className="relative"
                        onMouseEnter={() => setShowGenreMenu(true)}
                        onMouseLeave={() => setShowGenreMenu(false)}
                    >
                        <button tabIndex={0} className={`min-h-[44px] hover:text-white transition-colors flex items-center gap-1 cursor-pointer px-3 py-2 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-inset ${showGenreMenu ? 'text-white' : ''}`}>
                            Thể loại <ChevronDown size={14} className={`transition-transform duration-300 ${showGenreMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Genre Dropdown */}
                        {showGenreMenu && categories.length > 0 && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[540px] z-50">
                                <div className="bg-[#0f1015]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 grid grid-cols-3 gap-1">
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat.slug}
                                            to={`/search?genre=${cat.slug}`}
                                            className="px-3 py-2 rounded-xl text-[13px] text-gray-400 hover:text-primary-yellow hover:bg-white/5 transition-all"
                                            onClick={() => setShowGenreMenu(false)}
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        className="relative"
                        onMouseEnter={() => setShowCountryMenu(true)}
                        onMouseLeave={() => setShowCountryMenu(false)}
                    >
                        <button tabIndex={0} className={`min-h-[44px] hover:text-white transition-colors flex items-center gap-1 cursor-pointer px-3 py-2 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-inset ${showCountryMenu ? 'text-white' : ''}`}>
                            Quốc gia <ChevronDown size={14} className={`transition-transform duration-300 ${showCountryMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Country Dropdown */}
                        {showCountryMenu && countries.length > 0 && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[540px] z-50">
                                <div className="bg-[#0f1015]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 grid grid-cols-3 gap-1">
                                    {countries.map((country) => (
                                        <Link
                                            key={country.slug}
                                            to={`/search?country=${country.slug}`}
                                            className="px-3 py-2 rounded-xl text-[13px] text-gray-400 hover:text-primary-yellow hover:bg-white/5 transition-all"
                                            onClick={() => setShowCountryMenu(false)}
                                        >
                                            {country.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        className="relative"
                        onMouseEnter={() => setShowListMenu(true)}
                        onMouseLeave={() => setShowListMenu(false)}
                    >
                        <button tabIndex={0} className={`min-h-[44px] hover:text-white transition-colors flex items-center gap-1 cursor-pointer px-3 py-2 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-inset ${showListMenu ? 'text-white' : ''}`}>
                            Danh sách <ChevronDown size={14} className={`transition-transform duration-300 ${showListMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Types List Dropdown */}
                        {showListMenu && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[600px] z-50">
                                <div className="bg-[#0f1015]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-5 grid grid-cols-3 gap-y-3 gap-x-1">
                                    {LIST_TYPES.map((type) => (
                                        <Link
                                            key={type.slug}
                                            to={`/search?type=${type.slug}`}
                                            className="px-3 py-1.5 rounded-xl text-[14px] text-gray-300 hover:text-primary-yellow hover:bg-white/5 transition-all font-medium"
                                            onClick={() => setShowListMenu(false)}
                                        >
                                            {type.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <a href="/#top-movies" onClick={handleTopTrendingClick} tabIndex={0} className="min-h-[44px] hover:text-white transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-inset cursor-pointer group">
                        Top Thịnh Hành
                        <span className="bg-primary-yellow text-black text-[10px] font-bold px-1.5 py-0.5 rounded uppercase group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(234,179,8,0.3)]">Hot</span>
                    </a>
                </div>

                <div className="flex items-center justify-end gap-2 xl:gap-4 shrink-0 min-w-0">
                    <NavbarSearch />

                    {/* Desktop Profile Section (Only visible on very large screens) */}
                    <div className="transition-colors hidden xl:flex items-center gap-2 xl:gap-5">


                        <div className="hidden xl:flex items-center">
                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary-yellow relative group"
                                        title={user?.displayName}
                                    >
                                        <div className="w-7 h-7 rounded-full bg-primary-yellow/20 flex items-center justify-center overflow-hidden border border-white/10 transition-transform group-hover:scale-105">
                                            {user?.avatarUrl ? (
                                                <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-primary-yellow text-[10px] font-bold">
                                                    {user?.displayName?.charAt(0).toUpperCase() || <User size={12} />}
                                                </span>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-[#1a1c22] rounded-full p-0.5 border border-white/10 text-white/60">
                                            <ChevronDown size={8} strokeWidth={3} />
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showDropdown && (
                                        <div className="absolute right-0 mt-2 w-48 bg-[#0f1015]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl py-2 z-50">
                                            <div className="px-4 py-2 border-b border-white/5 mb-2">
                                                <p className="text-sm text-white font-medium truncate">{user?.displayName}</p>
                                                <p className="text-xs text-white/50 truncate">{user?.email}</p>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                                            >
                                                <LogOut size={16} />
                                                Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link to="/login" className="h-10 bg-primary-yellow text-black px-4 rounded-full text-xs font-bold hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.2)] flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white">
                                    <User size={14} />
                                    <span>Thành viên</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Mobile Menu Dropdown Panel */}
            {
                isMobileMenuOpen && (
                    <>
                        {/* Background Overlay (Dim) */}
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] 2xl:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Dropdown Panel - Tighter Positioning */}
                        <div className="absolute top-[calc(100%-8px)] left-0 right-0 z-[50] 2xl:hidden animate-in slide-in-from-top-4 duration-300">
                            <div className="mx-4 bg-[#0a0a0c]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto no-scrollbar py-6">

                                    {/* Redesigned Profile Section - Matches Navbar Style */}
                                    <div className="px-5 mb-6">
                                        {isAuthenticated ? (
                                            <div className="flex items-center justify-between bg-white/10 border border-white/5 p-3 rounded-full">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary-yellow/20 flex items-center justify-center overflow-hidden border border-white/5">
                                                        {user?.avatarUrl ? (
                                                            <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User size={18} className="text-primary-yellow" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white leading-tight">{user?.displayName}</span>
                                                        <span className="text-[10px] text-white/30 truncate max-w-[150px]">{user?.email}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="min-w-[44px] min-h-[44px] rounded-full hover:bg-white/5 flex items-center justify-center text-red-400 transition-colors"
                                                >
                                                    <LogOut size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <Link
                                                to="/login"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center justify-between bg-primary-yellow p-3 rounded-full group"
                                            >
                                                <div className="flex items-center gap-3 text-black">
                                                    <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
                                                        <User size={20} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black uppercase tracking-tight">Thành viên</span>
                                                        <span className="text-[10px] font-bold opacity-60">Đăng nhập ngay</span>
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-black/40">
                                                    <ChevronDown size={16} className="-rotate-90" />
                                                </div>
                                            </Link>
                                        )}
                                    </div>

                                    {/* Navigation List - Clean & Expandable */}
                                    <div className="px-5 space-y-1">
                                        {[
                                            { name: 'Trang Chủ', slug: '/', type: 'link' },
                                            { name: 'Thể Loại', type: 'dropdown', items: categories.map(c => ({ name: c.name, slug: `/search?genre=${c.slug}` })) },
                                            { name: 'Quốc Gia', type: 'dropdown', items: countries.map(c => ({ name: c.name, slug: `/search?country=${c.slug}` })) },
                                            { name: 'Danh Mục', type: 'dropdown', items: LIST_TYPES.map(t => ({ name: t.name, slug: `/search?type=${t.slug}` })) },
                                            { name: 'Top Thịnh Hành', slug: '/#top-movies', type: 'link', badge: 'HOT', onClick: handleTopTrendingClick },
                                        ].map((item, idx) => {
                                            const isExpanded = expandedSection === item.name;

                                            if (item.type === 'dropdown') {
                                                return (
                                                    <div key={idx} className="flex flex-col">
                                                        <button
                                                            onClick={() => setExpandedSection(isExpanded ? null : item.name)}
                                                            className={`min-h-[44px] w-full p-4 flex items-center justify-between rounded-2xl transition-all ${isExpanded ? 'bg-white/[0.05] text-primary-yellow' : 'text-white/70 hover:bg-white/[0.02]'}`}
                                                        >
                                                            <span className="text-sm font-bold uppercase tracking-tight">{item.name}</span>
                                                            <ChevronDown size={18} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-primary-yellow' : 'text-white/20'}`} />
                                                        </button>

                                                        {/* Dropdown Items */}
                                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[400px] opacity-100 py-2' : 'max-h-0 opacity-0'}`}>
                                                            <div className="grid grid-cols-2 gap-2 px-2">
                                                                {item.items.slice(0, 10).map((subItem, sIdx) => (
                                                                    <Link
                                                                        key={sIdx}
                                                                        to={subItem.slug}
                                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                                        className="p-3 rounded-xl bg-white/[0.03] text-[11px] font-bold text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
                                                                    >
                                                                        {subItem.name}
                                                                    </Link>
                                                                ))}
                                                                <Link
                                                                    to="/explore"
                                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                                    className="p-3 rounded-xl bg-primary-yellow/10 text-[11px] font-bold text-primary-yellow text-center col-span-2"
                                                                >
                                                                    Xem tất cả
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <a
                                                    href={item.slug}
                                                    key={idx}
                                                    className="min-h-[44px] w-full p-4 flex items-center justify-between rounded-2xl text-white/70 hover:bg-white/[0.02] hover:text-white transition-all group"
                                                    onClick={(e) => {
                                                        if (item.onClick) {
                                                            item.onClick(e);
                                                        } else {
                                                            e.preventDefault();
                                                            setIsMobileMenuOpen(false);
                                                            navigate(item.slug);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold uppercase tracking-tight">{item.name}</span>
                                                        {item.badge && (
                                                            <span className="bg-primary-yellow text-black text-[8px] font-black px-1.5 py-0.5 rounded-sm shadow-[0_0_8px_rgba(234,179,8,0.4)] group-hover:scale-105 transition-transform">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>

                                </div>
                            </div>
                        </div>
                    </>
                )
            }
        </nav >
    );
}

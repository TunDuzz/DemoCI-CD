import { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MovieCard from './MovieCard';

export default function MovieSlider({ title, movies = [], isLoading = false, noOverlap = false }) {
    const sliderRef = useRef(null);

    const scroll = (direction) => {
        if (sliderRef.current) {
            const { scrollLeft, clientWidth } = sliderRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 100 : scrollLeft + clientWidth - 100;
            sliderRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (isLoading) {
        return (
            <div className="w-full mb-10 flex flex-col xl:flex-row gap-6">
                <div className="xl:w-1/5 shrink-0 pl-6 xl:pl-8">
                    <div className="h-8 w-3/4 bg-white/5 rounded-md animate-pulse mb-4"></div>
                    <div className="h-4 w-1/2 bg-white/5 rounded-md animate-pulse"></div>
                </div>
                <div className="xl:w-4/5 flex gap-4 overflow-hidden px-6 xl:px-0">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="w-[140px] md:w-[180px] aspect-[2/3] bg-white/5 rounded-2xl animate-pulse shrink-0 border border-white/5"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!movies || movies.length === 0) return null;

    // Splitting title to create a distinct typographic look (e.g., "Phim Mới" / "Cập Nhật")
    const titleParts = title.split(' ');
    const firstPart = titleParts.slice(0, Math.ceil(titleParts.length / 2)).join(' ');
    const secondPart = titleParts.slice(Math.ceil(titleParts.length / 2)).join(' ');

    return (
        <div className="w-full relative flex flex-col xl:flex-row items-center xl:items-stretch gap-6 group/slider py-4">

            {/* Left Sidebar: Title & Call to Action */}
            <div className="w-full xl:w-1/5 shrink-0 flex flex-col justify-center px-6 xl:pl-10 xl:pr-4 border-b xl:border-b-0 xl:border-r border-white/5 pb-4 xl:pb-0 z-10 relative">

                {/* Decorative glowing accent */}
                <div className="absolute top-1/2 -left-10 w-24 h-24 bg-primary-yellow/20 rounded-full blur-[40px] -translate-y-1/2 pointer-events-none"></div>

                <h2 className="font-heading text-2xl md:text-3xl xl:text-4xl font-bold text-white tracking-tight leading-tight flex xl:flex-col gap-2 xl:gap-0">
                    <span className="text-gray-200 drop-shadow-md">{firstPart}</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-yellow to-orange-400 drop-shadow-lg filter">
                        {secondPart}
                    </span>
                </h2>

                <Link to="/explore" className="mt-4 xl:mt-8 flex items-center gap-2 text-sm md:text-base font-medium text-gray-400 hover:text-primary-yellow transition-colors w-fit group/btn">
                    Xem toàn bộ
                    <ArrowRight size={16} className="transform group-hover/btn:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Right Area: Scrolling Slider */}
            <div className="w-full xl:w-4/5 relative">
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-50 w-12 h-24 flex items-center justify-center bg-gradient-to-r from-[#141414] to-transparent text-white opacity-0 group-hover/slider:opacity-100 transition-all duration-300 hover:text-primary-yellow disabled:opacity-0"
                >
                    <ChevronLeft size={32} className="drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] filter hover:scale-110 transition-transform" />
                </button>

                <div
                    ref={sliderRef}
                    className="flex items-center gap-4 overflow-x-auto scrollbar-hide px-6 xl:px-0 pb-10 pt-10 snap-x snap-mandatory scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {movies.map((movie, index) => (
                        <div key={movie._id || movie.slug} className={`w-[140px] md:w-[180px] snap-start shrink-0 ${!noOverlap ? `${index === 0 ? '' : '-ml-10 md:-ml-16'} ${index % 2 === 0 ? 'translate-y-2 md:translate-y-4' : '-translate-y-2 md:-translate-y-4'}` : ''}`}>
                            <MovieCard movie={movie} />
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-50 w-12 h-24 flex items-center justify-center bg-gradient-to-l from-[#141414] to-transparent text-white opacity-0 group-hover/slider:opacity-100 transition-all duration-300 hover:text-primary-yellow disabled:opacity-0"
                >
                    <ChevronRight size={32} className="drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] filter hover:scale-110 transition-transform" />
                </button>
            </div>

        </div>
    );
}

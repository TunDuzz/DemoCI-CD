import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import HoverDetailPortal from './HoverDetailPortal';

let isGlobalScrolling = false;
let globalScrollTimeout = null;

if (typeof window !== 'undefined') {
    const handleGlobalScroll = () => {
        isGlobalScrolling = true;
        clearTimeout(globalScrollTimeout);
        globalScrollTimeout = setTimeout(() => {
            isGlobalScrolling = false;
        }, 150);
    };

    // Attach to the capturing phase so it catches all scrolls universally
    window.addEventListener('scroll', handleGlobalScroll, { passive: true, capture: true });
    window.addEventListener('wheel', handleGlobalScroll, { passive: true, capture: true });
    window.addEventListener('touchmove', handleGlobalScroll, { passive: true, capture: true });
}

export default function MovieCard({ movie }) {
    const title = movie.name || "Untitled";
    const rawPoster = movie.thumb_url || movie.poster_url;
    const poster = rawPoster?.startsWith('http') ? rawPoster : `https://img.ophim.live/uploads/movies/${rawPoster}`;
    const year = movie.year || new Date().getFullYear();

    const cardRef = useRef(null);
    const hoverTimeoutRef = useRef(null);
    const leaveTimeoutRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [triggerRect, setTriggerRect] = useState(null);

    const handleMouseEnter = () => {
        if (isGlobalScrolling) return; // Prevent artificial hover triggers during scroll

        clearTimeout(leaveTimeoutRef.current);
        if (isHovered) return;

        hoverTimeoutRef.current = setTimeout(() => {
            if (cardRef.current && !isGlobalScrolling) { // Double check
                setTriggerRect(cardRef.current.getBoundingClientRect());
                setIsHovered(true);
            }
        }, 150);
    };

    const handleMouseLeave = () => {
        clearTimeout(hoverTimeoutRef.current);
        leaveTimeoutRef.current = setTimeout(() => {
            setIsHovered(false);
        }, 150);
    };

    const handlePortalMouseEnter = () => {
        clearTimeout(leaveTimeoutRef.current);
    };

    const handlePortalMouseLeave = () => {
        handleMouseLeave();
    };

    // Close the portal if the user scrolls the page or the slider
    useEffect(() => {
        if (!isHovered) return;

        const handleScroll = () => {
            setIsHovered(false);
            clearTimeout(hoverTimeoutRef.current);
            clearTimeout(leaveTimeoutRef.current);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('wheel', handleScroll, { passive: true });
        // Touch events for mobile scrolling
        window.addEventListener('touchmove', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('wheel', handleScroll);
            window.removeEventListener('touchmove', handleScroll);
        };
    }, [isHovered]);

    return (
        <>
            <Link
                to={`/watch/${movie.slug}`}
                ref={cardRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                data-hovered={isHovered}
                tabIndex={0}
                className="group relative flex-shrink-0 cursor-pointer block w-full aspect-[2/3] focus:outline-none focus:ring-4 focus:ring-primary-yellow focus:scale-105 rounded-2xl transition-all"
            >
                {/* Main Flat Container */}
                <div className={`w-full h-full relative transition-all duration-300 rounded-2xl border ${isHovered ? 'border-primary-yellow/60 shadow-[0_0_25px_rgba(252,213,63,0.4)] scale-[1.02] z-40' : 'border-white/5 group-hover:-translate-y-2 group-hover:shadow-[0_15px_30px_rgba(252,213,63,0.15)]'} overflow-hidden bg-[#1a1a1a]`}>

                    {/* Poster Image */}
                    <img
                        src={poster}
                        alt={title}
                        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'group-hover:scale-110'}`}
                        loading="lazy"
                        onError={(e) => {
                            if (e.target.src !== 'https://via.placeholder.com/400x600/1a1a1a/444444?text=No+Image') {
                                e.target.src = 'https://via.placeholder.com/400x600/1a1a1a/444444?text=No+Image';
                            }
                        }}
                    />

                    {/* Subtle Neon Glow effect on hover */}
                    <div className={`absolute inset-0 rounded-2xl border-2 transition-colors duration-300 pointer-events-none z-30 ${isHovered ? 'border-primary-yellow/40' : 'border-transparent group-hover:border-primary-yellow/40'}`}></div>

                    {/* Gradient to make text readable */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity z-10 ${isHovered ? 'opacity-100' : 'opacity-90 group-hover:opacity-100'}`}></div>

                    {/* Movie Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 z-20 flex flex-col gap-1 transform transition-transform duration-300">
                        <h3 className={`font-medium text-[11px] md:text-sm leading-tight line-clamp-2 transition-colors drop-shadow-md ${isHovered ? 'text-primary-yellow' : 'text-white group-hover:text-primary-yellow'}`}>
                            {title}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-gray-400 text-[10px] md:text-[11px] truncate w-[70%]">
                                {movie.origin_name}
                            </span>
                            <span className="text-primary-yellow font-bold text-[9px] md:text-[10px] bg-primary-yellow/10 rounded-sm px-1.5 py-0.5 border border-primary-yellow/20">
                                {year}
                            </span>
                        </div>
                    </div>

                    {/* Play Button Overlay (Minimal) */}
                    <div className={`absolute inset-0 bg-black/30 transition-opacity flex items-center justify-center backdrop-blur-[2px] z-20 ${isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <div className={`w-12 h-12 rounded-full bg-primary-yellow text-black flex items-center justify-center transform transition-transform duration-300 ease-out shadow-[0_0_20px_rgba(252,213,63,0.6)] ${isHovered ? 'scale-100' : 'scale-50 group-hover:scale-100'}`}>
                            <Play fill="currentColor" size={20} className="ml-1" />
                        </div>
                    </div>
                </div>
            </Link>

            <HoverDetailPortal
                movie={movie}
                triggerRect={triggerRect}
                isVisible={isHovered}
                onMouseEnter={handlePortalMouseEnter}
                onMouseLeave={handlePortalMouseLeave}
            />
        </>
    );
}

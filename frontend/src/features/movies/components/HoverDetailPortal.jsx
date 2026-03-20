import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Play, Info, Heart, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HoverDetailPortal({ movie, triggerRect, isVisible, onMouseEnter, onMouseLeave }) {
    const [mountNode, setMountNode] = useState(null);
    const [position, setPosition] = useState({});

    useEffect(() => {
        setMountNode(document.body);
    }, []);

    useEffect(() => {
        if (!triggerRect || !isVisible) return;

        // Expanded card dimensions
        const EXPANDED_WIDTH = 340;

        const { top, left, width, height } = triggerRect;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Center horizontally over the original card
        let finalLeft = left - (EXPANDED_WIDTH - width) / 2;

        // Keep within viewport bounds horizontally
        if (finalLeft < 20) finalLeft = 20;
        if (finalLeft + EXPANDED_WIDTH > windowWidth - 20) finalLeft = windowWidth - EXPANDED_WIDTH - 20;

        // Align vertically. Make it absolute relative to the document.
        let finalTop = top + window.scrollY - 30; // Closer to top

        setPosition({ left: finalLeft, top: finalTop });
    }, [triggerRect, isVisible]);

    if (!mountNode || !isVisible || !triggerRect) return null;

    const rating = movie.tmdb?.vote_average || (Math.random() * (9.5 - 6.5) + 6.5).toFixed(1);
    const poster = movie.thumb_url?.startsWith('http') ? movie.thumb_url : `https://img.ophim.live/uploads/movies/${movie.thumb_url}`;
    const backdrop = movie.poster_url?.startsWith('http') ? movie.poster_url : `https://img.ophim.live/uploads/movies/${movie.poster_url}`;

    return createPortal(
        <div
            className="absolute z-[99999] animate-in zoom-in-95 duration-300 ease-out shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/10 ring-1 ring-white/5"
            style={{
                left: position.left,
                top: position.top,
                width: 340,
                transformOrigin: 'center center'
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Top Half: Image Backdrop & Title Area */}
            <div className="w-full h-[180px] relative bg-black group-hover:opacity-100">
                <img
                    src={backdrop || poster}
                    alt={movie.name}
                    className="w-full h-full object-cover opacity-80 mix-blend-lighten"
                />

                {/* Smooth Gradient completely blending into the bg-[#0a0a0a] below */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent"></div>

                {/* Title floating over the gradient edge */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pt-10 pb-1">
                    <h3 className="text-white font-heading font-extrabold text-2xl leading-tight truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {movie.name}
                    </h3>
                    <p className="text-white/70 text-[13px] mt-1.5 line-clamp-1 drop-shadow-md font-medium tracking-wide">
                        {movie.origin_name || movie.name}
                    </p>
                </div>
            </div>

            {/* Bottom Half: Interactive Details */}
            <div className="px-5 pb-5 pt-4 flex flex-col gap-4">

                {/* Action Buttons Row */}
                <div className="flex items-center gap-2.5">
                    <Link
                        to={`/watch/${movie.slug}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary-yellow hover:bg-yellow-400 text-black font-bold py-2.5 px-4 rounded-full text-[15px] transition-all transform hover:scale-[1.03] active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.25)]"
                    >
                        <Play fill="currentColor" size={18} /> <span className="mt-[2px]">Xem ngay</span>
                    </Link>

                    <button
                        className="flex items-center justify-center w-11 h-11 border-2 border-white/20 hover:border-white/50 hover:bg-white/10 text-white rounded-full transition-all group"
                        title="Yêu thích"
                    >
                        <Heart size={18} className="group-hover:scale-110 transition-transform" />
                    </button>

                    <Link
                        to={`/watch/${movie.slug}`}
                        className="flex items-center justify-center w-11 h-11 border-2 border-white/20 hover:border-white/50 hover:bg-white/10 text-white rounded-full transition-all group"
                        title="Chi tiết phim"
                    >
                        <Info size={18} className="group-hover:scale-110 transition-transform" />
                    </Link>
                </div>

                {/* Info / Metadata Row */}
                <div className="flex items-center gap-3 text-[13px] font-semibold text-gray-300">
                    <span className="flex items-center text-[#111] bg-primary-yellow px-1.5 py-0.5 rounded gap-1 text-[11px] uppercase shadow-sm">
                        IMDb <span className="font-black text-black text-xs">{rating}</span>
                    </span>
                    <span className="text-gray-500 text-[10px]">•</span>
                    <span>{movie.year || new Date().getFullYear()}</span>
                    <span className="text-gray-500 text-[10px]">•</span>
                    <span>{movie.time || movie.episode_current || "Đang cập nhật"}</span>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {(movie.category || [{ name: "Hành động" }, { name: "Phiêu lưu" }]).slice(0, 3).map((c, i) => (
                        <span key={i} className="text-[12px] font-medium text-white/80 bg-white/10 hover:bg-white/15 cursor-default transition-colors px-3 py-1 rounded-full border border-white/5">
                            {c.name}
                        </span>
                    ))}
                    {(movie.category && movie.category.length > 3) && (
                        <span className="text-[12px] font-medium text-white/50 ml-1 tracking-wider">...</span>
                    )}
                </div>
            </div>
        </div>,
        mountNode
    );
}

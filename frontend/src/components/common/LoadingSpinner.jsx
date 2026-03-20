import React from 'react';
import { PlayCircle } from 'lucide-react';

const LoadingSpinner = () => {
    return (
        <div className="w-full flex-1 min-h-[70vh] flex flex-col items-center justify-center animate-in fade-in duration-500">
            {/* Inline Style for complex glow animation */}
            <style>
                {`
                    @keyframes rotate-glow {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .pill-glow-border {
                        position: relative;
                        padding: 3px;
                        border-radius: 9999px;
                        background: rgba(255, 255, 255, 0.05);
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .pill-glow-border::before {
                        content: '';
                        position: absolute;
                        width: 150%;
                        height: 300%;
                        background: conic-gradient(
                            transparent, 
                            transparent, 
                            transparent, 
                            #fcd53f
                        );
                        animation: rotate-glow 2s linear infinite;
                    }
                    .pill-glow-inner {
                        position: relative;
                        background: #09090b;
                        border-radius: 9999px;
                        padding: 12px 28px;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        z-index: 10;
                        white-space: nowrap;
                    }
                    .pill-glow-blur {
                        position: absolute;
                        inset: -5px;
                        background: inherit;
                        border-radius: inherit;
                        filter: blur(8px);
                        opacity: 0.5;
                        z-index: -1;
                        background: conic-gradient(
                            transparent, 
                            transparent, 
                            transparent, 
                            #fcd53f
                        );
                        animation: rotate-glow 2s linear infinite;
                    }
                `}
            </style>

            <div className="relative flex flex-col items-center">
                {/* Background Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-yellow/5 rounded-full blur-[100px] animate-pulse"></div>

                {/* Glowing Pill Container */}
                <div className="pill-glow-border shadow-2xl">
                    <div className="pill-glow-blur"></div>
                    <div className="pill-glow-inner">
                        <div className="bg-primary-yellow text-black p-1 rounded-full flex items-center justify-center">
                            <PlayCircle size={22} strokeWidth={2.5} />
                        </div>

                        <div className="flex items-center tracking-tighter">
                            <span className="font-heading font-bold text-2xl text-white">
                                Cine
                            </span>
                            <span className="font-heading font-light text-2xl text-white/40">
                                Stream
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;

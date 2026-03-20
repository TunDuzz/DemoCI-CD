import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-quality-levels';
import axiosClient from '../../../utils/axiosClient';
import useAuthStore from '../../../store/useAuthStore';
import {
    Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX,
    Settings, Maximize, Check, SkipForward, SkipBack,
    PictureInPicture2, Gauge
} from 'lucide-react';

const VideoPlayer = ({ videoUrl, movieId, movieName, movieSlug, movieThumbUrl, episode, initialTime = 0, autoPlay = true, onNext, onPrev }) => {
    const videoRef = useRef(null);
    const playerContainerRef = useRef(null);
    const playerRef = useRef(null);
    const saveProgressInterval = useRef(null);
    const controlsTimeoutRef = useRef(null);
    const settingsRef = useRef(null);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    // State for custom controls
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [bufferedTime, setBufferedTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [settingsView, setSettingsView] = useState('main'); // 'main', 'quality', 'speed'
    const [qualityLevels, setQualityLevels] = useState([]);
    const [currentQuality, setCurrentQuality] = useState('Auto');
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if clicking outside menu AND not clicking the settings toggle button
            const settingsButton = event.target.closest('button');
            const isSettingsButton = settingsButton && settingsButton.querySelector('.lucide-settings');

            if (settingsRef.current &&
                !settingsRef.current.contains(event.target) &&
                !isSettingsButton) {
                setShowSettings(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't trigger if typing in an input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (!playerRef.current) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'arrowright':
                case 'l':
                    e.preventDefault();
                    skip(10);
                    break;
                case 'arrowleft':
                case 'j':
                    e.preventDefault();
                    skip(-10);
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'arrowup':
                    e.preventDefault();
                    const newVolUp = Math.min(1, playerRef.current.volume() + 0.1);
                    playerRef.current.volume(newVolUp);
                    setVolume(newVolUp);
                    setIsMuted(newVolUp === 0);
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    const newVolDown = Math.max(0, playerRef.current.volume() - 0.1);
                    playerRef.current.volume(newVolDown);
                    setVolume(newVolDown);
                    setIsMuted(newVolDown === 0);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, duration]); // Depend on relevant state if needed, though playerRef.current is usually stable

    const saveWatchHistory = async (time, isCompleted = false) => {
        if (!isAuthenticated || time < 5) return;
        try {
            await axiosClient.post('/watch-history', {
                movieId,
                movieName,
                movieSlug,
                movieThumbUrl,
                episode: episode.toString().replace(/\.$/, ''),
                watchedTimeInSeconds: Math.floor(time),
                isCompleted
            });
        } catch (error) {
            console.error("Failed to save watch history", error);
        }
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "00:00";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) {
            return `${h}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
        }
        return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    useEffect(() => {
        if (!playerRef.current && videoRef.current) {
            const videoElement = document.createElement("video-js");
            videoElement.classList.add('vjs-big-play-centered');
            videoRef.current.appendChild(videoElement);

            const player = playerRef.current = videojs(videoElement, {
                autoplay: autoPlay,
                controls: false,
                responsive: true,
                fill: true,
                userActions: {
                    doubleClick: false
                },
                sources: [{
                    src: videoUrl,
                    type: 'application/x-mpegURL'
                }]
            }, () => {
                if (initialTime > 0) {
                    player.currentTime(initialTime);
                }

                const qualityLevels = player.qualityLevels();
                qualityLevels.on('addqualitylevel', () => {
                    const levels = [];
                    for (let i = 0; i < qualityLevels.length; i++) {
                        levels.push(qualityLevels[i]);
                    }
                    setQualityLevels(levels);
                });
            });

            player.on('play', () => {
                setIsPlaying(true);
                clearInterval(saveProgressInterval.current);
                saveProgressInterval.current = setInterval(() => {
                    saveWatchHistory(player.currentTime());
                }, 30000);
            });

            player.on('pause', () => {
                setIsPlaying(false);
                clearInterval(saveProgressInterval.current);
                saveWatchHistory(player.currentTime());
            });

            player.on('timeupdate', () => setCurrentTime(player.currentTime()));
            player.on('progress', () => {
                if (player.buffered().length > 0) {
                    setBufferedTime(player.buffered().end(player.buffered().length - 1));
                }
            });
            player.on('loadedmetadata', () => setDuration(player.duration()));
            player.on('volumechange', () => {
                setVolume(player.volume());
                setIsMuted(player.muted());
            });

            player.on('fullscreenchange', () => {
                // Keep keeping track via player event too but handle manually for custom UI
                setIsFullscreen(player.isFullscreen());
            });

            player.on('ended', () => {
                setIsPlaying(false);
                clearInterval(saveProgressInterval.current);
                saveWatchHistory(player.currentTime(), true);
                if (onNext) {
                    setTimeout(onNext, 1000); // Small delay for smoothness
                }
            });
        }

        return () => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                clearInterval(saveProgressInterval.current);
                saveWatchHistory(playerRef.current.currentTime());
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, [videoUrl, movieId, movieName, movieSlug, movieThumbUrl, episode, initialTime]);

    const togglePlay = () => {
        if (playerRef.current.paused()) {
            playerRef.current.play();
        } else {
            playerRef.current.pause();
        }
    };

    const skip = (seconds) => {
        const newTime = playerRef.current.currentTime() + seconds;
        playerRef.current.currentTime(Math.max(0, Math.min(newTime, duration)));
    };

    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        playerRef.current.volume(val);
        playerRef.current.muted(val === 0);
    };

    const toggleMute = () => {
        playerRef.current.muted(!playerRef.current.muted());
    };

    const handleSeek = (e) => {
        const val = parseFloat(e.target.value);
        playerRef.current.currentTime(val);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            if (playerContainerRef.current.requestFullscreen) {
                playerContainerRef.current.requestFullscreen();
            } else if (playerContainerRef.current.webkitRequestFullscreen) { /* Safari */
                playerContainerRef.current.webkitRequestFullscreen();
            } else if (playerContainerRef.current.msRequestFullscreen) { /* IE11 */
                playerContainerRef.current.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        }
    };

    const togglePiP = async () => {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else if (playerRef.current) {
            const video = playerRef.current.tech().el();
            if (video) await video.requestPictureInPicture();
        }
    };

    const changeQuality = (index) => {
        const levels = playerRef.current.qualityLevels();
        for (let i = 0; i < levels.length; i++) {
            levels[i].enabled = (i === index || index === -1);
        }
        setCurrentQuality(index === -1 ? 'Auto' : `${levels[index].height}p`);
        setSettingsView('main');
    };

    const changeSpeed = (speed) => {
        playerRef.current.playbackRate(speed);
        setPlaybackSpeed(speed);
        setSettingsView('main');
    };

    const handleMouseMove = () => {
        setShowControls(true);
        clearTimeout(controlsTimeoutRef.current);
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                if (!showSettings) setShowControls(false);
            }, 3000);
        }
    };

    return (
        <div
            ref={playerContainerRef}
            className="relative w-full h-full group bg-black rounded-none overflow-hidden flex items-center justify-center select-none"
            onMouseMove={handleMouseMove}
            onClick={(e) => {
                // Prevent play/pause toggle when clicking on controls or settings
                if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.rounded-xl')) return;
                togglePlay();
            }}
            style={{ cursor: showControls ? 'default' : 'none' }}
        >
            <div data-vjs-player className="absolute inset-0 w-full h-full">
                <style>{`
                    .video-js .vjs-tech {
                        object-fit: contain;
                    }
                `}</style>
                <div ref={videoRef} className="w-full h-full" />
            </div>


            {/* Custom Overlay */}
            <div className={`absolute inset-0 z-10 transition-opacity duration-500 flex flex-col justify-end pb-2 bg-gradient-to-t from-black/60 via-transparent to-transparent ${showControls ? 'opacity-100' : 'opacity-0'}`}>

                {/* Time Indicators (Above Progress Bar as per screenshot) */}
                <div className="flex justify-between px-4 mb-0.5 text-[10px] font-medium text-white/80">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>

                {/* Progress Bar (Full width, thin) */}
                <div className="px-4 mb-2 group/progress relative">
                    <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full v-slider cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, 
                                #fcd53f ${(currentTime / duration) * 100}%, 
                                rgba(255,255,255,0.4) ${(currentTime / duration) * 100}%, 
                                rgba(255,255,255,0.4) ${(bufferedTime / duration) * 100}%, 
                                rgba(255,255,255,0.15) ${(bufferedTime / duration) * 100}%)`
                        }}
                    />
                </div>

                {/* Control Bar (Icons exactly as screenshot) */}
                <div className="flex items-center justify-between px-4">
                    {/* Left Controls */}
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform">
                            {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                        </button>
                        <button onClick={() => skip(-10)} className="text-white hover:scale-110 transition-transform">
                            <RotateCcw size={18} />
                        </button>
                        <button onClick={() => skip(10)} className="text-white hover:scale-110 transition-transform">
                            <RotateCw size={18} />
                        </button>

                        {/* Volume Group */}
                        <div className="flex items-center gap-2 group/volume">
                            <button onClick={toggleMute} className="text-white">
                                {(isMuted || volume === 0) ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-16 v-slider cursor-pointer hidden group-hover/volume:block"
                                style={{
                                    background: `linear-gradient(to right, 
                                            white ${(isMuted ? 0 : volume) * 100}%, 
                                            rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%)`
                                }}
                            />
                        </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-5 relative">
                        {onPrev && (
                            <button onClick={onPrev} className="text-white/80 hover:text-white transition-colors" title="Tập trước">
                                <SkipBack size={18} fill="white" />
                            </button>
                        )}
                        {onNext && (
                            <button onClick={onNext} className="text-white/80 hover:text-white transition-colors" title="Tập tiếp theo">
                                <SkipForward size={18} fill="white" />
                            </button>
                        )}
                        <button onClick={togglePiP} className="text-white/80 hover:text-white transition-colors">
                            <PictureInPicture2 size={16} />
                        </button>

                        {/* Settings Menu Button */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowSettings(!showSettings);
                                    if (!showSettings) setSettingsView('main');
                                }}
                                className="flex items-center gap-1 text-white/80 hover:text-white"
                            >
                                <div className="relative">
                                    <Settings size={18} />
                                    <span className="absolute -top-1 -right-1.5 bg-black/40 text-[7px] px-0.5 rounded border border-white/20 uppercase">{currentQuality}</span>
                                </div>
                            </button>

                            {showSettings && (
                                <div ref={settingsRef} className="absolute bottom-full right-0 mb-4 w-52 bg-[#1a1c23]/95 backdrop-blur-2xl rounded-xl shadow-2xl overflow-hidden border border-white/10">
                                    {settingsView === 'main' && (
                                        <>
                                            <div className="p-3">
                                                <h4 className="text-[13px] font-bold text-white">Cài đặt</h4>
                                            </div>
                                            <div className="pb-2">
                                                <div
                                                    onClick={() => setSettingsView('quality')}
                                                    className="px-3 py-1.5 flex items-center justify-between hover:bg-white/5 cursor-pointer group"
                                                >
                                                    <span className="text-[13px] font-bold text-white/90">Chất lượng</span>
                                                    <span className="text-[12px] text-white/40 group-hover:text-white/60 flex items-center gap-2">
                                                        {currentQuality} <span className="text-base leading-none translate-y-[-1px]">›</span>
                                                    </span>
                                                </div>
                                                <div
                                                    className="px-3 py-1.5 flex items-center justify-between hover:bg-white/5 cursor-pointer group opacity-60"
                                                >
                                                    <span className="text-[13px] font-bold text-white/90">Phụ đề</span>
                                                    <span className="text-[12px] text-white/40 group-hover:text-white/60 flex items-center gap-2">
                                                        Tuỳ chỉnh <span className="text-base leading-none translate-y-[-1px]">›</span>
                                                    </span>
                                                </div>
                                                <div
                                                    onClick={() => setSettingsView('speed')}
                                                    className="px-3 py-1.5 flex items-center justify-between hover:bg-white/5 cursor-pointer group"
                                                >
                                                    <span className="text-[13px] font-bold text-white/90">Tốc độ</span>
                                                    <span className="text-[12px] text-white/40 group-hover:text-white/60 flex items-center gap-2">
                                                        {playbackSpeed}x <span className="text-base leading-none translate-y-[-1px]">›</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {settingsView === 'quality' && (
                                        <>
                                            <div className="p-3 flex items-center gap-2">
                                                <button onClick={() => setSettingsView('main')} className="text-white/40 hover:text-white transition-colors">
                                                    <span className="text-lg leading-none">‹</span>
                                                </button>
                                                <h4 className="text-[13px] font-bold text-white">Chất lượng</h4>
                                            </div>
                                            <div className="py-1 max-h-48 overflow-y-auto">
                                                <div
                                                    onClick={() => changeQuality(-1)}
                                                    className="px-3 py-2 flex items-center justify-between hover:bg-white/5 cursor-pointer group"
                                                >
                                                    <span className={`text-[13px] ${currentQuality === 'Auto' ? 'text-primary-yellow font-bold' : 'text-white/80'}`}>Tự động</span>
                                                    {currentQuality === 'Auto' && <Check size={14} className="text-primary-yellow" />}
                                                </div>
                                                {qualityLevels.map((level, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => changeQuality(i)}
                                                        className="px-3 py-2 flex items-center justify-between hover:bg-white/5 cursor-pointer group"
                                                    >
                                                        <span className={`text-[13px] ${currentQuality === `${level.height}p` ? 'text-primary-yellow font-bold' : 'text-white/80'}`}>{level.height}p</span>
                                                        {currentQuality === `${level.height}p` && <Check size={14} className="text-primary-yellow" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {settingsView === 'speed' && (
                                        <>
                                            <div className="p-3 flex items-center gap-2">
                                                <button onClick={() => setSettingsView('main')} className="text-white/40 hover:text-white transition-colors">
                                                    <span className="text-lg leading-none">‹</span>
                                                </button>
                                                <h4 className="text-[13px] font-bold text-white">Tốc độ phát</h4>
                                            </div>
                                            <div className="py-1">
                                                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                                                    <div
                                                        key={s}
                                                        onClick={() => changeSpeed(s)}
                                                        className="px-3 py-2 flex items-center justify-between hover:bg-white/5 cursor-pointer group"
                                                    >
                                                        <span className={`text-[13px] ${playbackSpeed === s ? 'text-primary-yellow font-bold' : 'text-white/80'}`}>{s}x</span>
                                                        {playbackSpeed === s && <Check size={14} className="text-primary-yellow" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                </div>
                            )}
                        </div>

                        <button onClick={toggleFullscreen} className="text-white hover:scale-110 transition-transform">
                            <Maximize size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal icon for the Toggle
const Zap = ({ className }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

export default VideoPlayer;

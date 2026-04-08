import React, { useState, useRef, useEffect, useCallback } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ src, poster, title }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    // Playback State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isEnded, setIsEnded] = useState(false);
    const [tooltip, setTooltip] = useState({ visible: false, time: 0, x: 0 });

    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const skip = (amount) => {
        videoRef.current.currentTime += amount;
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        videoRef.current.volume = newVolume;
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        videoRef.current.muted = newMuted;
    };

    const cyclePlaybackRate = () => {
        const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
        const nextRateIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
        const nextRate = rates[nextRateIndex];
        setPlaybackRate(nextRate);
        videoRef.current.playbackRate = nextRate;
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const handleTimeUpdate = () => {
        setCurrentTime(videoRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        setDuration(videoRef.current.duration);
    };

    const handleProgress = () => {
        if (videoRef.current.buffered.length > 0) {
            const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
            setBuffered((bufferedEnd / duration) * 100);
        }
    };

    const getSeekPercentage = (e) => {
        const rect = containerRef.current.querySelector('.progress-container').getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        return pos;
    };

    const handleSeek = (e) => {
        const pos = getSeekPercentage(e);
        videoRef.current.currentTime = pos * duration;
    };

    const handleMouseMoveSeek = (e) => {
        const pos = getSeekPercentage(e);
        const time = pos * duration;
        const rect = containerRef.current.querySelector('.progress-container').getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        setTooltip({ visible: true, time, x: clientX - rect.left });
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "00:00";
        const h = Math.floor(time / 3600);
        const m = Math.floor((time % 3600) / 60);
        const s = Math.floor(time % 60);
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const resetControlsTimer = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    }, [isPlaying]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        resetControlsTimer();
    }, [resetControlsTimer]);

    const handleMainClick = (e) => {
        if (e.target === videoRef.current || e.target.classList.contains('video-overlay-center')) {
            togglePlay();
        }
    };

    return (
        <div
            ref={containerRef}
            className={`cinematic-player ${showControls ? 'show-controls' : 'hide-controls'} ${isPlaying ? 'is-playing' : 'is-paused'}`}
            onMouseMove={resetControlsTimer}
            onClick={resetControlsTimer}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="video-element"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onProgress={handleProgress}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onEnded={() => { setIsPlaying(false); setIsEnded(true); }}
                onClick={handleMainClick}
            />

            {/* Vignette Overlay */}
            <div className="video-vignette"></div>

            {/* Top Bar: Title */}
            <div className="video-top-bar">
                <h2 className="video-title">{title}</h2>
            </div>

            {/* Center State Overlays */}
            {isBuffering && (
                <div className="video-overlay-state">
                    <div className="buffering-spinner">
                        <div className="spinner-arc"></div>
                        <div className="spinner-dot"></div>
                    </div>
                </div>
            )}

            {!isPlaying && !isBuffering && !isEnded && (
                <div className="video-overlay-center" onClick={togglePlay}>
                    <button className="big-play-btn">
                        <svg viewBox="0 0 24 24" width="64" height="64"><path fill="var(--cream)" d="M8 5v14l11-7z" /></svg>
                    </button>
                </div>
            )}

            {isEnded && (
                <div className="video-overlay-center" onClick={() => { videoRef.current.currentTime = 0; videoRef.current.play(); setIsEnded(false); setIsPlaying(true); }}>
                    <button className="replay-btn">
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
                    </button>
                </div>
            )}

            {/* Controls Container */}
            <div className="video-controls-container">
                {/* Progress Bar */}
                <div
                    className="progress-container"
                    onClick={handleSeek}
                    onMouseMove={handleMouseMoveSeek}
                    onTouchStart={handleSeek}
                    onTouchMove={handleSeek}
                    onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
                >
                    <div className="progress-bar">
                        <div className="progress-track"></div>
                        <div className="progress-buffer" style={{ width: `${buffered}%` }}></div>
                        <div className="progress-elapsed" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
                        <div className="progress-thumb" style={{ left: `${(currentTime / duration) * 100}%` }}></div>
                    </div>
                    {tooltip.visible && (
                        <div className="progress-tooltip" style={{ left: `${tooltip.x}px` }}>
                            {formatTime(tooltip.time)}
                        </div>
                    )}
                </div>

                <div className="video-controls-row">
                    {/* Left Group */}
                    <div className="controls-group left">
                        <button className="control-btn" onClick={togglePlay}>
                            {isPlaying ? (
                                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            ) : (
                                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 5v14l11-7z" /></svg>
                            )}
                        </button>

                        <button className="control-btn skip-btn" onClick={() => skip(-10)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                                <text x="12" y="15" fontSize="8" fill="currentColor" stroke="none" textAnchor="middle">10</text>
                            </svg>
                        </button>

                        <button className="control-btn skip-btn" onClick={() => skip(10)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                <path d="M21 3v5h-5" />
                                <text x="12" y="15" fontSize="8" fill="currentColor" stroke="none" textAnchor="middle">10</text>
                            </svg>
                        </button>

                        <div className="time-display">
                            <span>{formatTime(currentTime)}</span>
                            <span className="time-separator">/</span>
                            <span className="duration">{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="spacer"></div>

                    {/* Right Group */}
                    <div className="controls-group right">
                        <div className="volume-container">
                            <button className="control-btn" onClick={toggleMute}>
                                {isMuted || volume === 0 ? (
                                    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM19 12c0 3.12-2.04 5.75-4.83 6.59v2.1c3.93-.89 6.83-4.42 6.83-8.69s-2.9-7.8-6.83-8.69v2.1c2.79.84 4.83 3.47 4.83 6.59zM3 9v6h4l5 5V4L7 9H3z" /></svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" /></svg>
                                )}
                            </button>
                            <div className="volume-slider-pop">
                                <input
                                    type="range"
                                    min="0" max="1" step="0.05"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="volume-range"
                                />
                            </div>
                        </div>

                        <button className="control-btn speed-btn" onClick={cyclePlaybackRate}>
                            <span>{playbackRate}x</span>
                        </button>

                        <button className="control-btn" onClick={toggleFullScreen}>
                            {isFullScreen ? (
                                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" /></svg>
                            ) : (
                                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;

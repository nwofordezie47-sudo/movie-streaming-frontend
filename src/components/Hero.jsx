import React, { useState, useEffect } from 'react';
import './Hero.css';

const Hero = ({ movies, onPlay, onInfo }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // If no movies are provided, render a fallback/skeleton hero
    if (!movies || movies.length === 0) {
        return (
            <div className="hero-container" style={{ background: 'var(--bg-surface)' }}>
                <div className="hero-overlay"></div>
            </div>
        );
    }

    // Auto-advance carousel every 8 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % movies.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [movies.length]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % movies.length);
    };

    const currentMovie = movies[currentIndex];

    // Create a poster URL or a fallback placeholder
    const getPosterUrl = (movie) => movie.thumbnailUrl ||
        'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop';

    return (
        <div className="hero-container">
            {/* Render all slides for smooth cross-fading */}
            {movies.map((movie, index) => (
                <div
                    key={movie._id || index}
                    className={`hero-slide ${index === currentIndex ? 'active' : ''}`}
                    style={{ backgroundImage: `url(${getPosterUrl(movie)})` }}
                />
            ))}

            <div className="hero-overlay"></div>

            {/* Side Controls */}
            {movies.length > 1 && (
                <div className="hero-carousel-controls side-controls">
                    <button className="hero-arrow left-arrow" onClick={handlePrev} aria-label="Previous slide">
                        &#10094;
                    </button>
                    <button className="hero-arrow right-arrow" onClick={handleNext} aria-label="Next slide">
                        &#10095;
                    </button>
                </div>
            )}

            <div className="hero-content">
                <h1 className="hero-title">{currentMovie.title || 'Featured Title'}</h1>

                <div className="hero-meta">
                    {/* <span className="hero-match">98% Match</span> */}
                    <span>{currentMovie.releaseYear || new Date().getFullYear()}</span>
                    {(currentMovie.tags && currentMovie.tags.length > 0) && (
                        <span className="hero-rating">{currentMovie.tags[0]}</span>
                    )}
                    <span>{currentMovie.duration || '2h 14m'}</span>
                </div>

                <p className="hero-description">
                    {currentMovie.description || 'Experience the sweeping epic that redefines cinematic storytelling. Dive into a world of mystery, action, and unparalleled visual fidelity.'}
                </p>

                <div className="hero-actions">
                    <button className="btn-play" onClick={() => onPlay && onPlay(currentMovie)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Play
                    </button>
                    <button className="btn-more" onClick={() => onInfo && onInfo(currentMovie)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        More Info
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hero;

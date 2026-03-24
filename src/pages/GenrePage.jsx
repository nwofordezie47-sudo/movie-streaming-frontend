import React, { useState } from 'react';
import MovieCard from '../components/MovieCard';
import '../components/Hero.css'; // Corrected path to components directory

const GenrePage = ({ title, movies, onSelect }) => {
    return (
        <div className="genre-page" style={{ padding: '80px 4% 40px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2.5rem', 
                marginBottom: '40px',
                color: 'var(--text-primary)'
            }}>
                {title}
            </h1>

            {movies.length > 0 ? (
                <div className="movie-grid">
                    {movies.map(movie => (
                        <MovieCard
                            key={movie._id}
                            movie={movie}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                    <p>No movies found in this category.</p>
                </div>
            )}
        </div>
    );
};

export default GenrePage;

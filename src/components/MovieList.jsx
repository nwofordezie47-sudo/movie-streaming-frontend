import React from 'react';
import MovieCard from './MovieCard';
import './MovieRow.css';

const MovieList = ({ movies, onSelectMovie, title = "Trending Now" }) => {
  return (
    <section className="movie-row-section">
      <h2 className="movie-row-title">{title}</h2>

      {movies.length === 0 ? (
        <p className="movie-row-empty">No movies available in this category.</p>
      ) : (
        <div className="movie-row-container">
          {movies.map(movie => (
            <MovieCard
              key={movie._id}
              movie={movie}
              onSelect={onSelectMovie}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default MovieList;


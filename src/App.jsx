import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import MovieList from './components/MovieList';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import { AuthContext } from './context/AuthContext';
import OnboardingModal from './components/OnboardingModal';
import MyList from './pages/MyList';
import GenrePage from './pages/GenrePage';
import MovieDetails from './components/MovieDetails';
import VideoPlayer from './components/VideoPlayer';
import { getTransformedVideoUrl } from './utils/cloudinaryUtils';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const shuffleArray = (array) => {
  if (!array) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const HomeSkeleton = () => {
  return (
    <div style={{ padding: '0 0 50px 0', minHeight: '100vh' }}>
      <div className="skeleton" style={{ height: '70vh', width: '100%', marginBottom: '40px', borderRadius: '0' }} />
      <div style={{ padding: '0 4%' }}>
        <div className="skeleton-text medium" style={{ height: '2.5rem', marginBottom: '20px' }} />
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '20px',
          marginBottom: '40px'
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i}>
              <div className="skeleton skeleton-card" style={{ marginBottom: '15px' }} />
              <div className="skeleton skeleton-text medium" />
              <div className="skeleton skeleton-text short" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Home = ({ movies, onSelectMovie, onWatchMovie }) => {
  const { user } = useContext(AuthContext);

  // Randomize the entire movie pool once per component mount or movie list update
  const shuffledMovies = useMemo(() => shuffleArray(movies), [movies]);

  // Personalization logic: Show all movies, but prioritize preferred genres if they exist
  // We use stringified genres to prevent re-shuffles when the user object reference updates after list toggles
  const preferredGenresStr = user?.preferredGenres?.join(',') || '';
  
  const recommended = useMemo(() => {
    const genres = preferredGenresStr ? preferredGenresStr.split(',') : [];
    const filtered = genres.length > 0
      ? shuffledMovies.filter(m => m.tags?.some(tag => genres.includes(tag)))
      : [];
    return shuffleArray(filtered);
  }, [shuffledMovies, preferredGenresStr]);

  // If we have recommendations, show those first. 
  // Otherwise, or in addition, show everything to avoid a blank screen.
  const displayMovies = recommended.length > 0 ? recommended : shuffledMovies;
  const showRecommendations = recommended.length > 0;

  // Choose top 5 movies for the cinematic hero carousel
  const featuredMovies = displayMovies.slice(0, 5);

  return (
    <>
      {featuredMovies.length > 0 ? (
        <Hero movies={featuredMovies} onPlay={onWatchMovie} onInfo={onSelectMovie} />
      ) : (
        <div style={{ height: '50vh', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Waiting for cinematic content...</p>
        </div>
      )}

      <main style={{ padding: '0 0 50px 0' }}>
        {movies.length > 0 ? (
          <>
            <MovieList
              movies={displayMovies}
              onSelectMovie={onSelectMovie}
              title={showRecommendations ? "Recommended for You" : "Trending Now"}
            />

            {showRecommendations && movies.length > recommended.length && (
              <div style={{ marginTop: '40px' }}>
                <MovieList
                  movies={movies.filter(m => !recommended.includes(m))}
                  onSelectMovie={onSelectMovie}
                  title="More to Explore"
                />
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: '40px 4%', color: 'var(--text-muted)' }}>
            No movies found. Try uploading some in the Admin panel!
          </div>
        )}
      </main>
    </>
  );
};

function App() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [viewState, setViewState] = useState('browse'); // 'browse', 'details', 'watch'
  const [moviesLoading, setMoviesLoading] = useState(true);
  const { user, refreshUser, isNewUser, setIsNewUser, loading: authLoading } = useContext(AuthContext);

  const fetchMovies = async () => {
    setMoviesLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/movies`);
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setMoviesLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    setViewState('details');
    window.scrollTo(0, 0);
  };

  const handleStartWatch = (movie) => {
    setSelectedMovie(movie);
    setViewState('watch');
    window.scrollTo(0, 0);
  };

  const filteredMovies = movies.filter(movie => {
    if (!movie) return false;
    const title = (movie.title || '').toLowerCase();
    const description = (movie.description || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    const tags = Array.isArray(movie.tags) ? movie.tags : [];

    return title.includes(search) ||
      description.includes(search) ||
      tags.some(tag => tag.toLowerCase().includes(search));
  });

  const renderContent = (content) => {
    if (viewState === 'details' && selectedMovie) {
      return <MovieDetails
        movie={selectedMovie}
        onBack={() => setViewState('browse')}
        onPlay={() => setViewState('watch')}
      />;
    }
    if (viewState === 'watch' && selectedMovie) {
      return (
        <div style={{ padding: '40px 4% 0' }}>
          <button
            onClick={() => setViewState('details')}
            style={{
              padding: '10px 20px',
              marginBottom: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: '6px'
            }}
          >
            <span>&larr;</span> Back to Details
          </button>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', marginBottom: '10px' }}>{selectedMovie.title}</h2>
          <div style={{ marginTop: '20px', width: '100%', maxWidth: '1200px' }}>
            <VideoPlayer
              src={getTransformedVideoUrl(selectedMovie.videoUrl)}
              poster={selectedMovie.thumbnailUrl}
              title={selectedMovie.title}
            />
          </div>
        </div>
      );
    }
    return content;
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        onSearch={(term) => { setSearchTerm(term); setViewState('browse'); }} 
        searchResults={searchTerm ? filteredMovies : []}
        onSelectMovie={handleSelectMovie}
        searchTerm={searchTerm}
      />

      {user && (user.email || user.username) && !user.onboardingComplete && isNewUser && (
        <OnboardingModal
          user={user}
          onComplete={() => {
            refreshUser();
            setIsNewUser(false);
          }}
        />
      )}

      <Routes>
        <Route path="/" element={user ? <Navigate to="/movies" replace /> : <Login />} />
        <Route path="/login" element={user ? <Navigate to="/movies" replace /> : <Login />} />
        <Route path="/movies" element={<ProtectedRoute>{renderContent(moviesLoading ? <HomeSkeleton /> : <Home movies={movies} onSelectMovie={handleSelectMovie} onWatchMovie={handleStartWatch} />)}</ProtectedRoute>} />
        <Route path="/series" element={<ProtectedRoute>{renderContent(<GenrePage title="Series" movies={movies.filter(m => m.tags?.includes('Series'))} onSelect={handleSelectMovie} loading={moviesLoading} />)}</ProtectedRoute>} />
        <Route path="/new-and-popular" element={<ProtectedRoute>{renderContent(<GenrePage title="New & Popular" movies={movies.filter(m => m.releaseYear === 2026).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))} onSelect={handleSelectMovie} loading={moviesLoading} />)}</ProtectedRoute>} />
        <Route path="/my-list" element={<ProtectedRoute>{renderContent(<MyList onSelect={handleSelectMovie} />)}</ProtectedRoute>} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;

import React, { useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import './MovieCard.css';

const MovieDetails = ({ movie, onBack, onPlay }) => {
    const { user, refreshUser } = useContext(AuthContext);
    const { showToast } = useContext(ToastContext);
    const [isToggling, setIsToggling] = useState(false);

    const isInList = user?.myList?.some(item => {
        const itemId = item?._id || item;
        return itemId.toString() === movie._id.toString();
    });

    const handleListToggle = async () => {
        if (!user || isToggling) return;
        const uid = user.id || user._id;
        if (!uid) return;

        setIsToggling(true);
        console.log("Details View - Toggling Movie:", movie.title);
        try {
            await axios.post('http://localhost:5000/users/my-list/toggle', {
                userId: uid,
                movieId: movie._id
            });
            await refreshUser();
            
            if (isInList) {
                showToast('Removed from My List', 'info');
            } else {
                showToast('Added to My List', 'success');
            }
        } catch (err) {
            console.error("Error toggling list in details", err);
        } finally {
            setIsToggling(false);
        }
    };

    const imageUrl = movie.thumbnailUrl ||
        'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop';

    return (
        <div className="movie-details-view" style={{ padding: '20px 4%', animation: 'fadeIn 0.5s ease' }}>
            <button
                onClick={onBack}
                style={{
                    padding: '10px 20px',
                    marginBottom: '30px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: '8px',
                    fontFamily: 'inherit'
                }}
            >
                <span>&larr;</span> Back to Browse
            </button>

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                <div style={{ flex: '0 0 300px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                    <img src={imageUrl} alt={movie.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>

                <div style={{ flex: '1', minWidth: '300px' }}>
                    <h1 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '3.5rem',
                        marginBottom: '10px',
                        color: 'var(--cream)'
                    }}>
                        {movie.title}
                    </h1>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px', color: 'var(--text-muted)' }}>
                        {/* <span style={{ color: '#46d369', fontWeight: 'bold' }}>98% Match</span> */}
                        <span>{movie.releaseYear || '2024'}</span>
                        <span style={{ border: '1px solid #555', padding: '1px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>4K</span>
                        <span>{movie.duration || '2h 15m'}</span>
                    </div>

                    <p style={{
                        fontSize: '1.2rem',
                        lineHeight: '1.6',
                        color: 'rgba(255,255,255,0.8)',
                        marginBottom: '30px',
                        maxWidth: '800px'
                    }}>
                        {movie.description || "In a world where destiny and desire collide, one journey will redefine everything. Experience the cinematic event that has captivated audiences around the globe."}
                    </p>

                    {movie.tags && movie.tags.length > 0 && (
                        <div style={{ marginBottom: '40px' }}>
                            <span style={{ color: 'var(--text-muted)', marginRight: '10px' }}>Genres:</span>
                            {movie.tags.map(tag => (
                                <span key={tag} style={{ color: 'white', marginRight: '10px' }}>{tag}</span>
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button
                            onClick={() => onPlay(movie)}
                            style={{
                                padding: '15px 40px',
                                background: 'white',
                                color: 'black',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.8)'}
                            onMouseOut={(e) => e.target.style.background = 'white'}
                        >
                            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 5v14l11-7z" /></svg>
                            Watch Movie
                        </button>

                        <button
                            onClick={handleListToggle}
                            disabled={isToggling}
                            style={{
                                padding: '15px 30px',
                                background: isInList ? 'var(--maroon)' : 'rgba(255,255,255,0.1)',
                                color: 'white',
                                border: isInList ? 'none' : '2px solid rgba(255,255,255,0.5)',
                                borderRadius: '4px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.2s ease',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            {isToggling ? (
                                <div className="btn-spinner" style={{ width: '20px', height: '20px' }}></div>
                            ) : isInList ? (
                                <>
                                    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                                    In My List
                                </>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                                    Add to My List
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;

import React, { useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import './MovieCard.css';

const MovieCard = ({ movie, onSelect }) => {
    const { user, refreshUser } = useContext(AuthContext);
    const { showToast } = useContext(ToastContext);
    const [isToggling, setIsToggling] = useState(false);

    const isInList = user?.myList?.some(item => {
        const itemId = item?._id || item; // If populated, use _id. Else, it is the ID itself.
        return itemId.toString() === movie._id.toString();
    });

    const handleListToggle = async (e) => {
        e.stopPropagation();
        if (!user || isToggling) return;

        const uid = user.id || user._id;
        if (!uid) return;

        console.log("Toggling Movie:", movie.title, "for User:", uid);
        setIsToggling(true);
        try {
            const res = await axios.post('http://localhost:5000/users/my-list/toggle', {
                userId: uid,
                movieId: movie._id
            });
            console.log("Toggle success, updated list:", res.data);
            await refreshUser();
            
            if (isInList) {
                showToast('Removed from My List', 'info');
            } else {
                showToast('Added to My List', 'success');
            }
            console.log("User state refreshed");
        } catch (err) {
            console.error("Error toggling list", err.response?.data || err.message);
        } finally {
            setIsToggling(false);
        }
    };
    // Use a fallback image if no thumbnail exists
    const imageUrl = movie.thumbnailUrl ||
        'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop';

    return (
        <div className="movie-card" onClick={() => onSelect(movie)}>
            <div className="movie-card-poster">
                <img
                    src={imageUrl}
                    alt={movie.title}
                    className="movie-card-img"
                    loading="lazy"
                />
                <div className="movie-card-overlay">
                    <button
                        className={`list-toggle-btn ${isInList ? 'in-list' : ''} ${isToggling ? 'loading' : ''}`}
                        onClick={handleListToggle}
                        disabled={isToggling}
                        title={isInList ? "Remove from My List" : "Add to My List"}
                    >
                        {isToggling ? (
                            <div className="btn-spinner"></div>
                        ) : isInList ? (
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
            <div className="movie-card-info">
                <h3 className="movie-card-title">{movie.title}</h3>
                <div className="movie-card-meta">
                    {/* <span className="movie-card-rating">95% Match</span> */}
                    <span>{movie.releaseYear || new Date().getFullYear()}</span>
                    {movie.duration && <span className="movie-card-duration">{movie.duration}</span>}
                </div>
            </div>
        </div>
    );
};

export default MovieCard;

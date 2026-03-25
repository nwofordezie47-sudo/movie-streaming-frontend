import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Upload.css'; // Reusing premium form styles

const EditMovieModal = ({ isOpen, movie, onClose, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    releaseYear: '',
    thumbnailUrl: '',
    videoUrl: '',
    tags: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const genres = [
    "Action", "Adventure", "Comedy", "Drama", "Horror", "Thriller / Suspense",
    "Sci-Fi", "Fantasy", "Romance", "Animation", "Documentary", "Crime / Mystery",
    "Musical", "Historical / Period", "Western", "Series"
  ];

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || '',
        description: movie.description || '',
        duration: movie.duration || '',
        releaseYear: movie.releaseYear || '',
        thumbnailUrl: movie.thumbnailUrl || '',
        videoUrl: movie.videoUrl || '',
        tags: movie.tags || []
      });
      setError('');
    }
  }, [movie]);

  if (!isOpen || !movie) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/movies/${movie._id || movie.id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setLoading(false);
      if (onUpdateSuccess) onUpdateSuccess();
      onClose();
    } catch (err) {
      console.error('Update failed:', err);
      setError(err.response?.data?.error || 'Failed to update movie.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(10, 10, 10, 0.98)',
      zIndex: 9999,
      overflowY: 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '40px 20px'
    }}>
      <div className="upload-container" style={{ position: 'relative', marginTop: '20px', maxWidth: '800px', width: '100%' }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
        
        <h2 className="upload-header">Edit Masterpiece</h2>

        {error && (
            <div style={{ padding: '10px', backgroundColor: 'rgba(255,0,0,0.1)', color: 'red', marginBottom: '20px', borderRadius: '5px' }}>
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label className="upload-section-label">Movie Title</label>
            <input
              type="text"
              name="title"
              className="auth-input"
              style={{ width: '100%', marginBottom: '15px' }}
              value={formData.title}
              onChange={handleChange}
              required
            />
            <label className="upload-section-label">Story Description</label>
            <textarea
              name="description"
              className="auth-input"
              style={{ width: '100%', minHeight: '100px', resize: 'none' }}
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label className="upload-section-label">Duration</label>
              <input
                type="text"
                name="duration"
                placeholder="e.g. 2h 15m"
                className="auth-input"
                style={{ width: '100%' }}
                value={formData.duration}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="upload-section-label">Release Year</label>
              <input
                type="number"
                name="releaseYear"
                className="auth-input"
                style={{ width: '100%' }}
                value={formData.releaseYear}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="upload-section-label">Thumbnail URL</label>
            <input
              type="url"
              name="thumbnailUrl"
              className="auth-input"
              style={{ width: '100%' }}
              value={formData.thumbnailUrl}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="upload-section-label">Video URL (CDN / Stream Link)</label>
            <input
              type="url"
              name="videoUrl"
              className="auth-input"
              style={{ width: '100%' }}
              value={formData.videoUrl}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="upload-section-label">Genres & Tags</label>
            <div className="genre-grid">
              {genres.map(genre => (
                <button
                  key={genre}
                  type="button"
                  className={`genre-tag-btn ${formData.tags.includes(genre) ? 'active' : ''}`}
                  onClick={() => toggleTag(genre)}
                >
                  {formData.tags.includes(genre) && <span style={{ marginRight: '6px' }}>✓</span>}
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              <button type="button" onClick={onClose} className="auth-submit" style={{ backgroundColor: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--cream)'}}>
                Cancel
              </button>
              <button type="submit" disabled={loading} className="upload-submit-btn">
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMovieModal;

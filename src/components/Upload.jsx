import React, { useState } from 'react';
import axios from 'axios';
import Modal from './Modal';
import './Upload.css';

const Upload = ({ onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [duration, setDuration] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const genres = [
    "Action", "Adventure", "Comedy", "Drama", "Horror", "Thriller / Suspense",
    "Sci-Fi", "Fantasy", "Romance", "Animation", "Documentary", "Crime / Mystery",
    "Musical", "Historical / Period", "Western", "Series"
  ];

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const closeModal = () => {
    setModalState(s => ({ ...s, isOpen: false }));
  };

  const showModal = (title, message, type) => {
    setModalState({ isOpen: true, title, message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) return showModal('Error', 'Please select a video file', 'error');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('duration', duration);
    formData.append('releaseYear', releaseYear);
    formData.append('tags', selectedTags.join(', '));
    formData.append('file', videoFile);
    if (thumbnailUrl) {
      formData.append('thumbnailUrl', thumbnailUrl);
    }

    setLoading(true);
    setProgress(0);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      showModal('Success', 'Movie uploaded successfully!', 'success');
      setTitle('');
      setDescription('');
      setThumbnailUrl('');
      setDuration('');
      setReleaseYear('');
      setSelectedTags([]);
      setVideoFile(null);
      setProgress(0);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error('Upload failed:', error);
      showModal('Upload Failed', error.response?.data?.error || 'An error occurred during upload', 'error');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2 className="upload-header">Upload Masterpiece</h2>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label className="upload-section-label">General Information</label>
          <input
            type="text"
            placeholder="Movie Title"
            className="auth-input"
            style={{ width: '100%', marginBottom: '15px' }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Riveting Story Description..."
            className="auth-input"
            style={{ width: '100%', minHeight: '100px', resize: 'none' }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label className="upload-section-label">Duration</label>
            <input
              type="text"
              placeholder="e.g. 2h 15m"
              className="auth-input"
              style={{ width: '100%' }}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="upload-section-label">Release Year</label>
            <input
              type="number"
              placeholder="2024"
              className="auth-input"
              style={{ width: '100%' }}
              value={releaseYear}
              onChange={(e) => setReleaseYear(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="upload-section-label">Thumbnail URL</label>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            className="auth-input"
            style={{ width: '100%' }}
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="upload-section-label">Genres & Tags</label>
          <div className="genre-grid">
            {genres.map(genre => (
              <button
                key={genre}
                type="button"
                className={`genre-tag-btn ${selectedTags.includes(genre) ? 'active' : ''}`}
                onClick={() => toggleTag(genre)}
              >
                {selectedTags.includes(genre) && <span style={{ marginRight: '6px' }}>✓</span>}
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="upload-section-label"> Video File</label>
          <div className="file-input-wrapper">
            <div className="file-input-info">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span>{videoFile ? videoFile.name : "Choose Video File (MP4)"}</span>
            </div>
            <input
              type="file"
              accept="video/mp4"
              onChange={(e) => setVideoFile(e.target.files[0])}
              required
            />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic', textAlign: 'center' }}>

          </p>
        </div>

        {loading && (
          <div className="upload-progress-container">
            <div className="upload-progress-bar" style={{ width: `${progress}%` }} />
            <p className="upload-progress-text">{progress}% Uploaded</p>
          </div>
        )}

        <button type="submit" disabled={loading} className="upload-submit-btn">
          {loading ? 'Processing Masterpiece...' : 'Publish to DanStream'}
        </button>
      </form>

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  );
};

export default Upload;

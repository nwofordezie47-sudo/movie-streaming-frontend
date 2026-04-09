import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Upload from '../components/Upload';
import Modal from '../components/Modal';
import EditMovieModal from '../components/EditMovieModal';
import CardSkeleton from '../components/CardSkeleton';
import axios from 'axios';

const Admin = () => {
    const { user, token } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('upload');
    const [successMessage, setSuccessMessage] = useState('');
    
    const [movies, setMovies] = useState([]);
    const [loadingMovies, setLoadingMovies] = useState(false);
    
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, movieId: null, title: '' });
    const [editModal, setEditModal] = useState({ isOpen: false, movie: null });

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (activeTab === 'manage') {
            fetchMovies();
        }
    }, [activeTab]);

    const fetchMovies = async () => {
        setLoadingMovies(true);
        try {
            const adminId = user?._id || user?.id;
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/movies?uploadedBy=${adminId}`);
            setMovies(res.data);
        } catch (err) {
            console.error('Failed to fetch movies for admin panel:', err);
        } finally {
            setLoadingMovies(false);
        }
    };

    if (!user || !user.isAdmin) return null;

    const handleUploadSuccess = () => {
        setSuccessMessage('Movie uploaded successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        if (activeTab === 'manage') fetchMovies();
    };

    const handleDeleteClick = (movie) => {
        setDeleteModal({ isOpen: true, movieId: movie._id || movie.id, title: movie.title });
    };

    const confirmDelete = async () => {
        try {
            const authToken = token || localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/movies/${deleteModal.movieId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            setSuccessMessage(`Movie "${deleteModal.title}" deleted.`);
            setDeleteModal({ isOpen: false, movieId: null, title: '' });
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchMovies();
        } catch (err) {
            console.error("Delete failed:", err);
            alert(err.response?.data?.error || "Failed to delete movie.");
        }
    };

    const handleEditClick = (movie) => {
        setEditModal({ isOpen: true, movie });
    };

    return (
        <div style={{
            minHeight: '100vh',
            padding: '80px 4%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'var(--bg-base)'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '1200px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '40px'
            }}>
                <h1 style={{ margin: 0, fontSize: '2.5rem', fontFamily: 'var(--font-heading)' }}>Admin Dashboard</h1>
                <button
                    onClick={() => navigate('/')}
                    className="auth-submit"
                    style={{ padding: '10px 25px', width: 'auto', marginTop: 0 }}
                >
                    Back to Home
                </button>
            </div>

            {successMessage && (
                <div style={{
                    padding: '15px 30px',
                    backgroundColor: 'rgba(128, 1, 31, 0.1)',
                    color: 'var(--cream)',
                    border: '1px solid var(--maroon)',
                    marginBottom: '30px',
                    borderRadius: '8px',
                    animation: 'fadeIn 0.4s ease',
                    width: '100%',
                    maxWidth: '1200px',
                    textAlign: 'center'
                }}>
                    {successMessage}
                </div>
            )}

            {/* Tabs Navigation */}
            <div style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '40px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                width: '100%',
                maxWidth: '1200px'
            }}>
                <button 
                    onClick={() => setActiveTab('upload')}
                    style={{
                        padding: '10px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'upload' ? '3px solid var(--maroon)' : '3px solid transparent',
                        color: activeTab === 'upload' ? 'white' : 'var(--text-muted)',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'upload' ? 'bold' : 'normal',
                        transition: 'all 0.3s ease'
                    }}
                >
                    Upload Masterpiece
                </button>
                <button 
                    onClick={() => setActiveTab('manage')}
                    style={{
                        padding: '10px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'manage' ? '3px solid var(--maroon)' : '3px solid transparent',
                        color: activeTab === 'manage' ? 'white' : 'var(--text-muted)',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'manage' ? 'bold' : 'normal',
                        transition: 'all 0.3s ease'
                    }}
                >
                    Manage Movies
                </button>
            </div>

            {/* Tab Views */}
            {activeTab === 'upload' && (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <Upload onUploadSuccess={handleUploadSuccess} />
                </div>
            )}

            {activeTab === 'manage' && (
                <div style={{ width: '100%', maxWidth: '1200px' }}>
                    {loadingMovies ? (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                            gap: '25px' 
                        }}>
                            {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                            gap: '25px' 
                        }}>
                            {movies.map(movie => (
                                <div key={movie._id || movie.id} style={{
                                    background: 'var(--bg-surface)',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                                        <img 
                                            src={movie.thumbnailUrl || 'https://via.placeholder.com/400x225?text=No+Thumbnail'} 
                                            alt={movie.title}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </div>
                                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: 'var(--cream)'}}>{movie.title}</h3>
                                        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: 'var(--text-muted)', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {movie.description || 'No description provided.'}
                                        </p>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <button 
                                                onClick={() => handleEditClick(movie)}
                                                style={{
                                                    padding: '8px',
                                                    background: 'rgba(255,255,255,0.1)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    color: 'white',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(movie)}
                                                style={{
                                                    padding: '8px',
                                                    background: 'rgba(255,0,0,0.15)',
                                                    border: '1px solid rgba(255,0,0,0.3)',
                                                    color: '#ff4d4d',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {movies.length === 0 && (
                                <p style={{ color: 'var(--text-muted)' }}>No movies found in the database. Upload one!</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, movieId: null, title: '' })}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={`Are you absolutely sure you want to delete "${deleteModal.title}"? This action cannot be undone.`}
                type="warning"
            />

            <EditMovieModal 
                isOpen={editModal.isOpen} 
                movie={editModal.movie}
                onClose={() => setEditModal({ isOpen: false, movie: null })}
                onUpdateSuccess={() => {
                    setSuccessMessage('Movie updated successfully!');
                    setTimeout(() => setSuccessMessage(''), 3000);
                    fetchMovies();
                }}
            />

        </div>
    );
};

export default Admin;

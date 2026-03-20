import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Modal from './Modal';
import './Navbar.css';

const Navbar = ({ onSearch, searchResults, onSelectMovie, searchTerm }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    // Remove local searchTerm state since we are passing it as a prop now
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu when location changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-brand">
                <Link to="/">Dan<span>Stream</span></Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button className={`menu-toggle ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
                <span className="hamburger"></span>
            </button>

            <div className={`navbar-content ${isMenuOpen ? 'mobile-open' : ''}`}>
                {user && (
                    <div className="navbar-nav">
                        <Link to="/movies" className={`nav-link ${location.pathname === '/movies' ? 'active' : ''}`}>Home</Link>
                        <Link to="/series" className={`nav-link ${location.pathname === '/series' ? 'active' : ''}`}>Series</Link>
                        <Link to="/new-and-popular" className={`nav-link ${location.pathname === '/new-and-popular' ? 'active' : ''}`}>New & Popular</Link>
                        <Link to="/my-list" className={`nav-link ${location.pathname === '/my-list' ? 'active' : ''}`}>My List</Link>
                    </div>
                )}

                <div className="nav-actions">
                    {user && (
                        <div className="search-container">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Titles, people, genres"
                                    value={searchTerm || ''}
                                    onChange={(e) => {
                                        onSearch(e.target.value);
                                    }}
                                />
                                <svg viewBox="0 0 24 24" className="search-icon"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                            </div>
                            
                            {searchTerm && searchResults && (
                                <div className="search-dropdown">
                                    {searchResults.length > 0 ? (
                                        searchResults.slice(0, 8).map(movie => (
                                            <div 
                                                key={movie._id} 
                                                className="search-dropdown-item" 
                                                onClick={() => { 
                                                    onSearch(''); 
                                                    onSelectMovie(movie); 
                                                }}
                                            >
                                                <img src={movie.thumbnailUrl} alt={movie.title} />
                                                <span>{movie.title}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="search-dropdown-empty">No results found</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {user ? (
                        <>
                            {user.isAdmin && (
                                <Link to="/admin">
                                    <button className="nav-btn">Admin</button>
                                </Link>
                            )}
                            <button className="nav-logout" onClick={() => setShowLogoutModal(true)}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login">
                            <button className="nav-btn" style={{ background: 'var(--maroon)', borderColor: 'var(--maroon)' }}>
                                Sign In
                            </button>
                        </Link>
                    )}
                </div>
            </div>

            <Modal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={() => {
                    logout();
                    window.location.href = '/login';
                }}
                title="Logout"
                message="Are you sure you want to log out of DanStream?"
                type="info"
            />
        </nav>
    );
};

export default Navbar;

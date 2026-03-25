import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Modal from '../components/Modal';
import { auth, googleProvider, appleProvider } from '../firebase.config';
import { signInWithPopup } from 'firebase/auth';
import './Auth.css';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSocialLoading, setIsSocialLoading] = useState(false);
    const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const { signup, firebaseSync } = useContext(AuthContext);
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    const closeModal = () => {
        setModalState(s => ({ ...s, isOpen: false }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signup(username, email, password, isAdmin);
            navigate('/movies');
        } catch (err) {
            setModalState({
                isOpen: true,
                title: 'Signup Failed',
                message: err.response?.data?.message || 'An error occurred during signup',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialSignIn = async (provider) => {
        if (isSocialLoading) return;
        setIsSocialLoading(true);
        console.log("Starting social sign-up with provider:", provider.providerId);
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("Firebase popup success, syncing with server...");
            await firebaseSync(result.user);
            console.log("Server sync success, navigating to /movies");
            navigate('/movies');
        } catch (err) {
            const isCancelled = err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request';
            if (!isCancelled) {
                console.error("Social sign-in error:", err);
                setModalState({
                    isOpen: true,
                    title: 'Authentication Failed',
                    message: 'Could not sign in with social provider. Check your console for details.',
                    type: 'error'
                });
            } else {
                console.log("Social sign-up cancelled by user");
            }
        } finally {
            setIsSocialLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Left Panel */}
            <div className="auth-left">
                <div className="auth-left-content">
                    <h1>Join DanStream Today</h1>
                    <p>Start your cinematic adventure. Access thousands of exclusive titles and originals instantly.</p>
                </div>
            </div>

            {/* Right Panel */}
            <div className="auth-right">
                <div className="auth-card">
                    <div className="auth-logo">
                        <Link to="/">DanStream</Link>
                    </div>

                    <div className="auth-header">
                        <h2>Create your account</h2>
                        <p>Join our community of movie lovers</p>
                    </div>

                    <div className="social-auth">
                        <button className="social-btn" onClick={() => handleSocialSignIn(googleProvider)} disabled={isSocialLoading}>
                            <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                            {isSocialLoading ? 'Connecting...' : 'Google'}
                        </button>
                        <button className="social-btn" onClick={() => handleSocialSignIn(appleProvider)} disabled={isSocialLoading}>
                            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M17.05 20.28c-.96.95-2.04 1.81-3.14 1.77-1.11-.04-1.47-.72-2.73-.72-1.27 0-1.63.72-2.73.72-1.1.04-2.18-.86-3.14-1.77-1.95-1.92-3.41-5.42-3.41-8.54 0-3.1 1.95-4.8 3.8-4.8 1.01 0 1.97.7 2.58.7.62 0 1.57-.7 1.57-.7 1.85 0 3.8 1.7 3.8 4.8 0 .1-.01.2-.02.3-1.67.68-2.78 2.37-2.78 4.29 0 2.21 1.48 4.01 3.2 4.69-.02.03-.02.04-.02.07zm-4.32-15.35c.9-.99 1.48-2.37 1.48-3.75 0-.19-.02-.38-.06-.57-1.28.05-2.83.85-3.75 1.92-.83.97-1.57 2.36-1.57 3.75 0 .2.02.41.07.61 1.43-.11 2.93-.97 3.83-1.96z" /></svg>
                            {isSocialLoading ? 'Connecting...' : 'Apple'}
                        </button>
                    </div>

                    <div className="auth-divider">or sign up with email</div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                placeholder="johndoe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="remember-me" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                                <input
                                    type="checkbox"
                                    checked={isAdmin}
                                    onChange={(e) => setIsAdmin(e.target.checked)}
                                />
                                Register as Administrator
                            </label>
                        </div>

                        <button type="submit" className="auth-submit" disabled={isLoading || isSocialLoading}>
                            {isLoading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    <div className="btn-spinner"></div> Creating Account...
                                </div>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </div>
                </div>
            </div>

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

export default Signup;


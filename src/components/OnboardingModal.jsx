import React, { useState } from 'react';
import axios from 'axios';
import './Modal.css';
import Stepper, { Step } from './Stepper';

const OnboardingModal = ({ user, onComplete }) => {
    const [referral, setReferral] = useState('');
    const [selectedGenres, setSelectedGenres] = useState([]);

    const genres = [
        "Action", "Adventure", "Comedy", "Drama", "Horror", "Thriller / Suspense",
        "Sci-Fi", "Fantasy", "Romance", "Animation", "Documentary", "Crime / Mystery",
        "Musical", "Historical / Period", "Western"
    ];

    const toggleGenre = (genre) => {
        setSelectedGenres(prev =>
            prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
        );
    };

    const handleSubmit = async () => {
        try {
            const uid = user.id || user._id; // Handle both token payload and Mongoose object
            await axios.post('http://localhost:5000/users/onboarding', {
                userId: uid,
                referralSource: referral,
                preferredGenres: selectedGenres
            });
            onComplete();
        } catch (err) {
            console.error("Onboarding failed", err);
        }
    };

    const getIsNextDisabled = (currentStep) => {
        if (currentStep === 1) return !referral;
        if (currentStep === 2) return selectedGenres.length === 0;
        return false;
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px', backgroundColor: '#1a1a1a', border: '2px solid var(--maroon)', padding: '0', overflow: 'hidden' }}>
                <Stepper
                    initialStep={1}
                    onFinalStepCompleted={handleSubmit}
                    getIsNextDisabled={getIsNextDisabled}
                    backButtonText="Previous"
                    nextButtonText="Continue"
                >
                    <Step>
                        <div style={{ minHeight: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <h2 className="modal-title">Welcome to DanStream!</h2>
                            <p className="modal-message">How did you hear about us?</p>
                            <select
                                className="auth-input custom-select"
                                style={{ 
                                    width: '100%', 
                                    maxWidth: '400px',
                                    marginBottom: '20px', 
                                    background: '#222', 
                                    color: 'white', 
                                    padding: '12px 16px', 
                                    borderRadius: '8px', 
                                    border: '1px solid #555',
                                    appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right .7em top 50%',
                                    backgroundSize: '.65em auto',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                                value={referral}
                                onChange={(e) => setReferral(e.target.value)}
                            >
                            <option value="" style={{ color: 'black' }}>Select an option</option>
                            <option value="Friend or family" style={{ color: 'black' }}>Friend or family recommendation</option>
                            <option value="Colleague" style={{ color: 'black' }}>Colleague/coworker suggestion</option>
                            <option value="Social media" style={{ color: 'black' }}>Social media (Instagram, X, TikTok, Facebook)</option>
                            <option value="Email/Referral" style={{ color: 'black' }}>Email invite / referral link</option>
                            <option value="SMS/WhatsApp" style={{ color: 'black' }}>SMS / WhatsApp message</option>
                            <option value="YouTube" style={{ color: 'black' }}>YouTube video or review</option>
                            <option value="Blog/Article" style={{ color: 'black' }}>Blog post or article</option>
                            <option value="Podcast" style={{ color: 'black' }}>Podcast mention</option>
                            </select>
                        </div>
                    </Step>

                    <Step>
                        <div style={{ minHeight: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <h2 className="modal-title">Preferences</h2>
                            <p className="modal-message" style={{ marginBottom: '15px' }}>What kind of movies do you like? (Select as many as you want)</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', maxHeight: '250px', overflowY: 'auto', padding: '10px', marginBottom: '10px' }}>
                            {genres.map(genre => (
                                <button
                                    key={genre}
                                    style={{
                                        padding: '10px 8px',
                                        borderRadius: '20px',
                                        border: selectedGenres.includes(genre) ? '2px solid var(--maroon)' : '1px solid #444',
                                        background: selectedGenres.includes(genre) ? 'rgba(128,1,31,0.2)' : 'transparent',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '5px'
                                    }}
                                    onClick={() => toggleGenre(genre)}
                                >
                                    {selectedGenres.includes(genre) && <span>✓</span>}
                                    {genre}
                                </button>
                            ))}
                        </div>
                        </div>
                    </Step>
                </Stepper>
            </div>
        </div>
    );
};

export default OnboardingModal;

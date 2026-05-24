import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const WelcomeMessage = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    // Resolve name to display using displayName, fallback to username, and then first part of email, and finally "User"
    const name = user.displayName || user.username || user.email?.split('@')[0] || 'User';

    const getGreeting = () => {
        if (user.prevLogin) {
            const prevDate = new Date(user.prevLogin);
            const nowDate = new Date();
            const isSameDay = prevDate.getFullYear() === nowDate.getFullYear() &&
                              prevDate.getMonth() === nowDate.getMonth() &&
                              prevDate.getDate() === nowDate.getDate();
            if (isSameDay) {
                return `Welcome back, ${name}`;
            }
        }

        const hours = new Date().getHours();
        if (hours >= 5 && hours < 12) {
            return `Good morning, ${name} 🌅`;
        } else if (hours >= 12 && hours < 17) {
            return `What are we watching, ${name}?`;
        } else if (hours >= 17 && hours < 21) {
            return `Good evening, ${name} 🌆`;
        } else {
            return `Back at it, ${name} 🦉`;
        }
    };

    return (
        <div 
            className="glass-card welcome-banner"
            style={{
                padding: '24px',
                borderRadius: '12px',
                margin: '20px 4% 10px 4%',
                boxShadow: '0 8px 32px 0 rgba(128, 1, 31, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderLeft: '4px solid var(--maroon)',
                animation: 'fadeIn 0.5s ease-out'
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h2 style={{ 
                    fontFamily: 'var(--font-heading)', 
                    fontSize: '1.8rem', 
                    color: 'var(--cream)', 
                    margin: 0,
                    fontWeight: '600',
                    letterSpacing: '0.5px'
                }}>
                    {getGreeting()}
                </h2>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                    We've curated some fresh titles for your session today.
                </p>
            </div>
        </div>
    );
};

export default WelcomeMessage;

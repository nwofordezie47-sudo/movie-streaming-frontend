import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Upload from '../components/Upload';
import axios from 'axios';

const Admin = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/');
        }
    }, [user, navigate]);

    if (!user || !user.isAdmin) return null;

    const handleUploadSuccess = () => {
        setSuccessMessage('Movie uploaded successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
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
                maxWidth: '1000px',
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

            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <p style={{ fontSize: '1.2rem', color: 'var(--cream)', opacity: 0.8 }}>
                    Welcome, Administrator. Shape the cinematic experience of DanStream.
                </p>
            </div>

            {successMessage && (
                <div style={{
                    padding: '15px 30px',
                    backgroundColor: 'rgba(128, 1, 31, 0.1)',
                    color: 'var(--cream)',
                    border: '1px solid var(--maroon)',
                    marginBottom: '30px',
                    borderRadius: '8px',
                    animation: 'fadeIn 0.4s ease'
                }}>
                    {successMessage}
                </div>
            )}

            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Upload onUploadSuccess={handleUploadSuccess} />
            </div>
        </div>
    );
};

export default Admin;

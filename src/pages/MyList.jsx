import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';

const MyList = ({ onSelect }) => {
    const { user } = useContext(AuthContext);
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyList = async () => {
            if (!user) return;
            try {
                const res = await axios.get(`http://localhost:5000/users/me?userId=${user.id || user._id}`);
                setList(res.data.myList || []);
            } catch (err) {
                console.error("Error fetching my list", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyList();
    }, [user]);

    return (
        <div className="my-list-page" style={{ padding: '100px 4% 40px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2.5rem',
                marginBottom: '40px',
                color: 'var(--text-primary)'
            }}>
                My List
            </h1>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>Loading...</div>
            ) : list.length > 0 ? (
                <div className="movie-grid">
                    {list.map(movie => (
                        <MovieCard
                            key={movie._id}
                            movie={movie}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                    <p>You haven't added any movies to your list yet.</p>
                </div>
            )}
        </div>
    );
};

export default MyList;

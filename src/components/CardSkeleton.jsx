import React from 'react';

const CardSkeleton = () => {
    return (
        <div className="movie-card skeleton-container">
            <div className="skeleton skeleton-card" style={{ marginBottom: '15px' }}></div>
            <div className="skeleton skeleton-text medium"></div>
            <div className="skeleton skeleton-text short"></div>
        </div>
    );
};

export default CardSkeleton;

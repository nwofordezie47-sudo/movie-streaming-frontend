import React, { createContext, useState, useCallback } from 'react';
import './Toast.css';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div className={`toast-notification ${toast.type}`}>
                    {toast.type === 'success' ? (
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                    )}
                    {toast.message}
                </div>
            )}
        </ToastContext.Provider>
    );
};

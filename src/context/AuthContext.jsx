import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isNewUser, setIsNewUser] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const payload = JSON.parse(atob(storedToken.split('.')[1]));

                    // Simple expiration check
                    const currentTime = Date.now() / 1000;
                    if (payload.exp && payload.exp < currentTime) {
                        console.warn("Token expired, logging out...");
                        logout();
                        setLoading(false);
                        return;
                    }

                    console.log("Initializing auth from stored token, user id:", payload.id);

                    // 1. Immediate sync update from token data
                    const initialUser = {
                        id: payload.id,
                        isAdmin: payload.isAdmin,
                        onboardingComplete: false
                    };
                    setUser(initialUser);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

                    // 2. Fetch fresh profile details from server
                    try {
                        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/me?userId=${payload.id}`);
                        if (res.data) {
                            setUser(res.data);
                            if (res.data.onboardingComplete) setIsNewUser(false);
                        }
                    } catch (fetchErr) {
                        console.error("Profile fetch failed, using token data fallback", fetchErr);
                        // If profiles fetch fails with 401/403 (handled by interceptor below), logout will trigger
                    }
                } catch (err) {
                    console.error("Session verification failed", err);
                    logout();
                }
            } else {
                delete axios.defaults.headers.common['Authorization'];
                setUser(null);
            }
            setLoading(false);
        };

        initAuth();
    }, [token]);

    // Global interceptor for auth errors
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                const message = error.response?.data?.message || "";
                if (error.response?.status === 401 || (error.response?.status === 403 && message.includes("jwt expired"))) {
                    console.error("Global auth error detected, logging out...");
                    logout();
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const login = async (email, password) => {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, { email, password });
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

        // Fetch full profile immediately
        const payload = JSON.parse(atob(res.data.token.split('.')[1]));
        const profileRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/me?userId=${payload.id}`);
        setUser(profileRes.data);
        setIsNewUser(false); // Returning user
    };

    const signup = async (username, email, password, isAdmin = false) => {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/signup`, { username, email, password, isAdmin });
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

        setUser(res.data.user);
        setIsNewUser(true);
        return res.data;
    };

    const firebaseSync = async (firebaseUser) => {
        console.log("Syncing Firebase user with backend:", firebaseUser.email);
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/firebase-sync`, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
        });
        console.log("Backend sync response received, setting token...");
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

        // Fetch full profile immediately
        const payload = JSON.parse(atob(res.data.token.split('.')[1]));
        console.log("Fetching full profile for user:", payload.id);
        const profileRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/me?userId=${payload.id}`);
        console.log("Profile fetched successfully:", profileRes.data.username);
        setUser(profileRes.data);
        setIsNewUser(res.data.isNewUser); // Set based on backend detection
    };

    const refreshUser = async () => {
        const uid = user?.id || user?._id;
        if (uid) {
            console.log("Refreshing user data for:", uid);
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/me?userId=${uid}`);
                console.log("Refreshed user data:", res.data);
                setUser(res.data);
                if (res.data.onboardingComplete) {
                    setIsNewUser(false);
                }
            } catch (err) {
                console.error("Failed to refresh user data:", err);
            }
        } else {
            console.warn("refreshUser called but no user ID found in state", user);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, isNewUser, setIsNewUser, login, signup, firebaseSync, logout, loading, refreshUser }}>
            {loading ? (
                <div className="cinematic-loader">
                    <div className="spinner"></div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', letterSpacing: '2px' }}>DANSTREAM</div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

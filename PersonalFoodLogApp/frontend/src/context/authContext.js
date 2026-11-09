import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken, setUnauthorizedHandler } from '../api/client';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const AuthContext = createContext(null);

/**
 * Keeps the login across app restarts: the token is saved on the device and
 * checked against the server on start-up. If the server can't be reached the
 * saved session is still used, so the app works with a flaky connection.
 */
const AuthProvider = ({ children }) => {
    const [status, setStatus] = useState('loading'); // 'loading' | 'signedOut' | 'signedIn'
    const [user, setUser] = useState(null);

    const clearSession = useCallback(async () => {
        setAuthToken(null);
        setUser(null);
        setStatus('signedOut');
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    }, []);

    useEffect(() => {
        setUnauthorizedHandler(() => { clearSession(); });
        let cancelled = false;
        (async () => {
            const [[, token], [, savedUser]] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
            if (!token) {
                if (!cancelled) setStatus('signedOut');
                return;
            }
            setAuthToken(token);
            try {
                const { user: current } = await api.get('/auth/me');
                if (cancelled) return;
                setUser(current);
                setStatus('signedIn');
                await AsyncStorage.setItem(USER_KEY, JSON.stringify(current));
            } catch (err) {
                if (cancelled) return;
                if (err.status === 401) {
                    await clearSession();
                } else {
                    // Offline: trust the saved session.
                    setUser(savedUser ? JSON.parse(savedUser) : null);
                    setStatus('signedIn');
                }
            }
        })();
        return () => { cancelled = true; };
    }, [clearSession]);

    const login = useCallback(async (email, password) => {
        const { token, user: current } = await api.post('/auth/login', { email, password });
        setAuthToken(token);
        await AsyncStorage.multiSet([[TOKEN_KEY, token], [USER_KEY, JSON.stringify(current)]]);
        setUser(current);
        setStatus('signedIn');
        return current;
    }, []);

    const register = useCallback(async (email, password) => {
        await api.post('/auth/register', { email, password });
        return true;
    }, []);

    const value = useMemo(() => ({
        status,
        user,
        isAuthenticated: status === 'signedIn',
        login,
        register,
        logout: clearSession,
    }), [status, user, login, register, clearSession]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export { AuthProvider, AuthContext };

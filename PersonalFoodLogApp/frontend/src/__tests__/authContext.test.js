import React from 'react';
import { Text } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../context/authContext';

let auth;
const Probe = () => {
    auth = useAuth();
    return <Text>{auth.status}:{auth.user?.email ?? '-'}</Text>;
};
const renderAuth = () => render(<AuthProvider><Probe /></AuthProvider>);

beforeEach(async () => { await AsyncStorage.clear(); });

describe('AuthProvider', () => {
    it('starts signed out without a saved token', async () => {
        const { getByText } = renderAuth();
        await waitFor(() => getByText('signedOut:-'));
    });

    it('restores a saved session after an app restart', async () => {
        await AsyncStorage.multiSet([['token', 't1'], ['user', JSON.stringify({ id: 1, email: 'old@x.co' })]]);
        mockFetchRoutes({ 'GET /auth/me': { body: { user: { id: 1, email: 'me@x.co' } } } });
        const { getByText } = renderAuth();
        await waitFor(() => getByText('signedIn:me@x.co'));
    });

    it('stays signed in with the saved user when offline', async () => {
        await AsyncStorage.multiSet([['token', 't1'], ['user', JSON.stringify({ id: 1, email: 'old@x.co' })]]);
        global.fetch = jest.fn(async () => { throw new TypeError('offline'); });
        const { getByText } = renderAuth();
        await waitFor(() => getByText('signedIn:old@x.co'));
    });

    it('drops an expired session', async () => {
        await AsyncStorage.setItem('token', 'expired');
        mockFetchRoutes({ 'GET /auth/me': { status: 401, body: { message: 'Invalid or expired token' } } });
        const { getByText } = renderAuth();
        await waitFor(() => getByText('signedOut:-'));
        expect(await AsyncStorage.getItem('token')).toBeNull();
    });

    it('logs in, saves the token, and logs out', async () => {
        mockFetchRoutes({ 'POST /auth/login': { body: { token: 'new', user: { id: 2, email: 'a@b.co' } } } });
        const { getByText } = renderAuth();
        await waitFor(() => getByText('signedOut:-'));
        await act(() => auth.login('a@b.co', 'password123'));
        getByText('signedIn:a@b.co');
        expect(await AsyncStorage.getItem('token')).toBe('new');
        await act(() => auth.logout());
        getByText('signedOut:-');
        expect(await AsyncStorage.getItem('token')).toBeNull();
    });
});

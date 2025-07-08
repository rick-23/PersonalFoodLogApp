import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileScreen from '../screens/ProfileScreen';
import { AuthContext } from '../context/authContext';

describe('ProfileScreen', () => {
    const mockLogout = jest.fn();

    const renderWithContext = (user = { email: 'test@example.com' }) =>
        render(
            <AuthContext.Provider value={{ user, logout: mockLogout }}>
                <ProfileScreen />
            </AuthContext.Provider>
        );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user email', () => {
        const { getByText } = renderWithContext();
        expect(getByText('Profile')).toBeTruthy();
        expect(getByText('Email:')).toBeTruthy();
        expect(getByText('test@example.com')).toBeTruthy();
    });

    it('shows "Not available" if user email is missing', () => {
        const { getByText } = renderWithContext({});
        expect(getByText('Not available')).toBeTruthy();
    });

    it('calls logout when logout button is pressed', () => {
        const { getByText } = renderWithContext();
        const logoutButton = getByText('Logout');
        fireEvent.press(logoutButton);
        expect(mockLogout).toHaveBeenCalled();
    });
});
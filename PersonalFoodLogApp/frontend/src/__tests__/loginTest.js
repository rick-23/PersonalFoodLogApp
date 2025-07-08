import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../screens/LoginScreen';
import { AuthProvider } from '../context/authContext';

test('renders login form and handles input', () => {
    const { getByPlaceholderText, getByLabelText } = render(
        <AuthProvider>
            <LoginScreen navigation={{ navigate: jest.fn(), replace: jest.fn() }} />
        </AuthProvider>
    );
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');

    const loginButton = getByLabelText('login-button');
    expect(loginButton).toBeTruthy();
});

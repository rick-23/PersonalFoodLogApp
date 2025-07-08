import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '../screens/RegisterScreen';
import { AuthProvider } from '../context/authContext';

// Mock navigation prop
const navigation = { replace: jest.fn(), navigate: jest.fn() };

const mockRegister = jest.fn(() => Promise.resolve(true));

jest.mock('../context/authContext', () => ({
    useAuth: () => ({
        register: mockRegister,
    }),
}));

describe('RegisterScreen', () => {
    it('renders all input fields and buttons', () => {
        const { getByPlaceholderText, getByLabelText } = render(
            <RegisterScreen navigation={navigation} />
        );
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
        expect(getByLabelText('register-button')).toBeTruthy();
        expect(getByLabelText('go-to-login')).toBeTruthy();
    });

    it('handles input and calls register', async () => {
        const { getByPlaceholderText, getByLabelText } = render(
            <RegisterScreen navigation={navigation} />
        );
        const emailInput = getByPlaceholderText('Email');
        const passwordInput = getByPlaceholderText('Password');
        const confirmPasswordInput = getByPlaceholderText('Confirm Password');
        const registerButton = getByLabelText('register-button');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password123');
        fireEvent.changeText(confirmPasswordInput, 'password123');
        fireEvent.press(registerButton);

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(navigation.replace).toHaveBeenCalledWith('Login');
        });
    });
});
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { AuthContext } from '../context/authContext';

const withAuth = (ui, value) => render(<AuthContext.Provider value={value}>{ui}</AuthContext.Provider>);
const nav = () => ({ navigate: jest.fn(), replace: jest.fn() });

describe('LoginScreen', () => {
    it('logs in with the entered details', async () => {
        const login = jest.fn(async () => ({}));
        const { getByPlaceholderText, getByLabelText } = withAuth(<LoginScreen navigation={nav()} />, { login });
        fireEvent.changeText(getByPlaceholderText('Email'), ' test@example.com ');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.press(getByLabelText('login-button'));
        await waitFor(() => expect(login).toHaveBeenCalledWith('test@example.com', 'password123'));
    });

    it('shows the server error', async () => {
        const login = jest.fn(async () => { throw new Error('Invalid email or password'); });
        const { getByPlaceholderText, getByLabelText, findByText } = withAuth(<LoginScreen navigation={nav()} />, { login });
        fireEvent.changeText(getByPlaceholderText('Email'), 'a@b.co');
        fireEvent.changeText(getByPlaceholderText('Password'), 'wrong');
        fireEvent.press(getByLabelText('login-button'));
        await findByText('Invalid email or password');
    });

    it('goes to Register', () => {
        const navigation = nav();
        const { getByText } = withAuth(<LoginScreen navigation={navigation} />, { login: jest.fn() });
        fireEvent.press(getByText('Create an account'));
        expect(navigation.navigate).toHaveBeenCalledWith('Register');
    });
});

describe('RegisterScreen', () => {
    const fill = (utils, password, confirmPassword) => {
        fireEvent.changeText(utils.getByPlaceholderText('Email'), 'a@b.co');
        fireEvent.changeText(utils.getByPlaceholderText('Password'), password);
        fireEvent.changeText(utils.getByPlaceholderText('Confirm Password'), confirmPassword);
        fireEvent.press(utils.getByLabelText('register-button'));
    };

    it('rejects mismatched passwords before calling the server', async () => {
        const register = jest.fn();
        const utils = withAuth(<RegisterScreen navigation={nav()} />, { register, login: jest.fn() });
        fill(utils, 'password123', 'password124');
        await utils.findByText('Passwords do not match');
        expect(register).not.toHaveBeenCalled();
    });

    it('rejects short passwords', async () => {
        const utils = withAuth(<RegisterScreen navigation={nav()} />, { register: jest.fn(), login: jest.fn() });
        fill(utils, 'short', 'short');
        await utils.findByText('Password must be at least 8 characters');
    });

    it('registers and signs straight in', async () => {
        const register = jest.fn(async () => true);
        const login = jest.fn(async () => ({}));
        const utils = withAuth(<RegisterScreen navigation={nav()} />, { register, login });
        fill(utils, 'password123', 'password123');
        await waitFor(() => expect(login).toHaveBeenCalledWith('a@b.co', 'password123'));
        expect(register).toHaveBeenCalledWith('a@b.co', 'password123');
    });
});

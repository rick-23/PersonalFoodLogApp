import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import UserInfoFormScreen from '../screens/UserInfoFormScreen';

describe('UserInfoFormScreen', () => {
    it('renders all input fields and the Save button', () => {
        const { getByPlaceholderText, getByText } = render(<UserInfoFormScreen />);
        expect(getByPlaceholderText('Enter your name')).toBeTruthy();
        expect(getByPlaceholderText('Enter your age')).toBeTruthy();
        expect(getByPlaceholderText('Enter your height')).toBeTruthy();
        expect(getByPlaceholderText('Enter your weight')).toBeTruthy();
        expect(getByText('Save')).toBeTruthy();
    });

    it('shows validation errors if required fields are empty', async () => {
        const { getByText } = render(<UserInfoFormScreen />);
        fireEvent.press(getByText('Save'));
        await waitFor(() => {
            expect(getByText('Name is required')).toBeTruthy();
            expect(getByText('Age is required')).toBeTruthy();
            expect(getByText('Height is required')).toBeTruthy();
            expect(getByText('Weight is required')).toBeTruthy();
        });
    });

    it('shows validation error for non-numeric age, height, and weight', async () => {
        const { getByPlaceholderText, getByText } = render(<UserInfoFormScreen />);
        fireEvent.changeText(getByPlaceholderText('Enter your name'), 'John');
        fireEvent.changeText(getByPlaceholderText('Enter your age'), 'abc');
        fireEvent.changeText(getByPlaceholderText('Enter your height'), 'xyz');
        fireEvent.changeText(getByPlaceholderText('Enter your weight'), 'foo');
        fireEvent.press(getByText('Save'));
        await waitFor(() => {
            expect(getByText('Age must be a number')).toBeTruthy();
            expect(getByText('Height must be a number')).toBeTruthy();
            expect(getByText('Weight must be a number')).toBeTruthy();
        });
    });

    it('submits form with valid input', async () => {
        const { getByPlaceholderText, getByText, queryByText } = render(<UserInfoFormScreen />);
        fireEvent.changeText(getByPlaceholderText('Enter your name'), 'John');
        fireEvent.changeText(getByPlaceholderText('Enter your age'), '30');
        fireEvent.changeText(getByPlaceholderText('Enter your height'), '180');
        fireEvent.changeText(getByPlaceholderText('Enter your weight'), '75');
        fireEvent.press(getByText('Save'));

        await waitFor(() => {
            expect(queryByText('Name is required')).toBeNull();
            expect(queryByText('Age is required')).toBeNull();
            expect(queryByText('Height is required')).toBeNull();
            expect(queryByText('Weight is required')).toBeNull();
        });
    });
});
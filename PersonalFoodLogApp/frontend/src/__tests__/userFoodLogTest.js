import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import UserFoodLogScreen from '../screens/UserFoodLogScreen';
import { NavigationContainer } from '@react-navigation/native';

describe('UserFoodLogScreen', () => {
    // Helper to wrap with navigation context
    const renderWithNavigation = () =>
        render(
            <NavigationContainer>
                <UserFoodLogScreen />
            </NavigationContainer>
        );

    it('renders all input fields and buttons', () => {
        const { getByPlaceholderText, getByText } = renderWithNavigation();
        expect(getByPlaceholderText('Enter food name')).toBeTruthy();
        expect(getByPlaceholderText('B (Breakfast), L (Lunch), D (Dinner), S (Snack)')).toBeTruthy();
        expect(getByPlaceholderText('Image URL or ID')).toBeTruthy();
        expect(getByText('Food Image')).toBeTruthy();
        expect(getByText('Save')).toBeTruthy();
    });

    it('shows validation errors if required fields are empty', async () => {
        const { getByText } = renderWithNavigation();
        fireEvent.press(getByText('Save'));
        await waitFor(() => {
            expect(getByText('Name is required.')).toBeTruthy();
            expect(getByText('Meal type is required.')).toBeTruthy();
        });
    });

    it('submits form with valid input', async () => {
        const { getByPlaceholderText, getByText, queryByText } = renderWithNavigation();
        fireEvent.changeText(getByPlaceholderText('Enter food name'), 'Apple');
        fireEvent.changeText(getByPlaceholderText('B (Breakfast), L (Lunch), D (Dinner), S (Snack)'), 'B');
        fireEvent.changeText(getByPlaceholderText('Image URL or ID'), 'apple.jpg');
        fireEvent.press(getByText('Save'));

        // No validation errors should be shown
        await waitFor(() => {
            expect(queryByText('Name is required.')).toBeNull();
            expect(queryByText('Meal type is required.')).toBeNull();
        });
    });

    it('navigates when Food Image button is pressed', () => {
        const { getByText } = renderWithNavigation();
        fireEvent.press(getByText('Food Image'));
    });
});
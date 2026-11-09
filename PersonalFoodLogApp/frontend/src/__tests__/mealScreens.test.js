import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AddMealScreen from '../screens/AddMealScreen';
import TodayScreen from '../screens/TodayScreen';
import { FoodLogContext } from '../context/foodLogContext';
import { DEFAULT_REMINDER_SETTINGS } from '../reminders/planReminders';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ navigate: mockNavigate }),
}));

const foodLog = (overrides) => ({
    meals: [], loading: false, error: null, refresh: jest.fn(), addMeal: jest.fn(async () => ({})),
    deleteMeal: jest.fn(), settings: DEFAULT_REMINDER_SETTINGS, updateSettings: jest.fn(), ...overrides,
});
const withFoodLog = (ui, value) => render(
    <NavigationContainer><FoodLogContext.Provider value={value}>{ui}</FoodLogContext.Provider></NavigationContainer>,
);

beforeEach(() => jest.clearAllMocks());

describe('AddMealScreen', () => {
    const navigation = { goBack: jest.fn() };

    it('requires a food name', async () => {
        const value = foodLog();
        const { getByText, findByText } = withFoodLog(<AddMealScreen navigation={navigation} route={{ params: {} }} />, value);
        fireEvent.press(getByText('Save'));
        await findByText('Name is required.');
        expect(value.addMeal).not.toHaveBeenCalled();
    });

    it('saves the meal with the chosen type, calories and photo', async () => {
        const value = foodLog();
        const utils = withFoodLog(<AddMealScreen navigation={navigation} route={{ params: { mealType: 'lunch' } }} />, value);
        fireEvent.changeText(utils.getByPlaceholderText('Enter food name'), ' Paneer wrap ');
        fireEvent.press(utils.getByLabelText('Dinner'));
        fireEvent.changeText(utils.getByPlaceholderText('e.g. 350'), '420');
        fireEvent.press(utils.getByText('📷 Take photo'));
        await utils.findByLabelText('Meal photo');
        fireEvent.press(utils.getByText('Save'));

        await waitFor(() => expect(value.addMeal).toHaveBeenCalled());
        const saved = value.addMeal.mock.calls[0][0];
        expect(saved).toMatchObject({ name: 'Paneer wrap', mealType: 'dinner', calories: 420, notes: null, photoUri: 'file:///camera.jpg' });
        expect(Date.parse(saved.eatenAt)).not.toBeNaN();
        expect(navigation.goBack).toHaveBeenCalled();
    });

    it('preselects the meal from the reminder that opened it', () => {
        const { getByLabelText } = withFoodLog(<AddMealScreen navigation={navigation} route={{ params: { mealType: 'snack' } }} />, foodLog());
        expect(getByLabelText('Snack').props.accessibilityState.selected).toBe(true);
    });

    it('rejects non-numeric calories', async () => {
        const value = foodLog();
        const utils = withFoodLog(<AddMealScreen navigation={navigation} route={{}} />, value);
        fireEvent.changeText(utils.getByPlaceholderText('Enter food name'), 'Tea');
        fireEvent.changeText(utils.getByPlaceholderText('e.g. 350'), 'lots');
        fireEvent.press(utils.getByText('Save'));
        await utils.findByText('Enter a whole number up to 10000.');
        expect(value.addMeal).not.toHaveBeenCalled();
    });

    it('shows a save error', async () => {
        const value = foodLog({ addMeal: jest.fn(async () => { throw new Error("Can't reach the server"); }) });
        const utils = withFoodLog(<AddMealScreen navigation={navigation} route={{}} />, value);
        fireEvent.changeText(utils.getByPlaceholderText('Enter food name'), 'Tea');
        fireEvent.press(utils.getByText('Save'));
        await utils.findByText("Can't reach the server");
    });
});

describe('TodayScreen', () => {
    const meals = [
        { id: 1, name: 'Poha', mealType: 'breakfast', eatenAt: '2026-11-09T03:00:00Z', calories: 250, notes: null, photoUri: null },
        { id: 2, name: 'Dal rice', mealType: 'lunch', eatenAt: '2026-11-09T08:00:00Z', calories: 500, notes: 'home', photoUri: null },
    ];

    it('groups meals by type with a calorie total', () => {
        const { getByText, getAllByText } = withFoodLog(<TodayScreen />, foodLog({ meals }));
        getByText('2 meals logged');
        getByText('750 kcal');
        getByText('Poha');
        getByText('Dal rice');
        expect(getAllByText('Not logged yet')).toHaveLength(2); // dinner + snack
    });

    it('opens Add Meal for a section', () => {
        const { getByLabelText } = withFoodLog(<TodayScreen />, foodLog());
        fireEvent.press(getByLabelText('Add Dinner'));
        expect(mockNavigate).toHaveBeenCalledWith('AddMeal', { mealType: 'dinner' });
    });

    it('suggests turning on reminders until they are on', () => {
        const off = withFoodLog(<TodayScreen />, foodLog());
        off.getByText(/Turn on meal reminders/);
        off.unmount();
        const on = withFoodLog(<TodayScreen />, foodLog({ settings: { ...DEFAULT_REMINDER_SETTINGS, enabled: true } }));
        expect(on.queryByText(/Turn on meal reminders/)).toBeNull();
    });

    it('shows load errors with a retry', () => {
        const value = foodLog({ error: "Can't reach the server" });
        const { getByText } = withFoodLog(<TodayScreen />, value);
        fireEvent.press(getByText('Try again'));
        expect(value.refresh).toHaveBeenCalled();
    });
});

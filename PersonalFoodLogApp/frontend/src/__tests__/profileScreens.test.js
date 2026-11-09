import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import ProfileScreen from '../screens/ProfileScreen';
import PersonalInfoScreen from '../screens/PersonalInfoScreen';
import RemindersScreen from '../screens/RemindersScreen';
import { AuthContext } from '../context/authContext';
import { FoodLogContext } from '../context/foodLogContext';
import { DEFAULT_REMINDER_SETTINGS } from '../reminders/planReminders';

beforeEach(() => jest.clearAllMocks());

describe('ProfileScreen', () => {
    const renderProfile = (user) => {
        const logout = jest.fn();
        const navigation = { navigate: jest.fn() };
        const utils = render(
            <AuthContext.Provider value={{ user, logout }}>
                <ProfileScreen navigation={navigation} />
            </AuthContext.Provider>,
        );
        return { ...utils, logout, navigation };
    };

    it('shows the signed-in email', () => {
        renderProfile({ email: 'test@example.com' }).getByText('test@example.com');
    });

    it('shows "Not available" without an email', () => {
        renderProfile({}).getByText('Not available');
    });

    it('logs out and links to settings', () => {
        const { getByText, logout, navigation } = renderProfile({ email: 'a@b.co' });
        fireEvent.press(getByText('Logout'));
        expect(logout).toHaveBeenCalled();
        fireEvent.press(getByText('Edit personal info'));
        expect(navigation.navigate).toHaveBeenCalledWith('PersonalInfo');
    });
});

describe('PersonalInfoScreen', () => {
    it('loads the saved profile and saves changes', async () => {
        const fetch = mockFetchRoutes({
            'GET /profile': { body: { profile: { name: 'Rick', age: 34, heightCm: 178.5, weightKg: 72 } } },
            'PUT /profile': (url, init) => ({ body: { profile: JSON.parse(init.body) } }),
        });
        const navigation = { goBack: jest.fn() };
        const utils = render(<PersonalInfoScreen navigation={navigation} />);
        await utils.findByDisplayValue('Rick');
        utils.getByDisplayValue('178.5');
        fireEvent.changeText(utils.getByPlaceholderText('Enter your weight'), '70.5');
        fireEvent.press(utils.getByText('Save'));
        await waitFor(() => expect(navigation.goBack).toHaveBeenCalled());
        const put = fetch.mock.calls.find(([, init]) => init.method === 'PUT');
        expect(JSON.parse(put[1].body)).toEqual({ name: 'Rick', age: 34, heightCm: 178.5, weightKg: 70.5 });
    });

    it('validates the numbers', async () => {
        mockFetchRoutes({ 'GET /profile': { body: { profile: null } } });
        const utils = render(<PersonalInfoScreen navigation={{ goBack: jest.fn() }} />);
        await utils.findByPlaceholderText('Enter your name');
        fireEvent.changeText(utils.getByPlaceholderText('Enter your name'), 'John');
        fireEvent.changeText(utils.getByPlaceholderText('Enter your age'), 'abc');
        fireEvent.changeText(utils.getByPlaceholderText('Enter your height'), '180');
        fireEvent.changeText(utils.getByPlaceholderText('Enter your weight'), '75');
        fireEvent.press(utils.getByText('Save'));
        await utils.findByText('Age must be a whole number (1–130)');
    });
});

describe('RemindersScreen', () => {
    const renderReminders = (settings) => {
        const updateSettings = jest.fn();
        const utils = render(
            <FoodLogContext.Provider value={{ settings, updateSettings }}>
                <RemindersScreen />
            </FoodLogContext.Provider>,
        );
        return { ...utils, updateSettings };
    };

    it('asks for permission and turns reminders on', async () => {
        Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'undetermined' });
        const { getByLabelText, updateSettings } = renderReminders(DEFAULT_REMINDER_SETTINGS);
        await waitFor(() => expect(Notifications.getPermissionsAsync).toHaveBeenCalled());
        fireEvent(getByLabelText('Meal reminders'), 'valueChange', true);
        await waitFor(() => expect(updateSettings).toHaveBeenCalledWith({ ...DEFAULT_REMINDER_SETTINGS, enabled: true }));
        expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('adjusts a meal time in 15 minute steps', async () => {
        const settings = { ...DEFAULT_REMINDER_SETTINGS, enabled: true };
        const { findByLabelText, getByLabelText, updateSettings } = renderReminders(settings);
        await findByLabelText('Lunch time');
        fireEvent.press(getByLabelText('Lunch later'));
        expect(updateSettings.mock.calls[0][0].meals.lunch.time).toBe('13:15');
        fireEvent(getByLabelText('Snack reminder'), 'valueChange', true);
        expect(updateSettings.mock.calls[1][0].meals.snack.enabled).toBe(true);
    });

    it('explains how to unblock notifications', async () => {
        Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
        const { findByText } = renderReminders({ ...DEFAULT_REMINDER_SETTINGS, enabled: true });
        await findByText('Notifications are blocked for this app.');
    });
});

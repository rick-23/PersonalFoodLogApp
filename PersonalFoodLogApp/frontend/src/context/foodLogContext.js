import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { api } from '../api/client';
import { dayRange, localDateKey } from '../utils/meals';
import { DEFAULT_REMINDER_SETTINGS } from '../reminders/planReminders';
import { syncReminders } from '../reminders/notifications';

const SETTINGS_KEY = 'reminderSettings';
const FoodLogContext = createContext(null);

/** Today's meals and the meal reminder settings, kept in sync with scheduled notifications. */
export const FoodLogProvider = ({ children }) => {
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [day, setDay] = useState(() => localDateKey(new Date()));
    const [settings, setSettings] = useState(null);

    const refresh = useCallback(async () => {
        const now = new Date();
        setDay(localDateKey(now));
        const { from, to } = dayRange(now);
        try {
            const data = await api.get('/meals', { from: from.toISOString(), to: to.toISOString() });
            setMeals(data.meals);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load settings and today's meals; reload when the app comes back to the foreground
    // (it may be a new day by then).
    useEffect(() => {
        AsyncStorage.getItem(SETTINGS_KEY)
            .then((raw) => setSettings(raw ? { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(raw) } : DEFAULT_REMINDER_SETTINGS))
            .catch(() => setSettings(DEFAULT_REMINDER_SETTINGS));
        refresh();
        const sub = AppState.addEventListener('change', (state) => { if (state === 'active') refresh(); });
        return () => sub.remove();
    }, [refresh]);

    // Re-plan reminders whenever meals or settings change.
    const loggedTypes = useMemo(() => [...new Set(meals.map((m) => m.mealType))].sort().join(','), [meals]);
    useEffect(() => {
        if (!settings || loading) return;
        syncReminders(settings, loggedTypes ? loggedTypes.split(',') : []).catch((err) => console.warn('Reminder sync failed', err));
    }, [settings, loggedTypes, loading, day]);

    const addMeal = useCallback(async (meal) => {
        const { meal: saved } = await api.post('/meals', meal);
        await refresh();
        return saved;
    }, [refresh]);

    const deleteMeal = useCallback(async (id) => {
        await api.delete(`/meals/${id}`);
        setMeals((current) => current.filter((m) => m.id !== id));
    }, []);

    const updateSettings = useCallback(async (next) => {
        setSettings(next);
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    }, []);

    const value = useMemo(() => ({
        meals, loading, error, refresh, addMeal, deleteMeal, settings, updateSettings,
    }), [meals, loading, error, refresh, addMeal, deleteMeal, settings, updateSettings]);

    return <FoodLogContext.Provider value={value}>{children}</FoodLogContext.Provider>;
};

export const useFoodLog = () => useContext(FoodLogContext);
export { FoodLogContext };

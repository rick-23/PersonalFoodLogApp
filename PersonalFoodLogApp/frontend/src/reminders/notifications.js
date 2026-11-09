import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { mealLabel, MEAL_TYPES } from '../utils/meals';
import { planReminders } from './planReminders';

export const REMINDER_KIND = 'meal-reminder';
export const remindersSupported = Platform.OS !== 'web';

// Show reminders even while the app is open.
if (remindersSupported) {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
}

const ensureAndroidChannel = async () => {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('meal-reminders', {
            name: 'Meal reminders',
            importance: Notifications.AndroidImportance.HIGH,
        });
    }
};

/** 'granted' | 'denied' | 'undetermined' */
export const getPermissionStatus = async () => {
    if (!remindersSupported) return 'denied';
    const { status } = await Notifications.getPermissionsAsync();
    return status;
};

export const requestPermission = async () => {
    if (!remindersSupported) return 'denied';
    await ensureAndroidChannel();
    const { status } = await Notifications.requestPermissionsAsync();
    return status;
};

const contentFor = (mealType) => {
    const emoji = MEAL_TYPES.find((m) => m.key === mealType)?.emoji ?? '🍽️';
    return {
        title: `${emoji} Time to log ${mealLabel(mealType).toLowerCase()}`,
        body: 'Tap to add what you had.',
        data: { kind: REMINDER_KIND, mealType },
    };
};

/** Replace all scheduled meal reminders with the current plan. Returns how many were scheduled. */
export const syncReminders = async (settings, loggedTodayTypes) => {
    if (!remindersSupported) return 0;
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(scheduled
        .filter((n) => n.content?.data?.kind === REMINDER_KIND)
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));

    if (!settings.enabled || (await getPermissionStatus()) !== 'granted') return 0;
    await ensureAndroidChannel();
    const plan = planReminders(settings, loggedTodayTypes);
    for (const item of plan) {
        await Notifications.scheduleNotificationAsync({
            identifier: item.id,
            content: contentFor(item.mealType),
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: item.date, channelId: 'meal-reminders' },
        });
    }
    return plan.length;
};

export const sendTestReminder = async () => {
    await Notifications.scheduleNotificationAsync({
        content: contentFor('lunch'),
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, channelId: 'meal-reminders' },
    });
};

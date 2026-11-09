import * as Notifications from 'expo-notifications';
import { syncReminders } from '../reminders/notifications';
import { DEFAULT_REMINDER_SETTINGS } from '../reminders/planReminders';

beforeEach(() => jest.clearAllMocks());

describe('syncReminders', () => {
    it('replaces only meal reminders with the current plan', async () => {
        Notifications.getAllScheduledNotificationsAsync.mockResolvedValueOnce([
            { identifier: 'old', content: { data: { kind: 'meal-reminder' } } },
            { identifier: 'other', content: { data: { kind: 'something-else' } } },
        ]);
        const count = await syncReminders({ ...DEFAULT_REMINDER_SETTINGS, enabled: true }, []);
        expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
        expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old');
        expect(count).toBeGreaterThan(0);
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(count);
        const first = Notifications.scheduleNotificationAsync.mock.calls[0][0];
        expect(first.content.data.kind).toBe('meal-reminder');
        expect(first.trigger.type).toBe('date');
    });

    it('only cancels when reminders are off', async () => {
        expect(await syncReminders(DEFAULT_REMINDER_SETTINGS, [])).toBe(0);
        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it("doesn't schedule without permission", async () => {
        Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
        expect(await syncReminders({ ...DEFAULT_REMINDER_SETTINGS, enabled: true }, [])).toBe(0);
    });
});

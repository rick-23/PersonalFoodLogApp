import { MEAL_TYPES, localDateKey } from '../utils/meals';

export const DEFAULT_REMINDER_SETTINGS = {
    enabled: false,
    meals: {
        breakfast: { enabled: true, time: '08:30' },
        lunch: { enabled: true, time: '13:00' },
        dinner: { enabled: true, time: '19:30' },
        snack: { enabled: false, time: '16:30' },
    },
};

/**
 * Which meal reminders to schedule for the next `days` days.
 * Today's reminder for a meal that's already been logged is skipped, as are times
 * that have passed. (Phones can't conditionally skip a repeating notification, so
 * we schedule individual dated ones and re-plan whenever meals or settings change.)
 */
export const planReminders = (settings, loggedTodayTypes, now = new Date(), days = 7) => {
    if (!settings?.enabled) return [];
    const logged = new Set(loggedTodayTypes);
    const plan = [];
    for (let offset = 0; offset < days; offset += 1) {
        for (const { key } of MEAL_TYPES) {
            const meal = settings.meals?.[key];
            if (!meal?.enabled) continue;
            if (offset === 0 && logged.has(key)) continue;
            const [h, m] = meal.time.split(':').map(Number);
            const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, h, m);
            if (date <= now) continue;
            plan.push({ id: `meal-${key}-${localDateKey(date)}`, mealType: key, date });
        }
    }
    return plan.sort((a, b) => a.date - b.date);
};

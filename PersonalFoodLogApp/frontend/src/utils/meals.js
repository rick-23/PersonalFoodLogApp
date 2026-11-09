export const MEAL_TYPES = [
    { key: 'breakfast', label: 'Breakfast', emoji: '🍳' },
    { key: 'lunch', label: 'Lunch', emoji: '🥗' },
    { key: 'dinner', label: 'Dinner', emoji: '🍲' },
    { key: 'snack', label: 'Snack', emoji: '🍎' },
];

export const mealLabel = (key) => MEAL_TYPES.find((m) => m.key === key)?.label ?? key;

/** A sensible meal type for the current time of day. */
export const defaultMealType = (now = new Date()) => {
    const h = now.getHours();
    if (h >= 5 && h < 11) return 'breakfast';
    if (h >= 11 && h < 16) return 'lunch';
    if (h >= 18 && h < 23) return 'dinner';
    return 'snack';
};

/** Start (inclusive) and end (exclusive) of the local day containing `date`. */
export const dayRange = (date = new Date()) => {
    const from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    return { from, to };
};

const pad = (n) => String(n).padStart(2, '0');
export const formatClock = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;
export const localDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Shift an "HH:MM" time by `minutes`, wrapping around midnight. */
export const shiftTime = (hhmm, minutes) => {
    const [h, m] = hhmm.split(':').map(Number);
    const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440;
    return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
};

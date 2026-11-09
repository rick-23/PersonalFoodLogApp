import { DEFAULT_REMINDER_SETTINGS, planReminders } from '../reminders/planReminders';

const on = { ...DEFAULT_REMINDER_SETTINGS, enabled: true };
const at = (s) => new Date(s); // local time

describe('planReminders', () => {
    it('plans nothing when reminders are off', () => {
        expect(planReminders(DEFAULT_REMINDER_SETTINGS, [], at('2026-11-09T07:00'))).toEqual([]);
    });

    it('plans the enabled meals for each of the next days, in order', () => {
        const plan = planReminders(on, [], at('2026-11-09T07:00'), 2);
        expect(plan.map((p) => p.id)).toEqual([
            'meal-breakfast-2026-11-09', 'meal-lunch-2026-11-09', 'meal-dinner-2026-11-09',
            'meal-breakfast-2026-11-10', 'meal-lunch-2026-11-10', 'meal-dinner-2026-11-10',
        ]);
        expect(plan[0].date).toEqual(at('2026-11-09T08:30'));
    });

    it("skips today's meals that are already logged, but not tomorrow's", () => {
        const plan = planReminders(on, ['breakfast', 'lunch'], at('2026-11-09T07:00'), 2);
        expect(plan.map((p) => p.id)).toEqual([
            'meal-dinner-2026-11-09',
            'meal-breakfast-2026-11-10', 'meal-lunch-2026-11-10', 'meal-dinner-2026-11-10',
        ]);
    });

    it('skips times that already passed today', () => {
        const plan = planReminders(on, [], at('2026-11-09T14:00'), 1);
        expect(plan.map((p) => p.mealType)).toEqual(['dinner']);
    });

    it('respects per-meal switches and custom times', () => {
        const settings = { ...on, meals: { ...on.meals, lunch: { enabled: false, time: '13:00' }, snack: { enabled: true, time: '16:45' } } };
        const plan = planReminders(settings, [], at('2026-11-09T12:00'), 1);
        expect(plan.map((p) => [p.mealType, p.date.getHours(), p.date.getMinutes()])).toEqual([['snack', 16, 45], ['dinner', 19, 30]]);
    });

    it('stays well under the iOS limit of 64 scheduled notifications', () => {
        const all = { enabled: true, meals: Object.fromEntries(Object.entries(on.meals).map(([k, v]) => [k, { ...v, enabled: true }])) };
        expect(planReminders(all, [], at('2026-11-09T00:00')).length).toBeLessThanOrEqual(28);
    });
});

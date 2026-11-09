import { dayRange, defaultMealType, shiftTime } from '../utils/meals';

describe('meal utils', () => {
    it('picks a meal type from the time of day', () => {
        expect(defaultMealType(new Date('2026-11-09T08:00'))).toBe('breakfast');
        expect(defaultMealType(new Date('2026-11-09T13:00'))).toBe('lunch');
        expect(defaultMealType(new Date('2026-11-09T16:30'))).toBe('snack');
        expect(defaultMealType(new Date('2026-11-09T20:00'))).toBe('dinner');
    });

    it('builds local day boundaries', () => {
        const { from, to } = dayRange(new Date('2026-11-09T15:20'));
        expect(from).toEqual(new Date('2026-11-09T00:00'));
        expect(to).toEqual(new Date('2026-11-10T00:00'));
    });

    it('shifts times and wraps around midnight', () => {
        expect(shiftTime('08:30', 15)).toBe('08:45');
        expect(shiftTime('00:10', -15)).toBe('23:55');
        expect(shiftTime('23:50', 15)).toBe('00:05');
    });
});

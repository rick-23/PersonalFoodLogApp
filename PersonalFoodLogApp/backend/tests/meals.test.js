const { describeDb, useDatabase } = require('./setup');
const request = require('supertest');
const app = require('../app');

const signUp = async (email) => {
    await request(app).post('/api/auth/register').send({ email, password: 'password123' });
    const { body } = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
    return { Authorization: `Bearer ${body.token}` };
};

describeDb('meals', () => {
    useDatabase();
    let auth;
    beforeEach(async () => { auth = await signUp('me@example.com'); });

    const create = (meal, headers = auth) => request(app).post('/api/meals').set(headers).send(meal);

    it('requires login', async () => {
        await request(app).get('/api/meals').expect(401);
    });

    it('creates a meal with defaults', async () => {
        const res = await create({ name: 'Oats', mealType: 'breakfast' }).expect(201);
        expect(res.body.meal).toMatchObject({ id: 1, name: 'Oats', mealType: 'breakfast', calories: null, notes: null, photoUri: null });
        expect(Date.parse(res.body.meal.eatenAt)).not.toBeNaN();
    });

    it.each([
        [{ mealType: 'lunch' }, /name is required/],
        [{ name: 'X', mealType: 'brunch' }, /mealType/],
        [{ name: 'X', mealType: 'lunch', calories: -1 }, /calories/],
        [{ name: 'X', mealType: 'lunch', eatenAt: 'yesterday' }, /eatenAt/],
    ])('validates %j', async (meal, message) => {
        const res = await create(meal).expect(400);
        expect(res.body.message).toMatch(message);
    });

    it('lists meals in a time range, newest first', async () => {
        await create({ name: 'Old', mealType: 'dinner', eatenAt: '2026-11-08T19:00:00Z' });
        await create({ name: 'Breakfast', mealType: 'breakfast', eatenAt: '2026-11-09T03:00:00Z' });
        await create({ name: 'Lunch', mealType: 'lunch', eatenAt: '2026-11-09T08:00:00Z' });
        const res = await request(app).get('/api/meals')
            .query({ from: '2026-11-08T18:30:00Z', to: '2026-11-09T18:30:00Z' }).set(auth).expect(200);
        expect(res.body.meals.map((m) => m.name)).toEqual(['Lunch', 'Breakfast', 'Old']);

        const narrower = await request(app).get('/api/meals')
            .query({ from: '2026-11-09T00:00:00Z', to: '2026-11-10T00:00:00Z' }).set(auth);
        expect(narrower.body.meals.map((m) => m.name)).toEqual(['Lunch', 'Breakfast']);
    });

    it('updates only the fields sent', async () => {
        await create({ name: 'Rice', mealType: 'lunch', calories: 300 });
        const res = await request(app).patch('/api/meals/1').set(auth).send({ calories: 450 }).expect(200);
        expect(res.body.meal).toMatchObject({ name: 'Rice', mealType: 'lunch', calories: 450 });
    });

    it('deletes a meal', async () => {
        await create({ name: 'Rice', mealType: 'lunch' });
        await request(app).delete('/api/meals/1').set(auth).expect(204);
        expect((await request(app).get('/api/meals').set(auth)).body.meals).toEqual([]);
    });

    it("never exposes or changes another user's meals", async () => {
        await create({ name: 'Mine', mealType: 'lunch' });
        const other = await signUp('other@example.com');
        expect((await request(app).get('/api/meals').set(other)).body.meals).toEqual([]);
        await request(app).patch('/api/meals/1').set(other).send({ name: 'Hacked' }).expect(404);
        await request(app).delete('/api/meals/1').set(other).expect(404);
        expect((await request(app).get('/api/meals').set(auth)).body.meals[0].name).toBe('Mine');
    });
});

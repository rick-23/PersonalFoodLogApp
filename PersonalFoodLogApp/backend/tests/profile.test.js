const { describeDb, useDatabase } = require('./setup');
const request = require('supertest');
const app = require('../app');

const signUp = async (email) => {
    await request(app).post('/api/auth/register').send({ email, password: 'password123' });
    const { body } = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
    return { Authorization: `Bearer ${body.token}` };
};

describeDb('profile', () => {
    useDatabase();
    let auth;
    beforeEach(async () => { auth = await signUp('me@example.com'); });

    it('is empty until saved, then round-trips', async () => {
        expect((await request(app).get('/api/profile').set(auth)).body.profile).toBeNull();
        const saved = await request(app).put('/api/profile').set(auth)
            .send({ name: 'Rick', age: '34', heightCm: 178.5, weightKg: '72' }).expect(200);
        expect(saved.body.profile).toMatchObject({ name: 'Rick', age: 34, heightCm: 178.5, weightKg: 72 });
        expect((await request(app).get('/api/profile').set(auth)).body.profile.name).toBe('Rick');
    });

    it('validates ranges', async () => {
        const res = await request(app).put('/api/profile').set(auth).send({ age: 500 }).expect(400);
        expect(res.body.message).toMatch(/age/);
    });
});

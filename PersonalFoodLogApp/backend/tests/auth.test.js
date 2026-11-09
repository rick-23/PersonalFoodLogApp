const { describeDb, useDatabase } = require('./setup');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');

describeDb('auth', () => {
    useDatabase();

    const register = (body) => request(app).post('/api/auth/register').send(body);

    it('registers, logs in and returns the current user', async () => {
        await register({ email: 'Me@Example.com ', password: 'password123' }).expect(201);
        const login = await request(app).post('/api/auth/login').send({ email: 'me@example.com', password: 'password123' }).expect(200);
        expect(login.body.user).toEqual({ id: 1, email: 'me@example.com' });

        const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.token}`).expect(200);
        expect(me.body.user.email).toBe('me@example.com');
    });

    it('issues tokens that last 30 days by default', async () => {
        await register({ email: 'a@b.co', password: 'password123' });
        const { body } = await request(app).post('/api/auth/login').send({ email: 'a@b.co', password: 'password123' });
        const { iat, exp } = jwt.decode(body.token);
        expect(exp - iat).toBe(30 * 24 * 60 * 60);
    });

    it('rejects a duplicate email with 409 instead of crashing', async () => {
        await register({ email: 'a@b.co', password: 'password123' }).expect(201);
        const res = await register({ email: 'A@B.co', password: 'password123' }).expect(409);
        expect(res.body.message).toMatch(/already exists/);
    });

    it.each([
        [{ email: 'not-an-email', password: 'password123' }, /valid email/],
        [{ email: 'a@b.co', password: 'short' }, /at least 8/],
        [{}, /valid email/],
    ])('validates registration %j', async (body, message) => {
        const res = await register(body).expect(400);
        expect(res.body.message).toMatch(message);
    });

    it('rejects a wrong password', async () => {
        await register({ email: 'a@b.co', password: 'password123' });
        await request(app).post('/api/auth/login').send({ email: 'a@b.co', password: 'wrong-password' }).expect(401);
    });

    it('rejects missing or bad tokens', async () => {
        await request(app).get('/api/auth/me').expect(401);
        await request(app).get('/api/auth/me').set('Authorization', 'Bearer nope').expect(401);
    });
});

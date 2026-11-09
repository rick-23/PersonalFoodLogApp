import { ApiError, api, setAuthToken, setUnauthorizedHandler } from '../api/client';
import { API_URL } from '../config/apiConfig';

afterEach(() => { setAuthToken(null); setUnauthorizedHandler(null); });

describe('api client', () => {
    it('defaults to the dev machine that served the app', () => {
        expect(API_URL).toBe('http://192.168.1.20:3001/api');
    });

    it('sends JSON with the saved token', async () => {
        const fetch = mockFetchRoutes({ 'POST /meals': { status: 201, body: { meal: { id: 1 } } } });
        setAuthToken('abc');
        await expect(api.post('/meals', { name: 'Oats' })).resolves.toEqual({ meal: { id: 1 } });
        const [, init] = fetch.mock.calls[0];
        expect(init.headers.Authorization).toBe('Bearer abc');
        expect(JSON.parse(init.body)).toEqual({ name: 'Oats' });
    });

    it('encodes query parameters', async () => {
        const fetch = mockFetchRoutes({ 'GET /meals': { body: { meals: [] } } });
        await api.get('/meals', { from: '2026-11-09T00:00:00.000Z', to: undefined });
        expect(fetch.mock.calls[0][0]).toBe(`${API_URL}/meals?from=2026-11-09T00%3A00%3A00.000Z`);
    });

    it("throws the server's message", async () => {
        mockFetchRoutes({ 'POST /auth/register': { status: 409, body: { message: 'An account with this email already exists' } } });
        await expect(api.post('/auth/register', {})).rejects.toEqual(new ApiError('An account with this email already exists', 409));
    });

    it('signs out when the server rejects the saved login', async () => {
        mockFetchRoutes({ 'GET /meals': { status: 401, body: { message: 'Invalid or expired token' } } });
        const handler = jest.fn();
        setUnauthorizedHandler(handler);
        setAuthToken('expired');
        await expect(api.get('/meals')).rejects.toMatchObject({ status: 401 });
        expect(handler).toHaveBeenCalled();
    });

    it('explains network failures', async () => {
        global.fetch = jest.fn(async () => { throw new TypeError('Network request failed'); });
        await expect(api.get('/meals')).rejects.toThrow(/Can't reach the server/);
    });
});

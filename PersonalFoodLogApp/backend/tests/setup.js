// Shared test setup: points the app at TEST_DATABASE_URL and resets tables between tests.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const hasDb = Boolean(process.env.TEST_DATABASE_URL);
if (!hasDb && process.env.CI) {
    throw new Error('TEST_DATABASE_URL must be set in CI');
}
if (hasDb) process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

const describeDb = hasDb ? describe : describe.skip;

const useDatabase = () => {
    const pool = require('../db');
    const migrate = require('../db/migrate');
    beforeAll(() => migrate(pool));
    beforeEach(() => pool.query('TRUNCATE users, profiles, meals RESTART IDENTITY CASCADE'));
    afterAll(() => pool.end());
    return pool;
};

module.exports = { describeDb, useDatabase };

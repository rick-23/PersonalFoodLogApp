const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const { HttpError, asyncHandler } = require('../lib/http');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const readCredentials = (body = {}) => {
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    return { email, password };
};

const issueToken = (userId) =>
    jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

router.post('/register', asyncHandler(async (req, res) => {
    const { email, password } = readCredentials(req.body);
    if (!EMAIL_RE.test(email)) throw new HttpError(400, 'Please enter a valid email address');
    if (password.length < MIN_PASSWORD_LENGTH) {
        throw new HttpError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }

    const hash = await bcrypt.hash(password, 10);
    try {
        await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hash]);
    } catch (err) {
        if (err.code === '23505') throw new HttpError(409, 'An account with this email already exists');
        throw err;
    }
    res.status(201).json({ message: 'User registered' });
}));

router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = readCredentials(req.body);
    const { rows } = await pool.query('SELECT id, email, password FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new HttpError(401, 'Invalid email or password');
    }
    res.json({ token: issueToken(user.id), user: { id: user.id, email: user.email } });
}));

router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
    const { rows } = await pool.query('SELECT id, email FROM users WHERE id = $1', [req.userId]);
    if (!rows.length) throw new HttpError(401, 'Account no longer exists');
    res.json({ user: rows[0] });
}));

module.exports = router;

const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const { HttpError, asyncHandler } = require('../lib/http');

const router = express.Router();
router.use(authenticateToken);

const COLUMNS = 'name, age, height_cm::float AS "heightCm", weight_kg::float AS "weightKg", updated_at AS "updatedAt"';

const RANGES = {
    age: [1, 130, 'age', true],
    heightCm: [30, 300, 'height_cm', false],
    weightKg: [2, 500, 'weight_kg', false],
};

router.get('/', asyncHandler(async (req, res) => {
    const { rows } = await pool.query(`SELECT ${COLUMNS} FROM profiles WHERE user_id = $1`, [req.userId]);
    res.json({ profile: rows[0] || null });
}));

router.put('/', asyncHandler(async (req, res) => {
    const body = req.body || {};
    const values = { name: null, age: null, height_cm: null, weight_kg: null };

    if (body.name !== undefined && body.name !== null) {
        if (typeof body.name !== 'string' || body.name.length > 100) throw new HttpError(400, 'name must be text');
        values.name = body.name.trim() || null;
    }
    for (const [key, [min, max, column, integer]] of Object.entries(RANGES)) {
        const v = body[key];
        if (v === undefined || v === null || v === '') continue;
        const n = Number(v);
        if (!Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n))) {
            throw new HttpError(400, `${key} must be a number between ${min} and ${max}`);
        }
        values[column] = n;
    }

    const { rows } = await pool.query(
        `INSERT INTO profiles (user_id, name, age, height_cm, weight_kg, updated_at)
         VALUES ($1, $2, $3, $4, $5, now())
         ON CONFLICT (user_id) DO UPDATE SET
           name = EXCLUDED.name, age = EXCLUDED.age, height_cm = EXCLUDED.height_cm,
           weight_kg = EXCLUDED.weight_kg, updated_at = now()
         RETURNING ${COLUMNS}`,
        [req.userId, values.name, values.age, values.height_cm, values.weight_kg],
    );
    res.json({ profile: rows[0] });
}));

module.exports = router;

const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const { HttpError, asyncHandler } = require('../lib/http');

const router = express.Router();
router.use(authenticateToken);

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const COLUMNS = 'id, name, meal_type AS "mealType", eaten_at AS "eatenAt", calories, notes, photo_uri AS "photoUri", created_at AS "createdAt"';

const isValidDate = (v) => typeof v === 'string' && !Number.isNaN(Date.parse(v));

/** Validate a meal body. With `partial`, only the fields present are checked. */
const parseMeal = (body = {}, { partial }) => {
    const has = (k) => Object.prototype.hasOwnProperty.call(body, k);
    const meal = {};

    if (has('name') || !partial) {
        if (typeof body.name !== 'string' || !body.name.trim()) throw new HttpError(400, 'Food name is required');
        if (body.name.length > 200) throw new HttpError(400, 'Food name is too long');
        meal.name = body.name.trim();
    }
    if (has('mealType') || !partial) {
        if (!MEAL_TYPES.includes(body.mealType)) {
            throw new HttpError(400, `mealType must be one of: ${MEAL_TYPES.join(', ')}`);
        }
        meal.meal_type = body.mealType;
    }
    if (has('eatenAt') && body.eatenAt !== null) {
        if (!isValidDate(body.eatenAt)) throw new HttpError(400, 'eatenAt must be a date-time');
        meal.eaten_at = new Date(body.eatenAt).toISOString();
    }
    if (has('calories')) {
        const c = body.calories;
        if (c !== null && c !== '' && !(Number.isInteger(Number(c)) && Number(c) >= 0 && Number(c) <= 10000)) {
            throw new HttpError(400, 'calories must be a whole number between 0 and 10000');
        }
        meal.calories = c === null || c === '' ? null : Number(c);
    }
    for (const [key, column, max] of [['notes', 'notes', 2000], ['photoUri', 'photo_uri', 2000]]) {
        if (has(key)) {
            if (body[key] !== null && typeof body[key] !== 'string') throw new HttpError(400, `${key} must be text`);
            if (body[key] && body[key].length > max) throw new HttpError(400, `${key} is too long`);
            meal[column] = body[key] || null;
        }
    }
    return meal;
};

// GET /api/meals?from=<ISO>&to=<ISO> — meals in a time range (the client sends its own
// local day boundaries), newest first. Without a range, the 50 most recent meals.
router.get('/', asyncHandler(async (req, res) => {
    const { from, to } = req.query;
    if ((from && !isValidDate(from)) || (to && !isValidDate(to))) {
        throw new HttpError(400, 'from and to must be date-times');
    }
    const params = [req.userId];
    let where = 'user_id = $1';
    if (from) { params.push(from); where += ` AND eaten_at >= $${params.length}`; }
    if (to) { params.push(to); where += ` AND eaten_at < $${params.length}`; }
    const limit = from || to ? 500 : 50;
    const { rows } = await pool.query(
        `SELECT ${COLUMNS} FROM meals WHERE ${where} ORDER BY eaten_at DESC LIMIT ${limit}`,
        params,
    );
    res.json({ meals: rows });
}));

router.post('/', asyncHandler(async (req, res) => {
    const meal = parseMeal(req.body, { partial: false });
    const columns = ['user_id', ...Object.keys(meal)];
    const values = [req.userId, ...Object.values(meal)];
    const { rows } = await pool.query(
        `INSERT INTO meals (${columns.join(', ')}) VALUES (${values.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING ${COLUMNS}`,
        values,
    );
    res.status(201).json({ meal: rows[0] });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
    const meal = parseMeal(req.body, { partial: true });
    const entries = Object.entries(meal);
    if (!entries.length) throw new HttpError(400, 'Nothing to update');
    const sets = entries.map(([col], i) => `${col} = $${i + 3}`).join(', ');
    const { rows } = await pool.query(
        `UPDATE meals SET ${sets} WHERE id = $1 AND user_id = $2 RETURNING ${COLUMNS}`,
        [Number(req.params.id) || 0, req.userId, ...entries.map(([, v]) => v)],
    );
    if (!rows.length) throw new HttpError(404, 'Meal not found');
    res.json({ meal: rows[0] });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    const { rowCount } = await pool.query('DELETE FROM meals WHERE id = $1 AND user_id = $2', [
        Number(req.params.id) || 0,
        req.userId,
    ]);
    if (!rowCount) throw new HttpError(404, 'Meal not found');
    res.status(204).send();
}));

module.exports = router;

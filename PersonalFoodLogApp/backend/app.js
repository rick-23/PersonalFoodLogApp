const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const mealRoutes = require('./routes/meals');
const profileRoutes = require('./routes/profile');
const { errorHandler } = require('./lib/http');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/profile', profileRoutes);

app.use((req, res) => res.status(404).json({ message: 'Not found' }));
app.use(errorHandler);

module.exports = app;

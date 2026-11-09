require('dotenv').config();

for (const name of ['DATABASE_URL', 'JWT_SECRET']) {
    if (!process.env[name]) {
        console.error(`Missing ${name}. Copy .env.example to .env and fill it in.`);
        process.exit(1);
    }
}

const app = require('./app');

const PORT = process.env.PORT || 3001;
// Listen on all interfaces so a phone on the same Wi-Fi can reach the API.
app.listen(PORT, '0.0.0.0', () => console.log(`Backend running on port ${PORT}`));

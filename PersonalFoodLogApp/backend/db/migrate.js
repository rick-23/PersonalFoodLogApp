// Creates or updates the database tables. Usage: npm run migrate
const fs = require('fs');
const path = require('path');

const migrate = async (pool) => {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
};

if (require.main === module) {
    require('dotenv').config();
    const pool = require('./index');
    migrate(pool)
        .then(() => console.log('Database is up to date'))
        .catch((err) => {
            console.error('Migration failed:', err.message);
            process.exitCode = 1;
        })
        .finally(() => pool.end());
}

module.exports = migrate;

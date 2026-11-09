-- Personal Food Log schema. Safe to run repeatedly (npm run migrate).

CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    email       TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
    user_id     INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT,
    age         INTEGER CHECK (age BETWEEN 1 AND 130),
    height_cm   NUMERIC(5, 1) CHECK (height_cm BETWEEN 30 AND 300),
    weight_kg   NUMERIC(5, 1) CHECK (weight_kg BETWEEN 2 AND 500),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meals (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    meal_type   TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    eaten_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    calories    INTEGER CHECK (calories BETWEEN 0 AND 10000),
    notes       TEXT,
    photo_uri   TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meals_user_eaten_at_idx ON meals (user_id, eaten_at DESC);

# PersonalFoodLogApp

A phone app to log your meals, with reminders at mealtimes so you don't forget.

## Features

- **Today view:** meals grouped into breakfast, lunch, dinner and snacks, with a calorie total. Pull down to refresh; tap ✕ (or long-press) to delete.
- **Log a meal:** food name, meal type (pre-selected for the time of day), time, optional calories, notes and a photo from the camera or gallery.
- **Meal reminders:** a notification at each mealtime you choose. It's skipped if you've already logged that meal today. Tapping it opens "Log a meal" with that meal selected. Reminders are scheduled on the phone, so they work offline and need no server.
- **Stay signed in:** your login is kept for 30 days, and the app still opens with a flaky connection.
- **Profile:** name, age, height and weight.

## Tech Stack

- **Frontend:** React Native with Expo SDK 53, React Navigation, react-hook-form, expo-notifications, expo-image-picker
- **Backend:** Node.js, Express, PostgreSQL
- **Auth:** JWT, bcrypt

## Getting Started

### 1. Database and backend

You need PostgreSQL running locally (or any hosted Postgres).

```sh
cd PersonalFoodLogApp/backend
npm install
cp .env.example .env      # then set DATABASE_URL and JWT_SECRET
npm run migrate           # creates the tables (safe to re-run)
npm run dev
```

### 2. App

```sh
cd PersonalFoodLogApp/frontend
npm install
npm start
```

Scan the QR code with **Expo Go** on your phone. As long as the phone and computer are on the same Wi-Fi, the app finds the backend on your computer automatically. To use a deployed backend instead, set `EXPO_PUBLIC_API_URL` (see `.env.example`).

Then turn on reminders from the **🔔 Reminders** tab and allow notifications when asked. "Send a test reminder" checks they arrive.

> Reminders work in the phone app (Android and iPhone), including Expo Go. They aren't available in the web version (`npm run web`).

## Tests

```sh
# App
cd PersonalFoodLogApp/frontend && npm test

# Backend: uses a real Postgres database, which the tests wipe
cd PersonalFoodLogApp/backend
TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/foodlog_test npm test
```

Without `TEST_DATABASE_URL` the backend tests are skipped. CI starts a Postgres service and runs both suites.

## API

All routes except register/login need `Authorization: Bearer <token>`.

| Method | Path | |
| --- | --- | --- |
| POST | `/api/auth/register` | `{ email, password }` (password ≥ 8 chars) |
| POST | `/api/auth/login` | → `{ token, user }` |
| GET | `/api/auth/me` | current user |
| GET | `/api/meals?from=&to=` | meals in a time range (ISO date-times), newest first |
| POST | `/api/meals` | `{ name, mealType, eatenAt?, calories?, notes?, photoUri? }` |
| PATCH | `/api/meals/:id` | change any of those fields |
| DELETE | `/api/meals/:id` | |
| GET / PUT | `/api/profile` | `{ name, age, heightCm, weightKg }` |

`mealType` is one of `breakfast`, `lunch`, `dinner`, `snack`.

Meal photos stay on the phone (only their location on the device is saved), so they only show on the phone that took them.

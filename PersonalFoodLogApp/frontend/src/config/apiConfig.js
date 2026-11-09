import Constants from 'expo-constants';

// Where the backend lives. Set EXPO_PUBLIC_API_URL (e.g. in a .env file) for a deployed server.
// In development, default to the machine running `expo start`, so a phone on the same
// Wi-Fi (Expo Go) can reach the backend without any configuration.
const devHostApi = () => {
    const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.20:8081"
    const host = hostUri ? hostUri.split(':')[0] : 'localhost';
    return `http://${host}:3001/api`;
};

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || devHostApi()).replace(/\/$/, '');

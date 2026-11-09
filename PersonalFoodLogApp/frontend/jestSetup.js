import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('expo-notifications', () => ({
    setNotificationHandler: jest.fn(),
    setNotificationChannelAsync: jest.fn(),
    getPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
    requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
    getAllScheduledNotificationsAsync: jest.fn(async () => []),
    cancelScheduledNotificationAsync: jest.fn(async () => {}),
    scheduleNotificationAsync: jest.fn(async () => 'id'),
    useLastNotificationResponse: jest.fn(() => null),
    AndroidImportance: { HIGH: 4 },
    SchedulableTriggerInputTypes: { DATE: 'date', TIME_INTERVAL: 'timeInterval' },
}));

jest.mock('expo-image-picker', () => ({
    requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
    requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
    launchCameraAsync: jest.fn(async () => ({ canceled: false, assets: [{ uri: 'file:///camera.jpg' }] })),
    launchImageLibraryAsync: jest.fn(async () => ({ canceled: false, assets: [{ uri: 'file:///library.jpg' }] })),
}));

jest.mock('expo-constants', () => ({ expoConfig: { hostUri: '192.168.1.20:8081' } }));

/** Mock fetch that answers by "METHOD /path" (query string ignored). */
global.mockFetchRoutes = (routes) => {
    global.fetch = jest.fn(async (url, init = {}) => {
        const path = url.replace(/^https?:\/\/[^/]+\/api/, '').split('?')[0];
        const key = `${init.method || 'GET'} ${path}`;
        const handler = routes[key];
        if (!handler) return { ok: false, status: 404, json: async () => ({ message: `No mock for ${key}` }) };
        const { status = 200, body = {} } = typeof handler === 'function' ? await handler(url, init) : handler;
        return { ok: status < 400, status, json: async () => body };
    });
    return global.fetch;
};

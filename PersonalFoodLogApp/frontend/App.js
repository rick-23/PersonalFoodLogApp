import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/authContext';
import AppNavigator from './src/AppNavigator';

const App = () => (
    <SafeAreaProvider>
        <AuthProvider>
            <StatusBar style="dark" />
            <AppNavigator />
        </AuthProvider>
    </SafeAreaProvider>
);

export default App;

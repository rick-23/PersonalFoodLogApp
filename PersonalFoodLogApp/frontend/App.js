import React from 'react';
import { AuthProvider } from './src/context/authContext';
import AppNavigator from './src/AppNavigator';

const App = () => (
  <AuthProvider>
    <AppNavigator />
  </AuthProvider>
);

export default App;

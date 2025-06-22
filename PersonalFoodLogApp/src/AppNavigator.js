import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import DashboardNavigator from './DashboardNavigator';
import { useAuth } from './context/authContext';

const AppNavigator = () => {
    const { isAuthenticated } = useAuth();

    return (
        <NavigationContainer>
            {isAuthenticated ? <DashboardNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

export default AppNavigator;

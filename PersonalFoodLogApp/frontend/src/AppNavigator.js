import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Notifications from 'expo-notifications';
import { useAuth } from './context/authContext';
import { FoodLogProvider } from './context/foodLogContext';
import { REMINDER_KIND, remindersSupported } from './reminders/notifications';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import TodayScreen from './screens/TodayScreen';
import AddMealScreen from './screens/AddMealScreen';
import ProfileScreen from './screens/ProfileScreen';
import PersonalInfoScreen from './screens/PersonalInfoScreen';
import RemindersScreen from './screens/RemindersScreen';
import { colors } from './theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcon = (emoji) => ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;

const Tabs = () => (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: colors.primaryDark }}>
        <Tab.Screen name="Today" component={TodayScreen} options={{ tabBarIcon: tabIcon('🍽️') }} />
        <Tab.Screen name="Reminders" component={RemindersScreen} options={{ tabBarIcon: tabIcon('🔔') }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: tabIcon('👤') }} />
    </Tab.Navigator>
);

const MainStack = () => (
    <FoodLogProvider>
        <Stack.Navigator>
            <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="AddMeal" component={AddMealScreen} options={{ title: 'Log a meal' }} />
            <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} options={{ title: 'Personal info' }} />
        </Stack.Navigator>
    </FoodLogProvider>
);

const AuthStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
    </Stack.Navigator>
);

/** Tapping a meal reminder opens "Log a meal" with that meal selected. */
const useReminderTaps = (navigationRef, isAuthenticated) => {
    const response = remindersSupported ? Notifications.useLastNotificationResponse() : null;
    const handled = useRef(null);
    useEffect(() => {
        const data = response?.notification?.request?.content?.data;
        const id = response?.notification?.request?.identifier;
        if (!isAuthenticated || data?.kind !== REMINDER_KIND || handled.current === id) return;
        handled.current = id;
        const go = () => navigationRef.current?.navigate('AddMeal', { mealType: data.mealType });
        if (navigationRef.current?.isReady()) go(); else setTimeout(go, 500);
    }, [response, isAuthenticated, navigationRef]);
};

const AppNavigator = () => {
    const { status, isAuthenticated } = useAuth();
    const navigationRef = useRef(null);
    useReminderTaps(navigationRef, isAuthenticated);

    if (status === 'loading') {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer ref={navigationRef}>
            {isAuthenticated ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default AppNavigator;

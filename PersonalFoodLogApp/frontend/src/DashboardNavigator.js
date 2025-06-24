import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import UserInfoFormScreen from './screens/UserInfoFormScreen';
import UserFoodLogScreen from './screens/UserFoodLogScreen';

const Tab = createBottomTabNavigator();

const DashboardNavigator = () => (
    <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="UserInfoFormScreen" component={UserInfoFormScreen} />
        <Tab.Screen name="UserFoodLogScreen" component={UserFoodLogScreen} />
    </Tab.Navigator>
);

export default DashboardNavigator;
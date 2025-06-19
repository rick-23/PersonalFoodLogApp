import { StatusBar } from "expo-status-bar";
import React from "react";
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import 'react-native-gesture-handler';

import UserInfoFormScreen from "./src/screens/user-info-form";
import HomeScreen from "./src/screens/home";
import UserFoodLogScreen from "./src/screens/user-food-log-form";
import OpenCamera from "./src/screens/openCamera";

const App = () => {
  const Stack = createStackNavigator();

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ navigation }) => ({
              title: 'Home',
              headerStyle: {
                backgroundColor: '#ff9300',
              },
              headerRight: () => (
                <TouchableOpacity
                  style={styles.addFoodInfo}
                  onPress={() => navigation.navigate('UserFoodLogScreen')}>
                  <Text style={styles.buttonText}>Add Food</Text>
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="AddUserInfo"
            component={UserInfoFormScreen}
            options={{
              title: 'Add User Profile',
              headerStyle: {
                backgroundColor: '#ff9300',
              },
            }}
          />
          <Stack.Screen
            name="UserFoodLogScreen"
            component={UserFoodLogScreen}
            options={{
              title: 'Add Food Intake',
              headerStyle: {
                backgroundColor: '#ff9300',
              },
            }}
          />
          <Stack.Screen
            name="OpenCamera"
            component={OpenCamera}
            options={{
              title: 'Open Camera',
              headerStyle: {
                backgroundColor: '#ff9300',
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  addUserInfo: {
    marginRight: 20,
  },
  logOutBtn: {
    marginLeft: 10,
  },
  addFoodInfo: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default App;

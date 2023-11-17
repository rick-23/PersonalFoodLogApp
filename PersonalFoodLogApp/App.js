import { StatusBar } from "expo-status-bar";
import React from "react";
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Amplify from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react-native";
import 'react-native-gesture-handler';
import { Auth } from 'aws-amplify';
import awsconfig from "./src/aws-exports";
import UserInfoFormScreen from "./src/screens/user-info-form";
import HomeScreen from "./src/screens/home";
import UserFoodLogScreen from "./src/screens/user-food-log-form";
import OpenCamera from "./src/screens/openCamera";

const App: () => React$Node = () => {
  const Stack = createStackNavigator();
  const signOut = async () => {
    try {
      await Auth.signOut({ global: true });
    } catch (error) {
      console.log('error signing out: ', error);
    }
  };
  return (
    <>
    <NavigationContainer>
    <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({navigation}) => ({
              title: 'Home',
              headerStyle: {
                backgroundColor: '#ff9300',
              },
              // headerLeft: () => {
              //   <TouchableOpacity
              //     style={styles.addUserInfo}
              //     onPress={() => navigation.navigate('AddUserInfo')}>
              //     <Text style={styles.buttonText}>Add User Info</Text>
              //   </TouchableOpacity>
              // },
              headerRight: () => (
                <TouchableOpacity
                  style={styles.addFoodInfo}
                  onPress={() => signOut()}>
                  <Text style={styles.buttonText}>Sign Out</Text>
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

Amplify.configure({
  ...awsconfig,
  Analytics: {
    disabled: true,
  },
});
const styles = StyleSheet.create({
  addUserInfo: {
    marginRight: 20,
  },
  logOutBtn: {
    marginLeft: 10,
  },
});

export default withAuthenticator(App);

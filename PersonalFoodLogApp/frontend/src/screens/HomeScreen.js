import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
  ImageBackground,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
const { width } = Dimensions.get("window");
const Home = () => {
  const navigation = useNavigation();
  return (
    <ImageBackground
      source={require("../../images/image1.png")}
      style={{ width: "100%", height: "100%" }}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Welcome to Personal Food Log App!
          </Text>
        </View>
        <View style={styles.body}>
          <Pressable
            style={styles.button}
            onPress={() => navigation.navigate("UserInfoFormScreen")}
          >
            <Text style={styles.buttonText}>Add Personal Info</Text>
          </Pressable>
        </View>
        <View style={styles.body}>
          <Pressable
            style={styles.button}
            onPress={() => navigation.navigate("UserFoodLogScreen")}
          >
            <Text style={styles.buttonText}>Add Food Intake Info</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
};
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: width,
    paddingVertical: 20,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    width: width,
    alignItems: "center",
  },
  body: {
    padding: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  button: {
    backgroundColor: "#ff9900",
    padding: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});
export default Home;

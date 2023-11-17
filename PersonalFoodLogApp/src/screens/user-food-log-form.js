import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Text,
  ImageBackground,
  Pressable,
} from "react-native";
import { Button } from "react-native-elements";
import t from "tcomb-form-native";
// import { Camera } from "expo-camera";
// import * as Permissions from "expo-permissions";
import { useNavigation } from "@react-navigation/native";

import _ from "lodash";
const { width } = Dimensions.get("window");

const Form = t.form.Form;
const form_stylesheet = _.cloneDeep(t.form.Form.stylesheet);
form_stylesheet.textbox.fontSize = 25;
form_stylesheet.textbox.color = "#ff9300";
form_stylesheet.textbox.borderColor = "#ff9300";
form_stylesheet.textbox.borderWidth = 3;
form_stylesheet.textbox.normal.fontSize = 25;
form_stylesheet.textbox.normal.color = "#ff9300";
form_stylesheet.textbox.normal.borderColor = "#ff9300";
form_stylesheet.textbox.normal.borderWidth = 3;

const UserFoodLogScreen = () => {
  const navigation = useNavigation();
  const foodLogStruct = t.struct({
    name: t.String,
    mealType: t.enums(
      { B: "Breakfast", L: "Lunch", D: "Dinner", S: "Snack" },
      "mealType"
    ),
    Image: t.String,
  });
  const [form, setForm] = useState(null);
  const [initialValues, setInitialValues] = useState({});

  const handleSubmit = async () => {
    // Saving product details
    console.log("Button Submit Triggered");
  };
  const simpleDialog = () => {
    console.log("Yukon");
  };
  const options = {
    stylesheet: form_stylesheet,
  };
  return (
    <ImageBackground
      source={require("../../images/image2.png")}
      style={{ width: "100%", height: "100%" }}
    >
      <View style={styles.container}>
        <SafeAreaView style={styles.userInfoView}>
          <ScrollView>
            <Form
              ref={(c) => setForm(c)}
              value={initialValues}
              options={options}
              type={foodLogStruct}
            />
            <Pressable style={styles.button} onPress={() => navigation.navigate("UserFoodLogScreen")}>
              <Text style={styles.buttonText}>Food Image</Text>
            </Pressable>

            <Pressable style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
            {/* <Button title="FoodImage" style = {styles.button} onPress={simpleDialog} />
            <Button title="Save" onPress={handleSubmit} style = {styles.button}/> */}
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  userInfoView: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingTop: 15,
    height: "auto",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: width,
    paddingVertical: 20,
    color: "#FFF",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "#ff9300",
    margin: 10
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "#FFF",
  },
});

export default UserFoodLogScreen;

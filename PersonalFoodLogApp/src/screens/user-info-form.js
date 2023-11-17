import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ImageBackground,
  Pressable,
  Text
} from "react-native";
import { Button } from "react-native-elements";
import t from "tcomb-form-native";
import _ from "lodash";
const { width } = Dimensions.get("window");

const Form = t.form.Form;
const form_stylesheet = _.cloneDeep(t.form.Form.stylesheet);

form_stylesheet.textbox.normal.fontSize = 25;
form_stylesheet.textbox.normal.color = "#ff9300";
form_stylesheet.textbox.normal.borderColor = "#ff9300";
form_stylesheet.textbox.normal.borderWidth = 3;

const UserInfoFormScreen = () => {
  const User = t.struct({
    name: t.String,
    age: t.Number,
    height: t.Number,
    weight: t.Number,
  });
  const [form, setForm] = useState(null);
  const [initialValues, setInitialValues] = useState({});

  const options = {
    stylesheet: form_stylesheet,
  };
  const handleSubmit = async () => {
    // Saving product details
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
              style={styles.userform}
              ref={(c) => setForm(c)}
              value={initialValues}
              type={User}
              options={options}
            />
             <Pressable style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
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
  },
  userform: {
    width: "100%",
    height: "auto",
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    marginTop: 5,
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

export default UserInfoFormScreen;

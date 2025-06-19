import React from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Text,
  ImageBackground,
  Pressable,
  TextInput,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const UserFoodLogScreen = () => {
  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      mealType: "",
      Image: "",
    },
  });

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
  };

  return (
    <ImageBackground
      source={require("../../images/image2.png")}
      style={{ width: "100%", height: "100%" }}
    >
      <View style={styles.container}>
        <SafeAreaView style={styles.userInfoView}>
          <ScrollView>
            {/* Name Field */}
            <Text style={styles.label}>Name</Text>
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enter food name"
                  placeholderTextColor="#ccc"
                />
              )}
              name="name"
            />
            {errors.name && <Text style={styles.errorText}>Name is required.</Text>}

            {/* Meal Type Field */}
            <Text style={styles.label}>Meal Type</Text>
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  onChangeText={onChange}
                  value={value}
                  placeholder="B (Breakfast), L (Lunch), D (Dinner), S (Snack)"
                  placeholderTextColor="#ccc"
                />
              )}
              name="mealType"
            />
            {errors.mealType && <Text style={styles.errorText}>Meal type is required.</Text>}

            {/* Image URL or Name */}
            <Text style={styles.label}>Image</Text>
            <Controller
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Image URL or ID"
                  placeholderTextColor="#ccc"
                />
              )}
              name="Image"
            />

            {/* Buttons */}
            <Pressable style={styles.button} onPress={() => navigation.navigate("UserFoodLogScreen")}>
              <Text style={styles.buttonText}>Food Image</Text>
            </Pressable>

            <Pressable style={styles.button} onPress={handleSubmit(onSubmit)}>
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
    paddingTop: 15,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: width,
    paddingVertical: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 10,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#ff9300",
    borderWidth: 3,
    borderRadius: 8,
    fontSize: 18,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    color: "#000",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "#ff9300",
    margin: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  errorText: {
    color: "red",
    marginLeft: 10,
    marginBottom: 10,
  },
});

export default UserFoodLogScreen;

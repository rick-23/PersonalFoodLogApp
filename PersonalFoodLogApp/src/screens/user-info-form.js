import React from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ImageBackground,
  Pressable,
  Text,
  TextInput,
} from "react-native";
import { useForm, Controller } from "react-hook-form";

const { width } = Dimensions.get("window");

const UserInfoFormScreen = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      age: "",
      height: "",
      weight: "",
    },
  });

  const onSubmit = (data) => {
    console.log("User Info Submitted:", data);
  };

  return (
    <ImageBackground
      source={require("../../images/image2.png")}
      style={{ width: "100%", height: "100%" }}
    >
      <View style={styles.container}>
        <SafeAreaView style={styles.userInfoView}>
          <ScrollView>
            <Text style={styles.label}>Name</Text>
            <Controller
              control={control}
              rules={{ required: "Name is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#ccc"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="name"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

            <Text style={styles.label}>Age</Text>
            <Controller
              control={control}
              rules={{
                required: "Age is required",
                pattern: {
                  value: /^\d+$/,
                  message: "Age must be a number",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Enter your age"
                  placeholderTextColor="#ccc"
                  keyboardType="numeric"
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="age"
            />
            {errors.age && <Text style={styles.errorText}>{errors.age.message}</Text>}

            <Text style={styles.label}>Height (cm)</Text>
            <Controller
              control={control}
              rules={{
                required: "Height is required",
                pattern: {
                  value: /^\d+$/,
                  message: "Height must be a number",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Enter your height"
                  placeholderTextColor="#ccc"
                  keyboardType="numeric"
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="height"
            />
            {errors.height && <Text style={styles.errorText}>{errors.height.message}</Text>}

            <Text style={styles.label}>Weight (kg)</Text>
            <Controller
              control={control}
              rules={{
                required: "Weight is required",
                pattern: {
                  value: /^\d+$/,
                  message: "Weight must be a number",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Enter your weight"
                  placeholderTextColor="#ccc"
                  keyboardType="numeric"
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="weight"
            />
            {errors.weight && <Text style={styles.errorText}>{errors.weight.message}</Text>}

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

export default UserInfoFormScreen;

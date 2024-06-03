import React from "react";
import Background from "../components/Background";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Button from "../components/Button";
import Paragraph from "../components/Paragraph";
import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { theme } from "../core/theme";
import { useNavigation } from "@react-navigation/native";
import { View } from "react-native";

export default function StartScreen() {
  const navigation = useNavigation();

  const goToLogin = () => {
    navigation.navigate("LoginScreen");
  };
  const goToRegister = () => {
    navigation.navigate("RegisterScreen");
  };

  return (
    <Background>
      <View className={`flex flex-col items-center justify-center w-[80%]`}>
        <Logo />
        <Header>FIT.AI</Header>
        <Paragraph>
          The easiest way to find information about your fitness journey.
        </Paragraph>
        <Button mode="contained" onPress={goToLogin} style={styles.loginButton}>
          Login
        </Button>
        <Button
          mode="outlined"
          onPress={goToRegister}
          style={styles.registerButton}
        >
          <Text style={styles.registerText}>Sign Up</Text>
        </Button>
      </View>
    </Background>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  h1: {
    fontSize: 50,
    marginBottom: 50,
    opacity: 0.6,
  },

  loginButton: {
    backgroundColor: theme.colors.orange,
    shadowColor: "#FFF",
    shadowOffset: 1,
    shadowOpacity: 0.9,
  },
  registerButton: {
    shadowColor: "#FFF",
    shadowOffset: 1,
    shadowOpacity: 0.9,
    color: "#FF5733",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  registerText: {
    color: theme.colors.orange,
    fontSize: 16,
  },
  routeText: { color: "rgb(0, 149, 246)" },
});

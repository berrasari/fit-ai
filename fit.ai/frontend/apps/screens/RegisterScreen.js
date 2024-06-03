import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import AuthRegister from "../components/AuthRegister";
import Background from "../components/Background";

import { theme } from "../core/theme";

export const RegisterScreen = () => {
  return (
    <Background>
      <AuthRegister />
    </Background>
  );
};

const styles = StyleSheet.create({
  back: { marginTop: 40 },
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
    borderColor: theme.colors.gray,
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

export default RegisterScreen;

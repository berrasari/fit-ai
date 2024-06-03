import React from "react";
import Background from "../components/Background";

import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { theme } from "../core/theme";
import { useNavigation } from "@react-navigation/native";
import AuthLogin from "../components/AuthLogin";

export const LoginScreen = () => {
  return (
    <Background>
      <AuthLogin />
    </Background>
  );
};

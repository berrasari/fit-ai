import React from "react";
import Background from "../components/Background";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Paragraph from "../components/Paragraph";
import Button from "../components/Button";
import { supabase } from "../api/supabase";
import { theme } from "../core/theme";
import { StyleSheet, View, Text } from "react-native";

export default function WelcomeScreen({ navigation }) {
  const navigate = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "DashboardScreen" }],
    });
  };
  return (
    <Background>
      <View className={`flex flex-col items-center justify-center w-[80%]`}>
        <Logo />
        <Header>Let’s start</Header>
        <Paragraph>
          Your health journey starts here. We are here for your questions about
          sport , diet , motivation.
        </Paragraph>
        <Button mode="outlined" onPress={navigate}>
          <Text style={styles.registerText}>Start</Text>
        </Button>
      </View>
    </Background>
  );
}
const styles = StyleSheet.create({
  registerText: {
    color: theme.colors.orange,
    fontSize: 16,
  },
});

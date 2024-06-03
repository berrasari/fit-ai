import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { supabase } from "../api/supabase";
import { theme } from "../core/theme";
import Background from "../components/Background";
import { useNavigation } from "@react-navigation/native";
import BackButton from "../components/BackButton";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Button from "../components/Button";
import Paragraph from "../components/Paragraph";
import { Text } from "react-native";
import TextInput from "../components/TextInput";
import { TouchableOpacity } from "react-native";
import AccountScreen from "../screens/AccountScreen";

export default function AuthLogin() {
  const navigation = useNavigation();

  const goToRegister = () => {
    navigation.navigate("RegisterScreen");
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const updateUser = async (email) => {
    try {
      const { data, error } = await supabase
        .from("user")
        .update([
          {
            is_confirmed: true,
          },
        ])
        .eq("email", email);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  async function signInWithEmail() {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        throw error;
      }
      updateUser(email);
      navigation.navigate("WelcomeScreen");
    } catch (error) {
      Alert.alert(error.message);
      setLoading(false);
    }
  }
  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <View className={`flex flex-col items-center justify-center w-[80%]`}>
        <Logo />
        <Header>Welcome back.</Header>
        <TextInput
          label="Email"
          returnKeyType="next"
          value={email.value}
          onChangeText={(text) => setEmail(text)}
          error={!!email.error}
          errorText={email.error}
          autoCapitalize="none"
          autoCompleteType="email"
          textContentType="emailAddress"
          keyboardType="email-address"
        />
        <TextInput
          label="Password"
          returnKeyType="done"
          value={password.value}
          onChangeText={(text) => setPassword(text)}
          error={!!password.error}
          errorText={password.error}
          secureTextEntry
        />
        <Button
          mode="contained"
          style={styles.loginButton}
          onPress={signInWithEmail}
        >
          Login
        </Button>
        <View style={styles.row}>
          <Text>Don’t have an account? </Text>

          <TouchableOpacity onPress={goToRegister}>
            <Text style={styles.link}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
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
  forgotPassword: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    marginTop: 4,
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: "bold",
    color: theme.colors.orange,
  },
});

import React, { useState } from 'react';

import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';

import { useNavigation } from '@react-navigation/native';

import { supabase } from '../api/supabase';
import BackButton from '../components/BackButton';
import Background from '../components/Background';
import Button from '../components/Button';
import Header from '../components/Header';
import Logo from '../components/Logo';
import TextInput from '../components/TextInput';
import {
  conditionsOfUse,
  privacyNotice,
} from '../constants/modalContent';
import { theme } from '../core/theme';

export default function AuthRegister() {
  const navigation = useNavigation();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);


  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState("");

  const allChecked = isChecked1 && isChecked2;

  const insertUserIntoTable = async () => {
    try {
      const { data, error } = await supabase.from("user").insert([
        {
          username: username,
          email: email,
          password: password,
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async () => {
    try {
      setLoading(true);

      const { data: userData, error: signUpError } = await supabase.auth.signUp(
        {
          email: email,
          password: password,
        }
      );

      if (signUpError) {
        if (signUpError.message === "Email rate limit exceeded") {
          throw new Error("This email already exists. Please try again.");
        }
        throw new Error(signUpError.message);
      }
      insertUserIntoTable();

      Alert.alert("Success", "Please check your inbox for email verification!");
    } catch (error) {
      Alert.alert("Registration Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (setChecked) => {
    setChecked(prev => !prev);
  };

  const openModal = (text) => {
    setModalText(text);
    setModalVisible(true);
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />

      <View className={`flex flex-col items-center justify-center w-[80%]`}>
        <Logo />
        <Header>Create Account</Header>
        <TextInput
          label="Username"
          returnKeyType="next"
          autoCapitalize="none"
          value={username}
          onChangeText={(text) => setUsername(text)}
        />
        <TextInput
          label="Email"
          returnKeyType="next"
          value={email}
          onChangeText={(text) => setEmail(text)}
          autoCapitalize="none"
          autoCompleteType="email"
          textContentType="emailAddress"
          keyboardType="email-address"
        />
        <TextInput
          label="Password"
          returnKeyType="done"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry
        />
        <View style={styles.checkboxContainer}>
          <TouchableOpacity onPress={() => handleCheckboxChange(setIsChecked1)}>
            <Text style={styles.checkbox}>{isChecked1 ? "☑" : "☐"}By creating an account, I agree to <Text style={styles.link} onPress={() => openModal(conditionsOfUse)}>Conditions of Use</Text>.</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleCheckboxChange(setIsChecked2)}>
            <Text style={styles.checkbox}>{isChecked2 ? "☑" : "☐"} I have read and understood the <Text style={styles.link} onPress={() => openModal(privacyNotice)}>Privacy Notice</Text> regarding the processing of my personal data.</Text>
          </TouchableOpacity>
        </View>
        <Button
          mode="outlined"
          onPress={signUpWithEmail}
          style={styles.registerButton}
          disabled={!allChecked}
        >
          <Text style={allChecked ? styles.registerText : { opacity: 0.4 }}>Sign Up</Text>
        </Button>
        <Text>Already have an account? </Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => navigation.replace("LoginScreen")}>
            <Text style={styles.link}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <ScrollView>
            <Markdown style={styles.modalText}>{modalText}</Markdown>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </Background>
  );
}

const styles = StyleSheet.create({
  link: { color: theme.colors.orange },
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
  checkboxContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  checkbox: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalView: {
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
    height: 600,
    marginTop: "auto",
    marginBottom: "auto",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {

    textAlign: "center",
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: theme.colors.orange,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2,
  }
});

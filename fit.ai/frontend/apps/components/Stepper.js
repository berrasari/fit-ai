import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { theme } from "../core/theme";

const Stepper = ({ value, onIncrement, onDecrement, onChange }) => {
  return (
    <View style={styles.stepperContainer}>
      <TouchableOpacity onPress={onDecrement} style={styles.stepperButton}>
        <Text style={styles.stepperButtonText}>-</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.stepperValue}
        keyboardType="numeric"
        value={String(value)}
        onChangeText={onChange}
      />
      <TouchableOpacity onPress={onIncrement} style={styles.stepperButton}>
        <Text style={styles.stepperButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    marginVertical: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: 175,
    borderWidth: 1,
    borderColor: theme.colors.gray,
    elevation: 2,
  },
  stepperButton: {
    backgroundColor: "white",
    padding: 5,
    borderRadius: 5,
  },
  stepperButtonText: {
    color: theme.colors.orange,
    fontSize: 28,
    fontWeight: "bold",
  },
  stepperValue: {
    fontSize: 18,
    marginHorizontal: 10,
    padding: 5,
    textAlign: "center",
    color: "#333",
    width: 60,
    fontWeight: "bold",
  },
});

export default Stepper;

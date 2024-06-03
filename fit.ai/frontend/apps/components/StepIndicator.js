import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "../core/theme";

const StepIndicator = ({ currentStep, steps, onStepPress }) => {
  return (
    <View style={styles.indicatorContainer}>
      {steps.map((step, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onStepPress(index)}
          style={styles.stepContainer}
        >
          <View
            style={[styles.circle, index <= currentStep && styles.activeCircle]}
          >
            <Text style={styles.stepText}>{index + 1}</Text>
          </View>
          <Text
            style={[styles.label, index <= currentStep && styles.activeLabel]}
          >
            {step.label}
          </Text>
          {index < steps.length - 1 && (
            <View
              style={[styles.line, index < currentStep && styles.activeLine]}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  indicatorContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.gray,
    justifyContent: "center",
    alignItems: "center",
  },
  activeCircle: {
    backgroundColor: theme.colors.orange,
  },
  stepText: {
    color: "#fff",
    fontWeight: "bold",
  },
  label: {
    marginLeft: 5,
    marginRight: 15,
    color: "#888",
  },
  activeLabel: {
    color: theme.colors.orange,
  },
  line: {
    width: 30,
    height: 2,
    backgroundColor: theme.colors.gray,
  },
  activeLine: {
    backgroundColor: theme.colors.orange,
  },
});

export default StepIndicator;

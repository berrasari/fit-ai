import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { theme } from "../core/theme";

const DietPlan = ({ dietPlan, onSubmit, createdAt }) => {
  const [expandedDay, setExpandedDay] = useState(null);

  let parsedDietPlan = dietPlan;

  // Check if dietPlan is a string, if so, parse it
  if (typeof dietPlan === "string") {
    try {
      parsedDietPlan = JSON.parse(dietPlan);
    } catch (error) {
      console.error("Failed to parse diet plan:", error);
      if (onSubmit) {
        onSubmit();
      }
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>Invalid diet plan data.</Text>
        </View>
      );
    }
  }

  // Check if dietPlan and dietPlan.diet_plan exist
  if (!dietPlan || !parsedDietPlan?.diet_plan) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Diet plan data is not available.</Text>
      </View>
    );
  }

  const handleCardPress = (day) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Diet Plan by AI</Text>

      <Text style={styles.date}>Plan created at {createdAt}</Text>
      {Object.keys(parsedDietPlan?.diet_plan).map((day) => (
        <TouchableOpacity
          key={day}
          style={[
            styles.dayContainer,
            expandedDay === day && styles.expandedCard,
          ]}
          onPress={() => handleCardPress(day)}
        >
          <Text style={styles.dayTitle}>{day}</Text>
          <Text>
            {" "}
            {Object.entries(parsedDietPlan?.diet_plan[day].total_macros)
              .map(([key, value]) => `${key}: ${value}`)
              .join(", ")}
          </Text>
          {expandedDay === day && (
            <View>
              {Object.keys(parsedDietPlan?.diet_plan[day].meals).map((meal) => (
                <View key={meal} style={styles.mealContainer}>
                  <Text style={styles.mealTitle}>
                    {meal == "snack_1" || meal == "snack_2" || meal == "snack_3"
                      ? "snack"
                      : meal}
                  </Text>
                  <Text style={styles.mealDescription}>
                    {parsedDietPlan?.diet_plan[day].meals[meal]}
                  </Text>
                </View>
              ))}
              <View style={styles.totalMacrosContainer}>
                <Text style={styles.totalMacrosTitle}>Total Macros</Text>
                <Text style={styles.totalMacros}>
                  {Object.entries(parsedDietPlan?.diet_plan[day].total_macros)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ")}
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      ))}
      <Text style={styles.date}>You can create one plan per week.</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 350,
    padding: 23,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.white,
    textAlign: "center",
    marginBottom: 5,
    marginTop: 60,
  },
  date: {
    fontSize: 14,

    color: "black",
    textAlign: "center",
    marginBottom: 10,
  },
  dayContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  expandedCard: {
    backgroundColor: theme.colors.white,
    shadowOpacity: 0.4,
  },
  dayTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
  },
  mealContainer: {
    marginLeft: 10,
    marginVertical: 10,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  mealDescription: {
    fontSize: 14,
    color: "#333",
  },
  totalMacrosContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalMacrosTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.orange,
  },
  totalMacros: {
    fontSize: 14,
    color: "#333",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});

export default DietPlan;

import React, { useState } from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { theme } from '../core/theme';

const WorkoutPlan = ({ workoutPlan, onSubmit, createdAt }) => {
  const [expandedDay, setExpandedDay] = useState(null);

  let parsedWorkoutPlan = workoutPlan;

  // Check if workoutPlan is a string, if so, parse it
  if (typeof workoutPlan === "string") {
    try {
      parsedWorkoutPlan = JSON.parse(workoutPlan);
    } catch (error) {
      console.error("Failed to parse workout plan:", error);
      if (onSubmit) {
        onSubmit();
      }
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>Invalid workout plan data.</Text>
        </View>
      );
    }
  }

  // Check if workoutPlan and workoutPlan.workout_plan exist
  if (!parsedWorkoutPlan || !parsedWorkoutPlan.workout_plan) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Workout plan data is not available.
        </Text>
      </View>
    );
  }

  const handleCardPress = (day) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Workout Plan by AI</Text>
      {createdAt && (
        <Text style={styles.date}>Plan created at {createdAt}</Text>
      )}
      {Object.keys(parsedWorkoutPlan.workout_plan).map((day) => (
        <TouchableOpacity
          key={day}
          style={[
            styles.dayContainer,
            expandedDay === day && styles.expandedCard,
          ]}
          onPress={() => handleCardPress(day)}
        >
          <Text style={styles.dayTitle}>{day}</Text>
          {expandedDay === day && (
            <View>
              {parsedWorkoutPlan.workout_plan[day].exercises.map(
                (exercise, index) => {
                  return (
                    <View key={index} style={styles.exerciseContainer}>
                      <Text style={styles.exerciseTitle}>{exercise.name}</Text>
                      <Text style={styles.exerciseDescription}>
                        {exercise.sets && `Sets: ${exercise.sets} `}
                        {exercise.reps && `Reps: ${exercise.reps} `}
                        {exercise.duration && `Duration: ${exercise.duration}`}
                      </Text>
                    </View>
                  );
                }
              )}
            </View>
          )}
        </TouchableOpacity>
      ))}
      <Text style={styles.date}>You can create one plan per 2 month.</Text>
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
    color: "black",
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
    padding: 25,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
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
  exerciseContainer: {
    marginLeft: 10,
    marginVertical: 10,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  exerciseDescription: {
    fontSize: 14,
    color: "#333",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});

export default WorkoutPlan;

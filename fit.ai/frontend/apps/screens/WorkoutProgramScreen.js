import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { theme } from "../core/theme";
import Stepper from "../components/Stepper";
import StepIndicator from "../components/StepIndicator";
import WorkoutPlan from "../components/WorkoutPlan";
import { supabase } from "../api/supabase";
import { useNavigation } from "@react-navigation/native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

const schema = yup.object().shape({
  height: yup.number().required("Height is required").positive().integer(),
  age: yup.number().required("Age is required").positive().integer(),
  gender: yup.string().required("Gender is required"),
  sportExperience: yup.string().required("Sport experience is required"),
  workoutFrequency: yup
    .number()
    .required("Workout frequency is required")
    .positive()
    .integer(),
  workoutLocation: yup.string().required("Workout location is required"),
  diseaseInjury: yup.string().optional(),
});

const steps = [
  { label: "Personal" },
  { label: "Experience" },
  { label: "Health" },
];

const WorkoutPlanScreen = ({ route }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const navigation = useNavigation();
  const [session, setSession] = useState("");
  const [created_at, setCreated_at] = useState();

  useEffect(() => {
    if (route.params?.session) {
      setSession(route.params.session);
    }
  }, [route.params]);

  const [step, setStep] = useState(0);
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState("");
  const [sportExperience, setSportExperience] = useState("");
  const [workoutFrequency, setWorkoutFrequency] = useState(3);
  const [workoutLocation, setWorkoutLocation] = useState("home");
  const [diseaseInjury, setDiseaseInjury] = useState("");

  const [loading, setLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const checkExistingWorkoutPlan = async () => {
      setLoading(true);
      try {
        const { data: existingData, error: fetchError } = await supabase
          .from("workoutPlan")
          .select("plan_json, created_at")
          .eq("email", session?.user?.email)
          .order("created_at", { ascending: false })
          .limit(1);

        if (fetchError) {
          console.error("Error fetching workout plan:", fetchError);
          return setStep(0);
        }

        if (existingData.length > 0) {
          const lastWorkoutPlan = existingData[0];
          const createdAt = new Date(lastWorkoutPlan.created_at);
          setCreated_at(createdAt.toDateString());
          const now = new Date();
          const daysDiff = Math.floor(
            (now - createdAt) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff < 60) {
            setWorkoutPlan(lastWorkoutPlan.plan_json);
          }
        }
      } catch (error) {
        console.error("Error checking workout plan:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      checkExistingWorkoutPlan();
    }
  }, [session]);

  const onSubmit = async ({
    height,
    age,
    gender,
    sportExperience,
    workoutFrequency,
    workoutLocation,
    diseaseInjury,
  }) => {
    setWorkoutPlan(null);
    setCreating(true);

    try {
      console.log("Sending POST request with data:", {
        height,
        age,
        gender,
        sportExperience,
        workoutFrequency,
        workoutLocation,
        diseaseInjury,
      });

      const response = await fetch("http://localhost:3000/api/workout-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height,
          age,
          gender,
          sportExperience,
          workoutFrequency,
          workoutLocation,
          diseaseInjury,
        }),
      });

      const newData = await response.json();

      console.log("Response from server:", newData);

      await supabase.from("workoutPlan").insert([
        {
          email: session?.user?.email,
          created_at: new Date(),
          plan_json: newData.response,
        },
      ]);

      setWorkoutPlan(newData.response);
      if (workoutPlan) {
        setCreating(false);
      }
    } catch (error) {
      setCreating(false);
      console.error("Error:", error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.welcome}>{`Personal Information`}</Text>
            <Text style={styles.welcomeDescription}>
              {`I need some information for better results.`}
            </Text>
            <Text style={styles.label}>I am a...</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === "male" && styles.genderButtonSelected,
                ]}
                onPress={() => setGender("male")}
              >
                <Text
                  style={[
                    gender === "male"
                      ? { color: "white" }
                      : { color: theme.colors.orange },
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === "female" && styles.genderButtonSelected,
                ]}
                onPress={() => setGender("female")}
              >
                <Text
                  style={[
                    gender === "female"
                      ? { color: "white" }
                      : { color: theme.colors.orange },
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Height (cm)</Text>
            <Stepper
              value={height}
              onIncrement={() => setHeight(height < 250 ? height + 1 : 250)}
              onDecrement={() => setHeight(height > 100 ? height - 1 : 100)}
              onChange={(text) => setHeight(parseInt(text) || 100)}
            />
            <Text style={styles.label}>Age (years)</Text>
            <Stepper
              value={age}
              onIncrement={() => setAge(age < 100 ? age + 1 : 100)}
              onDecrement={() => setAge(age > 10 ? age - 1 : 10)}
              onChange={(text) => setAge(parseInt(text) || 10)}
            />
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => setStep(1)}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.welcome}>Your Sport Experience</Text>
            <Text style={styles.label}>Describe your sport experience</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Beginner, Intermediate, Advanced"
              value={sportExperience}
              onChangeText={setSportExperience}
            />
            <Text style={styles.label}>
              How many days a week do you workout?
            </Text>
            <Stepper
              value={workoutFrequency}
              onIncrement={() =>
                setWorkoutFrequency(
                  workoutFrequency < 7 ? workoutFrequency + 1 : 7
                )
              }
              onDecrement={() =>
                setWorkoutFrequency(
                  workoutFrequency > 0 ? workoutFrequency - 1 : 0
                )
              }
              onChange={(text) => setWorkoutFrequency(parseInt(text))}
            />
            <Text style={styles.label}>Where do you want to work out?</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  workoutLocation === "home" && styles.genderButtonSelected,
                ]}
                onPress={() => setWorkoutLocation("home")}
              >
                <Text
                  style={[
                    workoutLocation === "home"
                      ? { color: "white" }
                      : { color: theme.colors.orange },
                  ]}
                >
                  Home
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  workoutLocation === "gym" && styles.genderButtonSelected,
                ]}
                onPress={() => setWorkoutLocation("gym")}
              >
                <Text
                  style={[
                    workoutLocation === "gym"
                      ? { color: "white" }
                      : { color: theme.colors.orange },
                  ]}
                >
                  Gym
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(0)}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => setStep(2)}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.welcome}>Additional Information</Text>
            <Text style={styles.label}>Any disease or injury?</Text>
            <TextInput
              style={styles.input}
              placeholder="List any disease or injury"
              value={diseaseInjury}
              onChangeText={setDiseaseInjury}
            />
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(1)}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() =>
                  onSubmit({
                    height,
                    age,
                    gender,
                    sportExperience,
                    workoutFrequency,
                    workoutLocation,
                    diseaseInjury,
                  })
                }
              >
                <Text style={styles.continueButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={[
        "white",
        "lightgray",
        theme.colors.orange,
        theme.colors.gray,
        "lightgray",
      ]}
      style={styles.linearGradient}
    >
      {loading ? (
        <View style={styles.container}>
          <Text style={styles.heading}>{`Workout Plan Generator AI`}</Text>
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item
              flexDirection="column"
              alignItems="center"
            >
              <SkeletonPlaceholder.Item
                width={350}
                height={75}
                borderRadius={6}
                marginVertical={10}
              />
              <SkeletonPlaceholder.Item
                width={350}
                height={75}
                borderRadius={6}
                marginVertical={10}
              />
              <SkeletonPlaceholder.Item
                width={350}
                height={75}
                borderRadius={6}
                marginVertical={10}
              />
              <SkeletonPlaceholder.Item
                width={350}
                height={75}
                borderRadius={6}
                marginVertical={10}
              />
              <SkeletonPlaceholder.Item
                width={350}
                height={75}
                borderRadius={6}
                marginVertical={10}
              />
              <SkeletonPlaceholder.Item
                width={350}
                height={75}
                borderRadius={6}
                marginVertical={10}
              />
              <SkeletonPlaceholder.Item
                width={350}
                height={75}
                borderRadius={6}
                marginVertical={10}
              />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        </View>
      ) : (
        <>
          {!workoutPlan ? (
            <ScrollView contentContainerStyle={styles.container}>
              <Text style={styles.heading}>{`Workout Plan Generator AI`}</Text>
              <StepIndicator
                currentStep={step}
                steps={steps}
                onStepPress={(step) => setStep(step)}
              />
              {creating ? (
                <ActivityIndicator size="large" color={"white"} />
              ) : (
                renderStep()
              )}
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={styles.container}>
              <WorkoutPlan
                workoutPlan={workoutPlan}
                createdAt={created_at}
                onSubmit={onSubmit}
              />
            </ScrollView>
          )}
        </>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  stepContainer: {
    width: "100%",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: theme.colors.orange,
    textAlign: "center",
  },
  heading: {
    shadowOffset: { width: 3, height: 2 },
    shadowColor: "black",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
    textAlign: "center",
  },
  welcomeDescription: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 20,
    color: theme.colors.gray,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  genderButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.orange,
    color: theme.colors.orange,
  },
  genderButtonSelected: {
    backgroundColor: theme.colors.orange,
    borderColor: theme.colors.orange,
    color: "#fff",
  },
  genderButtonText: {
    color: theme.colors.orange,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    textAlign: "center",
    marginBottom: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  backButton: {
    backgroundColor: "#ccc",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  backButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  continueButton: {
    backgroundColor: theme.colors.orange,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default WorkoutPlanScreen;

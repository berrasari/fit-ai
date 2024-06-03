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
import DietPlan from "../components/DietPlan";
import { supabase } from "../api/supabase";
import { useNavigation } from "@react-navigation/native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

const schema = yup.object().shape({
  height: yup.number().required("Height is required").positive().integer(),
  weight: yup.number().required("Weight is required").positive().integer(),
  goal: yup.string().required("Goal is required"),
  allergies: yup.string().optional(),
  nutritionStyle: yup.string().optional(),
  gender: yup.string().required("Gender is required"),
});

const steps = [{ label: "Person" }, { label: "Goal" }, { label: "Add" }];

const DietProgramScreen = ({ route }) => {
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
  const [weight, setWeight] = useState(70);
  const [goal, setGoal] = useState("");
  const [gender, setGender] = useState("");
  const [allergies, setAllergies] = useState("");
  const [nutritionStyle, setNutritionStyle] = useState("");
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(3);

  const [loading, setLoading] = useState(false);
  const [dietPlan, setDietPlan] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const checkExistingDietPlan = async () => {
      setLoading(true);
      try {
        const { data: existingData, error: fetchError } = await supabase
          .from("dietPlan")
          .select("plan_json, created_at")
          .eq("email", session?.user?.email)
          .order("created_at", { ascending: false })
          .limit(1);

        if (fetchError) {
          console.error("Error fetching diet plan:", fetchError);
          return setStep(0);
        }

        if (existingData.length > 0) {
          const lastDietPlan = existingData[0];
          const createdAt = new Date(lastDietPlan.created_at);
          setCreated_at(createdAt.toDateString());
          const now = new Date();
          const daysDiff = Math.floor(
            (now - createdAt) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff < 7) {
            setDietPlan(lastDietPlan.plan_json);
          }
        }
      } catch (error) {
        console.error("Error checking diet plan:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      checkExistingDietPlan();
    }
  }, [session]);

  const onSubmit = async ({
    height,
    weight,
    goal,
    gender,
    allergies,
    nutritionStyle,
    workoutsPerWeek,
  }) => {
    setDietPlan(null);
    setCreating(true);

    try {
      const response = await fetch("http://localhost:3000/api/diet-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height,
          weight,
          goal,
          gender,
          allergies,
          nutritionStyle,
          workoutsPerWeek,
        }),
      });

      const newData = await response.json();

      await supabase.from("dietPlan").insert([
        {
          email: session?.user?.email,
          created_at: new Date(),
          plan_json: newData.response,
        },
      ]);

      setDietPlan(newData.response);
      if (dietPlan) {
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
            <Text style={styles.label}>Weight (kg)</Text>
            <Stepper
              value={weight}
              onIncrement={() => setWeight(weight < 200 ? weight + 1 : 200)}
              onDecrement={() => setWeight(weight > 30 ? weight - 1 : 30)}
              onChange={(text) => setWeight(parseInt(text) || 30)}
            />

            <Text style={styles.label}>
              How many days a week do you work out?
            </Text>
            <Stepper
              value={workoutsPerWeek}
              onIncrement={() =>
                setWorkoutsPerWeek(
                  workoutsPerWeek < 7 ? workoutsPerWeek + 1 : 7
                )
              }
              onDecrement={() =>
                setWorkoutsPerWeek(
                  workoutsPerWeek > 0 ? workoutsPerWeek - 1 : 0
                )
              }
              onChange={(text) => setWorkoutsPerWeek(parseInt(text))}
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
            <Text style={styles.welcome}>Your Goals</Text>
            <Text style={styles.label}>What is Your Goal?</Text>
            <View style={styles.goalContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  goal === "gain_weight" && styles.genderButtonSelected,
                ]}
                onPress={() => setGoal("gain_weight")}
              >
                <Text
                  style={[
                    goal === "gain_weight"
                      ? { color: "white" }
                      : { color: theme.colors.orange },
                  ]}
                >
                  Gain Weight
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  goal === "lose_weight" && styles.genderButtonSelected,
                ]}
                onPress={() => setGoal("lose_weight")}
              >
                <Text
                  style={[
                    goal === "lose_weight"
                      ? { color: "white" }
                      : { color: theme.colors.orange },
                  ]}
                >
                  Lose Weight
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.genderButton,
                goal === "protect_weight" && styles.genderButtonSelected,
              ]}
              onPress={() => setGoal("protect_weight")}
            >
              <Text
                style={[
                  goal === "protect_weight"
                    ? { color: "white" }
                    : { color: theme.colors.orange },
                ]}
              >
                Protect Weight
              </Text>
            </TouchableOpacity>
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
            <Text style={styles.label}>Allergies or Diseases</Text>
            <TextInput
              style={styles.input}
              placeholder="List any allergies or diseases"
              value={allergies}
              onChangeText={setAllergies}
            />
            <Text style={styles.label}>Special Nutrition Style</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., Vegan, Vegetarian, etc."
              value={nutritionStyle}
              onChangeText={setNutritionStyle}
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
                    weight,
                    goal,
                    gender,
                    allergies,
                    nutritionStyle,
                    workoutsPerWeek,
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
      colors={[theme.colors.gray, theme.colors.gray]}
      style={styles.linearGradient}
    >
      {loading ? (
        <View style={styles.container}>
          <Text style={styles.heading}>{`Diet Plan Generator AI`}</Text>
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
          {!dietPlan ? (
            <ScrollView contentContainerStyle={styles.container}>
              <Text style={styles.heading}>{`Diet Plan Generator AI`}</Text>
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
              <DietPlan
                dietPlan={dietPlan}
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
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
  goalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 10,
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

export default DietProgramScreen;

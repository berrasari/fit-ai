import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Background from "./Background";
import BackButton from "./BackButton";
import { theme } from "../core/theme";
import { supabase } from "../api/supabase";
import { plans } from "../constants/plans"; // Assuming plans object is stored in a separate config file

export default function BillingModalScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentPlanId, email } = route.params;
  const [selectedPlan, setSelectedPlan] = useState(currentPlanId);

  const goBack = () => {
    navigation.navigate("AccountScreen", { refresh: true });
  };

  const changePlan = async (planId) => {
    try {
      const { error } = await supabase
        .from("user")
        .update({ plan_id: planId })
        .eq("email", email);

      if (error) throw error;

      Alert.alert("Success", "Plan updated successfully!");
      setSelectedPlan(planId);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <Background>
      <BackButton goBack={goBack} />
      <View style={styles.container}>
        <Text style={styles.title}>Billing Plans</Text>
        {Object.values(plans).map((plan) => (
          <TouchableOpacity
            key={plan.plan_id}
            style={[
              styles.planButton,
              selectedPlan === plan.plan_id && styles.selectedPlanButton,
            ]}
            onPress={() => changePlan(plan.plan_id)}
          >
            <Text style={styles.planText}>{plan.plan_name} Plan</Text>
            <Text style={styles.planDescription}>
              {plan.plan_id === 1
                ? "(3 questions for trial) - $0/month"
                : plan.plan_id === 2
                ? "(10 questions/day) - $5/month"
                : plan.plan_id === 3
                ? "(20 questions/day) - $15/month"
                : "(40 questions/day) - $35/month"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 36,
    marginBottom: 20,
    color: theme.colors.text,
    textAlign: "center",
  },
  planButton: {
    backgroundColor: theme.colors.gray,
    padding: 15,
    borderRadius: 25,
    marginTop: 10,
    width: 300,
    alignItems: "center",
  },
  selectedPlanButton: {
    backgroundColor: theme.colors.orange,
  },
  planText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  planDescription: {
    color: "white",
    fontSize: 16,
    marginTop: 5,
    textAlign: "center",
  },
});

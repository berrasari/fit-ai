import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";

const PlanScreen = ({ navigation }) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const plans = [
    { id: "basic", name: "Basic Plan", price: 999 },
    { id: "premium", name: "Premium Plan", price: 1999 },
  ];

  const fetchPaymentSheetParams = async (price) => {
    const response = await fetch("../api/payment-sheet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: price }),
    });
    const { paymentIntent, ephemeralKey, customer } = await response.json();
    return {
      paymentIntent,
      ephemeralKey,
      customer,
    };
  };

  const buyPlan = async (price) => {
    const { paymentIntent, ephemeralKey, customer } =
      await fetchPaymentSheetParams(price);

    const { error } = await initPaymentSheet({
      paymentIntentClientSecret: paymentIntent,
      customerEphemeralKeySecret: ephemeralKey,
      customerId: customer,
    });

    if (!error) {
      await openPaymentSheet();
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      Alert.alert("Success", "Your order is confirmed!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a Plan</Text>
      {plans.map((plan) => (
        <TouchableOpacity
          key={plan.id}
          style={styles.planButton}
          onPress={() => buyPlan(plan.price)}
        >
          <Text style={styles.planButtonText}>
            {plan.name} - ${plan.price / 100}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  planButton: {
    backgroundColor: "#007aff",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  planButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    marginTop: 20,
  },
  backButtonText: {
    color: "#007aff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PlanScreen;

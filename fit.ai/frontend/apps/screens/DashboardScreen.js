import React, { useEffect, useState, useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import Background from "../components/Background";
import { theme } from "../core/theme";
import Logo from "../components/Logo";
import { getProfile } from "../actions/getProfile";
const DashboardCard = ({ title, onPress, color, locked }) => (
  <TouchableOpacity
    style={[
      styles.card,
      { backgroundColor: color },
      locked && styles.lockedCard,
    ]}
    onPress={
      locked
        ? () => alert(`${title} is locked for your plan. Upgrade to access.`)
        : onPress
    }
  >
    <Text style={styles.cardText}>{title}</Text>
  </TouchableOpacity>
);

const SkeletonCard = () => <View style={[styles.card, styles.skeletonCard]} />;

export default function DashboardScreen({ navigation, route }) {
  const [userName, setUserName] = useState("");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (session) => {
    if (session) {
      const userProfile = await getProfile(session.user.email);
      if (userProfile) {
        setProfile(userProfile);
        setUserName(`@${userProfile.username}` || "Guest");
        setPlan(userProfile.plan);
      }
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData(session);
    }, [plan])
  );

  useEffect(() => {
    if (route.params?.session) {
      setSession(route.params.session);
    }
  }, [route.params]);

  useEffect(() => {
    fetchUserData(session);
  }, [session, fetchUserData]);

  useEffect(() => {
    fetchUserData(session);
  }, [userName, session, profile, plan, fetchUserData]);

  const handleRefresh = () => {
    fetchUserData(session);
  };

  const cards = [
    { name: "Chat", screen: "ChatScreen", color: "#FFA726" },
    { name: "Habit Tracker", screen: "HabitTrackerScreen", color: "#FB8C00" },
    {
      name: "Diet Program",
      screen: "DietProgramScreen",
      color: "#F57C00",
      locked: plan == "Free",
    },
    {
      name: "Workout Program",
      screen: "WorkoutProgramScreen",
      color: "#EF6C00",
      locked: plan == "Free" || plan == "Basic",
    },

    { name: "Blog", screen: "BlogScreen", color: "#E65100" },
    { name: "Account", screen: "AccountScreen", color: "#E64A19" },
  ];

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Logo height={50} width={50} />
          <Text style={styles.dashboardTitle}>Dashboard</Text>
          <View style={styles.userCard}>
            <Text style={styles.userName}>{`Hello, ${userName}`}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))
            : cards.map((card, index) => (
                <DashboardCard
                  key={index}
                  title={card.name}
                  onPress={() =>
                    navigation.navigate(card.screen, { session, user: profile })
                  }
                  color={card.color}
                  locked={card.locked}
                />
              ))}
        </View>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  dashboardTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: 5,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "flex-start",
    padding: 8,
  },
  header: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: 20,
  },
  userCard: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.gray,
  },
  card: {
    alignItems: "center",
    justifyContent: "center",
    width: "45%",
    height: 120,
    marginVertical: 10,
    borderRadius: 20,
    elevation: 3,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "black",
    shadowOpacity: 0.3,
    shadowRadius: 2,
    borderColor: theme.orange,
  },
  cardText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  lockedCard: {
    backgroundColor: "#BDBDBD",
  },
  skeletonCard: {
    backgroundColor: "#E0E0E0",
  },
});

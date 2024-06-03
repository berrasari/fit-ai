// App.js
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { supabase } from "./apps/api/supabase";
import { RegisterScreen } from "./apps/screens/RegisterScreen";
import StartScreen from "./apps/screens/StartScreen";
import { LoginScreen } from "./apps/screens/LoginScreen";
import WelcomeScreen from "./apps/screens/WelcomeScreen";
import { Session } from "@supabase/supabase-js";
import AccountScreen from "./apps/screens/AccountScreen";
import Account from "./apps/components/Account";
import ChatScreen from "./apps/screens/ChatScreen";
import DashboardScreen from "./apps/screens/DashboardScreen";
import BillingModalScreen from "./apps/components/BillingModalScreen";
import HabitTrackerScreen from "./apps/screens/HabitTrackerScreen";
import DietProgramScreen from "./apps/screens/DietProgramScreen";
import WorkoutProgramScreen from "./apps/screens/WorkoutProgramScreen";
import BlogScreen from "./apps/screens/BlogScreen";

export default function App() {
  const Stack = createStackNavigator();

  const [authsession, setAuthsession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then((response) => {
      const { data, error } = response;

      if (error) {
        console.error("Error fetching session:", error.message);
        return;
      }

      if (data) {
        const { session } = data;
        setAuthsession(session);
      }
    });

    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthsession(session);
    });

    return () => {};
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={authsession ? "AccountScreen" : "StartScreen"}
      >
        <Stack.Screen
          name="AccountScreen"
          initialParams={{ session: authsession }}
          component={AccountScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="StartScreen"
          initialParams={{ session: authsession }}
          component={StartScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LoginScreen"
          initialParams={{ session: authsession }}
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RegisterScreen"
          initialParams={{ session: authsession }}
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WelcomeScreen"
          initialParams={{ session: authsession }}
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DashboardScreen"
          initialParams={{ session: authsession }}
          component={DashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatScreen"
          initialParams={{ session: authsession }}
          component={ChatScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BillingModalScreen"
          initialParams={{ session: authsession }}
          component={BillingModalScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HabitTrackerScreen"
          initialParams={{ session: authsession }}
          component={HabitTrackerScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WorkoutProgramScreen"
          initialParams={{ session: authsession }}
          component={WorkoutProgramScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DietProgramScreen"
          initialParams={{ session: authsession }}
          component={DietProgramScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BlogScreen"
          component={BlogScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

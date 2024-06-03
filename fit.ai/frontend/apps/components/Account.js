import React, { useState, useEffect } from "react";
import { supabase } from "../api/supabase";
import { StyleSheet, View, Text, Alert, Image } from "react-native";
import Background from "./Background";
import BackButton from "./BackButton";
import { theme } from "../core/theme";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import { getPlan } from "../actions/getPlan";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

export default function Account({ route, session }) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState(null);
  const [planId, setPlanId] = useState(null);
  const [avatar_url, setAvatar_url] = useState("");

  useEffect(() => {
    if (session) {
      getProfile(session?.user?.email);
    }
  }, [session]);

  useFocusEffect(
    React.useCallback(() => {
      if (email) {
        fetchPlan(email);
      }
    }, [email])
  );

  useEffect(() => {
    if (route?.params?.refresh) {
      fetchPlan(email);

      navigation.setParams({ refresh: false });
    }
  }, [route?.params?.refresh]);

  const goToDashboard = () => {
    navigation.navigate("DashboardScreen", { refresh: true });
  };

  const goToBillingModal = () => {
    navigation.navigate("BillingModalScreen", { currentPlanId: planId, email });
  };

  const logOut = () => {
    supabase.auth.signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: "StartScreen" }],
    });
  };

  async function getProfile(email) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("user")
        .select(`username, password, email, avatar_url, plan_id`)
        .eq("email", email)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setPassword(data.password);
        setAvatar_url(data.avatar_url);
        setEmail(data.email);
        setPlanId(data.plan_id);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchPlan(email) {
    setLoading(true);
    try {
      const currentPlan = await getPlan(email);
      setPlan(currentPlan);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    }
    setLoading(false);
  }

  async function updateProfile({ username, email, password, avatar_url }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Alert("No user on the session!");

      const updates = {
        id: session?.user?.id,
        username,
        password,
        avatar_url,
        email,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("user").upsert(updates);

      if (error) {
        throw error;
      }
      Alert.alert("Success", "Profile Updated Successfully!");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Background>
      <BackButton goBack={goToDashboard} />
      <View className={`flex flex-col items-center justify-center w-[80%]`}>
        {loading ? (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item
              flexDirection="column"
              alignItems="center"
            >
              <SkeletonPlaceholder.Item
                width={100}
                height={100}
                borderRadius={50}
              />
              <SkeletonPlaceholder.Item
                marginTop={10}
                width={120}
                height={20}
                borderRadius={25}
              />
              <SkeletonPlaceholder.Item
                marginTop={30}
                width={350}
                height={45}
                borderRadius={4}
              />
              <SkeletonPlaceholder.Item
                marginTop={20}
                width={350}
                height={45}
                borderRadius={4}
              />
              <SkeletonPlaceholder.Item
                marginTop={30}
                width={350}
                height={45}
                borderRadius={4}
              />
              <SkeletonPlaceholder.Item
                marginTop={20}
                width={350}
                height={45}
                borderRadius={4}
              />
              <SkeletonPlaceholder.Item
                marginTop={20}
                width={350}
                height={45}
                borderRadius={25}
              />
              <SkeletonPlaceholder.Item
                marginTop={20}
                width={350}
                height={45}
                borderRadius={25}
              />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        ) : (
          <>
            {avatar_url ? (
              <Image
                style={styles.avatarImage}
                height={100}
                width={100}
                borderRadius={360}
                alt="Avatar"
                source={{ uri: avatar_url }}
              />
            ) : (
              <View
                className={"rounded-full flex justify-center items-center"}
                style={styles.avatarView}
                height={100}
                width={100}
              >
                <Text className={"font-semibold"} style={styles.avatarText}>
                  {session?.user?.email
                    ? session.user.email.slice(0, 2).toUpperCase()
                    : ""}
                </Text>
              </View>
            )}
            <Text className={"text-gray-700 font-bold my-5"}>Plan: {plan}</Text>
            <Button
              mode="contained"
              style={styles.billingButton}
              onPress={goToBillingModal}
            >
              <Text style={styles.loginText}>Billing Plans</Text>
            </Button>
            <TextInput
              label="Username"
              value={username}
              onChangeText={(text) => setUsername(text)}
            />
            <TextInput
              disabled
              onChangeText={(text) => setEmail(text)}
              label="Email"
              value={session?.user?.email}
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
            <Button
              mode="outlined"
              onPress={() =>
                updateProfile({ username, password, email, avatar_url })
              }
              disabled={loading}
            >
              <Text style={styles.registerText}>
                {loading ? "Loading ..." : "Update"}
              </Text>
            </Button>
            <Button
              mode="contained"
              style={styles.loginButton}
              onPress={logOut}
            >
              <Text style={styles.loginText}>Sign Out</Text>
            </Button>
          </>
        )}
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  avatarImage: { borderRadius: 360 },
  avatarView: {
    borderRadius: 360,
    backgroundColor: theme.colors.orange,
    fontSize: 36,
  },
  avatarText: {
    color: "white",
    fontSize: 36,
  },
  loginButton: {
    backgroundColor: theme.colors.gray,
    shadowColor: "#FFF",
    shadowOffset: 1,
    shadowOpacity: 0.9,
  },
  billingButton: {
    backgroundColor: theme.colors.orange,
    shadowColor: "#FFF",
    shadowOffset: 1,
    shadowOpacity: 0.9,
  },
  registerText: {
    color: theme.colors.orange,
    fontSize: 16,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
  },
  billingText: {
    color: "black",
    fontSize: 16,
  },
  routeText: { color: "rgb(0, 149, 246)" },
});

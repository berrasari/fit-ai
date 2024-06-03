import { Alert } from "react-native";
import { supabase } from "../api/supabase";
import { plans } from "../constants/plans";

export async function getProfile(email: any) {
  try {
    const {
      data: user,
      error,
      status,
    } = await supabase
      .from("user")
      .select(`username, password,plan_id, email,avatar_url`)
      .eq("email", email)
      .single();
    if (error && status !== 406) {
      throw error;
    }

    if (user) {
      const { username, password, plan_id, avatar_url, email } = user;
      const plan = await plans[plan_id].plan_name;
      return { username, password, plan_id, avatar_url, plan, email };
    }
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert(error.message);
    }
  }
}

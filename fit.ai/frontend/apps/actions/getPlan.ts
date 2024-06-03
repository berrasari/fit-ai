import { supabase } from "../api/supabase";
import { plans } from "../constants/plans";

export const getPlan = async (email: any) => {
  try {
    // Query the user table to get user data
    let { data: user, error: userError } = await supabase
      .from("user")
      .select("plan_id")
      .eq("email", email)
      .single();

    if (userError) {
      throw userError;
    }

    const { plan_id } = user;

    const plan = plans[plan_id].plan_name;

    return plan as string;
  } catch (error) {
    // console.error("Error fetching user profile and plan:", error.message);
    return { error: error.message };
  }
};

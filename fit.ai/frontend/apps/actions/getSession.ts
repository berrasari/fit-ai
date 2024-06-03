import React, { useEffect } from "react";
import { supabase } from "../api/supabase";
import { Session } from "@supabase/supabase-js";

export const getSession = () => {
  let authsession: Session = null;
  supabase.auth.getSession().then((response) => {
    const { data, error } = response;

    if (error) {
      console.error("Error fetching session:", error.message);
      return;
    }

    if (data) {
      const { session } = data;
      authsession = session;
    }
  });

  const authListener = supabase.auth.onAuthStateChange((_event, session) => {
    authsession = session;
  });
};

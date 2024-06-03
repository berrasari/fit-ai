// AccountScreen.js

import React, { useEffect, useState } from "react";
import Background from "../components/Background";

import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { theme } from "../core/theme";
import { useNavigation } from "@react-navigation/native";
import Account from "../components/Account";

const AccountScreen = ({ route }) => {
  const [authsession, setAuthsession] = useState(null);

  useEffect(() => {
    const session = route.params.session;
    setAuthsession(session);
  }, [route.params]);

  return (
    <Background>
      <Account session={authsession} />
    </Background>
  );
};

export default AccountScreen;

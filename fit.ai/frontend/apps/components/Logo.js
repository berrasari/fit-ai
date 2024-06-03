import React from "react";
import { Image, StyleSheet } from "react-native";

export default function Logo({ className, width = 110, height = 110 }) {
  return (
    <Image
      className={"shadow-sm    "}
      source={require("../../assets/logo-no-background.png")}
      style={[{ width, height }]} // Apply dynamic style
    />
  );
}

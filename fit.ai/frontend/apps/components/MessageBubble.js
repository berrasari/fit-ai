import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../core/theme";
import Logo from "./Logo";

const MessageBubble = ({ message, isUser }) => (
  <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
    {!isUser && <Logo height={30} width={30} style={styles.aiLogo} />}
    <Text style={[isUser ? styles.textWhite : styles.textBlack]}>
      {message}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  bubble: {
    maxWidth: 350,
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    gap: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  userBubble: {
    gap: 10,
    alignSelf: "flex-end",
    backgroundColor: theme.colors.orange,
    color: theme.colors.white,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#E0E0E0",
  },
  textBlack: {
    maxWidth: 250,
    color: "#000",
    fontSize: 16,
    fontWeight: 500,
  },
  textWhite: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 500,
  },
});

export default MessageBubble;

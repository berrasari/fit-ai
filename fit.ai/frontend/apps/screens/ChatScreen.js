import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import MessageBubble from "../components/MessageBubble";
import { theme } from "../core/theme";
import Background from "../components/Background";
import Logo from "../components/Logo";
import BackButton from "../components/BackButton";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../api/supabase";
import { getProfile } from "../actions/getProfile";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { planLimits } from "../constants/plans";

const ChatScreen = ({ route }) => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [dailyQuestionCount, setDailyQuestionCount] = useState(0);

  const welcomeMessageInserted = useRef(false);

  const fetchUserData = async (session) => {
    if (session) {
      const userProfile = await getProfile(session.user.email);
      if (userProfile) {
        setProfile(userProfile);
        setUserName(userProfile.username);
        setPlan(userProfile.plan);
      }
    }
  };

  useEffect(() => {
    if (route.params?.session) {
      setSession(route.params.session);
    }
  }, [route.params]);

  useEffect(() => {
    fetchUserData(session);
  }, [session]);

  const fetchMessageHistory = async (username) => {
    if (username) {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("username", username)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching message history:", error);
      } else {
        if (data.length !== 0) {
          setMessages(data);
          setLoading(false);
        } else if (data.length === 0 && !welcomeMessageInserted.current) {
          const welcomeMessage = {
            message:
              "Hi, I am Fit.AI! How can I assist you today with your fitness goals or questions?",
            isUser: false,
          };
          setMessages([welcomeMessage]);
          insertMessageToSupabase(welcomeMessage.message, false);
          welcomeMessageInserted.current = true;
          setLoading(false);
        }
      }
    }
  };

  const fetchQuestionCounts = async (username) => {
    // Fetch all-time question count
    const { data: allTimeData, error: allTimeError } = await supabase
      .from("messages")
      .select("*", { count: "exact" })
      .eq("username", username)
      .eq("isUser", true);

    if (allTimeError) {
      console.error("Error fetching all-time question count:", allTimeError);
    } else {
      setQuestionCount(allTimeData.length);
    }

    // Fetch today's question count
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data: dailyData, error: dailyError } = await supabase
      .from("messages")
      .select("*", { count: "exact" })
      .eq("username", username)
      .eq("isUser", true)
      .gte("created_at", startOfDay.toISOString());

    if (dailyError) {
      console.error("Error fetching daily question count:", dailyError);
    } else {
      setDailyQuestionCount(dailyData.length);
    }
  };

  useEffect(() => {
    if (userName) {
      fetchMessageHistory(userName);
      fetchQuestionCounts(userName);
    }
  }, [userName, plan]);

  const insertMessageToSupabase = async (messageText, isUser) => {
    const { data, error } = await supabase.from("messages").insert([
      {
        message: messageText,
        username: userName,
        isUser: isUser,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error inserting message:", error);
    } else {
      fetchQuestionCounts(userName); // Update the question counts
    }
  };

  const handleSendMessage = async () => {
    const userPlanLimit = planLimits[plan];
    const currentCount = plan === "Free" ? questionCount : dailyQuestionCount;

    if (message.trim()) {
      if (currentCount < userPlanLimit) {
        const newMessage = { message, isUser: true };
        setMessages([...messages, newMessage]);
        insertMessageToSupabase(message, true);
        setMessage("");
        setSending(true);
        try {
          const response = await fetch("http://localhost:3000/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
          });
          const data = await response.json();
          const botMessage = { message: data.response, isUser: false };
          setMessages((prevMessages) => [...prevMessages, botMessage]);
          insertMessageToSupabase(data.response, false);
        } catch (error) {
          console.error("Error sending message:", error);
        } finally {
          setSending(false);
        }
      } else {
        if (plan == "Free") {
          Alert.alert(
            "Limit Reached",
            `You have reached the limit of ${userPlanLimit} questions for Free Plan. Please buy subscription to send more questions.`
          );
        }
        Alert.alert(
          "Limit Reached",
          `You have reached the limit of ${userPlanLimit} questions for ${plan} plan. Please upgrade your plan to send more questions.`
        );
      }
    }
  };

  return (
    <Background>
      <View style={styles.container}>
        <View
          style={styles.header}
          className={`pt-16 pb-4 bg-[${theme.colors.orange}] w-full flex flex-col items-center justify-start`}
        >
          <Logo
            width={35}
            height={35}
            className={"shadow-sm border border-white"}
          />
          <Text className={"mt-3"} style={styles.h1}>
            Chat with Fit.AI
          </Text>
        </View>
        <BackButton goBack={navigation.goBack} />
        {loading ? (
          <View style={styles.messagesContainer}>
            <SkeletonPlaceholder>
              <SkeletonPlaceholder.Item
                flexDirection="column"
                alignItems="center"
              >
                <SkeletonPlaceholder.Item
                  width={350}
                  height={60}
                  borderRadius={4}
                  marginVertical={10}
                />
                <SkeletonPlaceholder.Item
                  width={350}
                  height={60}
                  borderRadius={4}
                  marginVertical={10}
                />
                <SkeletonPlaceholder.Item
                  width={350}
                  height={60}
                  borderRadius={4}
                  marginVertical={10}
                />
                <SkeletonPlaceholder.Item
                  width={350}
                  height={60}
                  borderRadius={4}
                  marginVertical={10}
                />
                <SkeletonPlaceholder.Item
                  width={350}
                  height={60}
                  borderRadius={4}
                  marginVertical={10}
                />
                <SkeletonPlaceholder.Item
                  width={350}
                  height={60}
                  borderRadius={4}
                  marginVertical={10}
                />
                <SkeletonPlaceholder.Item
                  width={350}
                  height={60}
                  borderRadius={4}
                  marginVertical={10}
                />
                <SkeletonPlaceholder.Item
                  width={350}
                  height={60}
                  borderRadius={4}
                  marginVertical={10}
                />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder>
            <View style={styles.inputContainer}>
              <SkeletonPlaceholder>
                <SkeletonPlaceholder.Item
                  flexDirection="row"
                  alignItems="center"
                >
                  <SkeletonPlaceholder.Item
                    width={350}
                    height={40}
                    borderRadius={20}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder>
            </View>
          </View>
        ) : (
          <FlatList
            data={messages}
            renderItem={({ item }) => (
              <MessageBubble message={item.message} isUser={item.isUser} />
            )}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.messagesContainer}
          />
        )}
        {sending && (
          <ActivityIndicator size="large" color={theme.colors.gray} />
        )}
        {!loading && (
          <View style={styles.inputContainer}>
            <TextInput
              onSubmitEditing={handleSendMessage}
              style={styles.input}
              placeholder="Type your message"
              placeholderTextColor="#888"
              onChangeText={(text) => setMessage(text)}
              value={message}
            />
            <TouchableOpacity style={styles.button} onPress={handleSendMessage}>
              <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    height: "100%",
    width: "100%",
    bottom: 0,
  },
  header: {
    backgroundColor: theme.colors.orange,
    padding: 30,
    paddingLeft: 50,
  },
  h1: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 0,
    marginLeft: 10,
    textAlign: "center",
    color: "white",
  },
  messagesContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 30,
    backgroundColor: "transparent",
    bottom: 0,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: "#f9f9f9",
  },
  button: {
    marginLeft: 10,
    backgroundColor: theme.colors.orange,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  skeletonContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
});

export default ChatScreen;

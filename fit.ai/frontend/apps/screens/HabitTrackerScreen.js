import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import Background from "../components/Background";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { theme } from "../core/theme";
import { supabase } from "../api/supabase";
import BackButton from "../components/BackButton";
import Button from "../components/Button";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

export default function HabitTrackerScreen({ route }) {
  const navigation = useNavigation();
  const [habits, setHabits] = useState([]);
  const [session, setSession] = useState("");

  const [newHabitText, setNewHabitText] = useState("");
  const [newHabitColor, setNewHabitColor] = useState("#FFCC80");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const goToDashboard = () => {
    navigation.navigate("DashboardScreen");
  };

  useEffect(() => {
    if (route.params?.session) {
      setSession(route.params.session);
    }
  }, [route.params]);

  useEffect(() => {
    if (session) {
      fetchHabits(session?.user?.email);
    }
  }, [session]);

  const fetchHabits = useCallback(async (email) => {
    try {
      const { data, error, status } = await supabase
        .from("habits")
        .select()
        .eq("email", email)
        .order("id", { ascending: true });

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        const today = dayjs().startOf("day").toISOString();
        const updatedHabits = data.map(async (habit) => {
          if (dayjs(habit.updated_at).isBefore(today)) {
            await supabase
              .from("habits")
              .update({
                completed: false,
                prev_update: habit.updated_at,
                updated_at: today,
              })
              .eq("id", habit.id);
            return {
              ...habit,
              completed: false,
              prev_update: habit.updated_at,
              updated_at: today,
            };
          }
          return habit;
        });
        setHabits(await Promise.all(updatedHabits));
      }
      setLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      setLoading(false);
    }
  }, []);

  const addHabit = async () => {
    if (newHabitText) {
      if (!session || !session.user) {
        console.error("No user on the session!");
        return;
      }
      const newHabit = {
        text: newHabitText,
        completed: false,
        color: newHabitColor,
        created_at: new Date().toISOString(),
        email: session.user.email,
        count: 0,
        prev_update: null,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from("habits")
        .insert([newHabit])
        .select();
      if (error) {
        console.error(error);
      } else if (data) {
        setHabits([...habits, ...data]);
        setNewHabitText("");
        setModalVisible(false);
      } else {
        console.error("Data is null or undefined");
      }
    }
  };

  const toggleHabitCompletion = async (id, completed, count) => {
    const newCount = completed ? count - 1 : count + 1;
    const { data, error } = await supabase
      .from("habits")
      .update({
        completed: !completed,
        count: newCount,
        prev_update: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(error);
    } else {
      setHabits(
        habits.map((habit) =>
          habit.id === id
            ? {
                ...habit,
                completed: !habit.completed,
                count: newCount,
                prev_update: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            : habit
        )
      );
    }
  };

  const calculateDays = (createdAt) => {
    const startDate = dayjs(createdAt);
    const today = dayjs();
    return today.diff(startDate, "day") + 1;
  };

  return (
    <Background>
      <BackButton goBack={goToDashboard} />
      <View style={styles.container}>
        <Text style={styles.header}>Practice & track</Text>
        <Text style={styles.subHeader}>
          Track your progress and keep going!
        </Text>
        <Text style={styles.listTitle}>All habits</Text>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.habitList}>
            {loading ? (
              <SkeletonPlaceholder>
                <SkeletonPlaceholder.Item
                  flexDirection="column"
                  alignItems="center"
                >
                  <SkeletonPlaceholder.Item
                    width={350}
                    height={80}
                    borderRadius={10}
                    marginVertical={10}
                  />
                  <SkeletonPlaceholder.Item
                    width={350}
                    height={80}
                    borderRadius={10}
                    marginVertical={10}
                  />
                  <SkeletonPlaceholder.Item
                    width={350}
                    height={80}
                    borderRadius={10}
                    marginVertical={10}
                  />
                  <SkeletonPlaceholder.Item
                    width={350}
                    height={80}
                    borderRadius={10}
                    marginVertical={10}
                  />
                  <SkeletonPlaceholder.Item
                    width={350}
                    height={80}
                    borderRadius={10}
                    marginVertical={10}
                  />
                  <SkeletonPlaceholder.Item
                    width={350}
                    height={80}
                    borderRadius={10}
                    marginVertical={10}
                  />
                  <SkeletonPlaceholder.Item
                    width={350}
                    height={80}
                    borderRadius={10}
                    marginVertical={10}
                  />
                  <SkeletonPlaceholder.Item
                    width={350}
                    height={80}
                    borderRadius={10}
                    marginVertical={10}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder>
            ) : (
              habits.map((habit) => {
                const daysPassed = calculateDays(habit.created_at);
                const completedDays = habit.count;
                return (
                  <TouchableOpacity
                    key={habit.id}
                    style={[
                      styles.habit,
                      { backgroundColor: habit.color, opacity: 1 },
                      habit.completed == true && { opacity: 0.7 },
                    ]}
                    onPress={() =>
                      toggleHabitCompletion(
                        habit.id,
                        habit.completed,
                        habit.count
                      )
                    }
                  >
                    <Text style={styles.habitText}>{habit.text}</Text>
                    <Text style={styles.habitStats}>
                      {completedDays} days completed out of {daysPassed} days
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>New Habit</Text>
              <TextInput
                style={styles.input}
                placeholder="10.000 steps 🏃🏻‍♀️, Drink 3L water 💧"
                value={newHabitText}
                onChangeText={setNewHabitText}
              />

              <View style={styles.colorPicker}>
                {[
                  "#e50000",

                  "#660066",
                  "#FFA500",
                  "#4169E1",
                  theme.colors.orange,
                  "#008000",
                ].map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      {
                        backgroundColor: color,
                        borderWidth: newHabitColor === color ? 2 : 0,
                      },
                    ]}
                    onPress={() => setNewHabitColor(color)}
                  />
                ))}
              </View>
              <Button style={styles.createButton} onPress={addHabit}>
                <Text style={styles.buttonText}>Create new habit</Text>
              </Button>
              <Button
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Button>
            </View>
          </View>
        </Modal>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    paddingTop: 70,
  },
  scrollContainer: {
    paddingBottom: 130, // To ensure content is not hidden behind the button
    width: "100%",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
  },
  habitList: {
    width: "100%",
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  habit: {
    minWidth: "85%",
    maxWidth: "85%",
    padding: 25,
    borderRadius: 10,
    marginBottom: 10,
  },
  habitText: {
    fontSize: 18,
    marginBottom: 2,
    fontWeight: "bold",
  },
  habitStats: {
    fontSize: 14,
    color: "white",

    fontWeight: "bold",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: theme.colors.orange,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    width: "100%",
  },
  colorPicker: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
    width: "100%",
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  createButton: {
    backgroundColor: theme.colors.orange,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  cancelButton: {
    backgroundColor: theme.colors.gray,
    padding: 15,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

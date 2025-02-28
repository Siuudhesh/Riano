import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import moment from "moment-timezone";
import { supabase } from "../lib/supabase";
import * as Notifications from "expo-notifications";

export default function ScheduleScreen({ navigation }) {
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationMinutes, setNotificationMinutes] = useState("30");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    refreshSchedules();
    fetchStudents();
  }, []);

  const refreshSchedules = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("schedules").select("*");

    if (error) {
      Alert.alert("Error", "Failed to fetch schedules.");
      console.error("Error fetching schedules:", error);
    } else {
      setSchedules(data);
    }
    setLoading(false);
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase.from("students").select("id, name");
    if (error) {
      console.error("Error fetching students:", error);
      Alert.alert("Error", "Failed to fetch students.");
    } else {
      setStudents(data);
    }
  };

  const handleClassOver = async (studentId, scheduleId) => {
    Alert.alert("Confirm", "Mark class as over and update attendance?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          setActionLoading(true);
          try {
            const { data, error } = await supabase
              .from("students")
              .select("attendance_count")
              .eq("id", studentId)
              .single();

            if (error) throw error;

            const newAttendanceCount = (data?.attendance_count || 0) + 1;

            await supabase
              .from("students")
              .update({ attendance_count: newAttendanceCount })
              .eq("id", studentId);
            await supabase.from("schedules").delete().eq("id", scheduleId);

            Alert.alert("Success", "Class marked as over!");
            refreshSchedules();
          } catch (error) {
            console.error("Error handling class over:", error);
            Alert.alert("Error", "Failed to mark class as over.");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const confirmDeleteSchedule = (id) => {
    Alert.alert("Confirm", "Are you sure you want to delete this class?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: () => handleDeleteSchedule(id), style: "destructive" },
    ]);
  };

  const handleDeleteSchedule = async (id) => {
    setActionLoading(true);
    const { error } = await supabase.from("schedules").delete().eq("id", id);
    setActionLoading(false);

    if (error) {
      Alert.alert("Error", "Failed to delete class.");
    } else {
      Alert.alert("Success", "Class deleted successfully!");
      refreshSchedules();
    }
  };

  const renderSwipeActions = (schedule) => (
    <View style={styles.swipeContainer}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate("EditSchedule", { scheduleId: schedule.id, refreshSchedules })}
      >
        <MaterialIcons name="edit" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDeleteSchedule(schedule.id)}
      >
        <MaterialIcons name="delete" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.classOverButton}
        onPress={() => handleClassOver(schedule.student_id, schedule.id)}
      >
        <MaterialIcons name="check-circle" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Class Schedules</Text>
      <TextInput
        placeholder="Notification Minutes"
        value={notificationMinutes}
        onChangeText={(text) => setNotificationMinutes(text.replace(/[^0-9]/g, ""))}
        keyboardType="numeric"
        style={styles.input}
      />
      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderSwipeActions(item)}>
            <View style={styles.scheduleItem}>
              <Text style={styles.label}>Lecture: {item.class_type}</Text>
              <Text style={styles.label}>Teacher: {item.teacher_name}</Text>
              <Text style={styles.label}>Student: {students.find((s) => s.id === item.student_id)?.name || "Unknown"}</Text>
              <Text style={styles.label}>Date: {moment(item.class_date).format("MMMM Do YYYY, h:mm a")}</Text>
            </View>
          </Swipeable>
        )}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate("AddSchedule", { refreshSchedules })}
        style={styles.addButton}
      >
        <Text style={styles.buttonText}>Add Schedule</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  scheduleItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#ccc", backgroundColor: "#fff", borderRadius: 8, marginVertical: 5 },
  label: { fontWeight: "bold", fontSize: 16 },
  swipeContainer: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center" },
  editButton: { backgroundColor: "#007bff", padding: 15, borderRadius: 5, marginRight: 5 },
  deleteButton: { backgroundColor: "red", padding: 15, borderRadius: 5, marginRight: 5 },
  classOverButton: { backgroundColor: "#28a745", padding: 15, borderRadius: 5 },
  addButton: { backgroundColor: "#007bff", padding: 15, borderRadius: 5, alignItems: "center", marginTop: 20 },
  buttonText: { color: "white", fontWeight: "bold" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginBottom: 20 },
});

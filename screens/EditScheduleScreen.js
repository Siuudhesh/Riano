import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator 
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment-timezone";
import { supabase } from "../lib/supabase";
import * as Notifications from "expo-notifications";

export default function EditScheduleScreen({ route, navigation }) {
  const { scheduleId, refreshSchedules } = route.params;
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [classType, setClassType] = useState("Theory");
  const [classDate, setClassDate] = useState(new Date());
  const [notificationMinutes, setNotificationMinutes] = useState("30");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
    fetchScheduleDetails();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase.from("students").select("id, name");
    if (error) {
      Alert.alert("Error", "Failed to fetch students.");
    } else {
      setStudents(data);
    }
  };

  const fetchScheduleDetails = async () => {
    const { data, error } = await supabase.from("schedules").select("*").eq("id", scheduleId).single();
    if (error) {
      Alert.alert("Error", "Failed to fetch schedule details.");
    } else {
      setSelectedStudent(data.student_id);
      setTeacherName(data.teacher_name);
      setClassType(data.class_type);
      setClassDate(moment(data.class_date).toDate());
      setLoading(false);
    }
  };

  const scheduleNotification = async (date, studentName) => {
    const minutes = parseInt(notificationMinutes);
    if (isNaN(minutes) || minutes <= 0) {
      Alert.alert("Error", "Please enter a valid number of minutes for the notification.");
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Upcoming Class Reminder",
        body: `Class with ${studentName} in ${minutes} minutes!`,
      },
      trigger: { seconds: Math.max(0, (date.getTime() - Date.now()) / 1000 - minutes * 60) },
    });
  };

  const handleUpdateSchedule = async () => {
    if (!selectedStudent || !teacherName || !classType) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    try {
      const { error } = await supabase.from("schedules").update({
        student_id: selectedStudent,
        teacher_name: teacherName,
        class_type: classType,
        class_date: moment(classDate).tz(moment.tz.guess()).format(), // Ensure the date is correctly formatted with timezone
      }).eq("id", scheduleId);

      if (error) {
        Alert.alert("Error", "Failed to update class.");
      } else {
        scheduleNotification(classDate, students.find(s => s.id === selectedStudent).name);
        Alert.alert("Success", "Class updated successfully!");
        refreshSchedules();
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred while updating the class.");
    }
  };

  const handleConfirm = (date) => {
    setClassDate(date);
    setShowDatePicker(false);
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Class Schedule</Text>

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>Select Date: {moment(classDate).format("MMMM Do YYYY, h:mm a")}</Text>
      </TouchableOpacity>
      <DateTimePickerModal isVisible={showDatePicker} mode="datetime" onConfirm={handleConfirm} onCancel={() => setShowDatePicker(false)} />

      <TextInput placeholder="Teacher Name" value={teacherName} onChangeText={setTeacherName} style={styles.input} />

      <View style={styles.pickerContainer}>
        <Picker selectedValue={classType} onValueChange={setClassType} style={styles.picker}>
          <Picker.Item label="Theory" value="Theory" />
          <Picker.Item label="Piano" value="Piano" />
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Picker selectedValue={selectedStudent} onValueChange={setSelectedStudent} style={styles.picker}>
          <Picker.Item label="Select Student" value="" />
          {students.map(student => (
            <Picker.Item key={student.id} label={student.name} value={student.id} />
          ))}
        </Picker>
      </View>

      <TextInput
        placeholder="Notification Minutes"
        value={notificationMinutes}
        onChangeText={text => setNotificationMinutes(text.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity onPress={handleUpdateSchedule} style={styles.updateButton}>
        <Text style={styles.updateButtonText}>Update Class</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginBottom: 10, borderRadius: 8, fontSize: 16, backgroundColor: "#fff" },
  pickerContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 10, backgroundColor: "#fff" },
  picker: { width: "100%", fontSize: 16 },
  dateButton: { padding: 12, backgroundColor: "#007bff", borderRadius: 8, marginBottom: 10, alignItems: "center" },
  dateText: { fontSize: 16, color: "white" },
  updateButton: { backgroundColor: "#28a745", padding: 15, borderRadius: 8, alignItems: "center" },
  updateButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});

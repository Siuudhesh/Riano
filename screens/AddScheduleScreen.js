import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment-timezone";
import { supabase } from "../lib/supabase";
import * as Notifications from "expo-notifications";

export default function AddScheduleScreen({ navigation, route }) {
  const { refreshSchedules } = route.params;
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [classType, setClassType] = useState("Theory");
  const [classDate, setClassDate] = useState(new Date());
  const [notificationMinutes, setNotificationMinutes] = useState("30"); // Default to 30 minutes
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase.from("students").select("id, name");
    if (error) {
      console.error("Error fetching students:", error);
      Alert.alert("Error", "Failed to fetch students.");
    } else {
      setStudents(data);
    }
  };

  const scheduleNotification = async (date, classType, teacher) => {
    const notificationTime = moment(date).subtract(parseInt(notificationMinutes, 10), "minutes").toDate();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Upcoming Class Reminder",
        body: `Your ${classType} class with ${teacher} is starting soon!`,
        sound: "default",
      },
      trigger: { date: notificationTime },
    });
  };

  const handleAddSchedule = async () => {
    if (!selectedStudent || !teacherName.trim() || !classType) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const formattedDate = moment(classDate).tz(moment.tz.guess()).format();

    try {
      const { error } = await supabase.from("schedules").insert([
        {
          student_id: selectedStudent,
          teacher_name: teacherName.trim(),
          class_type: classType,
          class_date: formattedDate,
          notification_minutes: parseInt(notificationMinutes, 10),  // Save notification time in DB
        },
      ]);

      if (error) {
        Alert.alert("Error", `Failed to add class: ${error.message}`);
      } else {
        Alert.alert("Success", "Class added successfully!");
        scheduleNotification(formattedDate, classType, teacherName);
        refreshSchedules();
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const handleConfirm = (date) => {
    setClassDate(date);
    setShowDatePicker(false);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Add Class Schedule</Text>

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18 }}>Select Date: {moment(classDate).format("MMMM Do YYYY, h:mm a")}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={() => setShowDatePicker(false)}
      />

      <TextInput
        placeholder="Teacher Name"
        value={teacherName}
        onChangeText={setTeacherName}
        style={styles.input}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={classType}
          onValueChange={(itemValue) => setClassType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Theory" value="Theory" />
          <Picker.Item label="Piano" value="Piano" />
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedStudent}
          onValueChange={(itemValue) => setSelectedStudent(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Student" value="" />
          {students.map((student) => (
            <Picker.Item key={student.id} label={student.name} value={student.id} />
          ))}
        </Picker>
      </View>

      <TextInput
        placeholder="Notification Minutes"
        value={notificationMinutes}
        onChangeText={(text) => setNotificationMinutes(text.replace(/[^0-9]/g, ''))} // Only allow numeric input
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity onPress={handleAddSchedule} style={styles.addButton}>
        <Text style={{ color: "white", fontWeight: "bold" }}>Add Class</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    justifyContent: "center",
  },
  picker: {
    width: "100%",
    fontSize: 16,
    color: "#000",
  },
  addButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
});

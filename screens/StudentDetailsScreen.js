import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Card, Button } from "react-native-paper";
import { supabase } from "../lib/supabase";

export default function StudentDetailsScreen({ route, navigation }) {
  const { studentId } = route.params;
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentDetails();
  }, []);

  const fetchStudentDetails = async () => {
    const { data, error } = await supabase.from("students").select("*").eq("id", studentId).single();

    if (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch student details.");
    } else {
      setStudent(data);
    }
    setLoading(false);
  };

  const confirmDeleteStudent = () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this student?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: deleteStudent },
      ],
      { cancelable: true }
    );
  };

  const deleteStudent = async () => {
    const { error } = await supabase.from("students").delete().eq("id", studentId);

    if (error) {
      Alert.alert("Error", "Failed to delete student.");
    } else {
      Alert.alert("Success", "Student deleted successfully!");
      navigation.goBack();
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {student && (
        <Card>
          <Card.Content>
            <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>{student.name}</Text>
            <Text>Age: {student.age}</Text>
            <Text>Gender: {student.gender}</Text>
            <Text>Phone: {student.phone}</Text>
            <Text>Fees: ${student.fees}</Text>
            <Text>Attendance: {student.attendance_count}</Text>
            <Text>Notes: {student.notes}</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => navigation.navigate("EditStudent", { studentId: student.id })}>Edit</Button>
            <Button onPress={confirmDeleteStudent}>Delete</Button>
          </Card.Actions>
        </Card>
      )}
    </View>
  );
}
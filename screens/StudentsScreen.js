import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Card } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

export default function StudentsScreen({ navigation }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("students").select("*").order("name", { ascending: true });

    if (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch students.");
    } else {
      setStudents(data);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchStudents();
    }, [])
  );

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Students</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate("StudentDetails", { studentId: item.id })}>
            <Card style={{ marginBottom: 10 }}>
              <Card.Content>
                <Text style={{ fontSize: 18 }}>{item.name}</Text>
                <Text>Age: {item.age}</Text>
                <Text>Fees: ${item.fees}</Text>
                <Text>Notes: {item.notes}</Text>
                <Text>Attendance: {item.attendance_count}</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate("AddStudent")}
        style={{
          backgroundColor: "#007bff",
          padding: 15,
          borderRadius: 5,
          marginTop: 20,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>+ Add Student</Text>
      </TouchableOpacity>
    </View>
  );
}

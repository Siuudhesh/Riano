import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Alert } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { supabase } from "../lib/supabase";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function StudentFeesDetail({ route, navigation }) {
  const { studentId } = route.params;
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchStudent();
    fetchFees();
  }, [selectedYear]);

  const fetchStudent = async () => {
    try {
      const { data, error } = await supabase.from("students").select("*").eq("id", studentId).single();
      if (error) {
        throw error;
      }
      setStudent(data);
    } catch (error) {
      console.error("Error fetching student:", error);
      Alert.alert("Error", "Failed to fetch student.");
    }
  };

  const fetchFees = async () => {
    try {
      const { data, error } = await supabase.from("fees").select("*").eq("student_id", studentId).eq("year", selectedYear);
      if (error) {
        throw error;
      }
      setFees(data);
    } catch (error) {
      console.error("Error fetching fees:", error);
      Alert.alert("Error", "Failed to fetch fees.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeeToggle = async (monthName) => {
    const feeRecord = fees.find(fee => fee.student_id === studentId && fee.month === monthName && fee.year === selectedYear);
    if (feeRecord) {
      // Delete fee record
      try {
        const { error } = await supabase.from("fees").delete().eq("id", feeRecord.id);
        if (error) {
          throw error;
        }
        console.log(`Deleted fee record for ${monthName} ${selectedYear}`);
        fetchFees();
      } catch (error) {
        console.error("Error deleting fee record:", error);
        Alert.alert("Error", "Failed to update fee status.");
      }
    } else {
      // Insert new fee record
      try {
        const { error } = await supabase.from("fees").insert([{ student_id: studentId, month: monthName, year: selectedYear, payment_date: new Date().toISOString() }]);
        if (error) {
          throw error;
        }
        console.log(`Inserted fee record for ${monthName} ${selectedYear}`);
        fetchFees();
      } catch (error) {
        console.error("Error inserting fee record:", error);
        Alert.alert("Error", "Failed to update fee status.");
      }
    }
  };

  const isFeePaid = (month, year) => {
    return fees.some(fee => fee.month === month && fee.year === year);
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      {student && (
        <>
          <Text style={styles.header}>{student.name}</Text>

          <Picker
            selectedValue={selectedYear}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
              <Picker.Item key={year} label={year.toString()} value={year} />
            ))}
          </Picker>

          <View style={styles.monthsContainer}>
            {months.map((month) => (
              <TouchableOpacity
                key={month}
                onPress={() => handleFeeToggle(month)}
                style={[
                  styles.monthButton,
                  isFeePaid(month, selectedYear) ? styles.paid : styles.unpaid
                ]}
              >
                <Text style={{ color: "white" }}>{month}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  picker: {
    width: "100%",
    height: 50,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginBottom: 20,
  },
  monthsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
  },
  monthButton: {
    padding: 12,
    borderRadius: 8,
    margin: 5,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  paid: {
    backgroundColor: "green",
  },
  unpaid: {
    backgroundColor: "red",
  },
});

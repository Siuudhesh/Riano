import React, { useEffect, useState, useCallback } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, 
  StyleSheet, TextInput, Alert 
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function FeesScreen({ navigation }) {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsData, feesData] = await Promise.all([
        supabase.from("students").select("id, name, fees, attendance_count"),
        supabase.from("fees").select("*").eq("year", currentYear),
      ]);

      if (studentsData.error) throw studentsData.error;
      if (feesData.error) throw feesData.error;

      setStudents(studentsData.data || []);
      setFees(feesData.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", error.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const getTotalFeesPaid = (studentId) => fees.filter(fee => fee.student_id === studentId).length;

  const getTotalFeesPending = (studentId) => months.length - getTotalFeesPaid(studentId);

  const getTotalAmountCollected = (studentId) => {
    const student = students.find(student => student.id === studentId);
    if (!student) return 0;
    return getTotalFeesPaid(studentId) * (student.fees || 0);
  };

  const markFeeAsPaid = async (studentId) => {
    const monthName = months[new Date().getMonth()];

    const alreadyPaid = fees.some(fee => fee.student_id === studentId && fee.month === monthName);
    if (alreadyPaid) {
      Alert.alert("Already Paid", `The fee for ${monthName} is already marked as paid.`);
      return;
    }

    Alert.alert(
      "Confirm Payment",
      `Mark ${monthName}'s fee as paid?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const { error } = await supabase.from("fees").insert([{ student_id: studentId, month: monthName, year: currentYear }]);
              if (error) throw error;
              
              setFees([...fees, { student_id: studentId, month: monthName, year: currentYear }]);
              Alert.alert("Success", `Fee for ${monthName} marked as paid.`);
            } catch (error) {
              console.error("Error marking fee as paid:", error);
              Alert.alert("Error", error.message || "Failed to mark fee as paid.");
            }
          },
        },
      ]
    );
  };

  const renderStudent = ({ item: student }) => (
    <TouchableOpacity onPress={() => navigation.navigate('StudentFeesDetail', { studentId: student.id })}>
      <View style={styles.studentCard}>
        <View>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.feeText}>✅ Fees Paid: {getTotalFeesPaid(student.id)}</Text>
          <Text style={styles.feeText}>⏳ Pending: {getTotalFeesPending(student.id)}</Text>
          <Text style={styles.amountText}>💰 Collected: ₹{getTotalAmountCollected(student.id).toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.payButton} onPress={() => markFeeAsPaid(student.id)}>
          <Text style={styles.payButtonText}>Mark Fee Paid</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💰 Student Fees</Text>
      <TextInput
        placeholder="🔍 Search Students"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : filteredStudents.length > 0 ? (
        <FlatList
          data={filteredStudents}
          keyExtractor={(student) => student.id.toString()}
          renderItem={renderStudent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <Text style={styles.emptyText}>No students found.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  loader: {
    marginTop: 20,
  },
  studentCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  feeText: {
    fontSize: 14,
    color: "#555",
  },
  amountText: {
    fontSize: 14,
    color: "#007BFF",
    fontWeight: "bold",
  },
  payButton: {
    backgroundColor: "#28a745",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  payButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 20,
  },
});

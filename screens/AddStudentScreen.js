import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "../lib/supabase";

export default function AddStudentScreen({ navigation }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [fees, setFees] = useState("");
  const [notes, setNotes] = useState("");

  const handleAddStudent = async () => {
    if (!name || !age || !gender || !fees) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    const { error } = await supabase.from("students").insert([{ name, age, gender, phone, fees, notes }]);

    if (error) {
      Alert.alert("Error", "Failed to add student.");
    } else {
      Alert.alert("Success", "Student added successfully!");
      navigation.goBack();
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Add Student</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        style={styles.input}
      />
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={gender}
          onValueChange={(itemValue) => setGender(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
        </Picker>
      </View>
      <TextInput
        placeholder="Phone (Optional)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        placeholder="Fees (Monthly)"
        value={fees}
        onChangeText={setFees}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
        style={[styles.input, { height: 100 }]}
      />

      <TouchableOpacity
        onPress={handleAddStudent}
        style={styles.addButton}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Add Student</Text>
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
    height: 50,
    width: "100%",
    fontSize: 16,
    color: "#000",
  },
  addButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
});

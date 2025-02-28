import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function StartScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Piano Teacher App 🎹</Text>

      <Text style={styles.feature}>📚 Manage Students</Text>
      <Text style={styles.feature}>📅 Schedule Classes</Text>
      <Text style={styles.feature}>💰 Fee Tracking</Text>
      <Text style={styles.feature}>🔔 Notifications</Text>

      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        style={styles.loginButton}
      >
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  feature: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    width: "80%",
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
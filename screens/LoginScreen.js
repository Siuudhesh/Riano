import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const hardcodedUsername = "teacher";
  const hardcodedPassword = "password123";

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    console.log("Attempting to log in with username:", username);
    try {
      if (username === hardcodedUsername && password === hardcodedPassword) {
        await AsyncStorage.setItem("isLoggedIn", "true");
        navigation.replace("HomeTabs", { screen: "Home" });
      } else {
        // Fetch the user with the provided username and password
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .eq('password', password)
          .single();

        if (error) {
          console.error("Login error:", error);
          Alert.alert("Login Failed", "Invalid username or password");
          return;
        }

        console.log("Login successful:", user);
        await AsyncStorage.setItem("isLoggedIn", "true");
        Alert.alert("Success", "Login Successful!");
        navigation.replace("HomeTabs", { screen: "Home" });
      }
    } catch (error) {
      console.error("Network error:", error);
      Alert.alert("Network Error", `Failed to connect to the server: ${error.message}`);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>
        Welcome, Teacher!
      </Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginVertical: 10,
          borderRadius: 5,
        }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginVertical: 10,
          borderRadius: 5,
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: "#007bff",
          padding: 10,
          borderRadius: 5,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

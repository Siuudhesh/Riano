import { View, Text, TouchableOpacity } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 30 }}>
        Welcome to Piano Teacher App 🎵
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate("HomeTabs", { screen: "Students" })}
        style={{
          backgroundColor: "#007bff",
          padding: 15,
          borderRadius: 10,
          marginBottom: 15,
          width: "80%",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>📚 Manage Students</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("HomeTabs", { screen: "Schedule" })}
        style={{
          backgroundColor: "#28a745",
          padding: 15,
          borderRadius: 10,
          marginBottom: 15,
          width: "80%",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>📅 Schedule Classes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Fees")}
        style={{
          backgroundColor: "#ffc107",
          padding: 15,
          borderRadius: 10,
          marginBottom: 15,
          width: "80%",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "black", fontWeight: "bold", fontSize: 18 }}>💰 Fee Tracking</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.replace("Login")}
        style={{
          backgroundColor: "red",
          padding: 15,
          borderRadius: 10,
          width: "80%",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

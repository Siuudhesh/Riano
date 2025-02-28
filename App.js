import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import ScheduleScreen from "./screens/ScheduleScreen";
import AddScheduleScreen from "./screens/AddScheduleScreen";
import EditScheduleScreen from "./screens/EditScheduleScreen";
import StudentsScreen from "./screens/StudentsScreen";
import AddStudentScreen from "./screens/AddStudentScreen";
import EditStudentScreen from "./screens/EditStudentScreen";
import StudentDetailsScreen from "./screens/StudentDetailsScreen";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import FeesScreen from "./screens/FeesScreen";
import StudentFeesDetail from "./screens/StudentFeesDetail";
import StartScreen from "./screens/StartScreen"; // Import the StartScreen

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const requestNotificationPermissions = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== "granted") {
      Alert.alert("Permission Required", "Please enable notifications for class reminders.");
    }
  }
};

function ScheduleStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ScheduleMain" component={ScheduleScreen} />
      <Stack.Screen name="AddSchedule" component={AddScheduleScreen} />
      <Stack.Screen name="EditSchedule" component={EditScheduleScreen} />
    </Stack.Navigator>
  );
}

function StudentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentsMain" component={StudentsScreen} />
      <Stack.Screen name="AddStudent" component={AddStudentScreen} />
      <Stack.Screen name="EditStudent" component={EditStudentScreen} />
      <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} />
    </Stack.Navigator>
  );
}

function FeesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FeesMain" component={FeesScreen} />
      <Stack.Screen name="StudentFeesDetail" component={StudentFeesDetail} />
    </Stack.Navigator>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Schedule") {
            iconName = "calendar-outline";
          } else if (route.name === "Students") {
            iconName = "people-outline";
          } else if (route.name === "Home") {
            iconName = "home-outline";
          } else if (route.name === "Fees") {
            iconName = "cash-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: "#007bff",
        inactiveTintColor: "gray",
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Schedule" component={ScheduleStack} />
      <Tab.Screen name="Students" component={StudentsStack} />
      <Tab.Screen name="Fees" component={FeesStack} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    requestNotificationPermissions();

    async function registerForPushNotifications() {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    }

    registerForPushNotifications();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="HomeTabs" component={HomeTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

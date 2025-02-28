import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import StartScreen from "../screens/StartScreen";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import StudentsScreen from "../screens/StudentsScreen";
import AddStudentScreen from "../screens/AddStudentScreen";
import StudentDetailsScreen from "../screens/StudentDetailsScreen";
import EditStudentScreen from "../screens/EditStudentScreen"; // New screen
import ScheduleScreen from "../screens/ScheduleScreen";
import AddScheduleScreen from "../screens/AddScheduleScreen";
import FeesScreen from "../screens/FeesScreen";
import FeeDetailsScreen from "../screens/FeeDetailsScreen";

const Stack = createStackNavigator();

export default function StackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" component={StartScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Students" component={StudentsScreen} />
        <Stack.Screen name="AddStudent" component={AddStudentScreen} />
        <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} />
        <Stack.Screen name="EditStudent" component={EditStudentScreen} /> 
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
        <Stack.Screen name="AddSchedule" component={AddScheduleScreen} />
        <Stack.Screen name="Fees" component={FeesScreen} />
        <Stack.Screen name="FeeDetail" component={FeeDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

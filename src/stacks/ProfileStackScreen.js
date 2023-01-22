import { StyleSheet, Text, View } from "react-native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen.js";
import AccountScreen from "../screens/settings_screens/AccountScreen";
import AboutScreen from "../screens/settings_screens/AboutScreen";
import ChangePasswordScreen from "../screens/settings_screens/ChangePasswordScreen";
import EditEmailScreen from "../screens/settings_screens/EditEmailScreen";

const Stack = createNativeStackNavigator();

export default function ProfileStackScreen() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: {
        backgroundColor: "#202024"
      }
    }}>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true }}/>
      <Stack.Screen name="Account" component={AccountScreen} options={{ headerShown: true }}/>
      <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: true }}/>
      <Stack.Screen name="Change Password" component={ChangePasswordScreen} options={{ headerShown: true }}/>
      <Stack.Screen name="Edit Email" component={EditEmailScreen} options={{ headerShown: true }}/>
    </Stack.Navigator>
  )
}
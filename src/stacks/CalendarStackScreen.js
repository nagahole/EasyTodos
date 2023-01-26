import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CalendarViewScreen from '../screens/CalendarViewScreen.js';
import EditTodoScreen from '../screens/EditTodoScreen.js';

const Stack = createNativeStackNavigator();

export default function CalendarStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Calendar" component={CalendarViewScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Calendar Edit" component={EditTodoScreen} options={{ headerShown: true, title: "Edit todo" }}/>
    </Stack.Navigator>
  )
}
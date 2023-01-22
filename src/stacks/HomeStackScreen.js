import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeDrawer from './HomeDrawer.js';

const Stack = createNativeStackNavigator();

export default function HomeStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home Drawer" component={HomeDrawer} options={{ headerShown: false }}/>
    </Stack.Navigator>
  )
}
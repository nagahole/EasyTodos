import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import CalendarStackScreen from './CalendarStackScreen';

const Drawer = createDrawerNavigator();

export default function HomeDrawer() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} initialParams={{
        mode: "home"
      }}/>
      <Drawer.Screen name="Completed" component={HomeScreen} options={{ headerShown: false }} initialParams={{
        mode: "completed"
      }}/>
      <Drawer.Screen name="Calendar Stack" component={CalendarStackScreen} options={{ headerShown: false, title: "Calendar" }}/>
    </Drawer.Navigator>
  );
}
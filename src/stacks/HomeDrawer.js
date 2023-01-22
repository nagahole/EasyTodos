import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';

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
    </Drawer.Navigator>
  );
}
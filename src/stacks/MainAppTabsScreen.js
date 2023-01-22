import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeStackScreen from "./HomeStackScreen";
import { Box, Circle, Modal, useColorMode } from "native-base"
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProfileStackScreen from "./ProfileStackScreen";
import AddTodoScreen from "../screens/AddTodoScreen";
import { firebase } from "@react-native-firebase/database";
import { auth, databaseURL } from "../firebase";
import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useState } from "react";
import AddTodoModal from "../components/AddTodoModal";
import Todo from "../classes/Todo";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import HomeDrawer from "./HomeDrawer";
import { dbRef } from "../firebase";

const Tab = createBottomTabNavigator();

function MyTabBar({ state, descriptors, navigation }) {

  const { colorMode } = useColorMode();

  const insets = useSafeAreaInsets();

  const forFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

  return (
    <Box 
      shadow="9"
      style={{ 
        flexDirection: 'row',
        backgroundColor: colorMode === 'dark'? "#1a1a1a" : "white",
        paddingBottom: insets.bottom,
        height: insets.bottom + 50,
        paddingTop: 10,
        alignItems: 'center',
        justifyContent: 'space-around'
      }}
    >
      { 
        state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {

          if (route.name === "Add Todo") {
            options.callback();
            return;
          }

          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        let iconName;

        if (route.name === 'Home Stack') {
          iconName = 'home-outline';
        } else if (route.name === 'Profile Stack') {
          iconName = 'person-outline';
        } else if (route.name === 'Add Todo') {
          iconName = 'add';
        }

        if(route.name !== 'Add Todo')
          return (
            <TouchableOpacity
              key={route.name}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Ionicons name={iconName} size={28} color={ isFocused? '#22c55e' : '#777'} />
              <Text style={{ 
                color: isFocused? '#22c55e' : '#777', 
                textAlign: 'center',
                fontSize: 10
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          )
        else
          return (
            <TouchableOpacity
              key={route.name}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box
                size="16"
                bg="green.500"
                p="0"
                mt="-3.5"
                justifyContent="center"
                alignItems="center"
                borderRadius="3xl"
              >
                <FontAwesomeIcon icon="fa-solid fa-plus" size={24} color={colorMode === 'dark'? "#1a1a1a" : "white"}/>
              </Box>
            </TouchableOpacity>
          )
        })}
      </Box>
  );
}

export default function MainApp() {

  const { colorMode } = useColorMode();
  const insets = useSafeAreaInsets();

  const [ addTodoModalOpen, setAddTodoModalOpen ] = useState(false);

  return (
    <>
      <AddTodoModal
        isOpen={addTodoModalOpen}
        setOpen={open => setAddTodoModalOpen(open)}
        onSubmit={(title, description, color, dueDate = null) => {

          dbRef("/todos").push(new Todo(title, description, color, dueDate));

        }}
      />

      <Tab.Navigator
        initialRouteName="Home Stack"
        tabBar={props => <MyTabBar { ...props } />}
      >
        <Tab.Screen name="Home Stack" component={HomeStackScreen} options={{headerShown: false, title: "Home"}}/>
        <Tab.Screen name="Add Todo" component={AddTodoScreen} options={{headerShown: false, title: "Add Todo",
          callback: () => {
            setAddTodoModalOpen(true);
          }}}/>
        <Tab.Screen name="Profile Stack" component={ProfileStackScreen} options={{headerShown: false, title: "Profile"}}/>
      </Tab.Navigator>
    </>
  )
}
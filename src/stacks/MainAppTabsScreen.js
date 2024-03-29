import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Box, Circle, Heading, Modal, useColorMode } from "native-base"
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProfileStackScreen from "./ProfileStackScreen";
import AddTodoScreen from "../screens/AddTodoScreen";
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { useEffect, useState } from "react";
import AddTodoModal from "../components/AddTodoModal";
import Todo from "../classes/Todo";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import HomeDrawer from "./HomeDrawer";
import { dbRef } from "../firebase";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const Tab = createBottomTabNavigator();

function MyTabBar({ state, descriptors, navigation }) {

  const { colorMode } = useColorMode();

  const insets = useSafeAreaInsets();

  return (
    <Box 
      shadow="9"
      style={{ 
        flexDirection: 'row',
        backgroundColor: colorMode === 'dark'? "#1a1a1a" : "white",
        paddingBottom: insets.bottom,
        height: insets.bottom + 65,
        paddingTop: 10,
        paddingBottom: insets.bottom + 10,
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

        if (route.name === 'Home Drawer') {
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
                mt="-4"
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

  // Splashscreen here to hide the imperfection of the time it takes to fetch data from the database
  const solidDuration = 100;
  const fadeDuration = 400;
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  const splashScreenOpacity = useSharedValue(1);

  const splashScreenStyles = useAnimatedStyle(() => {
    return {
      opacity: withTiming(splashScreenOpacity.value, {
        duration: fadeDuration,
        easing: Easing.in(Easing.linear),
      })
    };
  });

  useEffect(() => {
    setTimeout(() => {
      splashScreenOpacity.value = 0;
      setTimeout(() => {
        setShowSplashScreen(false);
      }, fadeDuration)
    }, solidDuration)
  }, [])

  return (
    <>
      {
        showSplashScreen && (
          <Animated.View
            style={[{
              paddingBottom: Dimensions.get('window').height * 0.1,
              backgroundColor: '#18181b',
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height,
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999
            }, splashScreenStyles]}
          >
            <Heading fontSize={35}>
              EASY TODOS
            </Heading>
          </Animated.View>
        )
      }
      <AddTodoModal
        isOpen={addTodoModalOpen}
        setOpen={open => setAddTodoModalOpen(open)}
        onSubmit={(title, description, color, dueDate = null, allDay = false) => {
          
          let todo = new Todo(title, description.trim(), color, dueDate);
          todo.allDay = allDay;

          dbRef("/todos").push(todo);

        }}
      />

      <Tab.Navigator
        initialRouteName="Home Drawer"
        tabBar={props => <MyTabBar { ...props } />}
      >
        <Tab.Screen name="Home Drawer" component={HomeDrawer} options={{headerShown: false, title: "Home"}}/>
        <Tab.Screen name="Add Todo" component={AddTodoScreen} options={{headerShown: false, title: "Add Todo",
          callback: () => {
            setAddTodoModalOpen(true);
          }}}/>
        <Tab.Screen name="Profile Stack" component={ProfileStackScreen} options={{headerShown: false, title: "Profile"}}/>
      </Tab.Navigator>
    </>
  )
}
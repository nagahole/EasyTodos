import './firebase';
import { StatusBar } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import RegisterScreen from './screens/pre_login_screens/RegisterScreen';
import LoginScreen from './screens/pre_login_screens/LoginScreen';
import ForgotPasswordScreen from './screens/pre_login_screens/ForgotPasswordScreen';
import MainApp from './stacks/MainAppTabsScreen';
import { useColorMode } from 'native-base';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faClock, faCircle, faCheck, faTrash, faThumbTack, faPencil, faSlash, faBars, faFilter, faRotateLeft,
  faCircleCheck, faLeftLong, faChevronRight, faBell, faBellSlash } from '@fortawesome/free-solid-svg-icons'

const Stack = createNativeStackNavigator();

const MyTheme = {
  dark: true,
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#4ade80',
    card: '#18181b'
  },
};

library.add(faPlus, faClock, faCircle, faCheck, faTrash, faThumbTack, faPencil, faSlash, faBars, faFilter, faRotateLeft,
  faCircleCheck, faLeftLong, faChevronRight, faBell, faBellSlash);

export default function TodoApp() {

  const { colorMode } = useColorMode();

  return (
    <NavigationContainer theme={MyTheme}>
      <StatusBar barStyle={colorMode == 'dark' ? 'light-content' : 'dark-content'}/>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Register" component={RegisterScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Forgot Password" component={ForgotPasswordScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Main" component={MainApp} options={{headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
}
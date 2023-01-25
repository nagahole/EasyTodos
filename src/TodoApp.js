import './firebase';
import { View, Text, StatusBar } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import RegisterScreen from './screens/pre_login_screens/RegisterScreen';
import LoginScreen from './screens/pre_login_screens/LoginScreen';
import ForgotPasswordScreen from './screens/pre_login_screens/ForgotPasswordScreen';
import MainApp from './stacks/MainAppTabsScreen';
import { useColorMode } from 'native-base';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faClock, faCircle, faCheck, faTrash, faThumbTack, faPencil, faSlash, faBars, faFilter, faRotateLeft,
  faCircleCheck, faLeftLong, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux';

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
  faCircleCheck, faLeftLong, faChevronRight);

export default function TodoApp() {

  const { colorMode } = useColorMode();

  const autoSignIn = useSelector(state => state.signedIn);

  return (
    <NavigationContainer theme={MyTheme}>
      <StatusBar barStyle={colorMode == 'dark' ? 'light-content' : 'dark-content'}/>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Register" component={RegisterScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Forgot Password" component={ForgotPasswordScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Main" component={MainApp} options={{headerShown: false, animation: autoSignIn? 'fade' : 'default' }}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
}
import { Alert, KeyboardAvoidingView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { auth } from '../firebase';
import { Box, Button, Center, FormControl, Heading, HStack, Input, Link, VStack } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setEmail, setPassword, setSignedIn, setUID } from '../redux/action';
import NetInfo from '@react-native-community/netinfo';
import firebase from 'firebase/compat/app';

export default function LoginScreen({navigation, route}) {

  const [emailText, setEmailText] = useState("");
  const [passwordText, setPasswordText] = useState("");

  const insets = useSafeAreaInsets();

  const signedIn = useSelector(state => state.signedIn);
  const persistedEmail = useSelector(state => state.email);
  const persistedPassword = useSelector(state => state.password);
  const persistedUID = useSelector(state => state.uid);

  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        navigation.replace("Main");
      }
    });

    NetInfo.fetch().then(state => {
      if (signedIn) {
        if (!state.isConnected && persistedUID !== "") {
          console.log("Bypassing");
          navigation.navigate("Main");
        } else {
          handleLogin(persistedEmail, persistedPassword);
        }
      }
    });

    return unsubscribe;

  }, [])
  
  function handleLogin(email = null, password = null) {
    auth
      .signInWithEmailAndPassword(email?? emailText, password?? passwordText)
      .then(userCredentials => {
        const user = userCredentials.user;
        console.log("Logged in with", user.email);
        dispatch(setEmail(email ?? emailText));
        dispatch(setPassword(password?? passwordText));
        dispatch(setUID(user.uid));

        //Set timeout here so TodoApp.js can separate manual sign in 
        //from auto sign in and play the right fade vs slide animation accordingly
        setTimeout(() => dispatch(setSignedIn(true)), 1000);
        
      })
      .catch(error => { 
        alert(error.message);
        dispatch(setEmail(""));
        dispatch(setPassword(""));
        dispatch(setSignedIn(false));
        dispatch(setUID(""));
      });
  }

  if (signedIn)
    return (
      <Center
        w="100%"
        h="100%"
        _dark={{
          bg: "dark.50"
        }}

        _light={{
          bg: "white"
        }}

        pt={insets.top}
        pb={insets.bottom + 100}
        pl={insets.left}
        pr={insets.right}
      >
        <Heading fontSize={35}>
          EASY TODOS
        </Heading>
      </Center>
    )

  return (
    <Center 
      w="100%"
      h="100%"
      _dark={{
        bg: "dark.50"
      }}

      _light={{
        bg: "white"
      }}

      pt={insets.top}
      pb={insets.bottom}
      pl={insets.left}
      pr={insets.right}
    >

      <Heading fontSize={35}>
        EASY TODOS
      </Heading>

      <Box safeArea p="2" py="2" w="90%" maxW="310">
        <VStack space={3}>
          <FormControl>
            <Input autoCapitalize='none' fontSize={16} h={10} placeholder="Email"
              value={emailText} onChangeText={text => setEmailText(text)}
              variant="filled" autoCorrect={false}
              _focus={{
                _dark: {
                  borderColor: 'gray.600',
                  backgroundColor: 'dark.100'
                }
              }}
            />
          </FormControl>
          <FormControl>
            <Input autoCapitalize='none' fontSize={16} h={10} type="password" placeholder="Password"
              value={passwordText} onChangeText={text => setPasswordText(text)}
              variant="filled"
              _focus={{
                _dark: {
                  borderColor: 'gray.600',
                  backgroundColor: 'dark.100'
                }
              }}
            />
          </FormControl>
          <VStack mt="5" space="2" alignItems="center">
            <Button mt="2" colorScheme="green" w="100%" onPress={() => { handleLogin() }}>
              Sign in
            </Button>
            <Button mt="2" colorScheme="green" w="100%" variant="outline" 
              onPress={() => {navigation.navigate("Register")} }
            >
              Register
            </Button>
            <Link mt="3" c
              _text={{
                color: 'green.100'
              }}
              onPress={() => { navigation.navigate("Forgot Password") }}
            >Forgot Password</Link>
          </VStack>
        </VStack>
      </Box>
    </Center>
  )
}
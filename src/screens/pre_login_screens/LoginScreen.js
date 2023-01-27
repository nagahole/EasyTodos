import React, { useEffect, useState } from 'react'
import { Box, Button, Center, FormControl, Heading, HStack, Input, Link, VStack } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import auth from "@react-native-firebase/auth";
import { Alert, Platform } from 'react-native';

GoogleSignin.configure({
  webClientId: "683728813647-9mav57hd0hj75rdkimd717rrqpf1f5t6.apps.googleusercontent.com",
});

export default function LoginScreen({navigation, route}) {

  const [emailText, setEmailText] = useState("");
  const [passwordText, setPasswordText] = useState("");

  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        navigation.replace("Main");
      }
    });

    return unsubscribe;

  }, [])
  
  function handleLogin() {
    if (emailText === "" || passwordText === "") {
      Alert.alert("Please fill out the fields");
      return;
    }
    auth()
      .signInWithEmailAndPassword(emailText, passwordText)
      .then(userCredentials => {
        const user = userCredentials.user;
        console.log("Logged in with", user.email);        
      })
      .catch(error => { 
        Alert.alert(error.nativeErrorCode, error.nativeErrorMessage?? error.message);
      });
  }

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

      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        paddingBottom: insets.bottom
      }}
    >
      <Box safeArea p="2" py="2" w="90%" maxW="310">
        <VStack space={3}>
          <Heading fontSize={35} alignSelf="center" mb="10">
            EASY TODOS
          </Heading>
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
              {/* ANDORID WORKS ! :D  SIKE ITS STILL BROEKN*/}
              {
                Platform.OS !== 'android' && (
                  <GoogleSigninButton 
                    size={1} 
                    style={{
                      marginTop: 5,
                      transform: [
                        { scaleX: 0.97 },
                        { scaleY: 1.05 }
                      ]
                    }}
                    onPress={() => onGoogleButtonPress().then(() => console.log("Signed in with google!"))}
                  />
                )
              }
              
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

  async function onGoogleButtonPress() {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();
  
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  
    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  }
}
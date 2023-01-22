import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Box, Button, Center, FormControl, Heading, Input, VStack } from 'native-base';
import { auth } from '../firebase';

export default function ForgotPasswordScreen({navigation, route}) {

  const [email, setEmail] = useState("");

  const insets = useSafeAreaInsets();

  function handleResetEmail() {
    auth.sendPasswordResetEmail(email)
      .then(() => {
        alert("Password reset email sent");
      })
      .catch(error => {
        alert(error.message);
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
      pt={insets.top + 50}
      pb={insets.bottom}
      pl={insets.left}
      pr={insets.right}
      justifyContent="flex-start"
    >
      <Box safeArea p="2" w="90%" maxW="290" py="8">
        <Heading size="lg" color="coolGray.800" _dark={{
        color: "warmGray.50"
      }} fontWeight="semibold">
          Reset Password
        </Heading>
        <Heading mt="1" color="coolGray.600" _dark={{
        color: "warmGray.200"
      }} fontWeight="medium" size="xs">
          Enter your email to continue!
        </Heading>
        <VStack space={3} mt="5">
          <FormControl>
            <FormControl.Label>Email</FormControl.Label>
            <Input 
              autoCapitalize='none'
              autoCorrect={false} 
              fontSize={16} h={10} 
              value={email} 
              onChangeText={text => setEmail(text)}
              variant="filled"
              _focus={{
                _dark: {
                  borderColor: 'gray.600',
                  backgroundColor: 'dark.100'
                }
              }}
            />
          </FormControl>
          <Button mt="2" colorScheme="green" onPress={handleResetEmail}>
            Send reset email
          </Button>
          <Button mt="2" variant="outline" colorScheme="green" onPress={() => { navigation.goBack(); }}>
            Go back
          </Button>
        </VStack>
      </Box>
    </Center>
  )
}
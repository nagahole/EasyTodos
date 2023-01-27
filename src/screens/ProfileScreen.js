import { Alert, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Box, Circle, HStack, ScrollView, VStack, Text, Button } from 'native-base'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import auth from "@react-native-firebase/auth";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import SettingsTextItem from '../components/SettingsTextItem';
import { setEmail, setPassword, setSignedIn, setUID } from '../redux/action';

export default function ProfileScreen({route, navigation}) {

  const insets = useSafeAreaInsets();

  function handleSignOut() {
    Alert.alert(
      "Sign out?",
      "",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            auth()
              .signOut()
              .then(() => {
                navigation.replace("Login");
              })
              .catch(error => Alert.alert(error.nativeErrorCode, error.nativeErrorMessage?? error.message))
          }
        }
      ]);
  }

  return (
    <Box
      w="100%"
      h="100%"

      _dark={{
        bg: "dark.100"
      }}

      _light={{
        bg: "white"
      }}

      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right
      }}
    >
      <ScrollView>
        <VStack p="5">
          <HStack alignItems="center" space="3" w="100%">
            <Circle bg="green.500" size="12">
              <Text color="dark.100" fontSize="2xl">{auth().currentUser?.email[0].toUpperCase()}</Text>
            </Circle>
            <VStack>
              <Text fontSize="11" color="gray.400">{auth().currentUser?.uid}</Text>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="16">{auth().currentUser?.email}</Text>
                <Box>
                  <FontAwesomeIcon icon="fa-solid fa-circle-check" color={auth().currentUser?.emailVerified? "#22c55e" : "#52525b"} style={{
                      marginTop: 2.5,
                      marginLeft: 5
                    }}
                  />
                  {
                    !auth().currentUser?.emailVerified &&
                      <FontAwesomeIcon icon="fa-solid fa-slash" size={17} color="#ef4444" style={{
                        position: 'absolute',
                        marginTop: 2.5,
                        marginLeft: 4.5
                      }} />
                  }
                </Box>
              </HStack>
            </VStack>
          </HStack>
        </VStack>
        <VStack>
          <SettingsTextItem text="Settings" onPress={() => { navigation.navigate("Settings") }}/>
          <SettingsTextItem text="Sign out" displayChevron={false} onPress={() => { handleSignOut(); }}/>
        </VStack>
      </ScrollView>
    </Box>
  )
}
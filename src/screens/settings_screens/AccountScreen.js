import { TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Box, Circle, HStack, ScrollView, VStack, Text, Button, Switch, useColorMode } from 'native-base'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import auth from "@react-native-firebase/auth";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import SettingsTextItem from '../../components/SettingsTextItem';


export default function AccountScreen({navigation, route}) {

  const insets = useSafeAreaInsets();

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
        paddingLeft: insets.left,
        paddingRight: insets.right
      }}
    >
      <ScrollView>
        <VStack>
          <SettingsTextItem text="User ID" displayChevron={false} rightComponent={() => (
            <Text fontSize="12" color="gray.300">{auth().currentUser?.uid}</Text>
          )}/>
          <SettingsTextItem text="Email" displayChevron={false} rightComponent={() => (
            <Text fontSize="16" color="gray.300">{auth().currentUser?.email}</Text>
          )}/>
          <SettingsTextItem text="Edit email" onPress={() => {navigation.navigate("Edit Email")}}/>
          <SettingsTextItem text="Change password" onPress={() => { navigation.navigate("Change Password")}}/>
          <SettingsTextItem text="Delete account" textStyle={{color: 'red'}} onPress={() => { navigation.navigate("Delete Account")}}/>
        </VStack>
      </ScrollView>
    </Box>
  )
}
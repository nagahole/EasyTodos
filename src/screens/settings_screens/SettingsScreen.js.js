import { TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Box, Circle, HStack, ScrollView, VStack, Text, Button, Switch, useColorMode } from 'native-base'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import SettingsTextItem from '../../components/SettingsTextItem';


export default function SettingsScreen({navigation, route}) {

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
          <SettingsTextItem text="Account" onPress={() => { navigation.navigate("Account") }}/>
          <SettingsTextItem text="About" onPress={() => { navigation.navigate("About") }}/>
        </VStack>
      </ScrollView>
    </Box>
  )
}
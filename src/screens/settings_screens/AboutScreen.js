import { TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Box, Circle, HStack, ScrollView, VStack, Text, Button, Switch, useColorMode } from 'native-base'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import SettingsTextItem from '../../components/SettingsTextItem';
import VersionInfo from 'react-native-version-info';

export default function AboutScreen() {

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

      pl={insets.left}
      pr={insets.right}
    >
      <ScrollView>
        <VStack>
          <SettingsTextItem text="Version" displayChevron={false} rightComponent={() => {
            return (
              <View>
                <Text>{VersionInfo.appVersion}</Text>
              </View>
            )
          }}/>
        </VStack>
      </ScrollView>
    </Box>
  )
}
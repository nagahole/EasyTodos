import React from 'react'
import { Box, HStack, Text } from 'native-base'
import { TouchableOpacity } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'

export default function SettingsTextItem(props) {
  return (
    <TouchableOpacity onPress={() => { props.onPress() }} disabled={!props.onPress}>
      <HStack px="5" py="3.5" borderBottomColor="dark.50:alpha.30" borderBottomWidth="0" w="100%" justifyContent="space-between" alignItems="center">
        <Text fontSize="17">{props.text}</Text>
        {
          props.rightComponent &&
            props.rightComponent()
        }
        {
          (props.displayChevron?? true) && 
          <FontAwesomeIcon icon="fa-solid fa-chevron-right" color="white"/>
        }
      </HStack>
    </TouchableOpacity>
  )
}
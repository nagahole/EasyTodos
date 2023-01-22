import React from 'react'
import { Box, HStack, Input, Modal, Switch, Text, VStack } from 'native-base';
import DropDownPicker from 'react-native-dropdown-picker';
import { dropdownColorValues } from './AddTodoModal';
import { useState } from 'react';
import { useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditTodoModal(props) {

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [dropdownItems, setDropdownItems] = useState(dropdownColorValues);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState(props.item.color);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    setDropdownValue(props.item.color);
    if (props.item.dueDate == null) {
      setDate(new Date());
      setShowDatePicker(false);
    } else {
      setDate(new Date(props.item.dueDate));
      setShowDatePicker(true);
    }
  }, [props.isOpen])
  

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={() => { 
        if (!showDatePicker) {
          props.setItem(prev => ({
            ...prev,
            dueDate: null
          }))
        }
        props.saveChanges(); 
        props.setOpen(false);
      }}
      animationPreset="fade"
      style={{
        paddingBottom: insets.bottom + 100
      }}
    >
      <Modal.Content overflow="visible" borderRadius="10">
        <Modal.Header borderRadius="10">
          <Input
            p="0"
            size="2xl"
            textAlign="center"
            value={props.item.title}
            variant="unstyled"
            onChangeText={text => {
              props.setItem(prev => ({
                ...prev,
                title: text
              }))
            }}
          /> 
        </Modal.Header>
        <Modal.Body overflow="visible">
          <VStack space={4} overflow="visible">
            <Input
              size="lg"
              multiline={true}
              numberOfLines={10}
              h="120"
              variant="unstyled"
              value={props.item.description}
              onChangeText={text => {
                props.setItem(prev => ({
                  ...prev,
                  description: text
                }))
              }}
            />

            <Box>
              <HStack alignItems="center" space={4} alignSelf="center">
                <Text
                  fontSize="16"
                >
                  Has due date
                </Text>
                <Switch
                  size="md"
                  colorScheme="lightBlue"
                  value={showDatePicker}
                  onToggle={(bool) => {
                    setShowDatePicker(bool);
                    props.setItem(prev => ({
                      ...prev,
                      dueDate: null
                    }));
                  }}
                />
              </HStack>
              
              <Box alignItems="center" mt="2.5">
                {
                  showDatePicker && (
                    <HStack space={3}>
                      <DateTimePicker
                        themeVariant="dark"
                        minimumDate={new Date()}
                        textColor="white"
                        value={date}
                        mode={'date'}
                        is24Hour={true}
                        onChange={(event, selectedDate) => {
                          setDate(selectedDate);
                          props.setItem(prev => ({
                            ...prev,
                            dueDate: selectedDate.getTime()
                          }))
                        }}
                      />
                      <DateTimePicker
                        themeVariant="dark"
                        minimumDate={new Date()}
                        textColor="white"
                        value={date}
                        mode={'time'}
                        is24Hour={true}
                        onChange={(event, selectedDate) => {
                          setDate(selectedDate);
                          props.setItem(prev => ({
                            ...prev,
                            dueDate: selectedDate.getTime()
                          }))
                        }}
                      />
                    </HStack>
                  )
                }
              </Box>
            </Box>

            <DropDownPicker
              dropDownDirection="TOP"
              listMode="SCROLLVIEW"
              theme="DARK"
              open={dropdownOpen}
              value={dropdownValue}
              items={dropdownItems}
              setOpen={setDropdownOpen}
              setValue={setDropdownValue}
              setItems={setDropdownItems}
              onChangeValue={value => {
                props.setItem(prev => ({
                  ...prev,
                  color: value
                }))
              }}
            />
          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  )
}
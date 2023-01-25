import React from 'react'
import { Box, Button, HStack, Input, Modal, Switch, Text, VStack } from 'native-base';
import DropDownPicker from 'react-native-dropdown-picker';
import { dropdownColorValues } from './AddTodoModal';
import { useState } from 'react';
import { useEffect } from 'react';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, LayoutAnimation, Platform } from 'react-native';
import moment from 'moment';

export default function EditTodoModal(props) {

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [allDay, setAllDay] = useState(false);

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

    setAllDay(props.item.allDay);
  }, [props.isOpen])

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    props.setItem(prev => ({
      ...prev,
      dueDate: selectedDate.getTime()
    }))
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    DateTimePickerAndroid.open({
      minimumDate: new Date(),
      value: date,
      onChange,
      mode: currentMode,
      is24Hour: true,
    });
  };
  

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
        paddingBottom: insets.bottom + Dimensions.get('window').height * 0.1
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
                <Text fontSize="16">
                  Has due date
                </Text>
                <Switch
                  size="md"
                  colorScheme="lightBlue"
                  value={showDatePicker}
                  onToggle={(bool) => {
                    LayoutAnimation.configureNext({
                      duration: 100,
                      update: { type: LayoutAnimation.Types.easeInEaseOut },
                    });
                    setShowDatePicker(bool);
                    props.setItem(prev => ({
                      ...prev,
                      dueDate: null
                    }));
                  }}
                />
                
              </HStack>
              {
                showDatePicker && Platform.OS === 'android' &&
                  <>
                    <Box mt="2" w='48' borderRadius="10" bg="dark.50:alpha.60" pt="1" pb="1.5" alignSelf="center">
                      <Text color="gray.400" textAlign="center" fontSize="16">
                        { moment(date).format('MMM Do, h:mm a') }
                      </Text>
                    </Box>
                    <HStack alignItems="center" space={4} alignSelf="center" mt="3">
                      <Button
                        colorScheme="lightBlue"
                        onPress={() => {
                          showMode('date');
                        }}
                      >
                        Set date
                      </Button>
                      <Button
                        colorScheme="lightBlue"
                        onPress={() => {
                          showMode('time');
                        }}
                      >
                        Set time
                      </Button>
                    </HStack>
                  </>
              }
              
              
              {
                showDatePicker && (
                  <Box alignItems="center" mt="2.5" justifyContent="center">
                    {
                      Platform.OS === 'ios' && (
                        <DateTimePicker
                          themeVariant="dark"
                          minimumDate={new Date()}
                          textColor="white"
                          value={date}
                          mode={allDay? 'date' : 'datetime'}
                          is24Hour={true}
                          onChange={(event, selectedDate) => {
                            setDate(selectedDate);
                            props.setItem(prev => ({
                              ...prev,
                              dueDate: selectedDate.getTime()
                            }))
                          }}
                        />
                      )
                    }
                    <HStack ml="12" alignItems="center" space={4} alignSelf="center">
                      <Text fontSize="16">All day</Text>
                      <Switch
                        size="md"
                        colorScheme="lightBlue"
                        value={allDay}
                        onToggle={(bool) => {
                          LayoutAnimation.configureNext({
                            duration: 100,
                            update: { type: LayoutAnimation.Types.easeInEaseOut },
                          });
                          props.setItem(prev => ({
                            ...prev,
                            allDay: bool
                          }));
                          setAllDay(bool)
                        }}
                      />
                    </HStack>
                  </Box>
                )
              }
              
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
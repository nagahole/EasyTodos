import React, { useRef } from 'react'
import { Box, Button, HStack, Input, Modal, Select, Switch, Text, VStack } from 'native-base';
import { dropdownColorValues } from './AddTodoModal';
import { useState } from 'react';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, LayoutAnimation, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { TriggerType } from '@notifee/react-native';
import moment from 'moment';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

export default function SetReminderModal(props) {

  const [reminderValue, setReminderValue] = useState("none");

  const insets = useSafeAreaInsets();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [allDay, setAllDay] = useState(false);

  const [number, setNumber] = useState("30");
  const [units, setUnits] = useState("minutes");

  const justLaunched = useRef(true);
  const justLaunchedTimeout = 1000;

  useEffect(() => {
    setTimeout(() => {
      justLaunched.current = false;
    }, justLaunchedTimeout)
  }, []);

  useEffect(() => {
    setReminderValue(props.item.reminder);

    let arr = props.item.customReminder.split(" ");
    setUnits(arr[1]);
    setNumber(arr[0]);

    if (props.item.dueDate == null) {
      setDate(new Date());
      setShowDatePicker(false);
    } else {
      setDate(new Date(props.item.dueDate));
      setShowDatePicker(true);
    }

    setAllDay(props.item.allDay);

  }, [props.isOpen]);

  useEffect(() => {
    if (justLaunched.current)
      return;

    props.saveChanges();
  }, [date, allDay, reminderValue, number, units]);

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

  function getNumberOfOptions(u) {
    let n;
    switch(u) {
      case "minutes":
        n = 60;
        break;
      case "hours":
        n = 24;
        break;
      case "days":
        n = 28;
        break;
      case "weeks":
        n = 4;
        break;
      default:
        console.warn("Units not recognized in getNumberOfOptions(units)");
        break;
    }
    return n;
  }
  
  return (
    <Modal
      isOpen={props.isOpen}
      onClose={() => { 
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
          <Text textAlign="center" fontSize="xl">
            Set reminder
          </Text>
        </Modal.Header>
        <Modal.Body overflow="visible">
          <Box pb="3">
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
                    dueDate: bool? date.getTime() : null
                  }));
                }}
              />
              
            </HStack>
            {
              showDatePicker && Platform.OS === 'android' && (
                <>
                  <Box mt="2" w='48' borderRadius="10" bg="dark.50:alpha.60" pt="1" pb="1.5" alignSelf="center">
                    <Text color="gray.400" textAlign="center" fontSize="16">
                      { 
                        moment(date).format(
                          props.item.allDay? 'MMM Do' : 'MMM Do, h:mm a'
                        ) 
                      }
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
                    {
                      !props.item.allDay && (
                        <Button
                          colorScheme="lightBlue"
                          onPress={() => {
                            showMode('time');
                          }}
                        >
                          Set time
                        </Button>
                      )
                    }
                  </HStack>
                </>
              )
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
                  <HStack ml="10" mt="2.5" alignItems="center" space={4} alignSelf="center">
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
          <Select 
            selectedValue={reminderValue}
            fontSize="16"
            p="3"
            placeholder="Set reminder" 
            dropdownIcon={
              reminderValue === 'none'
              ? (
                <FontAwesomeIcon icon="fa-solid fa-bell-slash" size={23} color="#71717a" style={{
                  marginRight: 12,
                  marginTop: -1
                }}/>
              ) 
              : <FontAwesomeIcon icon="fa-solid fa-bell" size={18} color="#fbbf24" style={{
                marginRight: 12,
                marginTop: -1
              }}/>
            }
            _selectedItem={{
              bg: "rgba(255,255,255,0.05)",
              endIcon: 
                <Box mt="0.5" ml="-0.5" justifyContent="center" alignItems="center">
                  <FontAwesomeIcon icon="fa-solid fa-check" color="white"/>
                </Box>
            }} 
            mt={1} 
            onValueChange={itemValue => {
              LayoutAnimation.configureNext({
                duration: 300,
                update: { type: LayoutAnimation.Types.easeInEaseOut },
              });
              props.setItem(prev => ({
                ...prev,
                reminder: itemValue
              }));
              setReminderValue(itemValue);
            }}
          >
              <Select.Item label="None" value="none" />
              <Select.Item label="10 minutes before" value="10 minutes" />
              <Select.Item label="30 minutes before" value="30 minutes" />
              <Select.Item label="1 hour before" value="1 hour" />
              <Select.Item label="1 day before" value="1 day" />
              <Select.Item label="1 week before" value="1 week" />
              <Select.Item label="Custom" value="custom" />
            </Select>

          {
            reminderValue == "custom" &&
              <Box display="flex" flexDir="row">
                <Box flex={1.4}>
                  <Picker
                    dropdownIconColor="white"
                    selectedValue={number}
                    onValueChange={n => {
                      props.setItem(prev => ({
                        ...prev,
                        customReminder: `${n} ${units}`
                      }));
                      setNumber(n);
                    }}
                  >
                    {
                      function() {
                        let n = getNumberOfOptions(units);
                        
                        n++; // 0 indexed
                        let arr = Array.from(Array(n).keys());
                        return (
                          arr.map(n => (
                            <Picker.Item key={n} color={Platform.OS === 'ios'? "white" : "black"} label={n.toString()} value={n.toString()}/>
                          ))
                        )
                      }()
                    }
                  </Picker>
                </Box>
                <Box flex={2}>
                  <Picker
                    dropdownIconColor="white"
                    selectedValue={units}
                    onValueChange={u => {
                      let n = Math.min(parseInt(number, 10), getNumberOfOptions(u))
                      //This is bad because it doesnt use the prev value to set the new number value
                      //However the picker is pretty slow so it should be ok
                      setNumber(n.toString());

                      props.setItem(prev => ({
                        ...prev,
                        customReminder: `${n} ${u}`
                      }));

                      setUnits(u);
                    }}
                  >
                    <Picker.Item color={Platform.OS === 'ios'? "white" : "black"} label={number === "1"? "Minute" : "Minutes"} value="minutes"/>
                    <Picker.Item color={Platform.OS === 'ios'? "white" : "black"} label={number === "1"? "Hour" : "Hours"} value="hours"/>
                    <Picker.Item color={Platform.OS === 'ios'? "white" : "black"} label={number === "1"? "Day" : "Days"} value="days"/>
                    <Picker.Item color={Platform.OS === 'ios'? "white" : "black"} label={number === "1"? "Week" : "Weeks"} value="weeks"/>
                  </Picker>
                </Box>
              </Box>
          }
        </Modal.Body>
      </Modal.Content>
    </Modal>
  )
}
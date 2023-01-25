import React, { useRef } from 'react'
import { Box, HStack, Input, Modal, Select, Switch, Text, VStack } from 'native-base';
import { dropdownColorValues } from './AddTodoModal';
import { useState } from 'react';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, LayoutAnimation, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { TriggerType } from '@notifee/react-native';

export default function SetReminderModal(props) {

  const [reminderValue, setReminderValue] = useState("none");

  const insets = useSafeAreaInsets();

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

  }, [props.isOpen]);

  useEffect(() => {
    if (justLaunched.current)
      return;

    props.saveChanges();
  }, [reminderValue, number, units]);

  if (props.item.dueDate == null || props.item.dueDate == undefined) {
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
              Please set a due date to use this feature
            </Text>
          </Modal.Header>
        </Modal.Content>
      </Modal>
    )
  }

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
        <Select 
          selectedValue={reminderValue}
          fontSize="16"
          p="3"
          placeholder="Set reminder" 
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
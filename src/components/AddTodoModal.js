import React, { useState } from 'react'
import { Box, Button, FormControl, Heading, HStack, Input, Modal, Switch, Text, VStack } from 'native-base'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import DropDownPicker from 'react-native-dropdown-picker';
import { LayoutAnimation, Platform } from 'react-native';
import moment from 'moment';

export const dropdownColorValues = [
  {label: 'Red', value: 'red', icon: () => <FontAwesomeIcon icon="fa-solid fa-circle" color="#ef4444"/>},
  {label: 'Orange', value: 'orange', icon: () => <FontAwesomeIcon icon="fa-solid fa-circle" color="#f97316"/>},
  {label: 'Yellow', value: 'yellow', icon: () => <FontAwesomeIcon icon="fa-solid fa-circle" color="#eab308"/>},
  {label: 'Green', value: 'green', icon: () => <FontAwesomeIcon icon="fa-solid fa-circle" color="#22c55e"/>},
  {label: 'Blue', value: 'blue', icon: () => <FontAwesomeIcon icon="fa-solid fa-circle" color="#3b82f6"/>},
  {label: 'Indigo', value: 'indigo', icon: () => <FontAwesomeIcon icon="fa-solid fa-circle" color="#6366f1"/>},
  {label: 'Violet', value: 'violet', icon: () => <FontAwesomeIcon icon="fa-solid fa-circle" color="#8b5cf6"/>},
];

export default function AddTodoModal(props) {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const insets = useSafeAreaInsets();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState("green");
  const [dropdownItems, setDropdownItems] = useState(dropdownColorValues);

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
      onClose={() => props.setOpen(false)}
      animationPreset="slide"
      display="flex"
      justifyContent="flex-end"
    >
      <Modal.Content w="95%"  bg="dark.100" shadow="9" style={{
        paddingBottom: insets.bottom,
      }}> 
        <Modal.Body>
          <VStack space={5}>
            <FormControl>
              <Input 
                h="12"
                placeholder="Title"
                fontSize="xl"
                value={title}
                onChangeText={text => setTitle(text)}
                variant="underlined"
                textAlign="center"
                _focus={{
                  _dark: {
                    borderColor: 'dark.300',
                  }
                }}
              />
            </FormControl>

            <FormControl>
              <Input 
                multiline={true}
                numberOfLines={5}
                h="20"
                placeholder="Description"
                fontSize={16}
                value={description}
                onChangeText={text => setDescription(text)}
                variant="filled"
                bg="dark.50"
                _focus={{
                  _dark: {
                    borderColor: 'gray.700',
                    backgroundColor: 'dark.50'
                  }
                }}
              />
            </FormControl>

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
                    LayoutAnimation.configureNext({
                      duration: 100,
                      update: { type: LayoutAnimation.Types.easeInEaseOut },
                    });
                    setShowDatePicker(bool)
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
              
              <Box alignItems="center" mt="2.5">
                {
                  showDatePicker && Platform.OS !== 'android' && (
                    <HStack space={3}>
                      <DateTimePicker
                        themeVariant="dark"
                        minimumDate={new Date()}
                        textColor="white"
                        value={date}
                        mode={'datetime'}
                        is24Hour={true}
                        onChange={(event, selectedDate) => {
                          setDate(selectedDate);
                        }}
                      />
                    </HStack>
                  )
                }
              </Box>
            </Box>

            <DropDownPicker
              listMode="SCROLLVIEW"
              theme="DARK"
              open={dropdownOpen}
              value={dropdownValue}
              items={dropdownItems}
              setOpen={setDropdownOpen}
              setValue={setDropdownValue}
              setItems={setDropdownItems}
            />

            <Button 
              w="100%"
              colorScheme="green"
              onPress={() => {
                if (showDatePicker) {
                  props.onSubmit(title, description, dropdownValue, date);
                } else {
                  props.onSubmit(title, description, dropdownValue);
                }
                setTitle("");
                setDescription("");
                props.setOpen(false);
              }}
            >
              Add Todo
            </Button>
          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  )
}

{/* <Input autoCapitalize='none' fontSize={16} h={10} placeholder="Email"
  value={emailText} onChangeText={text => setEmailText(text)}
  variant="filled"
  _focus={{
    _dark: {
      borderColor: 'gray.600',
      backgroundColor: 'dark.100'
    }
  }}
/> */}
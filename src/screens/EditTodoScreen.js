import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import moment from "moment";
import { Box, HStack, Input, VStack, Text, Switch, Select, ScrollView, Button } from "native-base";
import { useEffect, useState } from "react";
import { LayoutAnimation } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import NagaUtils from "../../utils/NagaUtils";
import { dropdownColorValues } from '../components/AddTodoModal';
import { dbRef } from "../firebase";

export default function EditTodoScreen({navigation, route}) {


  //TODO: ADD ANDROID COMPATIBILITY BY ADDING THOSE BUTTONS THAT IMPERATIVELY OPEN THE DATE TIME PICKERS
  //AND STUFF

  const [ title, setTitle ] = useState(route.params.item.title);
  const [ description, setDescription ] = useState(route.params.item.description);

  const [ showDatePicker, setShowDatePicker ] = useState(false);
  const [ dropdownItems, setDropdownItems ] = useState(dropdownColorValues);
  const [ dropdownOpen, setDropdownOpen ] = useState(false);
  const [ dropdownValue, setDropdownValue ] = useState(route.params.item.color);
  const [ date, setDate ] = useState(new Date());
  const [ allDay, setAllDay] = useState(route.params.item.allDay);
  const [ reminderValue, setReminderValue ] = useState(route.params.item.reminder);
  const [ number, setNumber ] = useState(route.params.item.customReminder.split(' ')[0]?? "30");
  const [ units, setUnits ] = useState(route.params.item.customReminder.split(' ')[1]?? "minutes");

  useEffect(() => {
    if (route.params.item.dueDate == null) {
      setDate(new Date());
      setShowDatePicker(false);
    } else {
      setDate(new Date(route.params.item.dueDate));
      setShowDatePicker(true);
    }
  }, []);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    dbRef(`/todos/${route.params.item.id}`).update({
      dueDate: currentDate.getTime()
    })
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
    <Box
      w="100%"
      h="100%"

      _dark={{
        bg: "dark.100"
      }}

      _light={{
        bg: "white"
      }}
    >
      <ScrollView contentContainerStyle={{
        paddingHorizontal: 20,
        paddingVertical: 15
      }}>
        <VStack space="3">
          <Box px="1">
            <Input
              size="2xl"
              textAlign="center"
              value={title}
              variant="underlined"
              onChangeText={setTitle}
              onEndEditing={() => {
                dbRef(`/todos/${route.params.item.id}`).update({
                  title: title
                })
              }}
            /> 
          </Box>
          <Input
            size="lg"
            multiline={true}
            numberOfLines={10}
            minH="120"
            variant="filled"
            value={description}
            onChangeText={setDescription}
            bg="dark.50"
            _focus={{
              _dark: {
                borderColor: 'gray.700',
                backgroundColor: 'dark.50'
              }
            }}
            onEndEditing={() => {
              dbRef(`/todos/${route.params.item.id}`).update({
                description: description
              })
            }}
          />

          <DropDownPicker
            dropDownDirection="BOTTOM"
            listMode="SCROLLVIEW"
            theme="DARK"
            open={dropdownOpen}
            value={dropdownValue}
            items={dropdownItems}
            setOpen={setDropdownOpen}
            setValue={setDropdownValue}
            setItems={setDropdownItems}
            onChangeValue={value => {
              dbRef(`/todos/${route.params.item.id}`).update({
                color: value
              })
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

                  dbRef(`/todos/${route.params.item.id}`)
                    .update({ dueDate: bool? date.getTime() : null});
                }}
              />
              
            </HStack>
            {
              showDatePicker && Platform.OS === 'android' &&
                <>
                  <Box mt="2" w='48' borderRadius="10" bg="dark.50:alpha.60" pt="1" pb="1.5" alignSelf="center">
                    <Text color="gray.400" textAlign="center" fontSize="16">
                      { 
                        moment(date).format(
                          allDay? 'MMM Do' : 'MMM Do, h:mm a'
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
                      !allDay && (
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
                          dbRef(`/todos/${route.params.item.id}`).update({
                            dueDate: selectedDate.getTime()
                          })
                        }}
                      />
                    )
                  }
                  <HStack mt="2.5" ml="10" alignItems="center" space={4} alignSelf="center">
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
                        setAllDay(bool)
                        dbRef(`/todos/${route.params.item.id}`).update({
                          allDay: bool
                        })
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

              setReminderValue(itemValue);

              dbRef(`/todos/${route.params.item.id}`).update({
                reminder: itemValue
              })
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
            reminderValue == "custom" && (
              <Box display="flex" flexDir="row">
                <Box flex={1.4}>
                  <Picker
                    dropdownIconColor="white"
                    selectedValue={number}
                    onValueChange={n => {
                      setNumber(n);

                      dbRef(`/todos/${route.params.item.id}`).update({
                        customReminder: `${n} ${units}`
                      });
                    }}
                  >
                    {
                      function() {
                        let n = NagaUtils.getNumberOfOptions(units);
                        
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
                      let n = Math.min(parseInt(number, 10), NagaUtils.getNumberOfOptions(u))
                      //This is bad because it doesnt use the prev value to set the new number value
                      //However the picker is pretty slow so it should be ok
                      setNumber(n.toString());

                      dbRef(`/todos/${route.params.item.id}`).update({
                        customReminder: `${n} ${u}`
                      });

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
            )
          }
        </VStack>
      </ScrollView>
    </Box>
  )
}
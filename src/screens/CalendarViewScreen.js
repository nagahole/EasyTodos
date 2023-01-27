import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import moment from "moment";
import { Box, Button, HStack, Text } from "native-base";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Agenda, AgendaList, Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NagaUtils from "../../utils/NagaUtils";
import { dbRef } from "../firebase";

const daysBackwardsToRender = 20;
const daysForwardsToRender = 100;

export default function CalendarViewScreen({navigation, route}) {
  const insets = useSafeAreaInsets();

  const [_callbackTodos, _setCallbackTodos] = useState([]);
  const [agendaData, setAgendaData] = useState({});

  const readData = useCallback(() => {

    dbRef('/todos').on('value', snapshot => {
      const data = snapshot.val();
      const loadedList = [];
      for (const key in data) {
        if (data[key].complete)
          continue;
        loadedList.push({
          id: key,
          title: data[key].title,
          description: data[key].description,
          color: data[key].color,
          dueDate: data[key].dueDate,
          pinned: data[key].pinned?? false,
          complete: data[key].complete,
          createdAt: data[key].createdAt,

          reminder: data[key].reminder ?? "none",
          customReminder: data[key].customReminder ?? "30 minutes",
          allDay: data[key].allDay,
          reminderID: data[key].reminderID
        })
      }

      _setCallbackTodos(loadedList);
    })

  }, []);

  useEffect(() => {
    _callbackTodos.sort((a,b) => NagaUtils.sortTodoComparator(a, b, "due date"));

    let res = {};

    let until = new Date(Date.now() + 60 * 60 * 24 * daysForwardsToRender * 1000);

    for (
        let d = new Date(Date.now() - 60 * 60 * 24 * daysBackwardsToRender * 1000); 
        d <= until; 
        d.setDate(d.getDate() + 1)
      ) {
      res[moment(d).format("YYYY-MM-DD")] = [];
    }

    //Parses todos into a format usable by <Agenda>
    for (let todo of _callbackTodos) {
      if (todo.dueDate == null || todo.dueDate == undefined)
        continue;

      let date = new Date(todo.dueDate);

      let dateString = moment(date).format("YYYY-MM-DD"); // 2020-08-19 (year-month-day) notice the different locale

      if (res.hasOwnProperty(dateString)) {
        res[dateString].push(todo);
      } else {
        res[dateString] = [todo];
      }
    }
    setAgendaData(res);
  }, [_callbackTodos])

  useEffect(() => {
    readData();
  },[]);

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

      pt={insets.top}
      pl={insets.left}
      pr={insets.right}
    >
      <Box>
        <HStack pt="3" px="3" justifyContent="space-between">
          <Button
            variant="unstyled"
            colorScheme="green"
            onPress={() => navigation.openDrawer() }
          >
            <HStack alignItems="center" space="3">
              <FontAwesomeIcon color="#22c55e" icon="fa-solid fa-bars" size={24}/>
              <Text fontSize="18" fontWeight="500" color="green.500">Calendar</Text>
            </HStack>
          </Button>
        </HStack>
      </Box>
      <Agenda
        theme={{
          calendarBackground: "#27272a",
          dayTextColor: '#fff',
          textDisabledColor: '#555',
          monthTextColor: '#aaa',
          selectedDayBackgroundColor: "#0ea5e9",
          dotColor: "#0ea5e9",
          agendaTodayColor: "#0ea5e9",
          'stylesheet.agenda.main': {
            reservations: {
            backgroundColor: "#18181b",
            flex: 1,
            marginTop: 104
            }
          }
        }}
        items={agendaData}
        renderItem={(item, isFirst) => (
          <TouchableOpacity onPress={() => { navigation.navigate("Calendar Edit", {
            item: item,
            
          }) }}>
            <Box 
              flex={1}
              borderRadius="10"
              p="3"
              mr="5"
              mt="4"
              bg={
                item.color === 'red'
                ? 'red.600'
                : item.color === 'orange'
                ? 'orange.600'
                : item.color === 'yellow'
                ? 'yellow.600'
                : item.color === 'green'
                ? 'green.600'
                : item.color === 'blue'
                ? 'blue.600'
                : item.color === 'indigo'
                ? 'indigo.600'
                : item.color === 'violet'
                ? 'violet.600'
                : 'white'
              }
            >
              <HStack w="100%" justifyContent="space-between">
                <Text color="white" flex={1.75} fontSize={22} lineHeight={28} mt="-1">{item.title}</Text>
                {
                  item.reminder !== 'none' && (
                    <HStack flex={1} space={1.5} justifyContent="flex-end" pt="0.5">
                      <Text style={{ marginTop: -3.5 }} color="white" >
                        {
                          item.reminder !== "custom"
                          ? item.reminder 
                          : item.customReminder.split(' ')[1] === 'minutes'
                          ? item.customReminder.split(' ')[0] + " mins"
                          : item.customReminder
                        }
                      </Text>
                      <FontAwesomeIcon icon="fa-solid fa-bell" color="white" size={16} style={{ marginTop: -0.5 }}/>
                    </HStack>
                  )
                }
              </HStack>
              <Text mt="0.5" color="gray.200">{ item.allDay? "All day" : moment(new Date(item.dueDate)).format('h:mm a') }</Text>
              <Text mt="0.5" color="gray.200">{item.description}</Text>
            </Box>
          </TouchableOpacity>
        )}
      />
    </Box>
  )
}
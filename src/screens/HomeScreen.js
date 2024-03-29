import { Box, Button, FlatList, Heading, HStack, Menu, Pressable, Text, View, VStack } from "native-base";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useEffect } from "react";
import { useState } from "react";
import { Alert, Dimensions, LayoutAnimation } from "react-native";
import FlatlistTodoItem from "../components/FlatlistTodoItem";
import EditTodoModal from "../components/EditTodoModal";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useRef } from "react";
import Animated, { Easing, timing, useAnimatedStyle, useSharedValue, useValue, withSpring, withTiming } from "react-native-reanimated";
import { dbRef } from "../firebase";
import SetReminderModal from "../components/SetReminderModal";
import notifee, { TriggerType } from '@notifee/react-native';
import moment from "moment";
import NagaUtils from "../../utils/NagaUtils";

//TODO: Move this into a util folder

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

export const defaultSettings = {
  sortBy: 'creation date',
  darkMode: true,
}

export default function HomeScreen({navigation, route}) {

  const insets = useSafeAreaInsets();

  const [todos, setTodos] = useState([]);

  const [settings, setSettings] = useState(defaultSettings);

  const [justLaunched, setJustLaunched] = useState(true); //This is to bypass animations for initial sort
  const justLaunchedTimeout = 1000;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalItem, setEditModalItem] = useState({
    id: -1,
    title: '',
    description: '',
    dueDate: new Date(),

    reminder: "none",
    customReminder: "30 minutes"
  });

  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderModalItem, setReminderModalItem] = useState({
    id: -1,
    title: '',
    description: '',
    dueDate: new Date(),

    reminder: "none",
    customReminder: "30 minutes"
  });

  const [_callbackTodos, _setCallbackTodos ] = useState([]);
  /*
    THIS IS A HACK:

    The problem is that within the useCallback callback, settings doesn't get updated,
    so whenever new todos are fetched from the database, it doesn't get sorted properly
    according to the type of sort (ie by creation date, due date, or title). So I have
    a _callbackTodos useState that will be called inside the useCallback, which a useEffect
    will respond to outside of the callback (thus allowing it to access the correct 
    settings.sortby) and push the _callbackTodos (sorted first) to normal todos accordingly
  */

  const readData = useCallback(() => {

    dbRef('/todos').on('value', snapshot => {
      const data = snapshot.val();
      const loadedList = [];
      for (const key in data) {
        if (route.params.mode === 'completed'? !data[key].complete : data[key].complete)
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

      //TODO : Figurer out a better solution than this
      //This is called whenever ANY update is made to ANY
      //Todolist item, and loops through EVERY todo
      if (route.params.mode !== 'completed') { //Runs when items are incomplete
        notifee.cancelAllNotifications();
        for(let i = 0; i < loadedList.length; i++) {
          setupNotification(loadedList[i]);
        }
      }
      

      _setCallbackTodos(loadedList); //Read initialization for notes
    })

    dbRef('/settings').on('value', snapshot => {
      const data = snapshot.val();

      if(data == null) {
        dbRef('/settings')
          .set(defaultSettings)
          .then(() => { console.log("Init settings")} );
      } else {
        setSettings(prev => ({
          ...prev,
          sortBy: data.sortBy
        }));
      }
    });

  }, []);

  useEffect(() => {
    readData();

    setTimeout(() => {
      setJustLaunched(false);
    }, justLaunchedTimeout);
  },[]);

  useEffect(() => {
    sortTodos();
  }, [settings.sortBy])

  useEffect(() => {
    if (!justLaunched) {
      LayoutAnimation.configureNext({
        duration: 300,
        update: { type: LayoutAnimation.Types.easeInEaseOut },
        delete: {
          duration: 150,
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });
    }
    setTodos(_callbackTodos.sort((a,b) => NagaUtils.sortTodoComparator(a, b, settings.sortBy)));
  }, [_callbackTodos])

  function sortTodos() {
    if (!justLaunched) {
      LayoutAnimation.configureNext({
        update: { duration: 300, type: LayoutAnimation.Types.easeInEaseOut },
      });
    }
    
    setTodos(prev => { 
      /*
        I have to use a deep copy here that gets returned to Todos because apparently react
        doesn't register sorting arrays as an update -> ie they see arrays and their sorted
        counterparts as the same thing??

        So using a copy is basically explicitly telling react that "Hey, this is a different
        value and I need you to update it accordingly"
      */
      let copy = [...prev];
      copy.sort((a,b) => NagaUtils.sortTodoComparator(a, b, settings.sortBy));
      return copy;
    });
  }

  function toggleComplete(item) {
    dbRef(`/todos/${item.id}`).update({ 
      complete: !item.complete,
      reminder: 'none'
    });
  }

  function saveEditModalChanges() {
    if (editModalItem.id === -1)
      return;

    dbRef(`/todos/${editModalItem.id}`).update({
      title: editModalItem.title,
      description: editModalItem.description.trim(),
      color: editModalItem.color,
      dueDate: editModalItem.dueDate,
      allDay: editModalItem.allDay
    });
  }

  async function setupNotification(todoItem) {
    if (todoItem.dueDate == null || todoItem.dueDate == undefined) {
      return;
    }

    notifee.cancelNotification(todoItem.reminderID);

    let secondsPrior;

    switch (todoItem.reminder) {
      case "none":
        return;
      case "10 minutes":
        secondsPrior = 60 * 10;
        break;
      case "30 minutes":
        secondsPrior = 60 * 30;
        break;
      case "1 hour":
        secondsPrior = 60 * 60;
        break;
      case "1 day":
        secondsPrior = 60 * 60 * 24;
        break;
      case "1 week":
        secondsPrior = 60 * 60 * 24 * 7;
        break;
      case "custom":
        let arr = todoItem.customReminder.split(' ');
        let multiplier;
        switch (arr[1]) { //unit
          case "minutes":
            multiplier = 60;
            break;
          case "hours":
            multiplier = 60 * 60;
            break;
          case "days":
            multiplier = 60 * 60 * 24;
            break;
          case "weeks":
            multiplier = 60 * 60 * 24 * 7;
            break;
          default:
            console.warn("Todo item custom reminder unit not set or unrecognized");
            return;
        }

        secondsPrior = parseInt(arr[0]) * multiplier;

        break;
      default:
        console.warn("Todo item reminder not set or unrecognized");
        return;
    }

    let date;

    if (todoItem.allDay) {
      let d = new Date(todoItem.dueDate);
      d.setHours(0,0,0,0);
      // Set to 12 AM. So eg 1 hour prior notification would notify you at 11PM that tomorrow has something on
      date = new Date(d.getTime() - secondsPrior * 1000);
    } else {
      date = new Date(todoItem.dueDate - secondsPrior * 1000);
    }

    if (date < new Date()) {
      console.log("Reminder is not in the future, aborting");
      return;
    }

    // Create a time-based trigger
    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(), // fire at 11:10am (10 minutes before meeting)
    };

    function weekOfTheYear(d) {
      // Copy date so don't modify original
      d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      // Set to nearest Thursday: current date + 4 - current day number
      // Make Sunday's day number 7
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
      // Get first day of year
      var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      // Calculate full weeks to nearest Thursday
      var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
      // Return array of year and week number
      return weekNo;
    }

    let notifBody;
    let dueDate = new Date(todoItem.dueDate);
    let notifDate = date;
    let dueMoment = moment(dueDate);
    let timeText = dueMoment.format("h:mm a");

    dueDate.setHours(0, 0, 0, 0);
    notifDate.setHours(0, 0, 0, 0);

    let daysGap = Math.round(new Date(dueDate - notifDate).getTime() / (60 * 60 * 24 * 1000));
    let weeksGap = Math.round(weekOfTheYear(dueDate) - weekOfTheYear(notifDate));

    if (daysGap <= 0) {
      notifBody = "Today";
    } else if (daysGap <= 1) {
      notifBody = "Tomorrow";
    } else if (weeksGap <= 0) {
      notifBody = `${dueMoment.format('dddd')}`;
    } else if (weeksGap <= 1) {
      if ((notifDate.getDay() > 5 || notifDate.getDay() == 0) && // saturday sunday
        dueDate.getDay() !== 0) { 
        // Only if the due day isn't a Sunday 
        notifBody = `${dueMoment.format('dddd')}`;
      } else {
        notifBody = `Next ${dueMoment.format('dddd')}`;
      }
    } else {
      notifBody = `${dueMoment.format('MMM Do')}`
    }

    if (!todoItem.allDay) 
      notifBody += ` at ${timeText}`;

    //console.log(notifBody);

    // Request permissions (required for iOS)
    await notifee.requestPermission()

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Create a trigger notification
    let reminderID = await notifee.createTriggerNotification(
      {
        title: `Reminder for ${todoItem.title}`,
        body: notifBody,
        android: {
          channelId,
          // pressAction is needed if you want the notification to open the app when pressed
          pressAction: {
            id: 'default',
          },
        },
      },
      trigger,
    );

    todoItem.reminderID = reminderID;
  }

  function saveReminderModalChanges() {
    if (reminderModalItem.id === -1)
      return;

    dbRef(`/todos/${reminderModalItem.id}`).update({
      dueDate: reminderModalItem.dueDate,
      allDay: reminderModalItem.allDay,

      reminder: reminderModalItem.reminder,
      customReminder: reminderModalItem.customReminder
    });
  }

  function pinItem(item) {
    dbRef(`/todos/${item.id}`).update({
      pinned: true
    });
  }

  function unpinItem(item) {
    dbRef(`/todos/${item.id}`).update({
      pinned: false
    });
  }

  function clearAllCompletedTodos() {
    for (let todo of todos) {
      if (todo.complete) {
        dbRef(`/todos/${todo.id}`)
          .remove()
          .catch(e => {
            console.warn(e);
          })
      }
    }
  }

  function renderHeaderComponent() {
    return (
      <Box>
        <HStack p="3" justifyContent="space-between">
          <Button
            variant="unstyled"
            colorScheme="green"
            onPress={() => navigation.openDrawer() }
          >
            <HStack alignItems="center" space="3">
              <FontAwesomeIcon color="#22c55e" icon="fa-solid fa-bars" size={24}/>
              <Text fontSize="18" fontWeight="500" color="green.500">{route.params.mode === 'completed'? "Completed" : "Home"}</Text>
            </HStack>
          </Button>
          <HStack
            space="3"
          >
            <VStack mt="1.5">
              <Text textAlign="right" color="dark.300" fontSize="12">Sorted by</Text>
              <Text textAlign="right" color="dark.500">{settings.sortBy.capitalize()}</Text>
            </VStack>
            <Menu 
              w="190" 
              placement="bottom right"
              trigger={triggerProps => {
              return (
                <Pressable p="3" accessibilityLabel="More options menu" {...triggerProps}>
                  <FontAwesomeIcon size={24} color="#22c55e" icon="fa-solid fa-filter" />
                </Pressable>
                )
              }}
            >
              <Menu.Group title="Sort by">
                <Menu.Item h="12" justifyContent="center" value="creation date" onPress={() => {
                  dbRef('/settings')
                    .update({
                      sortBy: 'creation date'
                    });
                }}>
                  <Text fontSize="16">Creation date</Text>
                </Menu.Item>
                <Menu.Item h="12" justifyContent="center" value="due date" onPress={() => {
                  dbRef('/settings')
                    .update({
                      sortBy: 'due date'
                    });
                }}>
                  <Text fontSize="16">Due date</Text>
                </Menu.Item>
                <Menu.Item h="12" justifyContent="center" value="title" onPress={() => {
                  dbRef('/settings')
                    .update({
                      sortBy: 'title'
                    });
                }}>
                  <Text fontSize="16">Title</Text>
                </Menu.Item>
                {/* Cannot be bothered sorting by color */}
              </Menu.Group>
              {
                route.params.mode === "completed" &&
                  <Menu.Group title="Other">
                    <Menu.Item h="12" justifyContent="center" value="creation date" onPress={() => {
                      Alert.alert(
                        "Clear all completed todos?",
                        "This cannot be undone. Continue?",
                        [
                          {
                            text: "Cancel",
                            style: 'cancel'
                          },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: () => { clearAllCompletedTodos() }
                          }
                        ]
                      )
                    }}>
                      <FontAwesomeIcon color="white" size={20} icon="fa-solid fa-trash" />
                    </Menu.Item>
                  </Menu.Group>
              }
            </Menu>
          </HStack>
        </HStack>
      </Box>
    )
  }

  const viewableItems = useSharedValue([]);

  const onViewCallBack = useCallback(({viewableItems: vItems})=> {
    viewableItems.value = vItems;
  }, []) // any dependencies that require the function to be "redeclared"

  async function deleteItem(item) {
    await dbRef(`/todos/${item.id}`).remove();
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
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right
      }}
    >      
      <EditTodoModal
        isOpen={editModalOpen}
        setOpen={setEditModalOpen}
        item={editModalItem}
        setItem={setEditModalItem}
        saveChanges={saveEditModalChanges}
      />
      <SetReminderModal
        isOpen={reminderModalOpen}
        setOpen={setReminderModalOpen}
        item={reminderModalItem}
        setItem={setReminderModalItem}
        saveChanges={saveReminderModalChanges}
      />
      <FlatList
        flex={1}
        data={todos}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeaderComponent}
        onViewableItemsChanged={onViewCallBack}
        renderItem={({item}) => 
          <FlatlistTodoItem
            setReminderModalItem={setReminderModalItem}
            setReminderModalOpen={setReminderModalOpen}
            viewableItems={viewableItems}
            setModalItem={setEditModalItem}
            setModalOpen={setEditModalOpen}
            pinItem={() => pinItem(item)}
            unpinItem={() => unpinItem(item)}
            item={item}
            toggleComplete={() => {
              toggleComplete(item);
            }}
            deleteTodo={() => {
              deleteItem(item)
            }}
          />
        }
        // Debugging purposes
        // Uncomment when you want to check trigger notification IDs
        // ListFooterComponent={
        //   <Button onPress={() => {notifee.getTriggerNotificationIds().then(ids => console.log('All trigger notifications: ', ids));
        // }}>
        //     Press me
        //   </Button>
        // }
      />
    </Box>
  )
}
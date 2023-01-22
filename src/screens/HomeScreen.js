import { AspectRatio, Box, Button, FlatList, HStack, Icon, IconButton, Image, Input, Menu, Modal, Pressable, ScrollView, Text, View, VStack } from "native-base";
import { auth, databaseURL, firestore } from "../firebase";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useEffect } from "react";
import { firebase } from '@react-native-firebase/database';
import Todo from '../classes/Todo';
import { useState } from "react";
import { Feather } from '@expo/vector-icons';
import { LayoutAnimation, TouchableOpacity } from "react-native";
import FlatlistTodoItem from "../components/FlatlistTodoItem";
import AddTodoModal from "../components/AddTodoModal";
import EditTodoModal from "../components/EditTodoModal";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useRef } from "react";
import { useSharedValue } from "react-native-reanimated";
import { ViewToken } from "react-native";
import { dbRef } from "../firebase";

//TODO: Move this into a util folder

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

const defaultSettings = {
  sortBy: 'creation date',
  darkMode: true,
}

export default function HomeScreen({navigation, route}) {

  const insets = useSafeAreaInsets();

  const [todos, setTodos] = useState([]);

  const [settings, setSettings] = useState(defaultSettings);

  const didMount = useRef(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState({
    id: -1,
    title: '',
    description: '',
    dueDate: new Date()
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
        })
      }

      LayoutAnimation.configureNext({
        duration: 300,
        update: { type: LayoutAnimation.Types.easeInEaseOut },
        delete: {
          duration: 150,
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });

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

  }, [dbRef(), settings]);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    sortTodos();
  }, [settings.sortBy])

  useEffect(() => {
    readData();
  },[]);

  useEffect(() => {
    setTodos(_callbackTodos.sort(sortTodoComparator));
  }, [_callbackTodos])

  function sortTodos() {
    LayoutAnimation.configureNext({
      duration: 300,

      update: { type: LayoutAnimation.Types.easeInEaseOut },
    });

    setTodos(prev => { 
      /*
        I have to use a deep copy here that gets returned to Todos because apparently react
        doesn't register sorting arrays as an update -> ie they see arrays and their sorted
        counterparts as the same thing??

        So using a copy is basically explicitly telling react that "Hey, this is a different
        value and I need you to update it accordingly"
      */
      let copy = [...prev];
      copy.sort(sortTodoComparator);
      return copy;
    });
  }

  function sortTodoComparator(a, b) {
    function compare() {
      if (settings.sortBy === 'creation date') {
        return new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime();
      } else if (settings.sortBy === 'due date') {
        if (a.dueDate == null && b.dueDate == null)
          return new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime();
        else if (a.dueDate == null)
          return true
        else if (b.dueDate == null)
          return false
        else
          return new Date(a.dueDate).getTime() < new Date(b.dueDate).getTime();
      } else if (settings.sortBy === 'title') {
        let res = a.title.localeCompare(b.title, 'en', { sensitivity: 'base' })
        if (res === 0)
          return new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime();
        return res;
      } else {
        console.warn("settings.sortBy not recognized: " + settings.sortBy);
      }
    }

    return (
      (a.pinned && b.pinned)
      ? compare()
      : a.pinned
      ? false
      : b.pinned
      ? true 
      : compare()
    )
  }

  function toggleComplete(item) {

    dbRef(`/todos/${item.id}`).update({ complete: !item.complete });
  }

  function saveModalChanges() {
    console.log("Saving modal changes:");
    console.log("Title:", modalItem.title);
    console.log("Description: '" + modalItem.description + "'");
    console.log("Color:", modalItem.color);
    console.log("dueDate:", modalItem.dueDate);


    dbRef(`/todos/${modalItem.id}`).update({
      title: modalItem.title,
      description: modalItem.description,
      color: modalItem.color,
      dueDate: modalItem.dueDate
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
              <Text fontSize="18" color="green.500">{route.params.mode === 'completed'? "Completed" : "Home"}</Text>
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
                {/* <Menu.Item h="12" justifyContent="center" value="color" onPress={() => {
                  dbref('/settings')
                    .update({
                      sortBy: 'color'
                    })
                }}>
                  <Text fontSize="16">Color</Text>
                </Menu.Item> */}
              </Menu.Group>
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
      pt={insets.top}
      pl={insets.left}
      pr={insets.right}
    >
      <EditTodoModal
        isOpen={modalOpen}
        setOpen={setModalOpen}
        item={modalItem}
        setItem={setModalItem}
        saveChanges={saveModalChanges}
      />
      <FlatList
        flex={1}
        data={todos}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeaderComponent}
        onViewableItemsChanged={onViewCallBack}
        renderItem={({item}) => 
          <FlatlistTodoItem
            viewableItems={viewableItems}
            setModalItem={setModalItem}
            setModalOpen={bool => setModalOpen(bool)}
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
      />
    </Box>
  )
}
import { View, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { Box, HStack, Menu, PresenceTransition, Pressable, Text, VStack } from 'native-base';
import { Swipeable, RectButton } from 'react-native-gesture-handler'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Easing, useAnimatedStyle, useValue, withTiming } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { useState } from 'react';
import moment from 'moment';

export default function FlatlistTodoItem(props) {

  const [swipeableRow, setSwipeableRow] = useState();

  const renderLeftActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
    });
    return (
      <RectButton style={[styles.leftAction, props.item.complete? { backgroundColor: "#06b6d4" } : null]} onPress={() => {}}>
        <FontAwesomeIcon icon={props.item.complete? "fa-solid fa-rotate-left" : "fa-solid fa-check"} size={24} style={{
          flex: 1,
          color: 'white',
          marginLeft: 20
        }}/>
      </RectButton>
    );
  };

  const renderRightAction = (iconName, color, x, progress, callback) => {
    const pressHandler = () => {
      callback();
      close();
    };

    if (iconName === "fa-solid fa-bars") //Probably shouldn't use fucking strings for thins like this
      return (
        <Animated.View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', transform: [{ translateX: 0 }],  }}>
          <Menu 
            trigger={ triggerProps => {
              return (
                <Pressable  
                  w="100%" 
                  h="100%" 
                  accessibilityLabel="More options menu" 
                  {...triggerProps}
                >
                  {
                    ({ isPressed }) => {
                      return ( 
                        <Box 
                          flex={1}
                          bg={isPressed ? "rgba(0,0,0,0.1)" : color} 
                          alignItems="center"
                          justifyContent="center"
                        >
                          <FontAwesomeIcon icon={iconName} color="white" size={20}/>
                        </Box> 
                      )
                    }
                  }
                </Pressable>
              )
            }}
          >
            <Menu.Item h="12" justifyContent="center" onPress={() => {
              Alert.alert(
                "Are you sure you want to delete this todo?",
                "This cannot be undone",
                [
                  {
                    text: "Cancel",
                    style: "cancel"
                  },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                      close();
                      props.deleteTodo();
                    }
                  }
                ]
              )
            }}>
              <Text fontSize={16}>Delete</Text>
            </Menu.Item>
            <Menu.Item h="12" justifyContent="center" onPress={() => {
              close();
              props.setReminderModalItem(props.item);
              setTimeout(() => {
                props.setReminderModalOpen(true);
              }, 50);
            }}>
              <Text fontSize={16}>Set reminder</Text>
            </Menu.Item>
          </Menu>
        </Animated.View>
      )

    return (
      <Animated.View style={{ flex: 1, transform: [{ translateX: 0 }],  }}>
        <RectButton
          style={[styles.rightAction, { backgroundColor: color }]}
          onPress={pressHandler}>
          <FontAwesomeIcon icon={iconName} color="white" size={20}/>
          {
            iconName === "fa-solid fa-thumbtack" && props.item.pinned &&
              <Box position="absolute">
                <FontAwesomeIcon icon="fa-solid fa-slash" color="white" size={24}/>
              </Box>
          }
        </RectButton>
      </Animated.View>
    );
  };

  const renderRightActions = progress => (
    <View style={{ width: 220, flexDirection: 'row', marginRight: 10, marginLeft: -10 }}>
      {renderRightAction("fa-solid fa-pencil", '#27272a', 192, progress, () => {
        props.setModalItem(props.item);
        setTimeout(() => {
          props.setModalOpen(true);
        }, 50);
      } )}
      {renderRightAction("fa-solid fa-thumbtack", '#27272a', 128, progress, () => {
        if(props.item.pinned) {
          props.unpinItem();
        } else {
          props.pinItem();
        }
        
      } )}
      {renderRightAction("fa-solid fa-bars", '#27272a', 64, progress)}
    </View>
  );

  const updateRef = ref => {
    setSwipeableRow(ref);
  };

  const close = () => {
    swipeableRow.close();
  };


  const rStyle = useAnimatedStyle(() => {
    const isVisible =
      props.viewableItems.value
        .filter(item => item.isViewable && item.item.id === props.item.id)
        .length > 0;

    return {
      opacity: withTiming(isVisible? 1 : 0),
      transform: [{
        scale: withTiming(isVisible? 1 : 0.6, {
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      }]
    }
  });

  return (
    <Box>
      <Swipeable
        onSwipeableOpen={direction => {
          if (direction === 'left') {
            //TODO: Make it an option in settings for confirmation of completion
            // Alert.alert(
            //   `Mark todo as ${props.item.complete? "incomplete" : "complete"}?`,
            //   "",
            //   [
            //     {
            //       text: "No",
            //       style: "cancel",
            //       onPress: () => {
            //         close();
            //       }
            //     },
            //     {
            //       text: "Yes",
            //       style: "default",
            //       onPress: () => {
                    props.toggleComplete();
            //       }
            //     }
            //   ]
            // );
          }
        }}
        ref={updateRef}
        friction={2}
        leftThreshold={30}
        rightThreshold={40}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
      >
        <Animated.View
          style={[{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 5,
            },
            shadowOpacity: 0.34,
            shadowRadius: 6.27,

            elevation: 10,

            backgroundColor: "#27272a",
            borderWidth: 1,
            borderTopColor: "#18181b",
            borderLeftColor: "#18181b",
            borderColor: "#3f3f46",
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            marginLeft: 10,
            width: Dimensions.get('window').width - 20,
          }, rStyle ]}
        >
          <Box 
            flex={1.5}
            justifyContent="center"
            alignItems="center"
            borderLeftRadius="20"
            py="4"
            pl="0.5"
            bg={{
              linearGradient: {
                colors: 
                  props.item.color === 'red'
                  ? ['red.500', 'red.600']
                  : props.item.color === 'orange'
                  ? ['orange.500', 'orange.600']
                  : props.item.color === 'yellow'
                  ? ['yellow.500', 'yellow.600']
                  : props.item.color === 'green'
                  ? ['green.500', 'green.600']
                  : props.item.color === 'blue'
                  ? ['blue.500', 'blue.600']
                  : props.item.color === 'indigo'
                  ? ['indigo.500', 'indigo.600']
                  : props.item.color === 'violet'
                  ? ['violet.500', 'violet.600']
                  : ['gray.50', 'gray.100']
              }
            }}
          >
            {
              props.item.dueDate && (
                <>
                  <Text textAlign="center" fontSize="md" lineHeight={18}>
                    { // The bug was caused by the box above being inside this text component
                      // which for some reason on height changes on the flatlist item caused
                      // endless growing of the item. The descriptiontext wasn't the issue: it
                      // just aggravated it whenever it changed the height of the list item
                      moment(new Date(props.item.dueDate)).format('Do') }
                    {'\n'}
                    { moment(new Date(props.item.dueDate)).format('MMM') }
                  </Text>
                  {
                    !props.item.allDay &&
                      <Box mt="2">
                        <Text fontSize="13" color="white">
                            { moment(new Date(props.item.dueDate)).format('h:mm a') }
                        </Text>
                      </Box>
                  }
                </>
              )
            }
            
          </Box>
          <Box flex={5} py="4" px="4">
            <HStack justifyContent="space-between">
              <Text
                mt="-1"
                flex={1.5}
                fontSize={25}
                bold={true}
                lineHeight={27}
                _dark={{
                  color: "white"
                }}
              >
                {props.item.title}
              </Text>
              {
                function() {

                  if (props.item.pinned || props.item.reminder !== "none")
                    return (
                      <VStack flex={1} space="2.5" alignItems="flex-end" mr="-1" mt="-0.5">
                        {
                          props.item.reminder !== "none" && props.item.dueDate != null && 
                            <HStack space={1.5}>
                              <Text style={{ marginTop: -3.5 }} color="gray.500" >
                                {
                                  props.item.reminder !== "custom"
                                  ? props.item.reminder 
                                  : props.item.customReminder.split(' ')[1] === 'minutes'
                                  ? props.item.customReminder.split(' ')[0] + " mins"
                                  : props.item.customReminder
                                }
                              </Text>
                              <FontAwesomeIcon icon="fa-solid fa-bell" color="#fbbf24" size={16} style={{ marginTop: -0.5 }}/>
                            </HStack>
                        }
                        {
                          props.item.pinned &&
                            <FontAwesomeIcon icon="fa-solid fa-thumbtack" color="white" style={{ marginRight: -0.13 }}/>
                        }
                      </VStack>
                    )
                }()
              }
            </HStack>
            {
              props.item.dueDate != undefined && props.item.dueDate != null &&
                <Text color="gray.500">
                  {
                    props.item.allDay
                    ? moment(props.item.dueDate).startOf('day').fromNow().capitalize()
                    : moment(props.item.dueDate).fromNow().capitalize()
                  }
                </Text>
            }
            <Text
              color="dark.500"
            >
              {moment(props.item.createdAt).format('ddd MMM Do, h:mm a')}
            </Text>

            {
              (props.item.description !== "") && 
              <Text
                mt="1"
                color="coolGray.500"
              >{props.item.description}</Text>
            }
            
          </Box>
        </Animated.View>
      </Swipeable>
      <Box h="3.5"></Box>
    </Box>
  )
}

const styles = StyleSheet.create({
  leftAction: {
    borderRadius: 20,
    flex: 1,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    marginHorizontal: 10,
  },

  actionText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'transparent',
    padding: 10,
  },

  rightAction: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
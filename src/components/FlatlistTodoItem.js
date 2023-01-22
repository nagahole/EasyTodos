import { View, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native'
import React from 'react'
import { Box, PresenceTransition, Pressable, Text } from 'native-base';
import { Swipeable, RectButton } from 'react-native-gesture-handler'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Easing, useAnimatedStyle, useValue, withTiming } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { useState } from 'react';

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
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });
    const pressHandler = () => {
      close();
      callback();
    };
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
        props.setModalOpen(true);
      } )}
      {renderRightAction("fa-solid fa-thumbtack", '#27272a', 128, progress, () => {
        if(props.item.pinned) {
          props.unpinItem();
        } else {
          props.pinItem();
        }
        
      } )}
      {renderRightAction("fa-solid fa-trash", '#27272a', 64, progress, () => {
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
                props.deleteTodo();
              }
            }
          ]
        )
      } )}
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
            Alert.alert(
              `Mark todo as ${props.item.complete? "incomplete" : "complete"}?`,
              "",
              [
                {
                  text: "No",
                  style: "cancel",
                  onPress: () => {
                    close();
                  }
                },
                {
                  text: "Yes",
                  style: "default",
                  onPress: () => {
                    props.toggleComplete();
                  }
                }
              ]
            );
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
                ,
                start: [0, 0],
                end: [1, 0]
              }
            }}
          >
            <Text textAlign="center" fontSize="md" lineHeight={18}>
              <Box mb="2">
                <Text fontSize="12" color="white">
                  {
                    props.item.dueDate && new Date(props.item.dueDate).toLocaleTimeString(undefined, {
                      hour: 'numeric',
                      minute: '2-digit'
                    })
                  }
                </Text>
              </Box>
              {'\n'}
              {
                props.item.dueDate && new Date(props.item.dueDate).toLocaleDateString(undefined, {
                  day: 'numeric',
                })
              }
              {'\n'}
              {
                props.item.dueDate && new Date(props.item.dueDate).toLocaleDateString(undefined, {
                  month: 'short'
                })
              }
            </Text>
            
          </Box>
          <Box flex={5} py="4" px="4">
            {
              props.item.pinned &&
                <Box
                position="absolute"
                right="4"
                top="4"
                >
                  <FontAwesomeIcon icon="fa-solid fa-thumbtack" color="white"/>
                </Box> 
            }
            
            <Text
              mt="-2" 
              fontSize={25}
              bold={true}
              _dark={{
                color: "white"
              }}
            >
              {props.item.title}
            </Text>
            <Text
              mt="-1"
              color="dark.500"
            >
              {new Date(props.item.createdAt).toLocaleDateString( undefined, {
                hour: 'numeric',
                minute: '2-digit'
              })}
            </Text>

            {
              (props.item.description !== "") && 
              <Text
                mt="1"
                _dark={{
                  color: "coolGray.500"
                }}
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
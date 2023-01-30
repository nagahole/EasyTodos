import React, { useState } from 'react'
import { Box, Button, Center, FormControl, Heading, Input, Text, VStack } from 'native-base'
import auth from "@react-native-firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import NagaUtils from '../../../utils/NagaUtils';



class DeleteAccountScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPassword: "",
      errors: {}
    }
  }

  confirmAccountDeletion = () => {
    let navigation = this.props.navigation;

    Alert.alert(
      "Are you sure you want to delete your account?",
      "This cannot be undone. Continue?",
      [
        {
          text: "Go back",
          style: "cancel"
        },
        {
          text: "Delete my account",
          style: "destructive",
          onPress() {
            auth().currentUser
              .delete()
              .then(() => { 
                Alert.alert("Account successfuly deleted");
                navigation.replace("Login");
              })
              .catch(error => Alert.alert(error.nativeErrorCode, error.nativeErrorMessage?? error.message))
          }
        }
      ]
    )
  }

  handleDeleteAccount = () => {

    if (auth().currentUser == null) {
      Alert.alert("Please reauthenticate to use this feature (this is likely an issue of not having a stable internet connection)");
      return null;
    }

    if (!NagaUtils.isSignedInWithPassword()) { //Can't reauthenticate with password if you're signed in with Google or Apple etc
      this.confirmAccountDeletion();
      return;
    }

    this.setState({ errors: {} }, () => {
      this
        .reauthenticate(this.state.currentPassword)
        .then(() => {
          // Current password is correct
          this.confirmAccountDeletion();
        })
        .catch((error) => { 
          Alert.alert(error.nativeErrorCode, error.nativeErrorMessage?? error.message);
        });
    })
  }

  reauthenticate = (currentPassword) => {
    var user = auth().currentUser;
    var cred = auth.EmailAuthProvider.credential(
        user.email, currentPassword);
    return user.reauthenticateWithCredential(cred);
  }

  render() {
    return (
      <Center 
        safeArea 
        w="100%"
        h="100%"
        _dark={{
          bg: "dark.50"
        }}

        _light={{
          bg: "white"
        }}
      >
        <Box p="2" w="90%" maxW="290" py="8">
          <VStack space={5} mb="40">
            {
              NagaUtils.isSignedInWithPassword() && (
                <FormControl isInvalid={"currentPassword" in this.state.errors}>
                  <FormControl.Label isInvalid={"currentPassword" in this.state.errors}>Current password</FormControl.Label>
                  <Input  
                    fontSize={16} h={10} 
                    type='password'
                    value={this.state.currentPassword} 
                    onChangeText={text => this.setState({currentPassword: text})}
                    variant="filled"
                    _focus={{
                      _dark: {
                        borderColor: 'gray.600',
                        backgroundColor: 'dark.100'
                      }
                    }}
                  />
                  <FormControl.ErrorMessage>- {this.state.errors.currentPassword}</FormControl.ErrorMessage>
                </FormControl>
              )
            }
            <Button mt="2" colorScheme="danger" onPress={this.handleDeleteAccount}>
              <Text fontWeight="bold">Delete account</Text>
            </Button>
          </VStack>
        </Box>
      </Center>
    )
  }
}

export function WithNavigation(props) {
  const navigation = useNavigation();

  return <DeleteAccountScreen navigation={navigation}/>
}

export default WithNavigation;
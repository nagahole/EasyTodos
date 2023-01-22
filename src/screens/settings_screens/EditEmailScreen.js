import React, { useState } from 'react'
import { Box, Button, Center, FormControl, Heading, Input, VStack } from 'native-base'
import { auth } from '../../firebase'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { emailHasErrors } from '../RegisterScreen';
import { firebase } from '../../firebase';
import { connect } from 'react-redux';
import { setEmail, setPassword } from '../../redux/action';



class EditEmailScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPassword: "",
      newEmail: "",
      errors: {}
    }
  }

  handleEditEmail = () => {

    if (auth.currentUser == null) {
      Alert.alert("Please reauthenticate to use this feature (this is likely an issue of not having a stable internet connection)");
      return null;
    }

    this.setState({ errors: {} }, () => {

      let hasError = false;

      if (emailHasErrors(this.state.newEmail)) {
        this.setState(prev => ({
          errors: { ...prev.errors, email: "Please enter a valid email address"}
        }));
        hasError = true;
      }

      if (Object.keys(this.state.errors).length > 0 || hasError)
        return;


      this
        .reauthenticate(this.state.currentPassword)
        .then(() => {
          // Current password is correct
          auth.currentUser
            .updateEmail(this.state.newEmail)
            .then(() => {
              // Email successfully updated
              this.props.dispatch(setEmail(this.state.newEmail));

              auth.currentUser.sendEmailVerification()
                .then(() => {
                  this.setState({
                    currentPassword: "",
                    newEmail: "",
                  });
                  this.props.navigation.goBack();
                  Alert.alert("Email updated and verification sent");
                })
                .catch((error) => {Alert.alert(error.message )})

              
            })
            .catch((error) => { Alert.alert(error.message) });
        })
        .catch((error) => { 
          if (error.code === 'auth/wrong-password') {
            //Don't need to account for previous password errors since up to this point
            //there will have been no password errors

            //Will need to update if somehow there can be an error up to here
            this.setState(prev => ({
              errors: { ...prev.errors, currentPassword: "Wrong password" }
            }));
            return;
          }
          Alert.alert(error.message);
        });
    })
  }

  reauthenticate = (currentPassword) => {
    var user = auth.currentUser;
    var cred = firebase.auth.EmailAuthProvider.credential(
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
            <FormControl isInvalid={"email" in this.state.errors}>
              <FormControl.Label>New email</FormControl.Label>
              <Input 
                autoCorrect={false}
                autoCapitalize='none' 
                fontSize={16} h={10} 
                value={this.state.newEmail} 
                onChangeText={text => this.setState({newEmail: text})}
                variant="filled"
                _focus={{
                  _dark: {
                    borderColor: 'gray.600',
                    backgroundColor: 'dark.100'
                  }
                }}
              />
              <FormControl.ErrorMessage>- Please enter a valid email address</FormControl.ErrorMessage>
            </FormControl>
            <Button mt="2" colorScheme="green" onPress={this.handleEditEmail}>
              Update email
            </Button>
          </VStack>
        </Box>
      </Center>
    )
  }
}

export function WithNavigation(props) {
  const navigation = useNavigation();

  return <EditEmailScreen navigation={navigation} dispatch={props.dispatch} />
}

export default connect()(WithNavigation);
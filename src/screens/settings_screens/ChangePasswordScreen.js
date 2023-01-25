import React, { useState } from 'react'
import { Box, Button, Center, FormControl, Heading, Input, VStack } from 'native-base'
import auth from "@react-native-firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { checkPasswordErrors } from '../pre_login_screens/RegisterScreen';
import { firebase } from '../../firebase';
import { connect } from 'react-redux';
import { setPassword } from '../../redux/action';



class ChangePasswordScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      errors: {}
    }
  }

  handleResetPassword = () => {

    if (auth().currentUser == null) {
      Alert.alert("Please reauthenticate to use this feature (this is likely an issue of not having a stable internet connection)");
      return null;
    }

    this.setState({ errors: {} }, () => {

      let hasError = false;

      let passwordErrors = checkPasswordErrors(this.state.newPassword);

      if(passwordErrors.length > 0) {
        this.setState(prev => ({
          errors: { ...prev.errors, password: passwordErrors }
        }));
        hasError = true;
      }
    
      if (this.state.newPassword !== this.state.confirmNewPassword) {
        this.setState(prev => ({
          errors: { ...prev.errors, confirmPassword: "Passwords aren't matching" }
        }));
        hasError = true;
      }

      if (Object.keys(this.state.errors).length > 0 || hasError)
        return;


      this
        .reauthenticate(this.state.currentPassword)
        .then(() => {
          // Current password is correct
          if (this.state.currentPassword === this.state.newPassword) {
            //Don't need to account for previous password errors since up to this point
            //there will have been no password errors
            this.setState(prev => ({
              errors: { ...prev.errors, password: [ "Please choose a password that is different from your current password"] }
            }));
            return;
          }
          auth().currentUser
            .updatePassword(this.state.newPassword)
            .then(() => {
              this.props.navigation.goBack();

              this.setState({
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: ""
              });

              Alert.alert("Password updated");
            })
            .catch((error) => { Alert.alert(error.nativeErrorCode, error.nativeErrorMessage) });
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
          <VStack space={3} mb="40">
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
            <FormControl isInvalid={"password" in this.state.errors}>
              <FormControl.Label>New password</FormControl.Label>
              <Input 
                autoCapitalize='none' 
                fontSize={16} h={10} 
                type="password"  
                value={this.state.newPassword} 
                onChangeText={text => this.setState({newPassword: text})}
                variant="filled"
                _focus={{
                  _dark: {
                    borderColor: 'gray.600',
                    backgroundColor: 'dark.100'
                  }
                }}
              />
              
              {
                !("password" in this.state.errors)?
                <FormControl.HelperText
                  _text={{
                    fontSize: 'xs'
                  }}
                >
                  Password should be atleast 8 characters long and contain a combination of uppercase and lowercase letters,
                  numbers, and symbols
                </FormControl.HelperText>
                :
                <FormControl.ErrorMessage>
                {
                  this.state.errors.password.map(error => {
                    return `- ${error}`
                  }).join("\n")
                }
                </FormControl.ErrorMessage>
              }

            </FormControl>
            <FormControl isInvalid={'confirmPassword' in this.state.errors}>
              <FormControl.Label>Confirm new password</FormControl.Label>
              <Input 
                autoCapitalize='none' 
                fontSize={16} h={10} 
                type="password"  
                value={this.state.confirmNewPassword} 
                onChangeText={text => { this.setState({confirmNewPassword: text}); }}
                variant="filled"
                _focus={{
                  _dark: {
                    borderColor: 'gray.600',
                    backgroundColor: 'dark.100'
                  }
                }}
              />
              <FormControl.ErrorMessage>- {this.state.errors.confirmPassword}</FormControl.ErrorMessage>
            </FormControl>
            <Button mt="2" colorScheme="green" onPress={this.handleResetPassword}>
              Change password
            </Button>
          </VStack>
        </Box>
      </Center>
    )
  }
}

export function WithNavigation(props) {
  const navigation = useNavigation();

  return <ChangePasswordScreen navigation={navigation}/>
}

export default connect()(WithNavigation);
import React from 'react'
import { Box, Button, Center, FormControl, Heading, Input, VStack } from 'native-base'
import auth from "@react-native-firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

export function checkPasswordErrors(password) {
  let hasLowerCase = false;
  let hasUpperCase = false;
  let hasSymbol = false;
  let hasNumber = false;

  for(let i = 0; i < password.length; i++) {
    let c = password[i];

    if ("abcdefghijklmnopqrstuvwxyz".includes(c))
      hasLowerCase = true;

    if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(c))
      hasUpperCase = true;

    if ("!@#$%^&*()_+-={}|[]\\\\;':\",./<>?`~".includes(c))
      hasSymbol = true;

    if ("1234567890".includes(c))
      hasNumber = true;
  }

  let passwordErrors = [];

  if(!hasLowerCase) {
    passwordErrors.push("Must contain a lowercase letter");
  }

  if(!hasUpperCase) {
    passwordErrors.push("Must contain an uppercase letter");
  }

  if(!hasSymbol) {
    passwordErrors.push("Must contain a symbol");
  }

  if(!hasNumber) {
    passwordErrors.push("Must contain a number");
  }

  if(password.length < 8) {
    passwordErrors.push("Must be greater than 8 characters long");
  }

  return passwordErrors;
}

export function emailHasErrors(email) {
  return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

class RegisterScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      confirmPassword: "",
      errors: {}
    }
  }

  handleSignUp = () => {
    this.setState({ errors: {} }, () => {

      let hasError = false;

      if (emailHasErrors(this.state.email)) {
        this.setState(prev => ({
          errors: { ...prev.errors, email: "Please enter a valid email" }
        }));
        hasError = true;
      }

      let passwordErrors = checkPasswordErrors(this.state.password);

      if(passwordErrors.length > 0) {
        this.setState(prev => ({
          errors: { ...prev.errors, password: passwordErrors }
        }));
        hasError = true;
      }
    
      if (this.state.password !== this.state.confirmPassword) {
        this.setState(prev => ({
          errors: { ...prev.errors, confirmPassword: "Passwords aren't matching" }
        }));
        hasError = true;
      }

      if (Object.keys(this.state.errors).length > 0 || hasError)
        return;

      auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(userCredentials => {
          auth().currentUser
            .sendEmailVerification()
            .then(() => {
              Alert.alert("Email verification sent");
            })
            .catch(error => { console.log(error); Alert.alert(error.code, error.message)});//error.nativeErrorCode, error.nativeErrorMessage?? error.message));
        })
        .catch(error => Alert.alert(error.nativeErrorCode, error.nativeErrorMessage?? error.message));
    })
  }

  render() {

    const { navigation } = this.props;

    return (
      <Center 
        w="100%"
        h="100%"
        _dark={{
          bg: "dark.50"
        }}

        _light={{
          bg: "white"
        }}
        safeArea
      >
        <Box safeArea p="2" w="90%" maxW="290" py="8">
          <Heading size="lg" color="coolGray.800" _dark={{
          color: "warmGray.50"
        }} fontWeight="semibold">
            Welcome
          </Heading>
          <Heading mt="1" color="coolGray.600" _dark={{
          color: "warmGray.200"
        }} fontWeight="medium" size="xs">
            Sign up to continue!
          </Heading>
          <VStack space={3} mb="20">
            <FormControl isInvalid={"email" in this.state.errors}>
              <FormControl.Label>Email</FormControl.Label>
              <Input 
                autoCapitalize='none' 
                autoCorrect={false}
                fontSize={16} h={10} 
                value={this.state.email} 
                onChangeText={text => this.setState({email: text})}
                variant="filled"
                _focus={{
                  _dark: {
                    borderColor: 'gray.600',
                    backgroundColor: 'dark.100'
                  }
                }}
              />
              <FormControl.ErrorMessage>{this.state.errors.email}</FormControl.ErrorMessage>
            </FormControl>
            <FormControl isInvalid={"password" in this.state.errors}>
              <FormControl.Label>Password</FormControl.Label>
              <Input 
                autoCapitalize='none' 
                fontSize={16} h={10} 
                type="password"  
                value={this.state.password} 
                onChangeText={text => this.setState({password: text})}
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
                    console.log(error);
                    return `- ${error}`
                  }).join("\n")
                }
                </FormControl.ErrorMessage>
              }

            </FormControl>
            <FormControl isInvalid={'confirmPassword' in this.state.errors}>
              <FormControl.Label>Confirm Password</FormControl.Label>
              <Input 
                autoCapitalize='none' 
                fontSize={16} h={10} 
                type="password"  
                value={this.state.confirmPassword} 
                onChangeText={text => { this.setState({confirmPassword: text}); }}
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
            <Button mt="2" colorScheme="green" onPress={this.handleSignUp}>
              Sign up
            </Button>
            <Button mt="2" variant="outline" colorScheme="green" onPress={() => { navigation.goBack(); }}>
              Go back
            </Button>
          </VStack>
        </Box>
      </Center>
    )
  }
}

export default function(props) {
  const navigation = useNavigation();

  return <RegisterScreen navigation={navigation} />
}
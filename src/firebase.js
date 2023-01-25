// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { firebase as dbFirebase } from '@react-native-firebase/database';
import auth from "@react-native-firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBV65vG4p-Zsz6MiP9s5CjCCfA2rBdzUFM",
  authDomain: "easy-todo-ffcb3.firebaseapp.com",
  projectId: "easy-todo-ffcb3",
  storageBucket: "easy-todo-ffcb3.appspot.com",
  messagingSenderId: "683728813647",
  appId: "1:683728813647:web:91b1ee68c9237eb653f43a",
  measurementId: "G-EYQQW05FWM",
  databaseURL: "https://easy-todo-ffcb3-default-rtdb.firebaseio.com"
};

// Initialize Firebase

let app;

if(firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

const databaseURL = "https://easy-todo-ffcb3-default-rtdb.firebaseio.com";

const dbRef = (refAddon = "") => {
  return dbFirebase
    .app()
    .database(databaseURL)
    .ref(`/users/${auth().currentUser.uid}` + refAddon);
}

export { databaseURL, dbRef }
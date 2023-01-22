import { SET_DARK_MODE, SET_EMAIL, SET_PASSWORD, SET_SIGNED_IN, SET_UID } from "./action";

const initialState = {
  email: "",
  password: "",
  signedIn: false,
  uid: ""
};

const todoReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_EMAIL: 
      return { ...state, email: action.payload };
    case SET_PASSWORD:
      return { ...state, password: action.payload };
    case SET_SIGNED_IN:
      return { ...state, signedIn: action.payload };
    case SET_UID:
      return { ...state, uid: action.payload }; 
    default:
      return state;
  }
}



export default todoReducer;
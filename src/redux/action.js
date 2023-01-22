export const SET_EMAIL = "SET_EMAIL";
export const SET_PASSWORD = "SET_PASSWORD";
export const SET_SIGNED_IN = "SET_SIGNED_IN";
export const SET_UID = "SET_UID";

export const setEmail = email => ({
  type: SET_EMAIL,
  payload: email
});

export const setPassword = password => ({
  type: SET_PASSWORD,
  payload: password
});

export const setSignedIn = isLoggedIn => ({
  type: SET_SIGNED_IN,
  payload: isLoggedIn
});

export const setUID = uid => ({
  type: SET_UID,
  payload: uid
});
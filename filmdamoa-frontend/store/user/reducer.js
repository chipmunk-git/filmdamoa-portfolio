import { userActionTypes } from './action';

const userInitialState = {
  username: null,
  accessToken: null,
};

export default function reducer(state = userInitialState, action) {
  switch (action.type) {
    case userActionTypes.LOGIN_SUCCESS:
    case userActionTypes.FETCH_USER_SUCCESS:
      return {
        ...state,
        username: action.username,
      };
    case userActionTypes.LOGOUT_SUCCESS:
      return {
        ...state,
        username: null,
      };
    case userActionTypes.SET_ACCESS_TOKEN_SUCCESS:
      return {
        ...state,
        accessToken: action.accessToken
      };
    case userActionTypes.SET_AUTH_HEADER_SUCCESS:
      return {
        ...state,
        accessToken: null
      };
    default:
      return state;
  }
}
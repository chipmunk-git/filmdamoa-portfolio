import { userActionTypes } from './action';

const userInitialState = {
  username: null,
};

export default function reducer(state = userInitialState, action) {
  switch (action.type) {
    case userActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        username: action.username,
      };
    case userActionTypes.LOGOUT_SUCCESS:
      return {
        ...state,
        username: null,
      };
    default:
      return state;
  }
}
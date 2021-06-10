import { http } from '../../lib/http';

export const userActionTypes = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
  SET_ACCESS_TOKEN_SUCCESS: 'SET_ACCESS_TOKEN_SUCCESS',
  SET_AUTH_HEADER_SUCCESS: 'SET_AUTH_HEADER_SUCCESS',
  FETCH_USER_SUCCESS: 'FETCH_USER_SUCCESS',
};

export const login = (reqObj) => async (dispatch) => {
  try {
    const resp = await http.post('/auth/login', reqObj, { withCredentials: true });
    const { accessToken, username } = resp.data;
    http.defaults.headers.Authorization = `Bearer ${accessToken}`;

    dispatch({ type: userActionTypes.LOGIN_SUCCESS, username });
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export const logout = () => async (dispatch) => {
  try {
    await http.get('/auth/logout', { withCredentials: true });
    http.defaults.headers.Authorization = undefined;

    dispatch({ type: userActionTypes.LOGOUT_SUCCESS });
  } catch (e) {
    console.error(e);
  }
}

export const setAccessToken = accessToken => ({ type: userActionTypes.SET_ACCESS_TOKEN_SUCCESS, accessToken });

export const maintainAuth = () => async (dispatch, getState) => {
  try {
    const { accessToken } = getState().user;
    if (!accessToken) return;
    const bearer = `Bearer ${accessToken}`;
    if (http.defaults.headers.Authorization !== bearer) http.defaults.headers.Authorization = bearer;

    dispatch({ type: userActionTypes.SET_AUTH_HEADER_SUCCESS });
  } catch (e) {
    console.error(e);
  }

  try {
    if (getState().user.username) return;
    const resp = await http.get('/auth/me');
    const { username } = resp.data;

    dispatch({ type: userActionTypes.FETCH_USER_SUCCESS, username });
  } catch (e) {
    console.error(e);
  }
}
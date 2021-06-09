import { http } from '../../lib/http';

export const userActionTypes = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
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
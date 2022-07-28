import { http } from '../../lib/http';

// 액션 타입 정의
export const userActionTypes = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
  SET_ACCESS_TOKEN_SUCCESS: 'SET_ACCESS_TOKEN_SUCCESS',
  SET_AUTH_HEADER_SUCCESS: 'SET_AUTH_HEADER_SUCCESS',
  FETCH_USER_SUCCESS: 'FETCH_USER_SUCCESS',
};

/* 액션 생성함수 정의 */
export const login = (reqObj) => async (dispatch) => { // Thunk 함수의 첫 번째 파라미터를 이용하여 원하는 액션 디스패치
  try {
    const resp = await http.post('/auth/login', reqObj, { withCredentials: true }); // 로그인 요청
    const { accessToken, username } = resp.data;
    http.defaults.headers.Authorization = `Bearer ${accessToken}`; // 액세스 토큰을 브라우저용 instance에 적용

    dispatch({ type: userActionTypes.LOGIN_SUCCESS, username }); // 아이디를 포함시켜 액션 디스패치
  } catch (e) {
    console.error(e);
    throw e; // 콜 스택의 첫 번째 catch 블록으로 전달
  }
}

export const logout = () => async (dispatch) => {
  try {
    await http.get('/auth/logout', { withCredentials: true }); // 로그아웃 요청
    http.defaults.headers.Authorization = undefined; // 액세스 토큰을 브라우저용 instance에서 제거

    dispatch({ type: userActionTypes.LOGOUT_SUCCESS });
  } catch (e) {
    console.error(e);
  }
}

// 액세스 토큰을 포함시켜 액션 생성
export const setAccessToken = accessToken => ({ type: userActionTypes.SET_ACCESS_TOKEN_SUCCESS, accessToken });

// 컴포넌트의 마운트 이후에 Thunk 함수 디스패치
export const maintainAuth = () => async (dispatch, getState) => { // Thunk 함수의 두 번째 파라미터를 이용하여 현재 State 조회
  try {
    const { accessToken } = getState().user; // 이미 로그인을 했다면 유저의 액세스 토큰 값이 할당됨
    if (!accessToken) return; // 로그인을 하지 않았다면 함수 실행 중단
    const bearer = `Bearer ${accessToken}`;
    if (http.defaults.headers.Authorization !== bearer) http.defaults.headers.Authorization = bearer;

    dispatch({ type: userActionTypes.SET_AUTH_HEADER_SUCCESS });
  } catch (e) {
    console.error(e);
  }

  try {
    if (getState().user.username) return; // 아이디가 이미 존재한다면 함수 실행 중단
    const resp = await http.get('/auth/me'); // 로그인한 유저의 정보 요청
    const { username } = resp.data;

    dispatch({ type: userActionTypes.FETCH_USER_SUCCESS, username });
  } catch (e) {
    console.error(e);
  }
}
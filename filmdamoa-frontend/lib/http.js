import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { setAccessToken } from '../store/user/action';

// 브라우저용 instance 생성
export const http = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_HOST}`, // Backend URL
});

// 원래의 요청에서 반환된 failedRequest를 파라미터로 받아 새 액세스 토큰을 적용한 후 Promise 객체를 반환하는 함수
const refreshAuthLogic = failedRequest => http.get('/auth/refresh', {
  headers: { Authorization: undefined }, withCredentials: true // 해당 설정을 적용하여 액세스 토큰 재발급 요청
}).then(resp => {
  const bearer = `Bearer ${resp.data.accessToken}`;
  /* 새 액세스 토큰을 브라우저용 instance 및 failedRequest에 적용 */
  http.defaults.headers.Authorization = bearer;
  failedRequest.response.config.headers['Authorization'] = bearer;

  return Promise.resolve();
}).catch(() => Promise.reject());

// 인증에 실패한 요청을 가로채어 인증을 갱신한 후 원래의 요청을 계속할 수 있도록 도와주는 라이브러리
// 첫 번째 파라미터로 axios instance, 두 번째 파라미터로 인증 갱신 함수를 받음
createAuthRefreshInterceptor(http, refreshAuthLogic);

// Node.js용 instance 생성
export const httpInNodeJs = axios.create({
  baseURL: `${process.env.HOST}`, // Backend URL
});

export const getDataInNodeJs = (url, token, req, res, store) => {
  return httpInNodeJs.get(url, {
    headers: { Authorization: `Bearer ${token}` } // Node.js용 instance의 헤더에 Authorization 필드를 포함시켜 요청
  })
  .catch(async error => {
    if (error.response.status === 401) {
      const resp = await httpInNodeJs.get('/auth/refresh', {
        headers: { Cookie: req.headers.cookie } // 응답 상태 코드가 '401 Unauthorized'라면 '브라우저 -> Node.js 요청'의 cookie 값을 포함시켜 액세스 토큰 재발급 요청
      });
      res.setHeader('set-cookie', resp.headers['set-cookie']); // resp.headers 객체의 set-cookie 값을 'Node.js -> 브라우저 응답'의 헤더에 설정
      store.dispatch(setAccessToken(resp.data.accessToken));

      return await httpInNodeJs.get(url, {
        headers: { Authorization: `Bearer ${resp.data.accessToken}` } // Node.js용 instance의 헤더에 갱신된 Authorization 필드를 포함시켜 재요청
      });
    } else console.log(error.config);
  });
}

// HTTP 요청이 POST 메소드인 것을 제외하면 getDataInNodeJs와 유사함
export const postDataInNodeJs = (url, data, token, req, res, store) => {
  return httpInNodeJs.post(url, data, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .catch(async error => {
    if (error.response.status === 401) {
      const resp = await httpInNodeJs.get('/auth/refresh', {
        headers: { Cookie: req.headers.cookie }
      });
      res.setHeader('set-cookie', resp.headers['set-cookie']);
      store.dispatch(setAccessToken(resp.data.accessToken));

      return await httpInNodeJs.post(url, data, {
        headers: { Authorization: `Bearer ${resp.data.accessToken}` }
      });
    } else console.log(error.config);
  });
}
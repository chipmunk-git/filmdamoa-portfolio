import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { setAccessToken } from '../store/user/action';

export const http = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_HOST}`,
});

const refreshAuthLogic = failedRequest => http.get('/auth/refresh', { withCredentials: true }).then(resp => {
  const bearer = `Bearer ${resp.data.accessToken}`;
  http.defaults.headers.Authorization = bearer;
  failedRequest.response.config.headers['Authorization'] = bearer;

  return Promise.resolve();
}).catch(() => Promise.reject());

createAuthRefreshInterceptor(http, refreshAuthLogic);

export const httpInNodeJs = axios.create({
  baseURL: `${process.env.HOST}`,
});

export const getDataInNodeJs = (url, token, req, res, store) => {
  return httpInNodeJs.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .catch(async error => {
    if (error.response.status === 401) {
      const resp = await httpInNodeJs.get('/auth/refresh', {
        headers: { Cookie: req.headers.cookie }
      });
      res.setHeader('set-cookie', resp.headers['set-cookie']);
      store.dispatch(setAccessToken(resp.data.accessToken));

      return await httpInNodeJs.get(url, {
        headers: { Authorization: `Bearer ${resp.data.accessToken}` }
      });
    } else console.log(error.config);
  });
}
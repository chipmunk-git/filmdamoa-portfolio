import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';

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
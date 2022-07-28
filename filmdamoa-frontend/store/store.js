import { createStore, applyMiddleware, combineReducers } from 'redux';
import { HYDRATE, createWrapper } from 'next-redux-wrapper';
import thunkMiddleware from 'redux-thunk';
import user from './user/reducer';

// 미들웨어 적용
const bindMiddleware = (middleware) => {
  if (process.env.NODE_ENV !== 'production') {
    const { composeWithDevTools } = require('redux-devtools-extension');
    return composeWithDevTools(applyMiddleware(...middleware)); // 리덕스 개발자 도구를 포함시켜 미들웨어 적용
  }
  return applyMiddleware(...middleware);
}

// 루트 리듀서 생성
const combinedReducer = combineReducers({
  user,
});

// HYDRATE 액션 핸들러 추가
const reducer = (state, action) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state, // use previous state
      ...action.payload, // apply delta from hydration
    };
    if (state.user.username) nextState.user.username = state.user.username; // preserve value on client side navigation
    return nextState;
  } else {
    return combinedReducer(state, action);
  }
}

// 스토어 생성
const initStore = () => {
  return createStore(reducer, bindMiddleware([thunkMiddleware]));
}

// assembled wrapper 생성
export const wrapper = createWrapper(initStore);
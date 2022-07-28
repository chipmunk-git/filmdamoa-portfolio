import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { matches, isEmail } from 'validator';
import debounce from 'lodash/debounce';
import styled from 'styled-components';
import * as cookie from 'cookie';
import { InputWithLabel, UtilityButton, withAuth } from '../components';
import { AuthErrorWrapper } from '../lib/styledComponents';
import { http } from '../lib/http';

const ResultWrapper = styled.div`
  margin: 3.5rem 0;
  font-size: 1.5rem;
  font-weight: bold;

  > div {
    margin: 0.5rem 0;
  }
`

// 회원가입 화면의 렌더링에 이용되는 컴포넌트
const Join = ({ result, setResult }) => {
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
    passwordConfirm: '',
    email: ''
  });
  const { username, password, passwordConfirm, email } = inputs;

  const [error, setError] = useState(null);
  const [seconds, setSeconds] = useState(5); // 회원가입 완료 후 이용될 카운트
  const [inAction, setInAction] = useState(false);

  const router = useRouter();

  // 코드 출처: https://reactjs.org/docs/hooks-faq.html#what-can-i-do-if-my-effect-dependencies-change-too-often 기반
  const isFinished = useRef(false);
  useEffect(() => { // 회원가입이 정상적으로 완료되면 5초 카운트다운 후, 메인 페이지로 이동
    if (!result) return;

    const myInterval = setInterval(() => {
      setSeconds(s => {
        if (s === 1) isFinished.current = true;
        return s - 1;
      });

      if (isFinished.current) {
        clearInterval(myInterval);
        router.replace('/');
      }
    }, 1000);

    return () => clearInterval(myInterval);
  }, [result]);

  // 코드 출처: https://backend-intro.vlpt.us/6/03.html 기반
  // 각 input의 입력값을 검증하는 데 이용되는 객체
  const validate = {
    username: (value) => {
      if (!matches(value, '^([a-z0-9]){4,30}$')) {
        setError('아이디는 4~30자의 영문 소문자 및 숫자로 이뤄져야 합니다.');
        return false;
      }
      return true;
    },
    password: (value) => {
      if (!matches(value, '^(?=.*[a-z])(?=.*[0-9])(?=.*[!#-%(-.:;=?@[-\`{-~])[a-z0-9!#-%(-.:;=?@[-\`{-~]{8,}$')) {
        setError('비밀번호는 8자 이상의 영문 소문자, 숫자, 특수문자로 이뤄져야 합니다.');
        return false;
      }
      setError(null); // 이메일과 아이디는 에러의 null 처리를 중복 확인 부분에서 하게 됩니다.
      return true;
    },
    passwordConfirm: (value) => {
      if (password !== value) {
        setError('비밀번호가 일치하지 않습니다.');
        return false;
      }
      setError(null);
      return true;
    },
    email: (value) => {
      if (!isEmail(value)) {
        setError('잘못된 이메일 형식입니다.');
        return false;
      }
      return true;
    }
  }

  // 아이디 또는 이메일의 중복 확인 후, 해당 입력값이 중복된다면 error 업데이트
  const checkExists = async (key, value, message) => {
    try {
      const resp = await http.get(`/auth/exists/${key}/${value}`);

      if (resp.data.exists) {
        setError(message);
      } else {
        setError(null);
      }
    } catch (e) {
      console.log(e);
    }
  }

  /* 해당 함수가 반복적으로 호출된다면, 가장 마지막 함수를 다음 300ms 이후에 실행 */
  const checkUsernameExists = debounce((username) => {
    checkExists('username', username, '이미 존재하는 아이디입니다.');
  }, 300);

  const checkEmailExists = debounce((email) => {
    checkExists('email', email, '이미 존재하는 이메일입니다.');
  }, 300);

  const onChange = useCallback(e => {
    const { name, value } = e.target;
    setInputs(inputs => ({
      ...inputs,
      [name]: value
    }));

    // 검증 작업 진행
    const validation = validate[name](value);
    if (name.indexOf('password') > -1 || !validation) return; // 비밀번호 검증이거나, 검증에 실패하면 여기서 마침

    // TODO: 이메일, 아이디 중복 확인
    const check = name === 'email' ? checkEmailExists : checkUsernameExists; // name에 따라 이메일을 체크할지 아이디를 체크할지 결정
    check(value);
  }, [password]);

  const handleLocalRegister = async () => {
    if (error) return; // 현재 에러가 있는 상태라면 진행하지 않음
    if (!validate['username'](username)
      || !validate['password'](password)
      || !validate['passwordConfirm'](passwordConfirm)
      || !validate['email'](email)) {

      // 하나라도 실패하면 진행하지 않음
      return;
    }

    try {
      setInAction(true);
      const resp = await http.post('/auth/join', { email, username, password }); // 회원가입 요청
      setResult(result => ({
        ...result,
        username: resp.data.username
      }));
    } catch (e) {
      setInAction(false);

      // 에러 처리하기
      if (e.response.status === 409) {
        const { message } = e.response.data;

        return setError(message);
      }

      setError('알 수 없는 에러가 발생했습니다.');
    }
  }

  const buttonStyleProps = useMemo(() => ({
    size: 'great',
    margin: '1rem 0 0',
    width: '100%'
  }), []);

  return (
    <>
      <Head>
        <title>FILMDAMOA - 회원가입</title>
        <meta name="description" content="회원가입 페이지입니다." />
      </Head>
      {result
        ? <div>
            <ResultWrapper>
              <div>환영합니다. '{result.username}'님!</div>
              <div>회원가입이 완료되었습니다.</div>
            </ResultWrapper>
            <ResultWrapper>{seconds}초 후에 메인 페이지로 이동합니다.</ResultWrapper>
          </div>
        : <div>
            <InputWithLabel label="아이디" name="username" placeholder="아이디" value={username} onChange={onChange} />
            <InputWithLabel label="비밀번호" name="password" placeholder="비밀번호"
              type="password" value={password} onChange={onChange} />
            <InputWithLabel label="비밀번호 확인" name="passwordConfirm" placeholder="비밀번호 확인"
              type="password" value={passwordConfirm} onChange={onChange} />
            <InputWithLabel label="이메일" name="email" placeholder="이메일" value={email} onChange={onChange} />
            {
              error && <AuthErrorWrapper>{error}</AuthErrorWrapper>
            }
            {inAction
              ? <UtilityButton styleProps={buttonStyleProps} inAction>회원가입 중...</UtilityButton>
              : <UtilityButton styleProps={buttonStyleProps} onClick={handleLocalRegister}>회원가입</UtilityButton>
            }
          </div>
      }
    </>
  );
}

export const getServerSideProps = async ({ req }) => {
  const accessToken = cookie.parse(req.headers.cookie || '').accessToken;

  if (accessToken) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

export default withAuth(React.memo(Join), '회원가입');
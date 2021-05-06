import React, { useState, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { matches, isEmail } from 'validator';
import { InputWithLabel, UtilityButton, withAuth } from '../components';
import { AuthErrorWrapper } from '../lib/styledComponents';

const Join = () => {
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
    passwordConfirm: '',
    email: ''
  });
  const { username, password, passwordConfirm, email } = inputs;

  // const [exists, setExists] = useState({
  //   username: false,
  //   email: false
  // });
  const [error, setError] = useState(null);

  // 코드 출처: https://backend-intro.vlpt.us/6/03.html 기반
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
      setError(null); // 이메일과 아이디는 에러 null 처리를 중복확인 부분에서 하게 됩니다
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

  const onChange = useCallback(e => {
    const { name, value } = e.target;
    setInputs(inputs => ({
      ...inputs,
      [name]: value
    }));

    // 검증작업 진행
    const validation = validate[name](value);
    if (name.indexOf('password') > -1 || !validation) return; // 비밀번호 검증이거나, 검증 실패하면 여기서 마침

    // TODO: 이메일, 아이디 중복 확인
  }, [password]);

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
      <div>
        <InputWithLabel label="아이디" name="username" placeholder="아이디" value={username} onChange={onChange} />
        <InputWithLabel label="비밀번호" name="password" placeholder="비밀번호"
          type="password" value={password} onChange={onChange} />
        <InputWithLabel label="비밀번호 확인" name="passwordConfirm" placeholder="비밀번호 확인"
          type="password" value={passwordConfirm} onChange={onChange} />
        <InputWithLabel label="이메일" name="email" placeholder="이메일" value={email} onChange={onChange} />
        {
          error && <AuthErrorWrapper>{error}</AuthErrorWrapper>
        }
        <UtilityButton styleProps={buttonStyleProps}>회원가입</UtilityButton>
      </div>
    </>
  );
}

export default withAuth(React.memo(Join), '회원가입');
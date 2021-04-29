import React, { useState, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { InputWithLabel, UtilityButton, withAuth } from '../components';

const Join = () => {
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
    passwordConfirm: '',
    email: ''
  });
  const { username, password, passwordConfirm, email } = inputs;
  const onChange = useCallback(e => {
    const { name, value } = e.target;
    setInputs(inputs => ({
      ...inputs,
      [name]: value
    }));
  }, []);

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
        <UtilityButton styleProps={buttonStyleProps}>회원가입</UtilityButton>
      </div>
    </>
  );
}

export default withAuth(React.memo(Join), '회원가입');
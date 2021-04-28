import React, { useState, useCallback, useMemo } from 'react';
import Head from 'next/head';
import Router from 'next/router';
import styled from 'styled-components';
import { InputWithLabel, UtilityButton, withAuth } from '../components';

const Title = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 1rem;
`

const Aligner = styled.div`
  margin-top: 1rem;
  text-align: right;
`

const StyledSpan = styled.span`
  color: ${({ theme }) => theme.colors.greyDark};
  cursor: pointer;
  
  &:hover {
    text-decoration: underline ${({ theme }) => theme.colors.greyDark};
  }
`

const Login = () => {
  const [inputs, setInputs] = useState({
    username: '',
    password: ''
  });
  const { username, password } = inputs;
  const onChange = useCallback(e => {
    const { name, value } = e.target;
    setInputs(inputs => ({
      ...inputs,
      [name]: value
    }));
  }, []);

  const buttonStyleProps = useMemo(() => ({
    size: 'great',
    margin: '1rem 0',
    width: '100%'
  }), []);

  return (
    <>
      <Head>
        <title>FILMDAMOA - 로그인</title>
        <meta name="description" content="로그인 페이지입니다." />
      </Head>
      <div>
        <Title>로그인</Title>
        <InputWithLabel label="ID" name="username" placeholder="ID" value={username} onChange={onChange} />
        <InputWithLabel label="비밀번호" name="password" placeholder="비밀번호"
          type="password" value={password} onChange={onChange} />
        <UtilityButton styleProps={buttonStyleProps}>로그인</UtilityButton>
        <Aligner>
          <StyledSpan onClick={() => Router.push('/join')}>회원가입</StyledSpan>
        </Aligner>
      </div>
    </>
  );
}

export default withAuth(React.memo(Login));
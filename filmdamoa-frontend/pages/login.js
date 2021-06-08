import React, { useState, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import * as cookie from 'cookie';
import { InputWithLabel, UtilityButton, withAuth } from '../components';
import { AuthErrorWrapper } from '../lib/styledComponents';
import { login } from '../store/user/action';

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

  const [error, setError] = useState(null);
  const [inAction, setInAction] = useState(false);

  const router = useRouter();

  const dispatch = useDispatch();

  const onChange = useCallback(e => {
    const { name, value } = e.target;
    setInputs(inputs => ({
      ...inputs,
      [name]: value
    }));
  }, []);

  const handleLocalLogin = async () => {
    try {
      setInAction(true);
      await dispatch(login({ username, password }));
      router.replace('/');
    } catch (e) {
      setInAction(false);

      if (e.response.status === 400) {
        const { errors } = e.response.data;
        const message = errors[0]['reason'];

        return setError(message);
      } else if (e.response.status === 403) {
        const { message } = e.response.data;

        return setError(message);
      }

      setError('알 수 없는 에러가 발생했습니다.')
    }
  }

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
        <InputWithLabel label="아이디" name="username" placeholder="아이디" value={username} onChange={onChange} />
        <InputWithLabel label="비밀번호" name="password" placeholder="비밀번호"
          type="password" value={password} onChange={onChange} />
        {
          error && <AuthErrorWrapper>{error}</AuthErrorWrapper>
        }
        {inAction
          ? <UtilityButton styleProps={buttonStyleProps} inAction>로그인 중...</UtilityButton>
          : <UtilityButton styleProps={buttonStyleProps} onClick={handleLocalLogin}>로그인</UtilityButton>
        }
        <Aligner>
          <StyledSpan onClick={() => router.push('/join')}>회원가입</StyledSpan>
        </Aligner>
      </div>
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

export default withAuth(React.memo(Login), '로그인');
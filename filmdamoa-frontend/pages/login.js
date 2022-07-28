import React, { useState, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import * as cookie from 'cookie';
import { InputWithLabel, UtilityButton, withAuth } from '../components';
import { AuthErrorWrapper } from '../lib/styledComponents';
import storage from '../lib/storage';
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

// 로그인 화면의 렌더링에 이용되는 컴포넌트
const Login = () => {
  const [inputs, setInputs] = useState({ // 각 input의 입력값을 제어하는 데 이용됨
    username: '',
    password: ''
  });
  const { username, password } = inputs;

  const [error, setError] = useState(null); // 각 오류 상황에 안내될 메시지
  const [inAction, setInAction] = useState(false); // 요청 로딩 여부

  const router = useRouter();

  const dispatch = useDispatch();

  const onChange = useCallback(e => {
    // 각 input의 name 및 value를 이용하여 inputs 업데이트
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
      const destination = storage.get('destination');

      // 로그인이 정상적으로 완료되면 지정된 페이지 또는 메인 페이지로 이동
      if (destination) router.replace(destination);
      else router.replace('/');
    } catch (e) {
      setInAction(false);

      // 응답 상태 코드에 따라 적절한 로직 수행
      if (e.response.status === 400) {
        const { errors } = e.response.data;
        const message = errors[0]['reason'];

        return setError(message);
      } else if (e.response.status === 403) {
        const { message } = e.response.data;

        return setError(message);
      }

      setError('알 수 없는 에러가 발생했습니다.');
    }
  }

  const buttonStyleProps = useMemo(() => ({
    size: 'great', // font-size 및 padding 설정
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
        destination: '/', // 이미 로그인을 했다면 메인 페이지로 리디렉션
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

export default withAuth(React.memo(Login), '로그인');
import Head from 'next/head';
import * as cookie from 'cookie';
import { withLayout } from '../components';
import { wrapper } from '../store/store';
import { setAccessToken } from '../store/user/action';

const Index = () => {
  return (
    <>
      <Head>
        <title>FILMDAMOA - 메인 페이지</title>
        <meta name="description" content="개봉 영화에 대한 모든 정보는 'FILMDAMOA'에서 얻으세요!" />
      </Head>
      <h1>Hello, world!</h1>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(async ({ req, store }) => {
  const accessToken = cookie.parse(req.headers.cookie || '').accessToken;
  if (accessToken) store.dispatch(setAccessToken(accessToken));

  return {
    props: {},
  };
});

export default withLayout(Index);
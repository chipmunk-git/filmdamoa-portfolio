import React, { useEffect } from 'react';
import Head from 'next/head';
import { withLayout } from '../components';

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

export default withLayout(Index);
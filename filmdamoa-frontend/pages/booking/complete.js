import { useEffect, useRef } from 'react';
import Head from 'next/head';
import styled, { css } from 'styled-components';
import * as cookie from 'cookie';
import { getDataInNodeJs } from '../../lib/http';
import { StyledArticle, scrollable } from '../../lib/styledComponents';
import { withLayout } from '../../components';
import { wrapper } from '../../store/store';
import { setAccessToken } from '../../store/user/action';

const InfoWrapper = styled.div`
  display: flex;
  overflow-x: auto;
  ${scrollable};

  @media ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    overflow-x: visible;
  }
`

const PosterBox = styled.div`
  height: 23.375rem;
  padding: 2.5rem 0;
  text-align: center;
  background-color: #3f3f3f;

  > div {
    width: 16.875rem;
    margin-bottom: 1.625rem;

    div {
      &:first-child {
        margin-bottom: 0.125rem;
        color: silver;
        font-size: ${({ theme }) => theme.fontSize.medium};
      }

      &:last-child {
        color: #55b0ba;
        font-size: ${({ theme }) => theme.fontSize.great};
        font-weight: bold;
      }
    }

    @media ${({ theme }) => theme.media.mobile} {
      width: 100%;
    }
  }

  img {
    width: 9.375rem;
    height: 13.5rem;
    border: 0;
  }
`

const listDotStyles = css`
  &::before {
    display: block;
    width: 3px;
    height: 3px;
    content: '';
    background-color: #aaa;
    position: absolute;
    top: 9px;
    left: 0;
  }
`

const DetailBox = styled.div`
  height: 23.375rem;
  padding: 2.5rem 3.75rem;
  background-color: #323232;

  div {
    width: 50.625rem;
    color: #55b0ba;
    font-size: 1.375rem;
  }

  i {
    font-size: 1.125em;
  }

  ul {
    width: 50.625rem;
    padding: 1.25rem 0;
    margin: 0.875rem 0;
    list-style: none;
    border-top: 1px solid #434343;

    li {
      padding-left: 9.625rem;
      margin: 0.25rem 0;
      color: white;
      position: relative;

      &:last-child {
        padding-left: 13.625rem;

        strong {
          color: #59bec9;
          font-size: 1.25em;
          position: absolute;
          left: 9.625rem;
        }
      }

      ${listDotStyles};
    }
  }

  span {
    width: 9rem;
    color: silver;
    position: absolute;
    left: 0.625rem;
  }

  @media ${({ theme }) => theme.media.mobile} {
    height: auto;
    padding: 2.5rem 1.625rem;
    overflow-x: auto;
    ${scrollable};

    div, ul {
      width: 24.875rem;
    }

    ul {
      position: relative;

      &::after {
        width: 1.625rem;
        height: 1px;
        content: '';
        position: absolute;
        top: 0;
        left: 100%;
      }
    }
  }
`

const GuideWrapper = styled.div`
  padding: 1rem;
  margin-top: 2rem;
  border: 1px solid ${({ theme }) => theme.colors.greyLight};
  border-radius: 0.375rem;
  color: #434343;

  div {
    padding-left: 0.5rem;
    position: relative;

    ${listDotStyles};
  }

  ul {
    padding: 0.375rem 0 0;
    margin: 0;
    list-style: none;

    li {
      padding-left: 0.625rem;
      margin: 0.25rem 0;
      position: relative;

      &::before {
        display: block;
        width: 4px;
        height: 1px;
        content: '';
        background-color: #323232;
        position: absolute;
        top: 10px;
        left: 0;
      }
    }
  }

  @media ${({ theme }) => theme.media.mobile} {
    margin-top: 0.75rem;
  }
`

const Complete = ({ data }) => {
  const scrollRef = useRef();
  useEffect(() => {
    const handleWheel = event => {
      if (scrollRef.current.contains(event.target)) {
        event.preventDefault();
        scrollRef.current.scrollLeft += event.deltaY;
      }
    }
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel, { passive: false });
    }
  }, []);

  return (
    <>
      <Head>
        <title>FILMDAMOA - ?????? ??????</title>
        <meta name="description" content="?????? ?????? ??????????????????." />
      </Head>
      <StyledArticle>
        <InfoWrapper ref={scrollRef}>
          <PosterBox>
            <div>
              <div>?????? ????????????</div>
              <div>{data.merchantUid}</div>
            </div>
            <img src={`${data.posterThumbnail.slice(0, -8)}_316.jpg`} alt={data.movieName} />
          </PosterBox>
          <DetailBox>
            <div>
              <strong>????????? ????????????????????? <i>!</i></strong>
            </div>
            <ul>
              <li>
                <span>???????????? </span>
                {data.movieName} / {data.playKindName}
              </li>
              <li>
                <span>????????????/????????? </span>
                {data.branchName} / {data.theabExpoName}
              </li>
              <li>
                <span>???????????? </span>
                {data.playDeAndDow.replace(/^[^(]*/g, '$&' + ' ')} {data.playTime.slice(0, -6)}
              </li>
              <li>
                <span>???????????? </span>
                {data.audiences.reduce((prevTotal, audience) => prevTotal + (audience.count > 0 ? `/${audience.category} ${audience.count}???` : ''), '').slice(1)}
              </li>
              <li>
                <span>???????????? </span>
                {data.selections.reduce((prevTotal, selection) => prevTotal + '/' + selection.seatName.replace(/[A-Z]+/g, '$&' + '??? '), '').slice(1)}
              </li>
              <li>
                <span>???????????? </span>
                <strong>{data.amount.toLocaleString()} </strong>
                ???
              </li>
            </ul>
          </DetailBox>
        </InfoWrapper>
        <GuideWrapper>
          <div>
            ????????????
            <ul>
              <li>????????? ?????? ????????? ?????? ???????????? ????????? ?????? ??????????????????.</li>
              <li>??????????????? ?????? ??????????????? ?????????????????? ??? ????????? 10??? ??? ???????????????.</li>
              <li>???????????? 20???????????? ?????? ????????????, ????????????????????? ???????????? ??? ????????????.</li>
            </ul>
          </div>
        </GuideWrapper>
      </StyledArticle>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(async ({ req, res, store }) => {
  const accessToken = cookie.parse(req.headers.cookie || '').accessToken;

  if (accessToken) {
    store.dispatch(setAccessToken(accessToken));
  } else {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const resp = await getDataInNodeJs('/payment/none', accessToken, req, res, store);

  if (!resp) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  const data = resp.data;

  return {
    props: { data },
  };
});

export default withLayout(Complete);
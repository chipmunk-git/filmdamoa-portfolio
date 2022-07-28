import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as cookie from 'cookie';
import { decode } from 'html-entities';
import { useSelector } from 'react-redux';
import Pagination from 'react-js-pagination';
import debounce from 'lodash/debounce';
import { http, httpInNodeJs, getDataInNodeJs } from '../lib/http';
import { StyledArticle } from '../lib/styledComponents';
import { withLayout } from '../components';
import { wrapper } from '../store/store';
import { setAccessToken } from '../store/user/action';

const MovieListWrapper = styled.div`
  width: 100%;
  padding: 0 calc(50vw - 37.5rem);
  background-color: ${({ theme }) => theme.colors.black};
  position: absolute;
  top: 0;
  left: 0;

  @media ${({ theme }) => theme.media.desktop} {
    padding: 0 3.625rem;
  }

  @media ${({ theme }) => theme.media.tablet} {
    padding: 0 2rem;
  }

  @media ${({ theme }) => theme.media.mobile} {
    padding: 0 0.375rem;
  }
`

const MovieList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  max-width: 72rem;
  padding: 0;
  margin: 0.25rem auto;
  list-style: none;

  li {
    margin: 1.25rem;
    position: relative;

    @media ${({ theme }) => theme.media.desktop} {
      margin: 1rem;
    }

    @media ${({ theme }) => theme.media.tablet} {
      margin: 1.25rem 1rem;
    }
  }

  a {
    display: block;
    width: 15.5rem;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    font-size: ${({ theme }) => theme.fontSize.medium};
    color: white;
  }

  img {
    height: 22rem;

    &:hover {
      + span {
        opacity: 1;
        visibility: visible;
        transition-delay: 0s;
      }
    }
  }

  @media ${({ theme }) => theme.media.desktop} {
    max-width: 52.5rem;
  }

  @media ${({ theme }) => theme.media.laptop} {
    max-width: 35rem;
  }

  @media ${({ theme }) => theme.media.tablet} {
    max-width: 17.5rem;
  }
`

const MovieInfoWrapper = styled.span`
  display: block;
  height: 22rem;
  padding: 1.625rem;
  position: absolute;
  top: 0;
  background-color: rgba(0, 0, 0, 0.8);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s linear, visibility 0s linear 0.2s;

  &:hover {
    opacity: 1;
    visibility: visible;
    transition-delay: 0s;
  }
`

const SynopsisBox = styled.span`
  display: block;
  height: 9.5rem;
  overflow: hidden;
  text-align: left;
`

const ScoreBox = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  width: calc(100% - 3.25rem);
  padding: 0.625rem 0 1.625rem;
  position: absolute;
  bottom: 0;
  border-top: 1px solid #3c3c3c;

  span {
    margin: 0 1rem;
    font-size: 1.75rem;
    color: #59bec9;
  }
`

const UserActionWrapper = styled.div`
  margin-top: 0.375rem;
  font-size: ${({ theme }) => theme.fontSize.medium};

  button {
    display: inline-block;
    width: 5rem;
    height: 2.25rem;
    padding: 0 0.375rem;
    border-radius: 0.25rem;
    border: 1px solid #503396;
    cursor: pointer;
    text-align: center;
    vertical-align: middle;
    color: white;
    border-color: #555;
    background-color: rgba(0, 0, 0, 0.4);
  }

  a {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: calc(100% - 5rem - 0.375rem);
    height: 2.25rem;
    margin-left: 0.375rem;
    border-radius: 0.25rem;
    text-align: center;
    vertical-align: middle;
    font-weight: bold;
    background-color: #037b94;
  }
`

const StyledHeart = styled(FontAwesomeIcon)`
  margin: 0 0.125rem;
  font-size: ${({ theme }) => theme.fontSize.medium} !important;
  color: ${({ theme, active }) => active ? theme.colors.freshRed : 'white'};
`

const MovieListFaker = styled.div`
  width: 100%;
  height: calc(${({ wrapperHeight }) => wrapperHeight}px - 3.625rem);

  @media ${({ theme }) => theme.media.tablet} {
    height: calc(${({ wrapperHeight }) => wrapperHeight}px - 2rem);
  }

  @media ${({ theme }) => theme.media.mobile} {
    height: calc(${({ wrapperHeight }) => wrapperHeight}px - 0.375rem);
  }
`

const MovieListPaginator = styled.div`
  text-align: center;

  .pagination {
    display: inline-block;
    padding-left: 0;
    margin: 1.25rem 0;
    border-radius: 0.25rem;

    > li {
      display: inline;

      > a, > span {
        padding: 0.375rem 0.75rem;
        margin-left: -1px;
        line-height: 1.375rem;
        text-decoration: none;
        color: #337ab7;
        background-color: white;
        border: 1px solid #dedede;
        float: left;
        position: relative;

        &:focus, &:hover {
          color: #23527c;
          background-color: ${({ theme }) => theme.colors.trackBg};
          border-color: #dedede;
          z-index: 2;
        }
      }

      &:first-child {
        > a, > span {
          margin-left: 0;
          border-top-left-radius: 0.25rem;
          border-bottom-left-radius: 0.25rem;
        }
      }

      &:last-child {
        > a, > span {
          border-top-right-radius: 0.25rem;
          border-bottom-right-radius: 0.25rem;
        }
      }
    }

    > .active {
      > a, > a:focus, > a:hover, > span, > span:focus, > span:hover {
        cursor: default;
        color: white;
        background-color: #337ab7;
        border-color: #337ab7;
        z-index: 3;
      }
    }

    > .disabled {
      > a, > a:focus, > a:hover, > span, > span:focus, > span:hover {
        cursor: not-allowed;
        color: #767676;
        background-color: white;
        border-color: #dedede;
      }
    }
  }
`

// 영화 목록 화면의 렌더링에 이용되는 컴포넌트
const Movie = ({ data }) => {
  const { username } = useSelector(state => ({
    username: state.user.username
  }));

  const [movies, setMovies] = useState(data.content); // 현재 페이지의 영화 목록
  const [height, setHeight] = useState(58); // MovieListFaker 컴포넌트의 높이
  const [activePage, setActivePage] = useState(1);

  const initialRender = useRef(true);
  useEffect(async () => {
    if (initialRender.current) {
      initialRender.current = false;
    } else { // 현재 페이지의 영화 목록(최신순 및 가나다순으로 정렬) 조회 후 State 업데이트
      await http.get(`/movie?page=${activePage - 1}&size=12&sort=movieReleaseDate,desc&sort=movieKoreanTitle,asc`).then(resp => {
        setMovies(resp.data.content);
      }).catch(err => alert(err.response.data.message));
    }
  }, [activePage]);

  const wrapperRef = useRef(); // 높이를 알아내기 위해 MovieListWrapper 컴포넌트에 사용됨
  const handleHeight = () => { // MovieListWrapper 컴포넌트의 높이와 같아지도록 height 업데이트
    if (height !== wrapperRef.current.getBoundingClientRect().height) setHeight(wrapperRef.current.getBoundingClientRect().height);
  }

  // 화면의 크기가 변경될 때 handleHeight 실행
  useEffect(() => {
    const handleResize = debounce(handleHeight, 100);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, [height]);

  // 영화 목록이 변경될 때 handleHeight 실행
  useEffect(() => {
    setTimeout(handleHeight, 100);
  }, [movies, height]);

  const handleToggle = async id => {
    if (!username) return;

    await http.post(`/movie/${id}/like`, {
      movieLike: movies.find(movie => movie.id === id).movieLike
    })
    .then(() => setMovies(
      movies.map(movie =>
        movie.id === id ? {
          ...movie,
          movieLikes: movie.movieLike ? movie.movieLikes - 1 : movie.movieLikes + 1,
          movieLike: !movie.movieLike
        } : movie
      )
    ))
    .catch(err => console.log(err));
  }

  const handlePageChange = pageNumber => setActivePage(pageNumber);

  // '현재 페이지의 영화 목록' 렌더링
  const movieItems = movies.map(movie =>
    <li key={movie.id}>
      <Link href={`/movie/${movie.id}`}>
        <a title="영화상세 보기">
          <img src={movie.posterThumbnail} alt={movie.movieKoreanTitle} />
          <MovieInfoWrapper>
            <SynopsisBox>
              {decode(movie.synopsis).replace(/<(?!\s*br\s*\/?)[^>]+>/gim, '').split('<br>').map(line => <>{line}<br /></>)}
            </SynopsisBox>
            <ScoreBox>
              관람평 <span>{movie.audienceScore}</span>
            </ScoreBox>
          </MovieInfoWrapper>
        </a>
      </Link>
      <UserActionWrapper>
        {movie.movieLike
          ? <button onClick={() => handleToggle(movie.id)}>
              <StyledHeart icon={["fas", "heart"]} active={'true'} /> {movie.movieLikes}
            </button>
          : <button onClick={() => handleToggle(movie.id)}>
              <StyledHeart icon={["far", "heart"]} /> {movie.movieLikes}
            </button>
        }
        <Link href={`/booking?movieNumber=${movie.movieNumber}`}>
          <a>예매</a>
        </Link>
      </UserActionWrapper>
    </li>
  );

  return (
    <>
      <Head>
        <title>FILMDAMOA - 영화</title>
        <meta name="description" content="영화 목록 페이지입니다." />
      </Head>
      <StyledArticle>
        <MovieListWrapper ref={wrapperRef}>
          <MovieList>{movieItems}</MovieList>
        </MovieListWrapper>
        <MovieListFaker wrapperHeight={height} />
        <MovieListPaginator>
          <Pagination activePage={activePage} itemsCountPerPage={data.size}
            totalItemsCount={data.totalElements} pageRangeDisplayed={5} onChange={handlePageChange} />
        </MovieListPaginator>
      </StyledArticle>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(async ({ req, res, store }) => {
  const accessToken = cookie.parse(req.headers.cookie || '').accessToken;
  let resp = null;

  /* 첫 페이지의 영화 목록(최신순 및 가나다순으로 정렬) 조회 */
  if (accessToken) {
    store.dispatch(setAccessToken(accessToken));
    resp = await getDataInNodeJs('/movie?page=0&size=12&sort=movieReleaseDate,desc&sort=movieKoreanTitle,asc', accessToken, req, res, store);
  } else {
    resp = await httpInNodeJs.get('/movie?page=0&size=12&sort=movieReleaseDate,desc&sort=movieKoreanTitle,asc');
  }
  const data = resp.data;

  return {
    props: { data },
  };
});

export default withLayout(Movie);
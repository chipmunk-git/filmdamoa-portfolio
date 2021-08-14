import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as cookie from 'cookie';
import { decode } from 'html-entities';
import { useSelector } from 'react-redux';
import { http, httpInNodeJs, getDataInNodeJs } from '../lib/http';
import { StyledArticle } from '../lib/styledComponents';
import { withLayout } from '../components';
import { wrapper } from '../store/store';
import { setAccessToken } from '../store/user/action';

const BoxOfficeWrapper = styled.div`
  width: 100%;
  height: 35rem;
  padding: 0 calc(50vw - 37.5rem);
  background-color: ${({ theme }) => theme.colors.black};
  position: absolute;
  top: 0;
  left: 0;

  @media ${({ theme }) => theme.media.desktop} {
    height: 64rem;
    padding: 0 3.625rem;
  }

  @media ${({ theme }) => theme.media.tablet} {
    height: 119rem;
    padding: 0 2rem;
  }

  @media ${({ theme }) => theme.media.mobile} {
    height: 120rem;
    padding: 0 0.375rem;
  }
`

const BoxOfficeTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  margin: 1.5rem 0;

  h1 {
    padding: 0 0 0.375rem;
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.regular};
    color: white;
    border-bottom: 2px solid ${({ theme }) => theme.colors.greyDark};
  }

  @media ${({ theme }) => theme.media.mobile} {
    flex-wrap: wrap;
    justify-content: center;
    margin: 0.625rem 0;
  }
`

const MoreMovieWrapper = styled.div`
  width: 8.875rem;

  a {
    padding: 0 0.5rem;
    text-decoration: none;
    cursor: pointer;
    font-size: ${({ theme }) => theme.fontSize.medium};
    color: ${({ theme }) => theme.colors.greyLight};

    &:hover {
      text-decoration: underline;
    }
  }

  @media ${({ theme }) => theme.media.mobile} {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    margin-top: 1rem;
  }
`

const MoreMovieFaker = styled(MoreMovieWrapper)`
  @media ${({ theme }) => theme.media.mobile} {
    display: none;
  }
`

const StyledPlus = styled(FontAwesomeIcon)`
  font-size: ${({ theme }) => theme.fontSize.medium} !important;
  color: ${({ theme }) => theme.colors.greyLight};
`

const BoxOfficeBody = styled.ul`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
  margin: 0 auto;

  li {
    margin: 0 1.25rem;
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
    text-decoration: none;
    cursor: pointer;
    font-size: ${({ theme }) => theme.fontSize.medium};
    color: white;

    > span {
      padding: 1rem;
      position: absolute;
      top: 0;
      font-size: 2rem;
      font-style: italic;
      font-weight: 300;
      text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.8);
    }
  }

  img {
    height: 22rem;

    &:hover {
      + div {
        opacity: 1;
        visibility: visible;
        transition-delay: 0s;
      }
    }
  }

  @media ${({ theme }) => theme.media.desktop} {
    max-width: 48rem;
  }

  @media ${({ theme }) => theme.media.tablet} {
    max-width: 32rem;
  }
`

const MovieInfoWrapper = styled.div`
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

const SynopsisBox = styled.div`
  height: 9.5rem;
  overflow: hidden;
`

const ScoreBox = styled.div`
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

const BoxOfficeFaker = styled.div`
  width: 100%;
  height: calc(35rem - 3.625rem);

  @media ${({ theme }) => theme.media.desktop} {
    height: calc(64rem - 3.625rem);
  }

  @media ${({ theme }) => theme.media.tablet} {
    height: calc(119rem - 2rem);
  }

  @media ${({ theme }) => theme.media.mobile} {
    height: calc(120rem - 0.375rem);
  }
`

const Index = ({ data }) => {
  const { username } = useSelector(state => ({
    username: state.user.username
  }));

  const [movies, setMovies] = useState(data);
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

  const movieItems = movies.map(movie =>
    <li key={movie.id}>
      <Link href={`/movie/${movie.id}`}>
        <a title="영화상세 보기">
          <span>{movie.dailyBoxOffice}</span>
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
        <title>FILMDAMOA - 메인 페이지</title>
        <meta name="description" content="개봉 영화에 대한 모든 정보는 'FILMDAMOA'에서 얻으세요!" />
      </Head>
      <StyledArticle>
        <BoxOfficeWrapper>
          <BoxOfficeTitle>
            <MoreMovieFaker />
            <h1>박스오피스</h1>
            <MoreMovieWrapper>
              <Link href="/movie">
                <a>더 많은 영화보기 <StyledPlus icon={["fas", "plus"]} /></a>
              </Link>
            </MoreMovieWrapper>
          </BoxOfficeTitle>
          <BoxOfficeBody>
            {movieItems}
          </BoxOfficeBody>
        </BoxOfficeWrapper>
        <BoxOfficeFaker />
      </StyledArticle>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(async ({ req, res, store }) => {
  const accessToken = cookie.parse(req.headers.cookie || '').accessToken;
  let resp = null;

  if (accessToken) {
    store.dispatch(setAccessToken(accessToken));
    resp = await getDataInNodeJs('/movie', accessToken, req, res, store);
  } else {
    resp = await httpInNodeJs.get('/movie');
  }
  const data = resp.data;

  return {
    props: { data },
  };
});

export default withLayout(Index);
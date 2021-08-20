import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import styled, { css } from 'styled-components';
import { darken } from 'polished';
import * as cookie from 'cookie';
import { decode } from 'html-entities';
import { http, httpInNodeJs, postDataInNodeJs } from '../lib/http';
import { numberReader, createParsedDates, createParsedTheaters } from '../lib/bookingFunction';
import { StyledArticle, scrollable } from '../lib/styledComponents';
import { withLayout } from '../components';
import { wrapper } from '../store/store';
import { setAccessToken } from '../store/user/action';

const wrapperStyles = css`
  width: 72rem;
  margin: 0 auto;

  @media ${({ theme }) => theme.media.desktop} {
    width: auto;
  }
`

const CalendarWrapper = styled.div`
  overflow-x: scroll;
  ${wrapperStyles};
  ${scrollable};
`

const HorizontalCalendar = styled.ul`
  display: inline-flex;
  height: 2.5rem;
  padding: 0;
  margin: 0.625rem 0.125rem 0.125rem;
  list-style: none;
  outline: 1px solid ${({ theme }) => theme.colors.greyLight};
  border-top: 1px solid ${({ theme }) => theme.colors.greyDark};

  li {
    display: inline-table;
    font-size: ${({ theme }) => theme.fontSize.medium};
    position: relative;
  }

  div {
    width: 5.125rem;
    text-align: center;
    background-color: white;
    border: 1px solid ${({ theme }) => theme.colors.greyDark};
    border-radius: 0.625rem;
    position: absolute;
    top: -0.625rem;
  }
`

const buttonStyles = css`
  cursor: pointer;
  background-color: transparent;
  border: 0;
`

const DateButton = styled.button`
  display: block;
  width: 5.125rem;
  padding: 0.5rem 0.75rem;
  ${buttonStyles};

  &:hover {
    border-bottom: 0.125rem solid #503396;
  }

  em {
    display: inline-block;
    padding: 0 0.5rem 0 0;
    font-size: ${({ theme }) => theme.fontSize.large};
    font-style: normal;
    position: relative;

    &::after {
      display: block;
      width: 3px;
      height: 3px;
      content: '';
      background-color: ${({ theme }) => theme.colors.greyDark};
      position: absolute;
      top: 0.5rem;
      right: 0.125rem;
    }
  }

  span {
    display: inline-block;
  }

  ${({ theme, active, day, selected }) => {
    return css`
      ${active ?
        css`
          ${day === 'SAT' &&
            css`
              color: #3b5fcb;
            `
          }

          ${day === 'SUN_OR_HOL' &&
            css`
              color: #e81002;
            `
          }

          ${selected &&
            css`
              background-color: ${theme.colors.greyBg};
              border-bottom: 0.125rem solid #503396;
            `
          }
        ` :
        css`
          cursor: default;
          color: ${({ theme }) => theme.colors.greyLight};

          &:hover {
            border-bottom: 0;
          }

          em::after {
            background-color: ${({ theme }) => theme.colors.greyLight};
          }
        `
      }
    `
  }}
`

const ListsWrapper = styled.div`
  display: flex;
  ${wrapperStyles};
`

const MovieListBox = styled.div`
  width: 25%;
  padding: 0 0.875rem;
  border: 1px solid ${({ theme }) => theme.colors.greyLight};

  h1 {
    margin: 0.875rem 0;
    font-size: ${({ theme }) => theme.fontSize.large};
  }
`

const MovieList = styled.ul`
  height: 33.5rem;
  padding: 0;
  margin: 0.875rem 0;
  list-style: none;
  overflow-y: auto;
  ${scrollable};
`

const MovieItem = styled.li`
  display: flex;
  align-items: center;
  padding: 0 0.25rem;
  font-size: ${({ theme }) => theme.fontSize.medium};

  ${({ theme, active, selected }) => css`
    ${active ?
      css`
        &:hover {
          background-color: ${darken(0.05, 'white')};
        }
      ` :
      css`
        opacity: 0.5;
      `
    }

    ${selected &&
      css`
        background-color: ${theme.colors.thumbBg};

        &:hover {
          background-color: ${theme.colors.thumbBg};
        }
      `
    }
  `}

  span {
    display: inline-block;
    width: 20px;
    height: 20px;
    background-image: url(${({ movieRating }) => movieRating});
    background-position: center;
    background-repeat: no-repeat;
  }

  button {
    width: calc(100% - 20px);
    padding: 0.375rem;
    text-align: left;
    ${buttonStyles};

    ${({ theme, active, selected }) => css`
      ${!active &&
        css`
          color: ${theme.colors.thumbBg};
          cursor: default;
        `
      }

      ${selected &&
        css`
          color: white;
        `
      }
    `}
  }
`

const TheaterListBox = styled(MovieListBox)`
  width: 32%;

  div {
    display: flex;
    margin: 0.875rem 0;
  }
`

const TheaterTabButton = styled.button`
  width: 50%;
  padding: 0.375rem;
  ${buttonStyles};

  ${({ theme, selected }) => css`
    border-top: 1px solid ${theme.colors.greyLight};
    border-bottom: 1px solid ${theme.colors.thumbBg};

    &:first-child {
      border-left: 1px solid ${theme.colors.greyLight};
    }

    &:last-child {
      border-right: 1px solid ${theme.colors.greyLight};
    }

    ${selected &&
      css`
        border: 1px solid ${theme.colors.thumbBg};
        border-bottom: 1px solid transparent;

        &:first-child {
          border-left: 1px solid ${theme.colors.thumbBg};
        }

        &:last-child {
          border-right: 1px solid ${theme.colors.thumbBg};
        }
      `
    }
  `}
`

const TheaterList = styled(MovieList)`
  width: 50%;
  height: 30.5rem;
  margin: 0;

  &:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.colors.greyLight};
  }

  li {
    font-size: ${({ theme }) => theme.fontSize.medium};
  }
`

const TheaterDistrictButton = styled.button`
  width: 100%;
  padding: 0.375rem;
  text-align: left;
  ${buttonStyles};

  ${({ theme, selected }) => css`
    ${selected &&
      css`
        background-color: ${theme.colors.greyLight};
      `
    }
  `}
`

const TheaterButton = styled.button`
  width: 100%;
  padding: 0.375rem;
  text-align: left;
  ${buttonStyles};

  ${({ theme, active, selected }) => css`
    ${active ?
      css`
        &:hover {
          background-color: ${darken(0.05, 'white')};
        }
      ` :
      css`
        color: ${theme.colors.thumbBg};
        cursor: default;
        opacity: 0.5;
      `
    }

    ${selected &&
      css`
        color: white;
        background-color: ${theme.colors.thumbBg};

        &:hover {
          background-color: ${theme.colors.thumbBg};
        }
      `
    }
  `}
`

const Booking = ({ data, queryMovieNumber }) => {
  const [parsedDates, setParsedDates] = useState(createParsedDates(data.movieFormDeList));
  const [movies, setMovies] = useState(data.movieList);
  const [parsedTheaters, setParsedTheaters] = useState({
    areaTheater: createParsedTheaters(data.areaBrchList),
    specialTheater: createParsedTheaters(data.spclbBrchList)
  });
  const [selection, setSelection] = useState({
    formattedDate: parsedDates[0]['formattedDate'],
    movieNumber: queryMovieNumber,
    theaterTab: 'areaTheater',
    theaterDistrict: { areaTheater: null, specialTheater: null },
    branchNumber: ['', '', '']
  });

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

  const postBookingData = reqObj => http.post('/booking', reqObj).then(resp => {
    setParsedDates(createParsedDates(resp.data.movieFormDeList));
    setMovies(resp.data.movieList);
    setParsedTheaters({
      areaTheater: createParsedTheaters(resp.data.areaBrchList),
      specialTheater: createParsedTheaters(resp.data.spclbBrchList)
    });
  }).catch(err => console.log(err));

  const handleDateSelection = async (active, formattedDate) => {
    if (active) {
      setSelection({ ...selection, formattedDate: formattedDate });
      await postBookingData({
        playDe: formattedDate,
        movieNo1: selection.movieNumber,
        brchNo1: selection['branchNumber'][0],
        spclbYn1: selection['branchNumber'][1],
        theabKindCd1: selection['branchNumber'][2]
      });
    }
  }

  const calendarItems = parsedDates.map(parsedDate =>
    <li key={parsedDate.id}>
      {parsedDate.fullYearAndMonth && <div>{parsedDate.fullYearAndMonth}</div>}
      <DateButton active={parsedDate.active} day={parsedDate.day[1]}
        selected={selection.formattedDate === parsedDate.formattedDate}
        onClick={() => handleDateSelection(parsedDate.active, parsedDate.formattedDate)}>
        <em>{parsedDate.date}</em>
        <span>{parsedDate.day[0]}</span>
      </DateButton>
    </li>
  );

  const handleMovieSelection = async (active, movieNumber) => {
    if (active) {
      setSelection({ ...selection, movieNumber: movieNumber });
      await postBookingData({
        playDe: selection.formattedDate,
        movieNo1: movieNumber,
        brchNo1: selection['branchNumber'][0],
        spclbYn1: selection['branchNumber'][1],
        theabKindCd1: selection['branchNumber'][2]
      });
    }
  }

  const movieRating = {
    AD01: '/icons/age-small-all.png',
    AD02: '/icons/age-small-12.png',
    AD03: '/icons/age-small-15.png',
    AD04: '/icons/age-small-19.png'
  };

  const movieItems = movies.map(movie =>
    <MovieItem key={movie.movieNo} active={movie.formAt === 'Y'}
      movieRating={movieRating[movie.admisClassCd]} selected={selection.movieNumber === movie.movieNo}>
      <span />
      <button onClick={() => handleMovieSelection(movie.formAt === 'Y', movie.movieNo)}>
        {movie.movieNm}
      </button>
    </MovieItem>
  );

  const handleTheaterTabToArea = () => setSelection({ ...selection, theaterTab: 'areaTheater' });
  const handleTheaterTabToSpecial = () => setSelection({ ...selection, theaterTab: 'specialTheater' });
  const handleTheaterDistrict = (theaterTab, index) => setSelection({
    ...selection,
    theaterDistrict: { ...selection.theaterDistrict, [theaterTab]: index }
  });

  const handleTheaterSelection = async (active, branchNumber) => {
    if (active) {
      setSelection({ ...selection, branchNumber: branchNumber });
      await postBookingData({
        playDe: selection.formattedDate,
        movieNo1: selection.movieNumber,
        brchNo1: branchNumber[0],
        spclbYn1: branchNumber[1],
        theabKindCd1: branchNumber[2]
      });
    }
  }

  const theaterDistrictItems = parsedTheaters[selection.theaterTab].map((parsedTheater, index) =>
    <li key={parsedTheater[0]['areaCd']}>
      <TheaterDistrictButton selected={selection['theaterDistrict'][selection.theaterTab] === index}
        onClick={() => handleTheaterDistrict(selection.theaterTab, index)}>
        {parsedTheater[0]['areaCdNm']}({parsedTheater[0]['formBrchCnt']})
      </TheaterDistrictButton>
    </li>
  );

  const theaterItems = (parsedTheaters[selection.theaterTab][selection['theaterDistrict'][selection.theaterTab]] || []).map(parsedTheater =>
    <li key={parsedTheater['brchNo']}>
      <TheaterButton active={parsedTheater['brchFormAt'] === 'Y'}
        selected={selection['branchNumber'][0] === parsedTheater['brchNo'] && selection['branchNumber'][2] === parsedTheater['areaCd']}
        onClick={() => handleTheaterSelection(parsedTheater['brchFormAt'] === 'Y',
          [parsedTheater['brchNo'], parsedTheater['oriAreaCd'] ? 'Y' : 'N', parsedTheater['areaCd']])}>
        {decode(parsedTheater['brchNm'])}
      </TheaterButton>
    </li>
  );

  return (
    <>
      <Head>
        <title>FILMDAMOA - 예매</title>
        <meta name="description" content="예매 페이지입니다." />
      </Head>
      <StyledArticle>
        <CalendarWrapper ref={scrollRef} horizontal>
          <HorizontalCalendar>{calendarItems}</HorizontalCalendar>
        </CalendarWrapper>
        <ListsWrapper>
          <MovieListBox>
            <h1>영화</h1>
            <MovieList>{movieItems}</MovieList>
          </MovieListBox>
          <TheaterListBox>
            <h1>극장</h1>
            <div>
              <TheaterTabButton selected={selection.theaterTab === 'areaTheater'}
                onClick={handleTheaterTabToArea}>전체</TheaterTabButton>
              <TheaterTabButton selected={selection.theaterTab === 'specialTheater'}
                onClick={handleTheaterTabToSpecial}>특별관</TheaterTabButton>
            </div>
            <div>
              <TheaterList>{theaterDistrictItems}</TheaterList>
              <TheaterList>{theaterItems}</TheaterList>
            </div>
          </TheaterListBox>
        </ListsWrapper>
      </StyledArticle>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(async ({ req, res, query, store }) => {
  const movieNumber = query.movieNumber;
  let reqObj = null;
  const date = new Date();
  const formattedDate = `${date.getFullYear()}${numberReader(date.getMonth() + 1)}${numberReader(date.getDate())}`;
  const accessToken = cookie.parse(req.headers.cookie || '').accessToken;
  let resp = null;

  if (movieNumber) {
    reqObj = {
      playDe: formattedDate,
      movieNo1: movieNumber
    };
  } else {
    reqObj = {
      playDe: formattedDate
    };
  }

  if (accessToken) {
    store.dispatch(setAccessToken(accessToken));
    resp = await postDataInNodeJs('/booking', reqObj, accessToken, req, res, store);
  } else {
    resp = await httpInNodeJs.post('/booking', reqObj);
  }
  const data = resp.data;

  return {
    props: { data, queryMovieNumber: movieNumber || '' },
  };
});

export default withLayout(Booking);
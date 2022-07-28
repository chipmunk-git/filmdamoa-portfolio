import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styled, { css } from 'styled-components';
import { darken } from 'polished';
import * as cookie from 'cookie';
import { decode } from 'html-entities';
import { http, httpInNodeJs, postDataInNodeJs } from '../../lib/http';
import { numberReader, createParsedDates, createParsedTheaters } from '../../lib/bookingFunction';
import { movieRating } from '../../lib/bookingObject';
import { StyledArticle, scrollable } from '../../lib/styledComponents';
import storage from '../../lib/storage';
import { withLayout } from '../../components';
import { wrapper } from '../../store/store';
import { setAccessToken } from '../../store/user/action';

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
          ${day === 'SAT' && // 토요일
            css`
              color: #3b5fcb;
            `
          }

          ${day === 'SUN_OR_HOL' && // 일요일 또는 공휴일
            css`
              color: #e81002;
            `
          }

          ${selected && // 선택한 날짜
            css`
              background-color: ${theme.colors.greyBg};
              border-bottom: 0.125rem solid #503396;
            `
          }
        ` : // 선택 불가능한 날짜
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

  @media ${({ theme }) => theme.media.laptop} {
    flex-wrap: wrap;
  }
`

const MovieListBox = styled.div`
  width: 25%;
  padding: 0 0.875rem;
  border: 1px solid ${({ theme }) => theme.colors.greyLight};

  h1 {
    margin: 0.875rem 0;
    font-size: ${({ theme }) => theme.fontSize.large};
  }

  @media ${({ theme }) => theme.media.laptop} {
    width: 45%;
  }

  @media ${({ theme }) => theme.media.mobile} {
    width: 100%;
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
    ${active ? // 선택 가능 여부
      css`
        &:hover {
          background-color: ${darken(0.05, 'white')};
        }
      ` :
      css`
        opacity: 0.5;
      `
    }

    ${selected && // 선택한 영화
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
      ${!active && // 선택 불가능한 영화
        css`
          color: ${theme.colors.thumbBg};
          cursor: default;
        `
      }

      ${selected && // 선택한 영화
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

  @media ${({ theme }) => theme.media.laptop} {
    width: 55%;
  }

  @media ${({ theme }) => theme.media.mobile} {
    width: 100%;
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

    ${selected && // 선택한 탭
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
    ${selected && // 선택한 '지역 또는 특별관 유형'
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
    ${active ? // 선택 가능 여부
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

    ${selected && // 선택한 극장
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

const TimeListBox = styled.div`
  width: 43%;
  border: 1px solid ${({ theme }) => theme.colors.greyLight};

  > div {
    display: flex;
    justify-content: space-between;
    padding: 0 0.875rem;
    margin: 0.875rem 0;

    h1 {
      margin: 0;
      font-size: ${({ theme }) => theme.fontSize.large};
    }

    div {
      display: flex;
      align-items: center;
      font-size: ${({ theme }) => theme.fontSize.small};
    }
  }

  @media ${({ theme }) => theme.media.laptop} {
    width: 100%;
  }
`

const TimeIcon = styled.i`
  display: inline-block;
  margin: 0 0.125rem 0 0.5rem;
  overflow: hidden;
  background-position: 0 0;
  background-repeat: no-repeat;

  ${({ time }) => css`
    ${time !== 'MNIGHT' ?
      css`
        width: 14px;
        height: 14px;

        ${time === 'ERYM' ? // 조조
          css`
            background-image: url('/icons/time-sun.png');
          ` : // 브런치
          css`
            background-image: url('/icons/time-brunch.png');
          `
        }
      ` : // 심야
      css`
        width: 12px;
        height: 12px;
        background-image: url('/icons/time-moon.png');
      `
    }
  `}
`

const TimeList = styled(MovieList)`
  li {
    font-size: ${({ theme }) => theme.fontSize.medium};
  }

  li:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.greyLight};
  }
`

const TimeButton = styled.button`
  width: 100%;
  padding: 0.375rem;
  ${buttonStyles};

  &:hover {
    background-color: ${darken(0.05, 'white')};
  }

  > span {
    display: inline-flex;
    flex-direction: column;
    min-height: 3.375rem;
    vertical-align: top;
  }
`

const MovieLegend = styled.span`
  width: 1.25rem;
  padding: 0.25rem 0 0 0;

  i {
    margin: 0.25rem auto;
  }
`

const MovieTime = styled.span`
  width: 4.375rem;
  padding: 0.25rem 0 0.25rem 0.375rem;
  text-align: left;

  strong {
    font-size: ${({ theme }) => theme.fontSize.large};
  }

  em {
    margin-top: 0.25rem;
    font-size: ${({ theme }) => theme.fontSize.small};
    font-style: normal;
  }
`

const MovieTitle = styled.span`
  width: calc(100% - 1.25rem - 4.375rem - 6.875rem);
  padding: 0.25rem 0;
  text-align: left;

  strong {
    font-weight: normal;
  }

  em {
    margin-top: 0.375rem;
    font-size: ${({ theme }) => theme.fontSize.small};
    font-style: normal;
  }
`

const MovieInfo = styled.span`
  align-items: flex-end;
  width: 6.875rem;
  padding: 0 0.125rem 0 0;
  text-align: right;
  font-size: ${({ theme }) => theme.fontSize.small};

  > span:last-child {
    display: inline-block;
    width: 3.75rem;
    height: 1.25rem;
    margin-top: 0.125rem;
    text-align: center;
    border: 1px solid ${({ theme }) => theme.colors.greyLight};

    strong {
      line-height: 1.25rem;
      vertical-align: middle;
      color: #01738b;
    }

    em {
      line-height: 1.25rem;
      vertical-align: middle;
      color: ${({ theme }) => theme.colors.thumbBg};
      font-style: normal;
    }
  }
`

// 예매 화면의 렌더링에 이용되는 컴포넌트
const Index = ({ data, queryMovieNumber }) => {
  const router = useRouter();

  const [parsedDates, setParsedDates] = useState(createParsedDates(data.movieFormDeList)); // 상영 일정이 정해진 날짜들
  const [movies, setMovies] = useState(data.movieList); // 현재 상영 중인 영화들
  const [parsedTheaters, setParsedTheaters] = useState({ // 각 범주별 극장 목록
    areaTheater: createParsedTheaters(data.areaBrchList),
    specialTheater: createParsedTheaters(data.spclbBrchList)
  });
  const [bookableMovies, setBookableMovies] = useState(data.movieFormList); // 선택한 조건으로 예매 가능한 영화들
  const [selection, setSelection] = useState({ // 선택한 조건
    formattedDate: parsedDates[0]['formattedDate'], // 형식화된 날짜
    movieNumber: queryMovieNumber, // 영화 고유 번호
    theaterTab: 'areaTheater', // 극장 범주
    theaterDistrict: { areaTheater: null, specialTheater: null }, // 지역 또는 특별관 유형의 인덱스
    branchNumber: ['', '', ''] // [극장 번호, 특별관 선택 여부, 지역 또는 특별관 유형의 코드]
  });

  const scrollRef = useRef(); // 가로 스크롤바가 포함된 컴포넌트에 사용됨
  useEffect(() => {
    const handleWheel = event => {
      /* 스크롤 휠만 이용하여 가로 스크롤바 조작 가능 */
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

  // 상영 영화 및 영화 스케줄 조회 후 여러 State 업데이트
  const postBookingData = reqObj => http.post('/booking', reqObj).then(resp => {
    setParsedDates(createParsedDates(resp.data.movieFormDeList));
    setMovies(resp.data.movieList);
    setParsedTheaters({
      areaTheater: createParsedTheaters(resp.data.areaBrchList),
      specialTheater: createParsedTheaters(resp.data.spclbBrchList)
    });
    setBookableMovies(resp.data.movieFormList);
  }).catch(err => console.log(err));

  // '형식화된 날짜' 선택 및 로직 수행
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

  // '상영 일정이 정해진 날짜들' 렌더링
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

  // '영화 고유 번호' 선택 및 로직 수행
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

  // '현재 상영 중인 영화들' 렌더링
  const movieItems = movies.map(movie =>
    <MovieItem key={movie.movieNo} active={movie.formAt === 'Y'}
      movieRating={movieRating[movie.admisClassCd]} selected={selection.movieNumber === movie.movieNo}>
      <span />
      <button onClick={() => handleMovieSelection(movie.formAt === 'Y', movie.movieNo)}>
        {movie.movieNm}
      </button>
    </MovieItem>
  );

  /* '극장 범주' 선택 */
  const handleTheaterTabToArea = () => setSelection({ ...selection, theaterTab: 'areaTheater' });
  const handleTheaterTabToSpecial = () => setSelection({ ...selection, theaterTab: 'specialTheater' });
  // '지역 또는 특별관 유형의 인덱스' 선택
  const handleTheaterDistrict = (theaterTab, index) => setSelection({
    ...selection,
    theaterDistrict: { ...selection.theaterDistrict, [theaterTab]: index }
  });

  // '[극장 번호, 특별관 선택 여부, 지역 또는 특별관 유형의 코드]' 선택 및 로직 수행
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

  // '지역 또는 특별관 유형 목록' 렌더링
  const theaterDistrictItems = parsedTheaters[selection.theaterTab].map((parsedTheater, index) =>
    <li key={parsedTheater[0]['areaCd']}>
      <TheaterDistrictButton selected={selection['theaterDistrict'][selection.theaterTab] === index}
        onClick={() => handleTheaterDistrict(selection.theaterTab, index)}>
        {parsedTheater[0]['areaCdNm']}({parsedTheater[0]['formBrchCnt']})
      </TheaterDistrictButton>
    </li>
  );

  // '지역 또는 특별관 유형의 극장 목록' 렌더링
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

  // 선택한 스케줄에 대한 상영 정보 확인 및 로직 수행
  const handleTimeSelection = bookableMovie => {
    if (confirm(`영화: ${bookableMovie.rpstMovieNm} / ${decode(bookableMovie.playKindNm)}\n` +
                `상영 시간: ${bookableMovie.playStartTime} ~ ${bookableMovie.playEndTime}\n` +
                `극장: ${decode(bookableMovie.brchNm)} / ${decode(bookableMovie.theabExpoNm)}\n` +
                `좌석 현황: ${bookableMovie.restSeatCnt} / ${bookableMovie.totSeatCnt}\n` +
                `\n예매 하시겠습니까?`)) {
      storage.set('seatParameter', { branchNumber: selection['branchNumber'][0], scheduleNumber: bookableMovie.playSchdlNo }); // 극장 번호 및 영화 스케줄 번호 저장
      router.push('/booking/seat');
    }
  }

  // '선택한 조건으로 예매 가능한 영화들' 렌더링
  const bookableMovieItems = (bookableMovies || []).map(bookableMovie =>
    <li key={bookableMovie.playSchdlNo}>
      <TimeButton onClick={() => handleTimeSelection(bookableMovie)}>
        <MovieLegend>
          {bookableMovie.playTyCd !== 'GERN' && <TimeIcon time={bookableMovie.playTyCd} title={bookableMovie.playTyCdNm} />}
        </MovieLegend>
        <MovieTime>
          <strong title="상영 시작">{bookableMovie.playStartTime}</strong>
          <em title="상영 종료">~{bookableMovie.playEndTime}</em>
        </MovieTime>
        <MovieTitle>
          <strong>{bookableMovie.rpstMovieNm}</strong>
          <em>{decode(bookableMovie.playKindNm)}</em>
        </MovieTitle>
        <MovieInfo>
          <span title="극장">{decode(bookableMovie.brchNm)}<br />{decode(bookableMovie.theabExpoNm)}</span>
          <span>
            <strong title="잔여 좌석">{bookableMovie.restSeatCnt}</strong>
            <em title="전체 좌석">/{bookableMovie.totSeatCnt}</em>
          </span>
        </MovieInfo>
      </TimeButton>
    </li>
  );

  return (
    <>
      <Head>
        <title>FILMDAMOA - 예매</title>
        <meta name="description" content="예매 페이지입니다." />
      </Head>
      <StyledArticle>
        <CalendarWrapper ref={scrollRef}>
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
          <TimeListBox>
            <div>
              <h1>시간</h1>
              <div>
                <TimeIcon time="ERYM" title="조조" />조조
                <TimeIcon time="BRUNCH" title="브런치" />브런치
                <TimeIcon time="MNIGHT" title="심야" />심야
              </div>
            </div>
            <TimeList>{bookableMovieItems}</TimeList>
          </TimeListBox>
        </ListsWrapper>
      </StyledArticle>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(async ({ req, res, query, store }) => {
  const movieNumber = query.movieNumber; // 쿼리 스트링에서 movieNumber 필드 값 확보. movieNumber 필드 값이 없다면 undefined가 할당됨
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

  /* 상영 영화 및 영화 스케줄 조회 */
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

export default withLayout(Index);
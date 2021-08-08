import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import styled, { css } from 'styled-components';
import * as cookie from 'cookie';
import { httpInNodeJs, postDataInNodeJs } from '../lib/http';
import { numberReader, createParsedDates } from '../lib/dateFunction';
import { StyledArticle } from '../lib/styledComponents';
import { withLayout } from '../components';
import { wrapper } from '../store/store';
import { setAccessToken } from '../store/user/action';

const CalendarWrapper = styled.div`
  width: 72rem;
  margin: 0 auto;
  overflow-x: scroll;

  @media ${({ theme }) => theme.media.desktop} {
    width: auto;
  }
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

const DateButton = styled.button`
  display: block;
  width: 5.125rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  background-color: transparent;
  border: 0;

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

const Booking = ({ data }) => {
  const [parsedDates, setParsedDates] = useState(createParsedDates(data.movieFormDeList));
  const [selection, setSelection] = useState(null);
  const handleDateSelection = (active, formattedDate) => {
    if (active) setSelection(formattedDate);
  }

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

  const calendarItems = parsedDates.map(parsedDate =>
    <li key={parsedDate.id}>
      {parsedDate.fullYearAndMonth && <div>{parsedDate.fullYearAndMonth}</div>}
      <DateButton active={parsedDate.active} day={parsedDate.day[1]}
        selected={selection === parsedDate.formattedDate}
        onClick={() => handleDateSelection(parsedDate.active, parsedDate.formattedDate)}>
        <em>{parsedDate.date}</em>
        <span>{parsedDate.day[0]}</span>
      </DateButton>
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
    props: { data },
  };
});

export default withLayout(Booking);
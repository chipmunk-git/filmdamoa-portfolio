import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import * as cookie from 'cookie';
import Pagination from 'react-js-pagination';
import { http, getDataInNodeJs } from '../../lib/http';
import { parsePaymentDateTime } from '../../lib/bookingFunction';
import { StyledArticle } from '../../lib/styledComponents';
import { withLayout } from '../../components';
import { wrapper } from '../../store/store';
import { setAccessToken } from '../../store/user/action';

const BookingListBox = styled.div`
  h1 {
    margin: 0.875rem 0;
    color: #503396;
    font-size: 1.375rem;
  }

  > div {
    border-top: 1px solid #545454;
  }

  .movie-name, .branch-name, .play-dat, .payment-dat, .amount {
    padding: 0.75rem 0.625rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }

  .movie-name {
    width: calc(100% - 8.125rem - 11.75rem - 10rem - 6.5rem);
  }

  .branch-name {
    width: 8.125rem;
  }

  .play-dat {
    width: 11.75rem;
  }

  .payment-dat {
    width: 10rem;
  }

  .amount {
    width: 6.5rem;
  }

  @media ${({ theme }) => theme.media.laptop} {
    .movie-name {
      width: 100%;
    }

    .branch-name {
      width: 9.625rem;
    }

    .play-dat {
      width: 15rem;
    }

    .payment-dat {
      width: 13.25rem;
    }

    .amount {
      width: 9.75rem;
    }
  }
`

const BookingListHeader = styled.div`
  display: flex;

  div {
    color: #232323;
    font-weight: bold;
    background-color: #f4f4f4;
    border: 1px solid #eaeaea;
    border-width: 0 0 1px 0;
  }

  @media ${({ theme }) => theme.media.laptop} {
    display: none;
  }
`

const BookingList = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;

  a {
    display: flex;
    text-decoration: none;
    color: #434343;
    border: 1px solid #eaeaea;
    border-width: 0 0 1px 0;

    &:hover {
      background-color: #f4f4f4;
    }
  }

  i {
    display: block;
    font-style: normal;
  }

  span {
    display: flex;
  }

  b {
    display: none;
  }

  .movie-name {
    text-align: left;
  }

  .amount {
    text-align: right;
    color: #e81002;
  }

  @media ${({ theme }) => theme.media.laptop} {
    a, span {
      display: block;
    }

    b {
      display: inline;
      margin-right: 0.5rem;
    }

    .movie-name {
      padding: 0.875rem 0.75rem;
      font-weight: bold;
    }

    .branch-name, .play-dat, .payment-dat, .amount {
      display: inline-block;
      padding: 0 0.75rem 0.25rem;
      text-align: left;
      vertical-align: top;
      font-size: ${({ theme }) => theme.fontSize.medium};

      &:last-child {
        padding: 0 0.75rem 0.875rem;
      }
    }
  }
`

const BookingListPaginator = styled.div`
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

const Index = ({ data }) => {
  const [bookings, setBookings] = useState(data.content);
  const [activePage, setActivePage] = useState(1);

  const initialRender = useRef(true);
  useEffect(async () => {
    if (initialRender.current) {
      initialRender.current = false;
    } else {
      await http.get(`/payment?page=${activePage - 1}&size=10&sort=paymentDateTime,desc`).then(resp => {
        setBookings(resp.data.content);
      }).catch(err => alert(err.response.data.message));
    }
  }, [activePage]);

  const handlePageChange = pageNumber => setActivePage(pageNumber);

  const bookingItems = bookings.map(booking =>
    <li key={booking.impUid}>
      <a href={`/mypage/booking_${booking.merchantUid}`}>
        <i className="movie-name">{booking.movieName} {booking.playKindName}</i>
        <span>
          <i className="branch-name">
            <b>극장</b>
            {booking.branchName}
          </i>
          <i className="play-dat">
            <b>상영일시</b>
            {booking.playDeAndDow.replace(/^[^(]*/g, '$&' + ' ')} {booking.playTime.slice(0, -6)}
          </i>
          <i className="payment-dat">
            <b>결제일시</b>
            {parsePaymentDateTime(booking.paymentDateTime)}
          </i>
          <i className="amount">
            <b>결제금액</b>
            {booking.amount.toLocaleString()}원
          </i>
        </span>
      </a>
    </li>
  );

  return (
    <>
      <Head>
        <title>FILMDAMOA - 개인 계정 관리</title>
        <meta name="description" content="개인 계정 관리 페이지입니다." />
      </Head>
      <StyledArticle>
        <div>
          <BookingListBox>
            <h1>예매내역</h1>
            <div>
              <BookingListHeader>
                <div className="movie-name">영화명</div>
                <div className="branch-name">극장</div>
                <div className="play-dat">상영일시</div>
                <div className="payment-dat">결제일시</div>
                <div className="amount">결제금액</div>
              </BookingListHeader>
              <BookingList>{bookingItems}</BookingList>
              <BookingListPaginator>
                <Pagination activePage={activePage} itemsCountPerPage={10}
                  totalItemsCount={data.totalElements} pageRangeDisplayed={5} onChange={handlePageChange} />
              </BookingListPaginator>
            </div>
          </BookingListBox>
        </div>
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

  const resp = await getDataInNodeJs('/payment?page=0&size=10&sort=paymentDateTime,desc', accessToken, req, res, store);

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

export default withLayout(Index);
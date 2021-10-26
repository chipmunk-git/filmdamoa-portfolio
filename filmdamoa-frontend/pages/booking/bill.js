import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as cookie from 'cookie';
import { decode } from 'html-entities';
import { useSelector } from 'react-redux';
import { http } from '../../lib/http';
import { movieRating } from '../../lib/bookingObject';
import { StyledArticle, StyledWrapper, MovieSeatBox, MovieInfoBox, TitleWrapper } from '../../lib/styledComponents';
import storage from '../../lib/storage';
import { withLayout } from '../../components';
import { wrapper } from '../../store/store';
import { setAccessToken } from '../../store/user/action';

const LeadBox = styled(MovieSeatBox)`
  h1 {
    margin: 0.75rem 0;
    color: ${({ theme }) => theme.colors.black};
    font-size: ${({ theme }) => theme.fontSize.large};
  }

  div {
    padding: 1.25rem;
    border: 1px solid ${({ theme }) => theme.colors.greyLight};
    border-radius: 0.625rem;
    color: #434343;
  }

  ul {
    padding: 0;
    margin: 0;
    list-style: none;

    li {
      display: inline-block;
      margin: 0.375rem 0;

      &:not(:last-child) {
        margin-right: 1.875rem;
      }
    }
  }

  label {
    display: flex;
    align-items: center;
  }

  input {
    margin: 0 0.375rem 0 0;
  }
`

const DetailWrapper = styled(TitleWrapper)`
  border-bottom: none;

  b {
    display: inline-block;
    color: silver;
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: normal;

    &:first-of-type {
      width: 100%;
      margin-top: 0.125rem;
    }

    &:not(:first-of-type) {
      width: 50%;
      max-width: 7rem;
    }

    &:last-of-type {
      padding-left: 0.5rem;
      position: relative;

      &::before {
        display: block;
        width: 1px;
        height: 0.875rem;
        content: '';
        background-color: #747474;
        position: absolute;
        bottom: 0.125rem;
        left: calc(3.25rem - 50%);
      }
    }
  }
`

const StyledClock = styled(FontAwesomeIcon)`
  margin-right: 0.125rem;
  font-size: ${({ theme }) => theme.fontSize.medium} !important;
  color: whitesmoke;
`

const InterimWrapper = styled.div`
  min-height: 13.5rem;
  margin: 0 1.25rem;
  font-size: ${({ theme }) => theme.fontSize.medium};

  > div {
    padding: 0.875rem 1.25rem;
    border-radius: 0.25rem;
    background-color: #434343;

    div {
      padding-top: 0.5rem;
      margin-top: 0.5rem;
      border-top: 1px solid #4d4d4d;

      &::after {
        display: block;
        content: '';
        clear: both;
      }
    }
  }

  ul {
    padding: 0;
    margin: 0;
    list-style: none;

    li {
      &::after {
        display: block;
        content: '';
        clear: both;
      }
    }
  }

  i {
    color: silver;
    font-style: normal;

    &:last-child {
      float: right;
      position: relative;
      top: 0.125rem;
    }
  }

  span {
    &:last-child {
      float: right;
      position: relative;
      top: -0.25rem;
    }
  }

  b {
    margin-right: 0.125rem;
    font-size: ${({ theme }) => theme.fontSize.great};
    font-weight: normal;
    position: relative;
    top: 0.125rem;
  }
`

const ResultWrapper = styled.div`
  padding: 0.75rem 0;
  margin: 0 1.25rem;

  div {
    &:first-child {
      position: relative;
      bottom: -0.25rem;
    }

    &:last-child {
      padding: 0.625rem 0;
      margin-top: 0.375rem;
      border-top: 1px solid #6a6a6c;
    }

    &::after {
      display: block;
      content: '';
      clear: both;
    }
  }

  span {
    &:last-child {
      float: right;
      position: relative;
      top: -0.625rem;
    }
  }

  strong {
    margin-right: 0.25rem;
    color: #59bec9;
    font-size: 1.75rem;
    font-weight: normal;
    position: relative;
    top: 0.375rem;
  }

  i {
    color: silver;
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-style: normal;

    &:last-child {
      float: right;
    }
  }
`

const ButtonWrapper = styled.div`
  button {
    width: 50%;
    height: 2.5rem;
    cursor: pointer;
    border: 0;
    color: white;
    font-size: ${({ theme }) => theme.fontSize.large};

    &:first-child {
      border-radius: 0 0 0 0.625rem;
      background-color: #53565b;
    }

    &:last-child {
      border-radius: 0 0 0.625rem 0;
      background-color: #329eb1;
    }
  }
`

const Bill = () => {
  const { username } = useSelector(state => ({
    username: state.user.username
  }));

  const router = useRouter();

  const [checkedState, setCheckedState] = useState('신용/체크카드');
  const [audiences, setAudiences] = useState([]);
  const [movieDetailInfo, setMovieDetailInfo] = useState({});

  const postBillData = async reqObj => {
    await http.post('/booking/seat', reqObj).then(resp => {
      const movieDtlInfo = resp.data.movieDtlInfo;
      setMovieDetailInfo({
        admisClassCd: movieDtlInfo.admisClassCd,
        movieNm: movieDtlInfo.movieNm,
        playKindName: decode(movieDtlInfo.playKindName),
        brchNm: decode(movieDtlInfo.brchNm),
        theabExpoNm: decode(movieDtlInfo.theabExpoNm),
        playDeAndDow: `${movieDtlInfo.playDe.substr(0, 4)}.${movieDtlInfo.playDe.substr(4, 2)}.${movieDtlInfo.playDe.substr(6, 2)}(${movieDtlInfo.playDowNm})`,
        playTime: `${movieDtlInfo.playStartTime.substr(0, 2)}:${movieDtlInfo.playStartTime.substr(2, 2)}` +
                  `~${movieDtlInfo.playEndTime.substr(0, 2)}:${movieDtlInfo.playEndTime.substr(2, 2)}`
      });
    }).catch(err => console.log(err));
  }

  useEffect(() => {
    const seatParameter = storage.get('seatParameter');
    const billParameter = storage.get('billParameter');

    if (!seatParameter || !billParameter) {
      router.replace('/');
      return;
    }

    setAudiences(billParameter.audiences);
    const reqObj = { playSchdlNo: seatParameter.scheduleNumber, brchNo: seatParameter.branchNumber };
    postBillData(reqObj);
  }, []);

  useEffect(() => {
    const jquery = document.createElement('script');
    jquery.src = 'https://code.jquery.com/jquery-1.12.4.min.js';
    const iamport = document.createElement('script');
    iamport.src = 'https://cdn.iamport.kr/js/iamport.payment-1.2.0.js';

    document.head.appendChild(jquery);
    document.head.appendChild(iamport);

    return () => {
      document.head.removeChild(jquery);
      document.head.removeChild(iamport);
    }
  }, []);

  const handleChange = evt => setCheckedState(evt.target.value);

  const audienceItems = audiences.map(audience => audience.count > 0 &&
    <li key={audience.category}>
      <i>{audience.category} {audience.count}</i>
      <i>{(audience.count * audience.fee).toLocaleString()}</i>
    </li>
  );

  const totalAmount = audiences.reduce((prevTotal, audience) => prevTotal + audience.count * audience.fee, 0);

  const handlePrevMotion = () => router.back();

  const handleRequestPay = async () => {
    const seatParameter = storage.get('seatParameter');
    const billParameter = storage.get('billParameter');

    if (!seatParameter || !billParameter) {
      router.replace('/');
      return;
    }

    const merchant_uid = `mid_${new Date().getTime()}`;
    const reqObj = {
      merchantUid: merchant_uid,
      scheduleNumber: seatParameter.scheduleNumber,
      branchNumber: seatParameter.branchNumber,
      playKindName: movieDetailInfo.playKindName,
      branchName: movieDetailInfo.brchNm,
      theabExpoName: movieDetailInfo.theabExpoNm,
      playDeAndDow: movieDetailInfo.playDeAndDow,
      playTime: movieDetailInfo.playTime,
      audiences: billParameter.audiences,
      selections: billParameter.selections,
      amount: totalAmount,
      paymentState: '결제 미완료',
      movieName: movieDetailInfo.movieNm,
      username: username
    };

    const paymentResp = await http.post('/payment', reqObj).catch(err => {
      alert(`결제 실패: ${err.response.data.message}`);
      return undefined;
    });
    if (!paymentResp) return;

    const { IMP } = window;
    IMP.init(process.env.NEXT_PUBLIC_MERCHANT);

    const pgAndPayMethod = {
      '신용/체크카드': ['bluewalnut', 'card'],
      '휴대폰 결제': ['bluewalnut', 'phone'],
      '카카오페이': ['kakaopay', 'card']
    };
    const [pg, payMethod] = pgAndPayMethod[checkedState];

    const data = {
      pg: pg,
      pay_method: payMethod,
      merchant_uid: merchant_uid,
      name: `${movieDetailInfo.movieNm}/${movieDetailInfo.playKindName}`,
      amount: totalAmount,
      buyer_name: username
    };

    const callback = async rsp => {
      if (rsp.success) {
        await http.post('/payment/complete', { impUid: rsp.imp_uid, merchantUid: rsp.merchant_uid }).then(resp => {
          switch (resp.data.status) {
            case 'vbankIssued':
              setTimeout(() => alert(resp.data.message), 100);
              break;
            case 'success':
              setTimeout(() => alert(resp.data.message), 100);

              storage.remove('seatParameter');
              storage.remove('billParameter');
              storage.remove('destination');

              router.push(`/booking/complete?merchantUid=${merchant_uid}`);
              break;
          }
        }).catch(err => setTimeout(() => alert(`결제 실패: ${err.response.data.message}`), 100));
      } else {
        setTimeout(() => alert(`결제 실패: ${rsp.error_msg}`), 100);
      }
    }

    IMP.request_pay(data, callback);
  }

  return (
    <>
      <Head>
        <title>FILMDAMOA - 예매 - 계산서</title>
        <meta name="description" content="계산서 페이지입니다." />
      </Head>
      <StyledArticle>
        <StyledWrapper>
          <LeadBox>
            <h1>결제수단선택</h1>
            <div>
              <ul>
                <li>
                  <label>
                    <input type="radio" name="checkedState" value="신용/체크카드" checked={checkedState === '신용/체크카드'} onChange={handleChange} />
                    신용/체크카드
                  </label>
                </li>
                <li>
                  <label>
                    <input type="radio" name="checkedState" value="휴대폰 결제" checked={checkedState === '휴대폰 결제'} onChange={handleChange} />
                    휴대폰 결제
                  </label>
                </li>
                <li>
                  <label>
                    <input type="radio" name="checkedState" value="카카오페이" checked={checkedState === '카카오페이'} onChange={handleChange} />
                    카카오페이
                  </label>
                </li>
              </ul>
            </div>
          </LeadBox>
          <MovieInfoBox>
            <DetailWrapper movieRating={movieRating[movieDetailInfo.admisClassCd]}>
              <span />
              <div>
                <h1>{movieDetailInfo.movieNm}</h1>
                <i>{movieDetailInfo.playKindName}</i>
                <b>{movieDetailInfo.brchNm}/{movieDetailInfo.theabExpoNm}</b>
                <b>{movieDetailInfo.playDeAndDow}</b>
                <b><StyledClock icon={["far", "clock"]} />{movieDetailInfo.playTime}</b>
              </div>
            </DetailWrapper>
            <InterimWrapper>
              <div>
                <ul>{audienceItems}</ul>
                <div>
                  <span>금액</span>
                  <span>
                    <b>{totalAmount.toLocaleString()}</b>
                    원
                  </span>
                </div>
              </div>
            </InterimWrapper>
            <ResultWrapper>
              <div>
                <span>최종결제금액</span>
                <span>
                  <strong>{totalAmount.toLocaleString()}</strong>
                  원
                </span>
              </div>
              <div>
                <i>결제수단</i>
                <i>{checkedState}</i>
              </div>
            </ResultWrapper>
            <ButtonWrapper>
              <button onClick={handlePrevMotion}>이전</button>
              <button onClick={handleRequestPay}>결제</button>
            </ButtonWrapper>
          </MovieInfoBox>
        </StyledWrapper>
      </StyledArticle>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(({ req, store }) => {
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

  return {
    props: {},
  };
});

export default withLayout(Bill);
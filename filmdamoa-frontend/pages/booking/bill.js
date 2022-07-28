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

// 계산서 화면의 렌더링에 이용되는 컴포넌트
const Bill = () => {
  const { username } = useSelector(state => ({
    username: state.user.username
  }));

  const router = useRouter();

  const [checkedState, setCheckedState] = useState('신용/체크카드'); // 결제 수단. '신용/체크카드', '휴대폰 결제' 및 '카카오페이' 중 하나를 선택
  const [audiences, setAudiences] = useState([]);
  const [movieDetailInfo, setMovieDetailInfo] = useState({});

  // 좌석 및 상영 정보 조회 후 movieDetailInfo 업데이트
  const postBillData = async reqObj => {
    await http.post('/booking/seat', reqObj).then(resp => {
      const movieDtlInfo = resp.data.movieDtlInfo;
      setMovieDetailInfo({
        admisClassCd: movieDtlInfo.admisClassCd, // 등급 코드
        movieNm: movieDtlInfo.movieNm, // 영화 이름
        playKindName: decode(movieDtlInfo.playKindName), // 상영 유형
        brchNm: decode(movieDtlInfo.brchNm), // 극장 이름
        theabExpoNm: decode(movieDtlInfo.theabExpoNm), // 상영관 이름
        playDeAndDow: `${movieDtlInfo.playDe.substr(0, 4)}.${movieDtlInfo.playDe.substr(4, 2)}.${movieDtlInfo.playDe.substr(6, 2)}(${movieDtlInfo.playDowNm})`, // 상영일 및 요일
        playTime: `${movieDtlInfo.playStartTime.substr(0, 2)}:${movieDtlInfo.playStartTime.substr(2, 2)}` +
                  `~${movieDtlInfo.playEndTime.substr(0, 2)}:${movieDtlInfo.playEndTime.substr(2, 2)}` // 상영 시작 및 종료 시간
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

  // jQuery 및 아임포트 JavaScript SDK Library 로드
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

  // 라디오 버튼의 value로 checkedState 업데이트
  const handleChange = evt => setCheckedState(evt.target.value);

  const audienceItems = audiences.map(audience => audience.count > 0 &&
    <li key={audience.category}>
      <i>{audience.category} {audience.count}</i>
      <i>{(audience.count * audience.fee).toLocaleString()}</i>
    </li>
  );

  const totalAmount = audiences.reduce((prevTotal, audience) => prevTotal + audience.count * audience.fee, 0);

  const handlePrevMotion = () => router.back();

  // '결제' 버튼 클릭 시 PG사의 결제창이 호출됨
  const handleRequestPay = async () => {
    const seatParameter = storage.get('seatParameter');
    const billParameter = storage.get('billParameter');

    if (!seatParameter || !billParameter) {
      router.replace('/');
      return;
    }

    const merchant_uid = `mid_${new Date().getTime()}`;
    const reqObj = {
      merchantUid: merchant_uid, // 예매 번호
      scheduleNumber: seatParameter.scheduleNumber,
      branchNumber: seatParameter.branchNumber,
      playKindName: movieDetailInfo.playKindName,
      branchName: movieDetailInfo.brchNm,
      theabExpoName: movieDetailInfo.theabExpoNm,
      playDeAndDow: movieDetailInfo.playDeAndDow,
      playTime: movieDetailInfo.playTime,
      audiences: billParameter.audiences,
      selections: billParameter.selections,
      amount: totalAmount, // 결제 금액
      paymentState: '결제 미완료',
      movieName: movieDetailInfo.movieNm,
      username: username
    };

    // 미완성 초기 결제 정보를 검증 및 가공하여 DB에 저장
    const paymentResp = await http.post('/payment', reqObj).catch(err => {
      alert(`결제 실패: ${err.response.data.message}`);
      return undefined;
    });
    if (!paymentResp) return;

    const { IMP } = window;
    IMP.init(process.env.NEXT_PUBLIC_MERCHANT); // 결제 요청 전, 가맹점 식별코드를 이용하여 IMP 객체 초기화

    const pgAndPayMethod = {
      '신용/체크카드': ['bluewalnut', 'card'],
      '휴대폰 결제': ['bluewalnut', 'phone'],
      '카카오페이': ['kakaopay', 'card']
    };
    const [pg, payMethod] = pgAndPayMethod[checkedState];

    // 결제 승인에 필요한 정보를 가지는 객체
    const data = {
      pg: pg, // PG사 코드값
      pay_method: payMethod, // 결제 방법
      merchant_uid: merchant_uid,
      name: `${movieDetailInfo.movieNm}/${movieDetailInfo.playKindName}`, // 주문명
      amount: totalAmount,
      buyer_name: username
    };

    // 결제 후 호출되는 함수
    const callback = async rsp => {
      if (rsp.success) { // 결제 성공 시 로직
        // 결제 번호 및 예매 번호를 이용하여 결제 정보 검증 및 완성
        await http.post('/payment/complete', { impUid: rsp.imp_uid, merchantUid: rsp.merchant_uid }).then(resp => {
          switch (resp.data.status) {
            case 'vbankIssued': // 가상계좌 발급 성공
              setTimeout(() => alert(resp.data.message), 100);
              break;
            case 'success': // 결제 성공
              setTimeout(() => alert(resp.data.message), 100);

              storage.remove('seatParameter');
              storage.remove('billParameter');
              storage.remove('destination');

              router.push('/booking/complete');
              break;
          }
        }).catch(err => setTimeout(() => alert(`결제 실패: ${err.response.data.message}`), 100));
      } else { // 결제 실패 시 로직
        setTimeout(() => alert(`결제 실패: ${rsp.error_msg}`), 100);
      }
    }

    IMP.request_pay(data, callback); // 결제창 호출
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
        destination: '/', // 로그인을 하지 않았다면 메인 페이지로 리디렉션
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
});

export default withLayout(Bill);
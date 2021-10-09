import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import * as cookie from 'cookie';
import { decode } from 'html-entities';
import { http } from '../../lib/http';
import { movieRating } from '../../lib/bookingObject';
import { StyledArticle } from '../../lib/styledComponents';
import storage from '../../lib/storage';
import { withLayout } from '../../components';
import { wrapper } from '../../store/store';
import { setAccessToken } from '../../store/user/action';

const Bill = () => {
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

  const audienceItems = audiences.map(audience => audience.count > 0 &&
    <li key={audience.category}>
      <i>{audience.category} {audience.count}</i>
      <i> {audience.count * audience.fee}</i>
    </li>
  );

  const totalAmount = audiences.reduce((prevTotal, audience) => prevTotal + audience.count * audience.fee, 0);

  return (
    <>
      <Head>
        <title>FILMDAMOA - 예매 - 계산서</title>
        <meta name="description" content="계산서 페이지입니다." />
      </Head>
      <StyledArticle>
        <div>
          <div>
            <h1>결제수단선택</h1>
            <div>
              <ul>
                <li>
                  <label>
                    <input type="radio" name="checkedState" value="신용/체크카드" checked={checkedState === '신용/체크카드'} />
                    신용/체크카드
                  </label>
                </li>
                <li>
                  <label>
                    <input type="radio" name="checkedState" value="휴대폰 결제" checked={checkedState === '휴대폰 결제'} />
                    휴대폰 결제
                  </label>
                </li>
                <li>
                  <label>
                    <input type="radio" name="checkedState" value="카카오페이" checked={checkedState === '카카오페이'} />
                    카카오페이
                  </label>
                </li>
              </ul>
            </div>
          </div>
          <div>
            <div movieRating={movieRating[movieDetailInfo.admisClassCd]}>
              <span />
              <div>
                <h1>{movieDetailInfo.movieNm}</h1>
                <i>{movieDetailInfo.playKindName}</i>
                <i>{movieDetailInfo.brchNm}/{movieDetailInfo.theabExpoNm}</i>
                <b>{movieDetailInfo.playDeAndDow}</b>
                <b>{movieDetailInfo.playTime}</b>
              </div>
            </div>
            <div>
              <div>
                <ul>{audienceItems}</ul>
                <div>
                  <span>금액</span>
                  <span>
                    <b>{totalAmount}</b>
                    원
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div>
                <span>최종결제금액</span>
                <span>
                  <strong>{totalAmount}</strong>
                  원
                </span>
              </div>
              <div>
                <i>결제수단</i>
                <i>{checkedState}</i>
              </div>
            </div>
            <div>
              <button>이전</button>
              <button>결제</button>
            </div>
          </div>
        </div>
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
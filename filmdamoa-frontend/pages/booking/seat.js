import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import * as cookie from 'cookie';
import { decode } from 'html-entities';
import { http } from '../../lib/http';
import { parseSeatDatas } from '../../lib/bookingFunction';
import { movieRating } from '../../lib/bookingObject';
import { StyledArticle } from '../../lib/styledComponents';
import storage from '../../lib/storage';
import { withLayout } from '../../components';
import { wrapper } from '../../store/store';
import { setAccessToken } from '../../store/user/action';

const Seat = () => {
  const router = useRouter();

  const [audiences, setAudiences] = useState([
    { category: '성인', count: 0, fee: 13000 },
    { category: '청소년', count: 0, fee: 10000 },
    { category: '우대', count: 0, fee: 5000 }
  ]);
  const [parsedRows, setParsedRows] = useState([]);
  const [parsedSeats, setParsedSeats] = useState([]);
  const [movieDetailInfo, setMovieDetailInfo] = useState({});
  const [selections, setSelections] = useState(Array.from({ length: 8 }, () => null));

  useEffect(() => {
    const seatParameter = storage.get('seatParameter');
    if (!seatParameter) {
      router.replace('/');
      return;
    }

    const reqObj = { playSchdlNo: seatParameter.scheduleNumber, brchNo: seatParameter.branchNumber };
    const postSeatData = async () => {
      await http.post('/booking/seat', reqObj).then(resp => {
        const { parsedRowList, parsedSeatList } = parseSeatDatas(resp.data);
        setParsedRows(parsedRowList);
        setParsedSeats(parsedSeatList);
        setMovieDetailInfo(resp.data.movieDtlInfo);
      });
    }
    postSeatData();
  }, []);

  const counterItems = audiences.map(audience =>
    <li key={audience.category}>
      {audience.category}
      <button>-</button>
      <span>{audience.count}</span>
      <button>+</button>
    </li>
  );

  const parsedRowItems = parsedRows.map((parsedRow, index) =>
    <li key={index}>{parsedRow && <span>{parsedRow}</span>}</li>
  );

  const exitIcon = {
    GTU: ['/icons/img-door-top.png', '상단측 출입구'],
    GTR: ['/icons/img-door-right.png', '우측 출입구'],
    GTD: ['/icons/img-door-bottom.png', '하단측 출입구'],
    GTL: ['/icons/img-door-left.png', '좌측 출입구'],
    GTUD: ['/icons/img-door-top-bottom.png', '상하단측 출입구'],
    GTLR: ['/icons/img-door-left-right.png', '좌우측 출입구']
  };

  const parsedSeatItems = parsedSeats.map((parsedSeatRow, index) =>
    <li key={index}>
      {parsedSeatRow.map(parsedSeatCol =>
        parsedSeatCol && (parsedSeatCol.rowNm
          ? <button key={parsedSeatCol.colNo} colNo={parsedSeatCol.colNo} seatKind={[parsedSeatCol.seatClassCd, parsedSeatCol.seatStatCd]}>{parsedSeatCol.seatNo}</button>
          : <img key={parsedSeatCol.colNo} colNo={parsedSeatCol.colNo} src={exitIcon[parsedSeatCol.gateTyCd][0]} alt={exitIcon[parsedSeatCol.gateTyCd][1]} />
        )
      )}
    </li>
  );

  const selectionItems = selections.map((selection, index) =>
    <li key={index}>{selection}</li>
  );

  const audienceItems = audiences.map(audience => audience.count > 0 &&
    <li key={audience.category}>
      {audience.category}
      <i>{audience.count}</i>
    </li>
  );

  const total = audiences.reduce((prevTotal, audience) => prevTotal + audience.count * audience.fee, 0);

  return (
    <>
      <Head>
        <title>FILMDAMOA - 예매 - 좌석 선택</title>
        <meta name="description" content="좌석 선택 페이지입니다." />
      </Head>
      <StyledArticle>
        <div>
          <div>
            <div>
              <h1>관람인원선택</h1>
              <button>초기화</button>
            </div>
            <ul>{counterItems}</ul>
            <div>
              <img src="/icons/img-theater-screen.png" alt="screen" />
              <div>
                <ul>{parsedRowItems}</ul>
                <ul>{parsedSeatItems}</ul>
              </div>
            </div>
          </div>
          <div>
            <div movieRating={movieRating[movieDetailInfo.admisClassCd]}>
              <span />
              <div>
                <h1>{movieDetailInfo.movieNm}</h1>
                <i>{decode(movieDetailInfo.playKindName)}</i>
              </div>
            </div>
            <div>
              <div>
                <i>{decode(movieDetailInfo.brchNm)}</i>
                <i>{decode(movieDetailInfo.theabExpoNm)}</i>
                <i>
                  {movieDetailInfo.playDe &&
                    `${movieDetailInfo.playDe.substr(0, 4)}.${movieDetailInfo.playDe.substr(4, 2)}.${movieDetailInfo.playDe.substr(6, 2)}(${movieDetailInfo.playDowNm})`}
                </i>
                <span>
                  {movieDetailInfo.playStartTime && movieDetailInfo.playEndTime &&
                    `${movieDetailInfo.playStartTime.substr(0, 2)}:${movieDetailInfo.playStartTime.substr(2, 2)}` +
                    `~${movieDetailInfo.playEndTime.substr(0, 2)}:${movieDetailInfo.playEndTime.substr(2, 2)}`}
                </span>
              </div>
              <img src={movieDetailInfo.imgPath && `${process.env.NEXT_PUBLIC_SHARED_IMG}${movieDetailInfo.imgPath.slice(0, -4)}_150.jpg`} alt={movieDetailInfo.movieNm} />
            </div>
            <div>
              <ul>
                <li>
                  <span className="choice" />
                  선택
                </li>
                <li>
                  <span className="finish" />
                  예매완료
                </li>
                <li>
                  <span className="pos" />
                  띄어앉기석
                </li>
                <li>
                  <span className="common" />
                  일반
                </li>
                <li>
                  <span className="disabled" />
                  장애인석
                </li>
              </ul>
              <div>
                <div>선택좌석</div>
                <ul>{selectionItems}</ul>
              </div>
            </div>
            <div>
              <ul>{audienceItems}</ul>
              <div>
                <span>최종결제금액</span>
                <div>
                  <strong>{total}</strong>
                  <span>원</span>
                </div>
              </div>
            </div>
            <div>
              <button>이전</button>
              <button>다음</button>
            </div>
          </div>
        </div>
      </StyledArticle>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(({ req, store }) => {
  const accessToken = cookie.parse(req.headers.cookie || '').accessToken;
  if (accessToken) store.dispatch(setAccessToken(accessToken));

  return {
    props: {},
  };
});

export default withLayout(Seat);
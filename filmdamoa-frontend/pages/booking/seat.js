import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styled, { css } from 'styled-components';
import { darken } from 'polished';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as cookie from 'cookie';
import { decode } from 'html-entities';
import { useSelector } from 'react-redux';
import { http } from '../../lib/http';
import { parseSeatDatas } from '../../lib/bookingFunction';
import { movieRating } from '../../lib/bookingObject';
import { StyledArticle, scrollable, StyledWrapper, MovieSeatBox, MovieInfoBox, TitleWrapper } from '../../lib/styledComponents';
import storage from '../../lib/storage';
import { withLayout } from '../../components';
import { wrapper } from '../../store/store';
import { setAccessToken } from '../../store/user/action';

const HeadingWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  h1 {
    margin: 0.75rem 0;
    color: ${({ theme }) => theme.colors.black};
    font-size: ${({ theme }) => theme.fontSize.large};
  }

  button {
    padding: 0.125rem 0.5rem;
    margin: 0.5rem 0;
    cursor: pointer;
    border: 1px solid silver;
    border-radius: 0.25rem;
    background-color: transparent;
    color: #434343;
    font-size: ${({ theme }) => theme.fontSize.medium};

    &:hover {
      border-color: ${({ theme }) => theme.colors.thumbBg};
      background-color: ${darken(0.05, 'white')};
    }
  }
`

const StyledSync = styled(FontAwesomeIcon)`
  font-size: ${({ theme }) => theme.fontSize.medium} !important;
  color: #434343;
`

const CounterList = styled.ul`
  padding: 0.375rem 1.25rem;
  margin: 0;
  list-style: none;
  border: 1px solid silver;
  border-bottom: 0;
  background-color: ${({ theme }) => theme.colors.greyBg};
  color: #434343;

  li {
    display: inline-block;
    margin: 0.375rem 0;

    &:not(:last-child) {
      margin-right: 2rem;
    }
  }

  button, span {
    height: 2rem;
    border: 1px solid silver;
    background-color: white;
  }

  button {
    width: 2rem;
    cursor: pointer;
    font-size: ${({ theme }) => theme.fontSize.large};

    &:first-child {
      margin-left: 0.625rem;
      border-radius: 0.375rem 0 0 0.375rem;
    }

    &:last-child {
      border-radius: 0 0.375rem 0.375rem 0;
    }
  }

  span {
    display: inline-block;
    width: 2.625rem;
    line-height: 2rem;
    text-align: center;
    vertical-align: top;
    border-width: 1px 0;
  }
`

const buttonWidth = 1.375;
const buttonHeight = 1.25;
const imgWidth = 1.125;

const SeatListWrapper = styled.div`
  min-height: 28rem;
  padding: 1.875rem 0;
  text-align: center;
  border: 1px solid silver;
  border-top: 0;
  overflow-x: auto;
  ${scrollable};

  div {
    display: flex;
    justify-content: center;
    width: 644px;
    margin: 0 auto;
  }

  ul {
    padding: 0;
    margin: 0;
    list-style: none;

    &:first-child {
      margin-right: 0.75rem;
    }

    &:last-child {
      width: ${({ colLength }) => buttonWidth * colLength}rem;
    }

    li {
      height: ${buttonHeight}rem;
      margin: 0.125rem 0;
      position: relative;
      font-size: ${({ theme }) => theme.fontSize.small};
    }
  }

  span {
    display: inline-block;
    width: ${imgWidth}rem;
    height: ${imgWidth}rem;
    line-height: ${imgWidth}rem;
    text-align: center;
    border: 1px solid silver;
    color: black;
  }
`

const choice = css`
  background-color: #503396;
  background-position: right 0;
  background-repeat: no-repeat;
`

const finish = css`
  background-color: #ccc;
  background-position: center 0;
  background-repeat: no-repeat;
`

const disabled = css`
  background-color: #328619;
  background-position: center 0;
  background-repeat: no-repeat;
`

const SeatButton = styled.button`
  width: ${buttonWidth}rem;
  height: ${buttonHeight}rem;
  padding: 0;
  cursor: pointer;
  border: 1px solid #02bfd3;
  background-color: #747474;
  color: white;
  position: absolute;
  left: ${({ colNo }) => buttonWidth * colNo}rem;

  ${({ seatKind, selected, spare }) => css`
    ${seatKind[1] !== 'SCT04' && seatKind[1] !== 'STOP_SELL' && spare &&
      css`
        &:hover {
          background-image: url('/icons/bg-seat-condition-choice.png');
          ${choice};
        }
      `
    }

    ${seatKind[0] === 'DISABLED_CLS' &&
      css`
        background-image: url('/icons/bg-seat-condition-disabled.png');
        ${disabled};
      `
    }

    ${selected &&
      css`
        background-image: url('/icons/bg-seat-condition-choice.png');
        ${choice};
      `
    }

    ${seatKind[1] === 'SCT04' &&
      css`
        background-image: url('/icons/bg-seat-condition-finish.png');
        font-size: 0 !important;
        ${finish};
      `
    }

    ${seatKind[1] === 'STOP_SELL' &&
      css`
        border: 1px solid #a59698;
        background-color: #a59698;
        background-image: none;
        font-size: 0 !important;
      `
    }
  `}
`

const ExitImg = styled.img`
  width: ${imgWidth}rem;
  height: ${imgWidth}rem;
  border: 0;
  position: absolute;
  left: ${({ colNo }) => buttonWidth * colNo}rem;
`

const ScheduleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  margin: 0 1.25rem;
  border-bottom: 1px solid #434343;
  font-size: ${({ theme }) => theme.fontSize.medium};

  i {
    display: block;
    color: silver;
    font-style: normal;
  }

  span {
    display: block;
    margin-top: 1rem;
  }

  img {
    height: 6.25rem;
  }
`

const SelectionWrapper = styled.div`
  display: flex;
  margin: 0.625rem 1.25rem;
  border: 1px solid #434343;
  border-radius: 0.375rem;
  color: silver;
  font-size: ${({ theme }) => theme.fontSize.medium};

  > ul {
    width: 55%;
    padding: 1rem;
    margin: 0;
    list-style: none;
    border-right: 1px solid #434343;

    li {
      display: flex;
      align-items: center;
      margin: 0.25rem 0;
      color: silver;
    }
  }

  span {
    display: inline-block;
    width: 0.875rem;
    height: 0.875rem;
    margin-right: 0.375rem;
  }

  .choice {
    background-image: url('/icons/bg-seat-condition-choice-s.png');
    ${choice};
  }

  .finish {
    background-image: url('/icons/bg-seat-condition-finish-s.png');
    ${finish};
  }

  .pos {
    background-color: #a59698;
  }

  .common {
    background-color: #747474;
  }

  .disabled {
    background-image: url('/icons/bg-seat-condition-disabled-s.png');
    ${disabled};
  }

  > div {
    width: 45%;

    div {
      margin: 0.875rem 0;
      text-align: center;
    }

    ul {
      width: 6rem;
      padding: 0;
      margin: 0.875rem auto;
      list-style: none;
    }
  }
`

const SelectionItem = styled.li`
  display: inline-block;
  width: 2.5rem;
  height: 2.125rem;
  margin: 0.25rem;
  line-height: 2.125rem;
  text-align: center;
  border: 1px solid #5c5c5c;
  color: white;

  &:nth-child(-n+${({ totalCount }) => totalCount}) {
    background-color: #53565b;
  }

  ${({ selected, totalCount }) => css`
    ${selected &&
      css`
        background-color: #503396;

        &:nth-child(-n+${totalCount}) {
          background-color: #503396;
        }
      `
    }
  `}
`

const ResultWrapper = styled.div`
  padding: 0.75rem 0;
  margin: 0 1.25rem;

  ul {
    height: 1.25rem;
    padding: 0;
    margin: 0;
    list-style: none;

    li {
      display: inline-block;
      color: silver;
      font-size: ${({ theme }) => theme.fontSize.medium};
      position: relative;

      &:not(:last-child) {
        margin-right: 0.75rem;

        &::after {
          display: block;
          width: 2px;
          height: 2px;
          content: '';
          background-color: silver;
          position: absolute;
          top: 50%;
          right: -0.375rem;
        }
      }
    }
  }

  i {
    font-style: normal;
  }

  > div {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 0.5rem;
  }

  strong {
    color: #59bec9;
    font-size: 1.75rem;
    font-weight: normal;
    position: relative;
    top: -0.25rem;
  }

  span {
    vertical-align: top;
  }
`

const ButtonWrapper = styled.div`
  button {
    width: 50%;
    height: 2.5rem;
    border: 0;
    font-size: ${({ theme }) => theme.fontSize.large};

    &:first-child {
      cursor: pointer;
      border-radius: 0 0 0 0.625rem;
      background-color: #53565b;
      color: white;
    }

    &:last-child {
      border-radius: 0 0 0.625rem 0;
      background-color: ${({ theme }) => theme.colors.greyLight};
      color: #aaa;

      ${({ active }) => css`
        ${active &&
          css`
            cursor: pointer;
            background-color: #329eb1;
            color: white;
          `
        }
      `}
    }
  }
`

const Seat = () => {
  const { username } = useSelector(state => ({
    username: state.user.username
  }));

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

  const postSeatData = async reqObj => {
    await http.post('/booking/seat', reqObj).then(resp => {
      const { parsedRowList, parsedSeatList } = parseSeatDatas(resp.data);
      setParsedRows(parsedRowList);
      setParsedSeats(parsedSeatList);
      setMovieDetailInfo(resp.data.movieDtlInfo);
    }).catch(err => console.log(err));
  }

  useEffect(() => {
    const seatParameter = storage.get('seatParameter');
    if (!seatParameter) {
      router.replace('/');
      return;
    }

    const reqObj = { playSchdlNo: seatParameter.scheduleNumber, brchNo: seatParameter.branchNumber };
    postSeatData(reqObj);
  }, []);

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

  const handleInitialization = () => {
    setAudiences(audiences => audiences.map(audience => ({ ...audience, count: 0 })));

    const seatParameter = storage.get('seatParameter');
    const reqObj = { playSchdlNo: seatParameter.scheduleNumber, brchNo: seatParameter.branchNumber };
    postSeatData(reqObj);

    setSelections(Array.from({ length: 8 }, () => null));
  }

  const handleDecrease = category => {
    if (selectedCount < totalCount) {
      setAudiences(audiences => audiences.map(audience => audience.count > 0 &&
        audience.category === category ? { ...audience, count: audience.count - 1 } : audience
      ));
    }
  }

  const handleIncrease = category => {
    if (totalCount < 8) {
      setAudiences(audiences => audiences.map(audience =>
        audience.category === category ? { ...audience, count: audience.count + 1 } : audience
      ));
    }
  }

  const counterItems = audiences.map(audience =>
    <li key={audience.category}>
      {audience.category}
      <button onClick={() => handleDecrease(audience.category)}>-</button>
      <span>{audience.count}</span>
      <button onClick={() => handleIncrease(audience.category)}>+</button>
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

  const handleSeatSelection = (seatKind, seatName, seatUniqueNumber) => {
    // 코드 출처: https://stackoverflow.com/a/4340339 및 https://stackoverflow.com/a/29829361 기반
    const reA = /[^a-zA-Z]/g;
    const reN = /[^0-9]/g;

    const sortAlphaNum = (a, b) => {
      if (a === b) return 0;
      else if (a === null) return 1;
      else if (b === null) return -1;
      else {
        const aA = a.seatName.replace(reA, '');
        const bA = b.seatName.replace(reA, '');

        if (aA === bA) {
          const aN = parseInt(a.seatName.replace(reN, ''), 10);
          const bN = parseInt(b.seatName.replace(reN, ''), 10);

          return aN === bN ? 0 : aN > bN ? 1 : -1;
        } else {
          return aA > bA ? 1 : -1;
        }
      }
    }

    if (seatKind !== 'SCT04' && seatKind !== 'STOP_SELL') {
      if (selections.some(selection => (selection && selection.seatName) === seatName)) {
        setSelections(selections => selections.map(selection => (selection && selection.seatName) === seatName ? null : selection).sort(sortAlphaNum));
      } else if (selectedCount < totalCount) {
        setSelections(selections => selections.slice(0, 7).concat({ seatName, seatUniqueNumber }).sort(sortAlphaNum));
      }
    }
  }

  const selectedCount = selections.filter(Boolean).length;
  const totalCount = audiences.reduce((prevTotal, audience) => prevTotal + audience.count, 0);

  const parsedSeatItems = parsedSeats.map((parsedSeatRow, index) =>
    <li key={index}>
      {parsedSeatRow.map(parsedSeatCol =>
        parsedSeatCol && (parsedSeatCol.rowNm
          ? <SeatButton key={parsedSeatCol.colNo} colNo={parsedSeatCol.colNo} seatKind={[parsedSeatCol.seatClassCd, parsedSeatCol.seatStatCd]}
              selected={selections.some(selection => (selection && selection.seatName) === `${parsedSeatCol.rowNm}${parsedSeatCol.seatNo}`)} spare={selectedCount < totalCount}
              onClick={() => handleSeatSelection(parsedSeatCol.seatStatCd, `${parsedSeatCol.rowNm}${parsedSeatCol.seatNo}`, parsedSeatCol.seatUniqNo)}>
              {parsedSeatCol.seatNo}
            </SeatButton>
          : <ExitImg key={parsedSeatCol.colNo} colNo={parsedSeatCol.colNo} src={exitIcon[parsedSeatCol.gateTyCd][0]} alt={exitIcon[parsedSeatCol.gateTyCd][1]} />
        )
      )}
    </li>
  );

  const selectionItems = selections.map((selection, index) =>
    <SelectionItem key={index} totalCount={totalCount} selected={selection && selection.seatName}>{selection === null ? '-' : selection.seatName}</SelectionItem>
  );

  const audienceItems = audiences.map(audience => audience.count > 0 &&
    <li key={audience.category}>
      {audience.category}
      <i> {audience.count}</i>
    </li>
  );

  const totalAmount = audiences.reduce((prevTotal, audience) => prevTotal + audience.count * audience.fee, 0);

  const handlePrevMotion = () => router.back();

  const handleNextMotion = active => {
    if (active) {
      storage.set('billParameter', { audiences, selections: selections.filter(Boolean) });

      if (username) {
        router.push('/booking/bill');
      } else {
        storage.set('destination', '/booking/bill');
        router.push('/login');
      }
    }
  }

  return (
    <>
      <Head>
        <title>FILMDAMOA - 예매 - 좌석 선택</title>
        <meta name="description" content="좌석 선택 페이지입니다." />
      </Head>
      <StyledArticle>
        <StyledWrapper>
          <MovieSeatBox>
            <HeadingWrapper>
              <h1>관람인원선택</h1>
              <button onClick={handleInitialization}><StyledSync icon={["fas", "sync"]} /> 초기화</button>
            </HeadingWrapper>
            <CounterList>{counterItems}</CounterList>
            <SeatListWrapper colLength={parsedSeats[0] && parsedSeats[0].length} ref={scrollRef}>
              <img src="/icons/img-theater-screen.png" alt="screen" />
              <div>
                <ul>{parsedRowItems}</ul>
                <ul>{parsedSeatItems}</ul>
              </div>
            </SeatListWrapper>
          </MovieSeatBox>
          <MovieInfoBox>
            <TitleWrapper movieRating={movieRating[movieDetailInfo.admisClassCd]}>
              <span />
              <div>
                <h1>{movieDetailInfo.movieNm}</h1>
                <i>{decode(movieDetailInfo.playKindName)}</i>
              </div>
            </TitleWrapper>
            <ScheduleWrapper>
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
            </ScheduleWrapper>
            <SelectionWrapper>
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
            </SelectionWrapper>
            <ResultWrapper>
              <ul>{audienceItems}</ul>
              <div>
                <span>최종결제금액</span>
                <div>
                  <strong>{totalAmount.toLocaleString()}</strong>
                  <span> 원</span>
                </div>
              </div>
            </ResultWrapper>
            <ButtonWrapper active={totalCount !== 0 && totalCount === selectedCount}>
              <button onClick={handlePrevMotion}>이전</button>
              <button onClick={() => handleNextMotion(totalCount !== 0 && totalCount === selectedCount)}>다음</button>
            </ButtonWrapper>
          </MovieInfoBox>
        </StyledWrapper>
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
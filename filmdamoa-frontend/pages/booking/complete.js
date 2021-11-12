import Head from 'next/head';
import * as cookie from 'cookie';
import { getDataInNodeJs } from '../../lib/http';
import { StyledArticle } from '../../lib/styledComponents';
import { withLayout } from '../../components';
import { wrapper } from '../../store/store';
import { setAccessToken } from '../../store/user/action';

const Complete = ({ data }) => {
  return (
    <>
      <Head>
        <title>FILMDAMOA - 예매 완료</title>
        <meta name="description" content="예매 완료 페이지입니다." />
      </Head>
      <StyledArticle>
        <div>
          <div>
            <div>
              <div>티켓 예매번호</div>
              <div>{data.merchantUid}</div>
            </div>
            <img src={`${data.posterThumbnail.slice(0, -8)}_316.jpg`} alt={data.movieName} />
          </div>
          <div>
            <div>
              <strong>예매가 완료되었습니다 <i>!</i></strong>
            </div>
            <ul>
              <li>
                <span>예매영화 </span>
                {data.movieName} / {data.playKindName}
              </li>
              <li>
                <span>관람극장/상영관 </span>
                {data.branchName} / {data.theabExpoName}
              </li>
              <li>
                <span>관람일시 </span>
                {data.playDeAndDow.replace(/^[^(]*/g, '$&' + ' ')} {data.playTime.slice(0, -6)}
              </li>
              <li>
                <span>관람인원 </span>
                {data.audiences.reduce((prevTotal, audience) => prevTotal + (audience.count > 0 ? `/${audience.category} ${audience.count}명` : ''), '').slice(1)}
              </li>
              <li>
                <span>좌석번호 </span>
                {data.selections.reduce((prevTotal, selection) => prevTotal + '/' + selection.seatName.replace(/[A-Z]+/g, '$&' + '열 '), '').slice(1)}
              </li>
              <li>
                <span>결제정보 </span>
                <strong>{data.amount.toLocaleString()} </strong>
                원
              </li>
            </ul>
          </div>
        </div>
        <div>
          <div>
            상영안내
            <ul>
              <li>쾌적한 관람 환경을 위해 상영시간 이전에 입장 부탁드립니다.</li>
              <li>지연입장에 의한 관람불편을 최소화하고자 본 영화는 10분 후 시작됩니다.</li>
              <li>상영시간 20분전까지 취소 가능하며, 캡쳐화면으로는 입장하실 수 없습니다.</li>
            </ul>
          </div>
        </div>
      </StyledArticle>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(async ({ req, res, query, store }) => {
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

  const merchantUid = query.merchantUid || 'none';
  const resp = await getDataInNodeJs(`/payment/${merchantUid}`, accessToken, req, res, store);

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

export default withLayout(Complete);
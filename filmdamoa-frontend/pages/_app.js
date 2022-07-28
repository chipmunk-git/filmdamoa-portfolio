import Head from 'next/head';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { config, dom } from '@fortawesome/fontawesome-svg-core';
import '../lib/fontawesome';
import { useRemoveFocusWhenNotTab } from '../lib/removeFocus';
import { wrapper } from '../store/store';

config.autoAddCss = false; // Font Awesome 기본 CSS의 자동 추가를 방지
// 전역 스타일 생성
const GlobalStyle = createGlobalStyle`
  ${dom.css()};

  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Roboto', 'Noto Sans KR', sans-serif;
  }

  * {
    box-sizing: inherit;
  }

  body:not(.user-is-tabbing) button:focus,
  body:not(.user-is-tabbing) input:focus,
  body:not(.user-is-tabbing) select:focus,
  body:not(.user-is-tabbing) textarea:focus,
  body:not(.user-is-tabbing) a:focus {
    outline: none;
  }

  button, input, select, textarea {
    font-family: 'Roboto', 'Noto Sans KR', sans-serif;
    font-size: inherit;
  }
`

// 일관적인 스타일 관리를 위한 theme 객체
const theme = {
  colors: {
    black: '#140a00',
    greyDark: '#909090',
    greyLight: '#e0e0e0',
    greyBg: '#f9f9f9',
    red: '#f81d37',
    freshRed: '#ff243e',
    trackBg: '#efefef',
    thumbBg: '#676767',
  },
  fontSize: {
    great: '1.25rem',
    large: '1.125rem',
    regular: '1rem',
    medium: '0.875rem',
    small: '0.75rem',
    little: '0.625rem',
  },
  media: {
    mobile: `screen and (max-width: 30rem)`,
    tablet: `screen and (max-width: 48rem)`,
    laptop: `screen and (max-width: 64rem)`,
    desktop: `screen and (max-width: 75rem)`,
  },
};

// 폰트 적용을 위한 @font-face rule 작성
const fontFace = `@font-face {
  font-family: 'Roboto';
  src: url('/fonts/Roboto-Regular.eot');
  src: local('☺'),
       url('/fonts/Roboto-Regular.woff2') format('woff2'),
       url('/fonts/Roboto-Regular.woff') format('woff'),
       url('/fonts/Roboto-Regular.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: auto;
}

@font-face {
  font-family: 'Noto Sans KR';
  src: url('/fonts/NotoSansKR-Regular.eot');
  src: local('☺'),
       url('/fonts/NotoSansKR-Regular.woff2') format('woff2'),
       url('/fonts/NotoSansKR-Regular.woff') format('woff'),
       url('/fonts/NotoSansKR-Regular.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
  font-display: auto;
}`;

// 각 페이지의 초기화에 이용되는 컴포넌트
function App({ Component, pageProps }) {
  useRemoveFocusWhenNotTab();

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{fontFace}</style>
      </Head>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

export default wrapper.withRedux(App);
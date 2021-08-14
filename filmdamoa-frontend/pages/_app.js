import Head from 'next/head';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { config, dom } from '@fortawesome/fontawesome-svg-core';
import '../lib/fontawesome';
import { useRemoveFocusWhenNotTab } from '../lib/removeFocus';
import { wrapper } from '../store/store';

config.autoAddCss = false;
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
  )
}

export default wrapper.withRedux(App);
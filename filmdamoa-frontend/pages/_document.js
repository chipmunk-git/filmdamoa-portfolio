import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

// 각 페이지에서 사용될 <html> 및 <body> 태그를 업데이트하는 컴포넌트
export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    // 매 요청마다 새로운 ServerStyleSheet instance 생성
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      // renderPage 재정의
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            // ServerStyleSheet instance의 해당 메소드를 사용하여 react tree 포장
            sheet.collectStyles(<App {...props} />),
        })

      // 부모의 getInitialProps 메소드 실행. 재정의한 renderPage가 ctx 객체에 포함됨
      const initialProps = await Document.getInitialProps(ctx)
      return {
        ...initialProps,
        // 'initialProps 및 ServerStyleSheet instance'의 스타일 추가
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      }
    } finally {
      // ServerStyleSheet instance의 garbage collection 관련 메소드 실행
      sheet.seal()
    }
  }

  render() {
    return (
      <Html>
        <Head>
          <meta charSet="utf-8" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
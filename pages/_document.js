import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <body className="bg-gray-50 text-gray-900 font-sans">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TOONVERSE - AI 웹툰 자동 생성 플랫폼',
  description: '키워드만 입력하면 AI가 웹툰을 자동으로 생성합니다. 시나리오부터 작화, 식자까지 완전 자동화.',
  keywords: ['웹툰', 'AI', '자동생성', 'webtoon', 'artificial intelligence'],
  authors: [{ name: 'TOONVERSE Team' }],
  openGraph: {
    title: 'TOONVERSE - AI 웹툰 자동 생성',
    description: '키워드만 입력하면 AI가 웹툰을 자동으로 생성합니다',
    type: 'website',
    url: 'https://toonverse.store',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WEB3 MONEY - レリモバ契約者専用サービス',
  description: 'レリモバ契約者専用のお知らせ配信・支援金投票システム',
  keywords: 'WEB3 MONEY, レリモバ, 契約者限定, お知らせ, 支援金投票',
  authors: [{ name: 'WEB3 MONEY Team' }],
  robots: 'noindex, nofollow', // 検索エンジンにインデックスされないよう設定
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* セキュリティヘッダー */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* PWA対応 */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WEB3 MONEY" />
        
        {/* OGP設定 */}
        <meta property="og:title" content="WEB3 MONEY - レリモバ契約者専用サービス" />
        <meta property="og:description" content="レリモバ契約者専用のお知らせ配信・支援金投票システム" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ja_JP" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="WEB3 MONEY" />
        <meta name="twitter:description" content="レリモバ契約者専用サービス" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div id="app" className="min-h-screen bg-gray-50">
          {children}
        </div>
        
        {/* グローバルスクリプト */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // エラーハンドリング
              window.addEventListener('error', function(e) {
                console.error('Global error:', e.error);
              });
              
              window.addEventListener('unhandledrejection', function(e) {
                console.error('Unhandled promise rejection:', e.reason);
              });
              
              // ブラウザ互換性チェック
              if (!window.fetch) {
                alert('お使いのブラウザは対応していません。最新のブラウザをご利用ください。');
              }
              
              // セキュリティ警告（開発者ツール対策）
              console.log('%c🚨 セキュリティ警告', 'color: red; font-size: 20px; font-weight: bold;');
              console.log('%cこのコンソールは開発者向けです。不正なコードの実行はシステムに害を与える可能性があります。', 'color: red; font-size: 14px;');
            `,
          }}
        />
      </body>
    </html>
  );
}
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RelayPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    checkReferrer();
  }, []);

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      router.push('/main');
    }
  }, [status, countdown, router]);

  const checkReferrer = () => {
    const allowedReferrers = [
      'xmobile.ne.jp/customer/',
      'xmobile.ne.jp/thanks/',
      'xmobile.ne.jp/mypage/',
      'localhost', // 開発用
      '127.0.0.1', // 開発用
    ];

    const referrer = document.referrer;
    console.log('Referrer:', referrer); // デバッグ用

    // 開発環境の場合は常に許可
    if (process.env.NODE_ENV === 'development') {
      setStatus('success');
      return;
    }

    // リファラーチェック
    const isAllowed = allowedReferrers.some(allowed => 
      referrer.toLowerCase().includes(allowed.toLowerCase())
    );

    if (isAllowed) {
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMessage(
        referrer 
          ? `不正なアクセス元からのアクセスです: ${new URL(referrer).hostname}`
          : 'リファラー情報が確認できません'
      );
    }
  };

  const handleRetry = () => {
    setStatus('checking');
    setTimeout(checkReferrer, 1000);
  };

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">アクセス確認中</h2>
          <p className="text-gray-600 text-sm">
            レリモバサイトからの正当なアクセスかどうか確認しています...
          </p>
          <div className="mt-4 flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 border-4 border-green-200 rounded-full"></div>
              </div>
              <div className="w-20 h-20 border-4 border-transparent border-t-green-500 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">{countdown}</span>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-green-800 mb-2">✅ 認証成功！</h2>
          <p className="text-green-700 mb-4">
            レリモバサイトからの正当なアクセスを確認しました
          </p>
          <p className="text-sm text-gray-600">
            {countdown > 0 ? (
              <>
                <span className="font-semibold">{countdown}秒後</span>にWEB3 MONEYサービスに移動します...
              </>
            ) : (
              'サービスページに移動中...'
            )}
          </p>
          
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-sm text-green-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>安全な接続が確立されました</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/main')}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            今すぐアクセス
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-red-800 mb-3">🚫 アクセスが拒否されました</h2>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm mb-3">
            このページはレリモバお客様マイページからのアクセスのみ許可されています。
          </p>
          {errorMessage && (
            <p className="text-xs text-red-600 bg-red-100 p-2 rounded">
              詳細: {errorMessage}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">正しいアクセス方法</h3>
            <ol className="text-sm text-blue-700 space-y-1 text-left">
              <li>1. レリモバ公式サイトにアクセス</li>
              <li>2. お客様マイページにログイン</li>
              <li>3. WEB3 MONEYサービスリンクをクリック</li>
            </ol>
          </div>

          <div className="flex gap-2 justify-center">
            <button 
              onClick={handleRetry}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              再試行
            </button>
            <button 
              onClick={() => window.history.back()}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              戻る
            </button>
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-700">
              開発モード: デバッグ用に直接アクセスを許可しています
            </p>
            <button
              onClick={() => {
                setStatus('success');
                setCountdown(1);
              }}
              className="mt-2 bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700"
            >
              開発用アクセス
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
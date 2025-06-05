
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 text-center">
        {/* ロゴ・タイトル */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            WEB3 MONEY
          </h1>
          <p className="text-gray-600 mb-4">
            レリモバ契約者専用サービス
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>契約者限定サービス</span>
          </div>
        </div>

        {/* アクセス案内 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            🔐 アクセス方法
          </h2>
          
          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">1</span>
              <span>レリモバお客様マイページにログイン</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">2</span>
              <span>WEB3 MONEYサービスリンクをクリック</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">3</span>
              <span>サービスページに自動移動</span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-medium">重要</span>
            </div>
            <p className="text-yellow-700 text-xs mt-2">
              セキュリティのため、レリモバお客様マイページからのアクセスのみ許可されています。
            </p>
          </div>
        </div>

        {/* フッター */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2025 WEB3 MONEY</p>
          <p>レリモバ契約者専用サービス</p>
        </div>
      </div>
    </div>
  );
}
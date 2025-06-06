'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NoticeList from '@/components/NoticeList';
import CampaignTabs from '@/components/CampaignTabs';
import VotingPageSelector from '@/components/VotingPageSelector';
import Image from 'next/image';

export default function MainPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'notices' | 'voting'>('notices');
    const [accessAllowed, setAccessAllowed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 開発段階フラグ（本番リリース時はfalseに変更）
    const IS_DEVELOPMENT_STAGE = true;

    useEffect(() => {
        checkAccess();
    }, []);

    const checkAccess = () => {
        // 開発段階またはローカル開発環境の場合は常に許可
        if (IS_DEVELOPMENT_STAGE || process.env.NODE_ENV === 'development') {
            console.log('MainPage: 開発段階モードでアクセス許可');
            setAccessAllowed(true);
            setIsLoading(false);
            return;
        }

        const referrer = document.referrer;
        console.log('MainPage Referrer:', referrer); // デバッグ用

        // RelayPageからのアクセスかどうかをチェック
        // RelayPageのURLパスを含むかどうかで判定
        const isFromRelayPage = referrer.includes('/relay') || 
                               referrer.includes('localhost') || 
                               referrer.includes('127.0.0.1');

        if (isFromRelayPage) {
            setAccessAllowed(true);
            setIsLoading(false);
        } else {
            // 不正なアクセスの場合はエラー表示（リダイレクトしない）
            setAccessAllowed(false);
            setIsLoading(false);
        }
    };

    // アクセスチェック中の表示
    if (isLoading) {
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
                        正当なアクセスかどうか確認しています...
                    </p>
                </div>
            </div>
        );
    }

    // アクセスが許可されていない場合（通常はリダイレクトされるが念のため）
    if (!accessAllowed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-red-800 mb-3">🚫 不正なアクセス</h2>
                    <p className="text-red-700 mb-4">
                        このページには正規のルートからアクセスしてください。
                    </p>
                    <button
                        onClick={() => router.push('/relay')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        正規アクセスページへ
                    </button>
                </div>
            </div>
        );
    }

    // 通常のメインページ表示
    return (
        <div className="min-h-screen bg-gray-50">
            {/* ヘッダー */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/icons/web3money4.jpeg"
                                alt="WEB3 MONEY Logo"
                                width={50}
                                height={50}
                                className="object-contain rounded"
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">WEB3 MONEY</h1>
                                <p className="text-sm text-gray-500">レリモバ契約者専用サービス</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1"></span>
                                オンライン
                            </div>
                            {/* 開発段階表示 */}
                            {(IS_DEVELOPMENT_STAGE || process.env.NODE_ENV === 'development') && (
                                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full inline-block mr-1"></span>
                                    開発段階
                                </div>
                            )}
                        </div>
                    </div>

                    {/* タブナビゲーション */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('notices')}
                            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors relative ${activeTab === 'notices'
                                ? 'border-blue-500 text-blue-600 bg-blue-50'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                </svg>
                                お知らせ
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab('voting')}
                            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors relative ${activeTab === 'voting'
                                ? 'border-pink-500 text-pink-600 bg-pink-50'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                支援投票
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* メインコンテンツ */}
            <div className="container mx-auto px-4 py-6">
                {/* タブ説明 */}
                <div className="mb-6">
                    {activeTab === 'notices' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="text-blue-600 text-xl">📢</div>
                                <div className="text-blue-800 text-sm">
                                    <p className="font-medium mb-1">お知らせについて</p>
                                    <p className="text-xs">重要な情報やキャンペーンの最新情報をお届けします。期間限定の情報もありますので、定期的にご確認ください。</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'voting' && (
                        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="text-pink-600 text-xl">💖</div>
                                <div className="text-pink-800 text-sm">
                                    <p className="font-medium mb-1">支援金投票について</p>
                                    <div className="text-xs space-y-1">
                                        <p>申請者への支援金投票を行えます。</p>
                                        <div className="flex items-center gap-1">
                                            <span className="w-1 h-1 bg-pink-600 rounded-full"></span>
                                            <span>投票時にフィナンシェID・メールアドレス・お名前の入力が必要です</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="w-1 h-1 bg-pink-600 rounded-full"></span>
                                            <span>重複投票防止のため、同じ申請者への複数投票はできません</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="w-1 h-1 bg-pink-600 rounded-full"></span>
                                            <span>投票内容は一度入力すると次回から自動入力されます</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* コンテンツエリア */}
                <div className="transition-all duration-300 ease-in-out">
                    {activeTab === 'notices' && (
                        <div className="animate-fadeIn">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                    </svg>
                                    最新のお知らせ
                                </h2>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    更新
                                </button>
                            </div>
                            <NoticeList />
                        </div>
                    )}

                    {activeTab === 'voting' && (
                        <div className="animate-fadeIn">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    支援投票
                                </h2>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <span>🔒 認証付き投票</span>
                                    </div>
                                </div>
                            </div>
                            <VotingPageSelector />
                        </div>
                    )}
                </div>
            </div>

            {/* フッター */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-600">
                            <p>© 2025 WEB3 MONEY - レリモバ契約者専用サービス</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                安全な接続
                            </span>
                            <span>|</span>
                            <span>契約者限定</span>
                            <span>|</span>
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                認証保護
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
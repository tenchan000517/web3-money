'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainPageContent from '@/components/MainPageContent';

export default function MainPremiumPage() {
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // プレミアム契約者用テーマ（黒背景）
    const theme = {
        primary: '#fbbf24',    // Yellow-400
        secondary: '#f59e0b',  // Yellow-500
        background: '#000000', // Black background
        text: '#ffffff',       // White text
        accent: '#ec4899'      // Pink-500
    };

    useEffect(() => {
        verifyAccess();
    }, []);

    const verifyAccess = () => {
        // セッションストレージから認証情報を確認
        const contractType = sessionStorage.getItem('contractType');
        const accessVerified = sessionStorage.getItem('accessVerified');

        console.log('MainPremium - Contract Type:', contractType);
        console.log('MainPremium - Access Verified:', accessVerified);

        const referrer = document.referrer;
        console.log('MainPremium - Referrer:', referrer);

        // 厳格なアクセス制御
        const isValidAccess = (
            contractType === 'premium' && 
            accessVerified === 'true' &&
            (referrer.includes('/relay-premium') || process.env.NODE_ENV === 'development')
        );

        if (isValidAccess) {
            setIsVerified(true);
            console.log('MainPremium: プレミアム契約者として認証済み');
            // 認証完了後にセッション情報を保持（削除しない）
            // sessionStorage.removeItem('accessVerified'); // コメントアウト
        } else {
            console.log('MainPremium: 認証情報が不正または不正アクセス');
            // 全ての認証情報をクリア
            sessionStorage.clear();
            // 不正アクセスの場合は完全にブロック
            router.replace('/');
            return;
        }

        setIsLoading(false);
    };

    // ローディング中の表示
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-50 to-black">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="relative mb-6">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-200 border-t-yellow-600 mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">プレミアムサービス準備中</h2>
                    <p className="text-yellow-200 text-sm">
                        プレミアム契約者向け特別サービスを準備しています...
                    </p>
                </div>
            </div>
        );
    }

    // 認証が完了した場合のメインコンテンツ表示
    if (isVerified) {
        return (
            <MainPageContent 
                contractType="premium"
                theme={theme}
            />
        );
    }

    // 何らかの理由で認証に失敗した場合
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-black">
            <div className="text-center max-w-md mx-auto p-8">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-red-800 mb-3">🚫 アクセスエラー</h2>
                <p className="text-red-700 mb-4">
                    認証情報に問題があります。<br/>
                    正規のアクセス経路からお試しください。
                </p>
                <button
                    onClick={() => router.push('/relay-premium')}
                    className="bg-yellow-600 text-black px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                    認証ページに戻る
                </button>
            </div>
        </div>
    );
}
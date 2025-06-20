'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainPageContent from '@/components/MainPageContent';

export default function MainBasicPage() {
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 基本契約者用テーマ
    const theme = {
        primary: '#3b82f6',    // Blue-500
        secondary: '#1d4ed8',  // Blue-700
        background: '#ffffff', // White background
        text: '#1f2937',       // Gray-800
        accent: '#ec4899'      // Pink-500
    };

    useEffect(() => {
        verifyAccess();
    }, []);

    const verifyAccess = () => {
        // セッションストレージから認証情報を確認
        const contractType = sessionStorage.getItem('contractType');
        const accessVerified = sessionStorage.getItem('accessVerified');
        const referrer = document.referrer;

        console.log('MainBasic - Contract Type:', contractType);
        console.log('MainBasic - Access Verified:', accessVerified);
        console.log('MainBasic - Referrer:', referrer);

        // 厳格なアクセス制御
        const isValidAccess = (
            contractType === 'basic' && 
            accessVerified === 'true'
            // リファラーチェックは relay ページで完了済みのため、ここでは不要
        );

        if (isValidAccess) {
            setIsVerified(true);
            console.log('MainBasic: 基本契約者として認証済み');
            // 認証完了後にセッション情報を保持（削除しない）
            // sessionStorage.removeItem('accessVerified'); // コメントアウト
        } else {
            console.log('MainBasic: 認証情報が不正または不正アクセス');
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
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">サービス準備中</h2>
                    <p className="text-gray-600 text-sm">
                        基本契約者向けサービスを準備しています...
                    </p>
                </div>
            </div>
        );
    }

    // 認証が完了した場合のメインコンテンツ表示
    if (isVerified) {
        return (
            <MainPageContent 
                contractType="basic"
                theme={theme}
            />
        );
    }

    // 何らかの理由で認証に失敗した場合
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
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
                    onClick={() => router.push('/relay-basic')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    認証ページに戻る
                </button>
            </div>
        </div>
    );
}
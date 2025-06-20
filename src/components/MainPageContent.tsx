'use client';
import { useState, useEffect } from 'react';
import NoticeList from '@/components/NoticeList';
import Image from 'next/image';
import { Applicant } from '@/lib/types';
import { getApplicantsFromReadonlyGAS } from '@/lib/api';
import VotingCard from '@/components/VotingCard';
import { Megaphone, Heart, Lock, Shield, Wifi, RefreshCw, AlertCircle } from 'lucide-react';

interface MainPageContentProps {
    contractType: 'basic' | 'premium';
    theme: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
        accent: string;
    };
}

export default function MainPageContent({ contractType, theme }: MainPageContentProps) {
    const [activeTab, setActiveTab] = useState<'notices' | 'voting'>('notices');
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (activeTab === 'voting') {
            fetchApplicants();
        }
    }, [activeTab]);

    // シンプルな読み取り専用GASからの直接取得
    const fetchApplicants = async () => {
        try {
            setLoading(true);
            console.log('📋 テスト用: 読み取り専用GASから申請者データを直接取得');
            const data = await getApplicantsFromReadonlyGAS();
            setApplicants(data || []);
            console.log('✅ 申請者データ取得完了:', data);
        } catch (err) {
            setError('申請者の取得に失敗しました');
            console.error('❌ 申請者データ取得エラー:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVoteSuccess = () => {
        // 投票後にデータを再取得
        fetchApplicants();
    };

    const getSortedApplicants = () => {
        if (!applicants || applicants.length === 0) return [];
        return [...applicants].sort((a, b) => {
            return (b.voteCount || 0) - (a.voteCount || 0);
        });
    };

    return (
        <div className="min-h-screen" style={{ background: theme.background }}>
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
                                <p className="text-sm text-gray-500">
                                    {contractType === 'basic' 
                                        ? 'レリモバ基本契約者専用サービス' 
                                        : 'レリモバ+WEB3MONEY契約者専用サービス'
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1"></span>
                                オンライン
                            </div>
                            <div 
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                    backgroundColor: `${theme.primary}20`, 
                                    color: theme.primary 
                                }}
                            >
                                <span 
                                    className="w-2 h-2 rounded-full inline-block mr-1"
                                    style={{ backgroundColor: theme.primary }}
                                ></span>
                                {contractType === 'basic' ? '基本契約者' : 'プレミアム契約者'}
                            </div>
                        </div>
                    </div>

                    {/* タブナビゲーション */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('notices')}
                            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors relative ${
                                activeTab === 'notices'
                                    ? `text-blue-600 bg-blue-50`
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            style={activeTab === 'notices' ? { borderBottomColor: theme.primary } : {}}
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
                            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors relative ${
                                activeTab === 'voting'
                                    ? `text-pink-600 bg-pink-50`
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            style={activeTab === 'voting' ? { borderBottomColor: theme.accent } : {}}
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
                                <Megaphone className="text-blue-600 w-5 h-5 mt-0.5" />
                                <div className="text-blue-800 text-sm">
                                    <p className="font-medium mb-1">お知らせについて</p>
                                    <p className="text-xs">重要な情報やキャンペーンの最新情報をお届けします。期間限定の情報もありますので、定期的にご確認ください。</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'voting' && (
                        <div className="border rounded-lg p-4" style={{ 
                            backgroundColor: `${theme.accent}15`, 
                            borderColor: `${theme.accent}40` 
                        }}>
                            <div className="flex items-start gap-3">
                                <Heart className="w-5 h-5 mt-0.5" style={{ color: theme.accent }} />
                                <div className="text-sm" style={{ color: theme.text }}>
                                    <p className="font-medium mb-1">支援金投票について</p>
                                    <div className="text-xs space-y-1">
                                        <p>申請者への支援金投票を行えます。</p>
                                        <div className="flex items-center gap-1">
                                            <span 
                                                className="w-1 h-1 rounded-full" 
                                                style={{ backgroundColor: theme.accent }}
                                            ></span>
                                            <span>投票時にフィナンシェID・メールアドレス・お名前の入力が必要です</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span 
                                                className="w-1 h-1 rounded-full" 
                                                style={{ backgroundColor: theme.accent }}
                                            ></span>
                                            <span>このページから1回投票することができます</span>
                                        </div>
                                        {contractType === 'premium' && (
                                            <div className="flex items-center gap-1">
                                                <span 
                                                    className="w-1 h-1 rounded-full" 
                                                    style={{ backgroundColor: theme.accent }}
                                                ></span>
                                                <span>YouTube出演選択機能が利用できます</span>
                                            </div>
                                        )}
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
                                    <RefreshCw className="w-4 h-4" />
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
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.accent }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    支援投票
                                </h2>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <Shield className="w-4 h-4 text-green-600" />
                                        <span><Lock className="w-3 h-3 inline mr-1" />認証付き投票</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* テスト用説明 */}
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <span><strong>テスト表示:</strong> 読み取り専用GASから申請者データを直接取得して表示中</span>
                                </p>
                            </div>

                            {/* 申請者一覧 */}
                            {error ? (
                                <div className="text-center py-12">
                                    <div className="text-red-500 text-xl mb-4">エラーが発生しました</div>
                                    <p className="text-gray-600">{error}</p>
                                    <button
                                        onClick={() => {
                                            setError(null);
                                            fetchApplicants();
                                        }}
                                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        再読み込み
                                    </button>
                                </div>
                            ) : loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">申請者を読み込み中...</p>
                                </div>
                            ) : applicants.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">申請者がいません</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {getSortedApplicants().map((applicant, index) => (
                                        <VotingCard
                                            key={applicant.id}
                                            applicant={applicant}
                                            campaignId="test-readonly-campaign"
                                            rank={index + 1}
                                            onVoteSuccess={handleVoteSuccess}
                                            votePage={contractType}
                                            showWeightedScore={false}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* フッター */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-600">
                            <p>© 2025 WEB3 MONEY - {contractType === 'basic' ? 'レリモバ基本契約者' : 'レリモバ+WEB3MONEY契約者'}専用サービス</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Wifi className="w-4 h-4 text-green-500" />
                                安全な接続
                            </span>
                            <span>|</span>
                            <span>{contractType === 'basic' ? '基本契約者限定' : 'プレミアム契約者限定'}</span>
                            <span>|</span>
                            <span className="flex items-center gap-1">
                                <Lock className="w-4 h-4 text-purple-500" />
                                認証保護
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
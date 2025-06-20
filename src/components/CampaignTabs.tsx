'use client';
import { useState, useEffect, useCallback } from 'react';
import { Campaign, Applicant } from '@/lib/types';
import { getCampaigns, getCampaign } from '@/lib/api';
import VotingCard from './VotingCard';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Lightbulb, Clock, Vote } from 'lucide-react';

export default function CampaignTabs() {
    const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
    const [campaignData, setCampaignData] = useState<(Campaign & { applicants: Applicant[] }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchActiveCampaigns = useCallback(async () => {
        try {
            setError(null);
            const campaigns = await getCampaigns('active');
            setActiveCampaigns(campaigns);

            // 最初のキャンペーンを自動選択
            if (campaigns.length > 0 && !selectedCampaign) {
                setSelectedCampaign(campaigns[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch campaigns:', error);
            setError('キャンペーンの取得に失敗しました');
        } finally {
            setLoading(false);
        }
    }, [selectedCampaign]);

    useEffect(() => {
        fetchActiveCampaigns();
    }, [fetchActiveCampaigns]);

    // 🆕 追加: selectedCampaignの変更を監視
    useEffect(() => {
        if (selectedCampaign) {
            console.log('🔄 selectedCampaign changed, fetching campaign data:', selectedCampaign);
            fetchCampaignData(selectedCampaign);
        }
    }, [selectedCampaign]);

    const fetchCampaignData = async (campaignId: string) => {
        try {
            setRefreshing(true);
            const data = await getCampaign(campaignId);
            setCampaignData(data);
        } catch (error) {
            console.error('Failed to fetch campaign data:', error);
            setError('キャンペーンデータの取得に失敗しました');
        } finally {
            setRefreshing(false);
        }
    };

    const handleVoteSuccess = () => {
        if (selectedCampaign) {
            fetchCampaignData(selectedCampaign);
        }
    };

    const handleRefresh = () => {
        if (selectedCampaign) {
            fetchCampaignData(selectedCampaign);
        }
    };

    const isNearExpiry = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">キャンペーンを読み込み中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                    <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-red-800 mb-4">{error}</p>
                    <button
                        onClick={fetchActiveCampaigns}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        再試行
                    </button>
                </div>
            </div>
        );
    }

    if (activeCampaigns.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8h.01M9 12h.01m3 0h.01m3 0h.01M9 16h.01m3 0h.01m3 0h.01" />
                    </svg>
                </div>
                <p className="text-gray-500 text-lg mb-2">現在進行中の投票はありません</p>
                <p className="text-gray-400 text-sm">新しい投票キャンペーンが開始されるとこちらに表示されます</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* タブメニュー */}
            {activeCampaigns.length > 1 && (
                <div className="border-b border-gray-200 bg-white rounded-lg shadow-sm">
                    <nav className="flex space-x-0 overflow-x-auto">
                        {activeCampaigns.map((campaign) => (
                            <button
                                key={campaign.id}
                                onClick={() => setSelectedCampaign(campaign.id)}
                                className={`whitespace-nowrap py-3 px-4 text-sm font-medium transition-colors border-b-2 min-w-0 flex-shrink-0 ${selectedCampaign === campaign.id
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="truncate">{campaign.title}</span>
                                    {isNearExpiry(campaign.endDate) && (
                                        <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full">
                                            まもなく終了
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </nav>
                </div>
            )}

            {/* キャンペーン内容 */}
            {campaignData && (
                <div className="space-y-4">
                    {/* キャンペーン情報ヘッダー */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h2 className="text-xl font-bold mb-2 text-gray-800">{campaignData.title}</h2>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                        </svg>
                                        期間: {format(new Date(campaignData.startDate), 'M月d日', { locale: ja })} ～ {format(new Date(campaignData.endDate), 'M月d日', { locale: ja })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        申請者: {campaignData.applicants.length}名
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isNearExpiry(campaignData.endDate)
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-green-100 text-green-700'
                                        }`}>
                                        {isNearExpiry(campaignData.endDate) ? (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                まもなく終了
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <Vote className="w-3 h-3" />
                                                投票中
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                更新
                            </button>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Lightbulb className="text-blue-600 w-5 h-5 mt-0.5" />
                                <div className="text-blue-800 text-sm">
                                    <p className="font-medium mb-1">投票について</p>
                                    <ul className="space-y-1 text-xs">
                                        <li>• お一人様1票でお願いします</li>
                                        <li>• 重複投票はご遠慮ください</li>
                                        <li>• 投票は期間終了まで随時受け付けています</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 申請者一覧 */}
                    <div className="space-y-4">
                        {campaignData.applicants.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-lg mb-2">申請者がいません</p>
                                <p className="text-gray-400 text-sm">申請が提出されるとこちらに表示されます</p>
                            </div>
                        ) : (
                            <>
                                {/* 統計情報 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-white rounded-lg shadow p-4 text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {campaignData.applicants.length}
                                        </div>
                                        <div className="text-sm text-gray-600">申請者数</div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-4 text-center">
                                        <div className="text-2xl font-bold text-pink-600">
                                            {campaignData.applicants.reduce((sum, a) => sum + (a.voteCount || 0), 0)}
                                        </div>
                                        <div className="text-sm text-gray-600">総投票数</div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-4 text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            ¥{campaignData.applicants.reduce((sum, a) => {
                                                // 安全に値を取得して数値に変換するヘルパー関数
                                                const parseAmount = (value: unknown): number => {
                                                    if (typeof value === 'number') {
                                                        return value;
                                                    }
                                                    if (typeof value === 'string') {
                                                        const parsed = parseInt(value.replace(/[^\d]/g, ''), 10);
                                                        return isNaN(parsed) ? 0 : parsed;
                                                    }
                                                    return 0;
                                                };

                                                const rawAmount = a.amount || a['希望金額'] || a['金額'] || 0;
                                                const amount = parseAmount(rawAmount);

                                                return sum + amount;
                                            }, 0).toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-600">総希望金額</div>
                                    </div>
                                </div>

                                {/* 申請者カード */}
                                <div className="space-y-4">
                                    {campaignData.applicants
                                        .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
                                        .map((applicant, index) => (
                                            <VotingCard
                                                key={applicant.id}
                                                applicant={applicant}
                                                campaignId={campaignData.id}
                                                rank={index + 1}
                                                onVoteSuccess={handleVoteSuccess}
                                            />
                                        ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
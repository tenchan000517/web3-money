'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Campaign, Applicant, ApiResponse } from '@/lib/types';
import { getCampaignWithApplicants, addAuthenticatedVote } from '@/lib/api';
import VotingCard from '@/components/VotingCard';

export default function PremiumVotingPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'weighted' | 'count'>('weighted');

    // ユーザー情報（実際の実装では認証から取得）
    const [userInfo] = useState({
        financeId: 'test-user-001',
        email: 'test@example.com',
        name: 'テストユーザー'
    });

    useEffect(() => {
        fetchCampaigns();
    }, []);

    useEffect(() => {
        if (selectedCampaign) {
            fetchApplicants(selectedCampaign);
        }
    }, [selectedCampaign]);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const response = await getCampaignWithApplicants('active');
            if (Array.isArray(response)) {
                setCampaigns(response);
                if (response.length > 0) {
                    setSelectedCampaign(response[0].id);
                }
            }
        } catch (err) {
            setError('キャンペーンの取得に失敗しました');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicants = async (campaignId: string) => {
        try {
            setLoading(true);
            const campaign = await getCampaignWithApplicants(campaignId);
            if (campaign && 'applicants' in campaign) {
                setApplicants(campaign.applicants || []);
            }
        } catch (err) {
            setError('申請者の取得に失敗しました');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVoteSuccess = () => {
        fetchApplicants(selectedCampaign);
    };

    const sortedApplicants = [...applicants].sort((a, b) => {
        if (sortBy === 'weighted') {
            return (b.weightedVoteScore || 0) - (a.weightedVoteScore || 0);
        } else {
            return (b.voteCount || 0) - (a.voteCount || 0);
        }
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-gray-400">読み込み中...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* ヘッダー */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        支援基金投票 - プレミアム投票
                    </h1>
                    <p className="text-gray-300">
                        レリモバ契約＋WEB3MONEY加入者様向けのプレミアム投票ページです。
                        投票の価値が5倍になり、YouTube出演希望も選択できます。
                    </p>
                    <div className="mt-4 p-4 bg-gradient-to-r from-yellow-900/30 to-yellow-700/30 border border-yellow-600/50 rounded-lg">
                        <p className="text-sm text-yellow-400">
                            <span className="font-semibold">投票権重:</span> 1票あたり+5ポイント
                        </p>
                        <p className="text-sm text-yellow-400 mt-1">
                            <span className="font-semibold">特典:</span> YouTube出演選択機能
                        </p>
                    </div>
                </div>

                {/* キャンペーン選択 */}
                {campaigns.length > 0 && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            投票キャンペーンを選択
                        </label>
                        <select
                            value={selectedCampaign}
                            onChange={(e) => setSelectedCampaign(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        >
                            {campaigns.map((campaign) => (
                                <option key={campaign.id} value={campaign.id}>
                                    {campaign.title}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* ソート選択 */}
                <div className="mb-6 flex justify-end">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-400">並び順:</span>
                        <button
                            onClick={() => setSortBy('weighted')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                sortBy === 'weighted'
                                    ? 'bg-yellow-600 text-black'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            総合スコア順
                        </button>
                        <button
                            onClick={() => setSortBy('count')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                sortBy === 'count'
                                    ? 'bg-yellow-600 text-black'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            投票数順
                        </button>
                    </div>
                </div>

                {/* 申請者リスト */}
                {sortedApplicants.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">現在投票可能な候補者はいません</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {sortedApplicants.map((applicant, index) => (
                            <VotingCard
                                key={applicant.id}
                                applicant={applicant}
                                campaignId={selectedCampaign}
                                rank={index + 1}
                                onVoteSuccess={handleVoteSuccess}
                                votePage="premium"
                                showWeightedScore={true}
                            />
                        ))}
                    </div>
                )}

                {/* フッター */}
                <div className="mt-12 text-center">
                    <button
                        onClick={() => router.push('/main')}
                        className="text-yellow-400 hover:text-yellow-300 font-medium"
                    >
                        ← メインページに戻る
                    </button>
                </div>
            </div>
        </div>
    );
}
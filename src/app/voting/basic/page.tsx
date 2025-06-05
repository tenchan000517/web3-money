'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Campaign, Applicant, ApiResponse } from '@/lib/types';
import { getCampaignWithApplicants, addAuthenticatedVote } from '@/lib/api';
import VotingCard from '@/components/VotingCard';

export default function BasicVotingPage() {
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
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-gray-600">読み込み中...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* ヘッダー */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        支援基金投票 - 基本投票
                    </h1>
                    <p className="text-gray-600">
                        レリモバ契約者様向けの基本投票ページです。
                        各候補者に1票ずつ投票できます。
                    </p>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <span className="font-semibold">投票権重:</span> 1票あたり+1ポイント
                        </p>
                    </div>
                </div>

                {/* キャンペーン選択 */}
                {campaigns.length > 0 && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            投票キャンペーンを選択
                        </label>
                        <select
                            value={selectedCampaign}
                            onChange={(e) => setSelectedCampaign(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <span className="text-sm text-gray-600">並び順:</span>
                        <button
                            onClick={() => setSortBy('weighted')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                sortBy === 'weighted'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            総合スコア順
                        </button>
                        <button
                            onClick={() => setSortBy('count')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                sortBy === 'count'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                                votePage="basic"
                                showWeightedScore={true}
                            />
                        ))}
                    </div>
                )}

                {/* フッター */}
                <div className="mt-12 text-center">
                    <button
                        onClick={() => router.push('/main')}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        ← メインページに戻る
                    </button>
                </div>
            </div>
        </div>
    );
}
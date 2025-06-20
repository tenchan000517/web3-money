'use client';

import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
import { Campaign, Applicant } from '@/lib/types';
import { getCampaigns, getCampaign } from '@/lib/api';
import VotingCard from '@/components/VotingCard';

interface VotingPageContentProps {
  votePage: 'basic' | 'premium';
}

export default function VotingPageContent({ votePage }: VotingPageContentProps) {
  // const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [sortBy, setSortBy] = useState<'weighted' | 'count'>('weighted');

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
      const response = await getCampaigns('active');
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
      const campaign = await getCampaign(campaignId);
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
    if (selectedCampaign) {
      fetchApplicants(selectedCampaign);
    }
  };

  const getSortedApplicants = () => {
    if (!applicants || applicants.length === 0) return [];
    
    // 投票数順でソート（スコア不要）
    return [...applicants].sort((a, b) => {
      return (b.voteCount || 0) - (a.voteCount || 0);
    });
  };

  const getPageStyles = () => {
    // 両方のページを黒背景に統一
    return {
      background: 'bg-black',
      textPrimary: 'text-white',
      textSecondary: 'text-gray-300',
      cardBg: 'bg-gray-900',
      accent: votePage === 'premium' ? 'text-yellow-400' : 'text-blue-400'
    };
  };

  const styles = getPageStyles();

  if (loading && !campaigns.length) {
    return (
      <div className={`min-h-screen ${styles.background} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={styles.textSecondary}>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${styles.background} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">エラーが発生しました</div>
          <p className={styles.textSecondary}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${styles.background}`}>
      {/* ヘッダー */}
      <div className={`${styles.cardBg} shadow-lg`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center mb-4">
            <h1 className={`text-2xl font-bold ${styles.textPrimary}`}>
              {votePage === 'basic' ? '基本投票ページ' : 'プレミアム投票ページ'}
            </h1>
          </div>

          {/* キャンペーン選択 */}
          {campaigns.length > 1 && (
            <div className="mb-4">
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className={`w-full max-w-md px-3 py-2 rounded-lg border ${styles.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ソート選択を削除（スコア不要のため） */}
        </div>
      </div>

      {/* 申請者一覧 */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={styles.textSecondary}>申請者を読み込み中...</p>
          </div>
        ) : applicants.length === 0 ? (
          <div className="text-center py-12">
            <p className={styles.textSecondary}>申請者がいません</p>
          </div>
        ) : (
          <div className="space-y-6">
            {getSortedApplicants().map((applicant, index) => (
              <VotingCard
                key={applicant.id}
                applicant={applicant}
                campaignId={selectedCampaign}
                rank={index + 1}
                onVoteSuccess={handleVoteSuccess}
                votePage={votePage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
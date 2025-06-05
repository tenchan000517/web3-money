'use client';
import { useState, useEffect } from 'react';
import { Campaign, CampaignSettings } from '@/lib/types';
import { getCampaigns, getAllCampaignSettings, updateCampaignSettings } from '@/lib/api';
// 日付フォーマット用のヘルパー関数
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
};

export default function CampaignSettingsAdmin() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [settings, setSettings] = useState<CampaignSettings[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSettings, setEditingSettings] = useState<{[key: string]: CampaignSettings}>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const [campaignsData, settingsData] = await Promise.all([
        getCampaigns(),
        getAllCampaignSettings()
      ]);
      
      setCampaigns(campaignsData || []);
      setSettings(settingsData || []);
      
      // 編集用の初期状態を設定
      const editingState: {[key: string]: CampaignSettings} = {};
      campaignsData.forEach(campaign => {
        const setting = settingsData.find(s => s.campaignId === campaign.id);
        editingState[campaign.id] = {
          campaignId: campaign.id,
          allowMultipleVotes: setting?.allowMultipleVotes || false,
          maxVotesPerUser: setting?.maxVotesPerUser || 1,
          createdAt: setting?.createdAt
        };
      });
      setEditingSettings(editingState);
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('データの取得に失敗しました');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSettingUpdate = (campaignId: string, field: keyof CampaignSettings, value: boolean | number) => {
    setEditingSettings(prev => ({
      ...prev,
      [campaignId]: {
        ...prev[campaignId],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = async (campaignId: string, campaignTitle: string) => {
    const setting = editingSettings[campaignId];
    if (!setting) return;

    if (!confirm(`「${campaignTitle}」の投票設定を更新しますか？`)) return;

    setLoading(true);
    
    try {
      await updateCampaignSettings(
        campaignId,
        setting.allowMultipleVotes,
        setting.maxVotesPerUser
      );
      
      await fetchData();
      alert('✅ 投票設定を更新しました');
      
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('❌ 設定の更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = (campaignId: string) => {
    const originalSetting = settings.find(s => s.campaignId === campaignId);
    setEditingSettings(prev => ({
      ...prev,
      [campaignId]: {
        campaignId: campaignId,
        allowMultipleVotes: originalSetting?.allowMultipleVotes || false,
        maxVotesPerUser: originalSetting?.maxVotesPerUser || 1,
        createdAt: originalSetting?.createdAt
      }
    }));
  };

  const getStatusLabel = (status: Campaign['status']) => {
    switch (status) {
      case 'draft': return '準備中';
      case 'active': return '投票中';
      case 'ended': return '終了';
      case 'archived': return 'アーカイブ';
      default: return status;
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'ended': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const hasUnsavedChanges = (campaignId: string) => {
    const editing = editingSettings[campaignId];
    const original = settings.find(s => s.campaignId === campaignId);
    
    if (!editing) return false;
    
    return (
      editing.allowMultipleVotes !== (original?.allowMultipleVotes || false) ||
      editing.maxVotesPerUser !== (original?.maxVotesPerUser || 1)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">⚙️ 投票設定管理</h1>
              <p className="text-gray-600 mt-1">キャンペーンごとの投票ルール・制限を設定できます</p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/admin"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                管理画面に戻る
              </a>
              <button
                onClick={fetchData}
                disabled={fetchLoading}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <svg className={`w-4 h-4 ${fetchLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                更新
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{error}</p>
              <button
                onClick={fetchData}
                className="ml-auto text-red-600 hover:text-red-800 text-sm underline"
              >
                再試行
              </button>
            </div>
          </div>
        )}

        {/* 説明カード */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">投票設定について</h3>
              <div className="text-purple-700 text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">🔒 複数投票許可:</span>
                  <span>1人のユーザーが複数の申請者に投票できるかを設定</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">📊 最大投票数:</span>
                  <span>1人のユーザーが投票できる最大回数を設定</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">⚡ リアルタイム適用:</span>
                  <span>設定変更は即座に投票画面に反映されます</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 設定一覧 */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                キャンペーン投票設定 ({campaigns.length}件)
              </h2>
            </div>
          </div>
          
          <div className="p-6">
            {fetchLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg mb-2">設定可能なキャンペーンがありません</p>
                <p className="text-gray-400 text-sm">まずキャンペーンを作成してください</p>
              </div>
            ) : (
              <div className="space-y-6">
                {campaigns
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((campaign) => {
                    const currentSetting = editingSettings[campaign.id];
                    const hasChanges = hasUnsavedChanges(campaign.id);
                    
                    return (
                      <div key={campaign.id} className={`border rounded-lg p-6 transition-all ${
                        hasChanges ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'
                      }`}>
                        {/* キャンペーン情報 */}
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-800">{campaign.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                                {getStatusLabel(campaign.status)}
                              </span>
                              {hasChanges && (
                                <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                                  ⚠️ 未保存
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                期間: {formatDate(campaign.startDate)} ～ {formatDate(campaign.endDate)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 設定項目 */}
                        {currentSetting && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* 複数投票許可設定 */}
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="bg-blue-100 rounded p-2">
                                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800">🔒 複数投票</h4>
                                  <p className="text-xs text-gray-600">複数の申請者への投票を許可</p>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`multiple-${campaign.id}`}
                                    checked={!currentSetting.allowMultipleVotes}
                                    onChange={() => handleSettingUpdate(campaign.id, 'allowMultipleVotes', false)}
                                    className="mr-2"
                                  />
                                  <span className="text-sm">
                                    <span className="font-medium">🚫 禁止</span>
                                    <span className="text-gray-600 ml-2">1人の申請者のみに投票可能</span>
                                  </span>
                                </label>
                                
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`multiple-${campaign.id}`}
                                    checked={currentSetting.allowMultipleVotes}
                                    onChange={() => handleSettingUpdate(campaign.id, 'allowMultipleVotes', true)}
                                    className="mr-2"
                                  />
                                  <span className="text-sm">
                                    <span className="font-medium">✅ 許可</span>
                                    <span className="text-gray-600 ml-2">複数の申請者に投票可能</span>
                                  </span>
                                </label>
                              </div>
                            </div>

                            {/* 最大投票数設定 */}
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="bg-green-100 rounded p-2">
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800">📊 最大投票数</h4>
                                  <p className="text-xs text-gray-600">1人あたりの投票上限回数</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-gray-700">上限:</label>
                                <select
                                  value={currentSetting.maxVotesPerUser}
                                  onChange={(e) => handleSettingUpdate(campaign.id, 'maxVotesPerUser', parseInt(e.target.value))}
                                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                  {[1, 2, 3, 5, 10].map(num => (
                                    <option key={num} value={num}>
                                      {num}票まで
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <p className="text-xs text-gray-500 mt-2">
                                複数投票が禁止の場合でも、同じ申請者への重複投票制限として機能します
                              </p>
                            </div>
                          </div>
                        )}

                        {/* アクションボタン */}
                        <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
                          <button
                            onClick={() => handleSaveSettings(campaign.id, campaign.title)}
                            disabled={!hasChanges || loading}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                              hasChanges && !loading
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {loading ? (
                              <>
                                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                保存中...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                設定を保存
                              </>
                            )}
                          </button>
                          
                          {hasChanges && (
                            <button
                              onClick={() => handleResetSettings(campaign.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors text-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              リセット
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* 使用方法ガイド */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-8 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            設定ガイド
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">📋 推奨設定パターン</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span><strong>厳格投票:</strong> 複数投票禁止 + 最大1票</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>柔軟投票:</strong> 複数投票許可 + 最大3票</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span><strong>自由投票:</strong> 複数投票許可 + 最大10票</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">⚠️ 注意事項</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>設定変更は即座に反映されます</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>投票中のキャンペーンでは慎重に変更してください</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>変更前の投票は設定変更後も有効です</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
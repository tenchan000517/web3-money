'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getNotices, getCampaigns } from '@/lib/api';

interface Stats {
  totalNotices: number;
  activeNotices: number;
  totalCampaigns: number;
  activeCampaigns: number;
  endedCampaigns: number;
  totalVotes: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalNotices: 0,
    activeNotices: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    endedCampaigns: 0,
    totalVotes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setError(null);
      const [notices, campaigns] = await Promise.all([
        getNotices(),
        getCampaigns()
      ]);
      
      setStats({
        totalNotices: notices.length,
        activeNotices: notices.length, // getNoticesは期間内のもののみ返す
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        endedCampaigns: campaigns.filter(c => c.status === 'ended').length,
        totalVotes: 0 // 実装では投票総数も取得可能
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setError('統計データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    bgColor,
    description 
  }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    color: string; 
    bgColor: string;
    description?: string;
  }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 ${bgColor} rounded-lg`}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className={`text-2xl font-bold ${color}`}>{loading ? '...' : value}</p>
            </div>
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">管理ダッシュボード</h1>
              <p className="text-gray-600 mt-1">WEB3 MONEY システム管理</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/main"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                ユーザー画面に戻る
              </Link>
              <button
                onClick={fetchStats}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </div>
          </div>
        )}

        {/* 統計カード */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 システム統計</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="表示中お知らせ"
              value={stats.activeNotices}
              icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>}
              color="text-blue-600"
              bgColor="bg-blue-100"
              description="現在表示されているお知らせ数"
            />

            <StatCard
              title="進行中キャンペーン"
              value={stats.activeCampaigns}
              icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>}
              color="text-green-600"
              bgColor="bg-green-100"
              description="投票受付中のキャンペーン"
            />

            <StatCard
              title="総キャンペーン"
              value={stats.totalCampaigns}
              icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>}
              color="text-purple-600"
              bgColor="bg-purple-100"
              description="これまでに作成したキャンペーン"
            />

            <StatCard
              title="システム状態"
              value={1}
              icon={<svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>}
              color="text-emerald-600"
              bgColor="bg-emerald-100"
              description="正常稼働中"
            />
          </div>
        </section>

        {/* クイックアクション */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🚀 クイックアクション</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">📢 お知らせ管理</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    新しいお知らせの投稿や既存のお知らせの管理ができます。期間指定での自動表示・非表示機能付き。
                  </p>
                  <Link
                    href="/admin/notices"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    お知らせ管理
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8h.01M9 12h.01m3 0h.01m3 0h.01M9 16h.01m3 0h.01m3 0h.01" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">🗳️ キャンペーン管理</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    支援金投票キャンペーンの作成・管理ができます。Googleフォーム連携で申請者データを自動取得。
                  </p>
                  <Link
                    href="/admin/campaigns"
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    キャンペーン管理
                  </Link>
                </div>
              </div>
            </div>

            {/* 🆕 投票設定管理カード */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">⚙️ 投票設定管理</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    キャンペーンごとの投票制限・ルール設定を管理できます。重複投票防止や投票数制限の設定。
                  </p>
                  <Link
                    href="/admin/campaign-settings"
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    投票設定
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 運用ガイド */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 運用ガイド</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                日常的な作業
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">📢 お知らせ投稿</span>
                  <span className="text-green-600 font-medium">約3分</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">🗳️ キャンペーン開始</span>
                  <span className="text-green-600 font-medium">約10分</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">📊 投票結果確認</span>
                  <span className="text-green-600 font-medium">随時</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">⚙️ ステータス変更</span>
                  <span className="text-green-600 font-medium">約1分</span>
                </div>
                {/* 🆕 投票設定管理追加 */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">🔒 投票設定変更</span>
                  <span className="text-purple-600 font-medium">約2分</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                月次メンテナンス
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-purple-600">•</span>
                  <span className="text-gray-700">終了キャンペーンのアーカイブ</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-purple-600">•</span>
                  <span className="text-gray-700">期限切れお知らせの確認</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-purple-600">•</span>
                  <span className="text-gray-700">システム動作状況の確認</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-purple-600">•</span>
                  <span className="text-gray-700">データベースの最適化</span>
                </div>
                {/* 🆕 認証データ確認追加 */}
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-purple-600">•</span>
                  <span className="text-gray-700">投票認証データの確認</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* システム情報 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🔧 システム情報</h2>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-800">システム状態</p>
                <p className="text-xs text-green-600">正常稼働中</p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-800">バージョン</p>
                <p className="text-xs text-blue-600">v2.0.0 (認証対応)</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-800">データベース</p>
                <p className="text-xs text-purple-600">Google Sheets + 認証</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
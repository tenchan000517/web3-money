'use client';
import { useState, useEffect } from 'react';
import { Campaign, FormField, ConnectionTestResult } from '@/lib/types';
import { getCampaigns, createCampaign, updateCampaignStatus, testFormConnection, getFormFields } from '@/lib/api';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function CampaignsAdmin() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    sheetUrl: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [connectionTest, setConnectionTest] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    result?: ConnectionTestResult;
  }>({ status: 'idle' });

  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [showFieldMapping, setShowFieldMapping] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setError(null);
      const data = await getCampaigns();
      setCampaigns(data || []); // Ensure campaigns is never undefined
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      setError('キャンペーンの取得に失敗しました');
      setCampaigns([]); // Reset to empty array on error
    } finally {
      setFetchLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!formData.sheetUrl.trim()) {
      alert('スプレッドシートURLを入力してください');
      return;
    }

    setConnectionTest({ status: 'testing' });
    
    try {
      const result = await testFormConnection(formData.sheetUrl);
      
      if (result.success) {
        setConnectionTest({ status: 'success', result });
        
        // フィールド情報を取得
        const fieldsResult = await getFormFields(formData.sheetUrl);
        if (fieldsResult.success && fieldsResult.fields) {
          setFormFields(fieldsResult.fields.map((field, index) => ({
            key: field.key,
            displayName: field.displayName || field.key,
            type: field.type || 'text',
            visible: true,
            order: index
          })));
          setShowFieldMapping(true);
        }
      } else {
        setConnectionTest({ status: 'error', result });
      }
    } catch (error) {
      setConnectionTest({ 
        status: 'error', 
        result: { 
          success: false, 
          message: 'テストに失敗しました: ' + (error as Error).message
        }
      });
    }
  };

  const renderConnectionGuide = () => {
    if (connectionTest.status !== 'error' || !connectionTest.result?.guide) return null;

    const guide = connectionTest.result.guide;
    
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="font-semibold text-red-800 mb-2">{guide.title}</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-red-700">
          {guide.steps.map((step: string, index: number) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
        <button
          onClick={handleTestConnection}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
        >
          再テスト
        </button>
      </div>
    );
  };

  const handleFieldUpdate = (index: number, field: Partial<FormField>) => {
    setFormFields(prev => 
      prev.map((f, i) => i === index ? { ...f, ...field } : f)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('キャンペーン名を入力してください');
      return;
    }

    if (!formData.sheetUrl.trim()) {
      alert('スプレッドシートURLを入力してください');
      return;
    }

    if (connectionTest.status !== 'success') {
      alert('まず接続テストを実行して成功させてください');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert('終了日は開始日より後の日付を選択してください');
      return;
    }

    setLoading(true);
    
    try {
      const campaignData = {
        ...formData,
        formUrl: '',
        fields: formFields
      };
      
      await createCampaign(campaignData);
      await fetchCampaigns();
      
      // フォームリセット
      setShowForm(false);
      resetForm();
      alert('✅ キャンペーンを作成しました');
      
    } catch (error) {
      console.error('Failed to create campaign:', error);
      alert('❌ キャンペーンの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      sheetUrl: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setConnectionTest({ status: 'idle' });
    setFormFields([]);
    setShowFieldMapping(false);
  };

  const handleStatusChange = async (campaignId: string, newStatus: Campaign['status'], title: string) => {
    const statusLabels = {
      'draft': '準備中',
      'active': '投票中',
      'ended': '終了',
      'archived': 'アーカイブ'
    };

    if (!confirm(`「${title}」を「${statusLabels[newStatus]}」に変更しますか？`)) return;
    
    try {
      await updateCampaignStatus(campaignId, newStatus);
      await fetchCampaigns();
      alert(`✅ ステータスを「${statusLabels[newStatus]}」に更新しました`);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('❌ ステータスの更新に失敗しました');
    }
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

  const isNearExpiry = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🗳️ キャンペーン管理</h1>
              <p className="text-gray-600 mt-1">支援金投票キャンペーンの作成・管理ができます</p>
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
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                新規キャンペーン
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
                onClick={fetchCampaigns}
                className="ml-auto text-red-600 hover:text-red-800 text-sm underline"
              >
                再試行
              </button>
            </div>
          </div>
        )}

        {/* 新規作成フォーム */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    新規キャンペーン作成
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700 p-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* 基本情報 */}
                <section>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    基本情報
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📝 キャンペーン名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="例：第1回支援金投票キャンペーン"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📊 スプレッドシートURL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={formData.sheetUrl}
                        onChange={(e) => setFormData({...formData, sheetUrl: e.target.value})}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        GoogleフォームのレスポンススプレッドシートのURLを入力してください
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={connectionTest.status === 'testing'}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          connectionTest.status === 'testing'
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : connectionTest.status === 'success'
                            ? 'bg-green-600 text-white'
                            : connectionTest.status === 'error'
                            ? 'bg-red-600 text-white'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {connectionTest.status === 'testing' ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            接続中...
                          </>
                        ) : connectionTest.status === 'success' ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            ✓ 接続成功
                          </>
                        ) : connectionTest.status === 'error' ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            ✗ 接続失敗
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            接続テスト
                          </>
                        )}
                      </button>
                    </div>

                    {/* 接続結果表示 - 修正箇所: headers.length アクセス時のチェック追加 */}
                    {connectionTest.result && (
                      <div className={`p-4 rounded-lg border ${
                        connectionTest.result.success 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <p className={`text-sm font-medium mb-2 ${
                          connectionTest.result.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {connectionTest.result.message}
                        </p>
                        
                        {connectionTest.result.success && connectionTest.result.data && (
                          <div className="text-xs text-green-700 space-y-1">
                            <p>📊 シート名: {connectionTest.result.data.sheetName}</p>
                            <p>📝 データ件数: {connectionTest.result.data.rowCount}件</p>
                            {connectionTest.result.data.headers && (
                              <>
                                <p>🏷️ 項目数: {connectionTest.result.data.headers.length}個</p>
                                <p>📋 項目: {connectionTest.result.data.headers.join(', ')}</p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {renderConnectionGuide()}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📅 開始日 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📅 終了日 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* フィールドマッピング - 修正箇所: formFields?.length チェック */}
                {showFieldMapping && formFields && formFields.length > 0 && (
                  <section className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8h.01M9 12h.01m3 0h.01m3 0h.01M9 16h.01m3 0h.01m3 0h.01" />
                      </svg>
                      項目設定
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      検出された項目の表示設定を調整してください
                    </p>
                    
                    <div className="space-y-4">
                      {formFields.map((field, index) => (
                        <div key={field.key} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                元の項目名
                              </label>
                              <p className="text-sm bg-white p-2 rounded border">{field.key}</p>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                表示名
                              </label>
                              <input
                                type="text"
                                value={field.displayName}
                                onChange={(e) => handleFieldUpdate(index, { displayName: e.target.value })}
                                className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <label className="flex items-center text-xs">
                                <input
                                  type="checkbox"
                                  checked={field.visible}
                                  onChange={(e) => handleFieldUpdate(index, { visible: e.target.checked })}
                                  className="mr-2"
                                />
                                表示
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={connectionTest.status !== 'success' || loading}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      connectionTest.status === 'success' && !loading
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        作成中...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        キャンペーン作成
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* キャンペーン一覧 - 修正箇所: campaigns?.length || 0 */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8h.01M9 12h.01m3 0h.01m3 0h.01M9 16h.01m3 0h.01m3 0h.01" />
                </svg>
                キャンペーン一覧 ({campaigns?.length || 0}件)
              </h2>
              <button
                onClick={fetchCampaigns}
                disabled={fetchLoading}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className={`w-4 h-4 ${fetchLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                更新
              </button>
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
            ) : campaigns?.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8h.01M9 12h.01m3 0h.01m3 0h.01M9 16h.01m3 0h.01m3 0h.01" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg mb-2">キャンペーンがありません</p>
                <p className="text-gray-400 text-sm">上のボタンから新しいキャンペーンを作成してください</p>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((campaign) => (
                  <div key={campaign.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{campaign.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                            {getStatusLabel(campaign.status)}
                          </span>
                          {campaign.status === 'active' && isNearExpiry(campaign.endDate) && (
                            <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                              ⏰ まもなく終了
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              期間: {format(new Date(campaign.startDate), 'yyyy/M/d', { locale: ja })} ～ {format(new Date(campaign.endDate), 'yyyy/M/d', { locale: ja })}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              作成: {format(new Date(campaign.createdAt), 'yyyy/M/d', { locale: ja })}
                            </span>
                          </div>
                          {campaign.sheetUrl && (
                            <p className="text-xs text-blue-600 truncate">
                              📊 {campaign.sheetUrl}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => handleStatusChange(campaign.id, 'active', campaign.title)}
                          className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm px-3 py-1 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          開始
                        </button>
                      )}
                      {campaign.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(campaign.id, 'ended', campaign.title)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v6H9z" />
                          </svg>
                          終了
                        </button>
                      )}
                      {campaign.status === 'ended' && (
                        <button
                          onClick={() => handleStatusChange(campaign.id, 'archived', campaign.title)}
                          className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6m0 0l6-6m-6 6V3" />
                          </svg>
                          アーカイブ
                        </button>
                      )}
                      <button className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-sm px-3 py-1 rounded-lg hover:bg-purple-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        詳細
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
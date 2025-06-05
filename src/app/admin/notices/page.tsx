'use client';
import { useState, useEffect } from 'react';
import { Notice } from '@/lib/types';
import { getNotices, createNotice, updateNotice, deleteNotice } from '@/lib/api';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function NoticesAdmin() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Partial<Notice>>({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPermanent: false, // 🆕 永続表示フラグ
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setError(null);
      const data = await getNotices();
      setNotices(data);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
      setError('お知らせの取得に失敗しました');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('タイトルと内容は必須です');
      return;
    }

    // 🆕 期限ありの場合の日付チェック
    if (!formData.isPermanent) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        alert('終了日は開始日より後の日付を選択してください');
        return;
      }
    }

    setLoading(true);
    
    try {
      // 🆕 送信データの準備
      const submitData = {
        title: formData.title,
        content: formData.content,
        ...(formData.isPermanent 
          ? { isPermanent: true } // 永続表示の場合
          : { // 期限ありの場合
              startDate: formData.startDate,
              endDate: formData.endDate,
              isPermanent: false
            }
        )
      };

      if (isEditing && editingNotice.id) {
        await updateNotice(editingNotice.id, submitData);
        alert('✅ お知らせを更新しました');
      } else {
        await createNotice(submitData);
        alert('✅ お知らせを作成しました');
      }
      
      await fetchNotices();
      resetForm();
    } catch (error) {
      console.error('Failed to save notice:', error);
      alert('❌ 保存に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (notice: Notice) => {
    setIsEditing(true);
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      isPermanent: notice.isPermanent || false,
      startDate: notice.startDate ? notice.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: notice.endDate ? notice.endDate.split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    
    // フォームまでスクロール
    document.getElementById('notice-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？\nこの操作は取り消せません。`)) return;
    
    try {
      await deleteNotice(id);
      await fetchNotices();
      alert('✅ お知らせを削除しました');
    } catch (error) {
      console.error('Failed to delete notice:', error);
      alert('❌ 削除に失敗しました。もう一度お試しください。');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingNotice({});
    setFormData({
      title: '',
      content: '',
      isPermanent: false,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  // 🆕 お知らせの状態判定
  const getNoticeStatus = (notice: Notice) => {
    if (notice.isPermanent) {
      return { status: 'permanent', label: '永続表示', color: 'bg-purple-100 text-purple-800' };
    }
    
    if (!notice.startDate || !notice.endDate) {
      return { status: 'permanent', label: '永続表示', color: 'bg-purple-100 text-purple-800' };
    }

    const now = new Date();
    const start = new Date(notice.startDate);
    const end = new Date(notice.endDate);
    
    if (now < start) {
      return { status: 'scheduled', label: '開始前', color: 'bg-yellow-100 text-yellow-800' };
    } else if (now > end) {
      return { status: 'expired', label: '終了', color: 'bg-gray-100 text-gray-800' };
    } else {
      return { status: 'active', label: '表示中', color: 'bg-green-100 text-green-800' };
    }
  };

  const getStatusBadge = (notice: Notice) => {
    const { label, color } = getNoticeStatus(notice);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {label === '永続表示' ? '♾️' : label === '開始前' ? '⏳' : label === '終了' ? '📋' : '🔔'} {label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📢 お知らせ管理</h1>
              <p className="text-gray-600 mt-1">お知らせの作成・編集・削除ができます（期限あり・なし対応）</p>
            </div>
            <a
              href="/admin"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              管理画面に戻る
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{error}</p>
              <button
                onClick={fetchNotices}
                className="ml-auto text-red-600 hover:text-red-800 text-sm underline"
              >
                再試行
              </button>
            </div>
          </div>
        )}

        {/* フォーム */}
        <div id="notice-form" className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            {isEditing ? (
              <>
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                お知らせ編集
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                新規お知らせ作成
              </>
            )}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="お知らせのタイトルを入力してください"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100文字</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📄 内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="お知らせの詳細内容を入力してください"
                rows={8}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                required
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.content.length}/1000文字</p>
            </div>

            {/* 🆕 表示期間設定 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-3">⏰ 表示期間設定</h3>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="displayType"
                    checked={formData.isPermanent}
                    onChange={() => setFormData({...formData, isPermanent: true})}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    <span className="font-medium">♾️ 永続表示</span>
                    <span className="text-gray-600 ml-2">期限なしで常に表示</span>
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="displayType"
                    checked={!formData.isPermanent}
                    onChange={() => setFormData({...formData, isPermanent: false})}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    <span className="font-medium">📅 期間指定</span>
                    <span className="text-gray-600 ml-2">開始日〜終了日を指定</span>
                  </span>
                </label>
              </div>
            </div>

            {/* 期間指定の場合のみ表示 */}
            {!formData.isPermanent && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📅 開始日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!formData.isPermanent}
                  />
                  <p className="text-xs text-gray-500 mt-1">この日から表示されます</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📅 終了日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!formData.isPermanent}
                  />
                  <p className="text-xs text-gray-500 mt-1">この日まで表示されます</p>
                </div>
              </div>
            )}

            {/* 永続表示の場合の説明 */}
            {formData.isPermanent && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-purple-600 text-xl">♾️</div>
                  <div className="text-purple-800 text-sm">
                    <p className="font-medium mb-1">永続表示について</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 期限なしで常に表示され続けます</li>
                      <li>• 重要なお知らせや基本情報に適しています</li>
                      <li>• 後から期間指定に変更することも可能です</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {isEditing ? '更新中...' : '作成中...'}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isEditing ? '更新' : '作成'}
                  </>
                )}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  キャンセル
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 一覧 */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8h.01M9 12h.01m3 0h.01m3 0h.01M9 16h.01m3 0h.01m3 0h.01" />
                </svg>
                お知らせ一覧 ({notices.length}件)
              </h2>
              <button
                onClick={fetchNotices}
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
            ) : notices.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg mb-2">お知らせがありません</p>
                <p className="text-gray-400 text-sm">上のフォームから新しいお知らせを作成してください</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notices
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((notice) => {
                    const noticeStatus = getNoticeStatus(notice);
                    return (
                      <div key={notice.id} className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                        noticeStatus.status === 'active' || noticeStatus.status === 'permanent'
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-white'
                      }`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-800">{notice.title}</h3>
                              {getStatusBadge(notice)}
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                              {notice.content}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEdit(notice)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              編集
                            </button>
                            <button
                              onClick={() => handleDelete(notice.id, notice.title)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              削除
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                          <div className="flex gap-4">
                            {notice.isPermanent ? (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                永続表示
                              </span>
                            ) : notice.startDate && notice.endDate ? (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {format(new Date(notice.startDate), 'yyyy/M/d', { locale: ja })} ～ {format(new Date(notice.endDate), 'yyyy/M/d', { locale: ja })}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                永続表示
                              </span>
                            )}
                          </div>
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            作成: {format(new Date(notice.createdAt), 'yyyy/M/d HH:mm', { locale: ja })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
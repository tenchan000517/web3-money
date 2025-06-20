'use client';

import { useState } from 'react';
import { PrivateConnectionTestResult } from '@/lib/types';

/**
 * プライベートスプレッドシート接続テストページ
 * 開発・テスト専用
 */
export default function TestPrivatePage() {
    const [testResult, setTestResult] = useState<PrivateConnectionTestResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runConnectionTest = async () => {
        setLoading(true);
        setError(null);
        setTestResult(null);

        try {
            console.log('🔄 プライベートスプレッドシート接続テスト開始');

            const response = await fetch('/api/gas?path=test-private-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    testMode: 'development',
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ 接続テスト結果:', data);

            if (data.success) {
                setTestResult(data.data);
            } else {
                throw new Error(data.error || '接続テストに失敗しました');
            }

        } catch (err) {
            console.error('❌ 接続テストエラー:', err);
            setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* ヘッダー */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        🔒 プライベートスプレッドシート接続テスト
                    </h1>
                    <p className="text-gray-600 text-sm">
                        プライバシー保護投票システムの接続状況を確認します（開発・テスト専用）
                    </p>
                </div>

                {/* テスト実行ボタン */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">接続テスト</h2>
                        <button
                            onClick={runConnectionTest}
                            disabled={loading}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                loading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    テスト中...
                                </div>
                            ) : (
                                '🚀 接続テスト開始'
                            )}
                        </button>
                    </div>

                    {/* テスト項目説明 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-800 mb-2">テスト項目</h3>
                        <ul className="text-blue-700 text-sm space-y-1">
                            <li className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                                Next.js API Route → Google Apps Script 通信
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                                プライベート投票システム初期化
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                                セキュリティ機能確認
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                                データスキーマ検証
                            </li>
                        </ul>
                    </div>
                </div>

                {/* エラー表示 */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="text-red-600 text-xl">❌</div>
                            <div>
                                <h3 className="font-medium text-red-800 mb-1">接続テスト失敗</h3>
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* テスト結果表示 */}
                {testResult && (
                    <div className={`rounded-lg border p-6 mb-6 ${
                        testResult.status === 'ok' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                    }`}>
                        <div className="flex items-start gap-3 mb-4">
                            <div className={`text-2xl ${
                                testResult.status === 'ok' ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {testResult.status === 'ok' ? '✅' : '❌'}
                            </div>
                            <div>
                                <h3 className={`font-semibold mb-1 ${
                                    testResult.status === 'ok' ? 'text-green-800' : 'text-red-800'
                                }`}>
                                    {testResult.status === 'ok' ? '接続テスト成功' : '接続テスト失敗'}
                                </h3>
                                <p className={`text-sm ${
                                    testResult.status === 'ok' ? 'text-green-700' : 'text-red-700'
                                }`}>
                                    {testResult.message}
                                </p>
                            </div>
                        </div>

                        {/* 成功時の詳細情報 */}
                        {testResult.status === 'ok' && testResult.features && (
                            <div className="mt-4">
                                <h4 className="font-medium text-green-800 mb-2">実装済み機能</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {testResult.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2 text-green-700 text-sm">
                                            <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 開発メモ */}
                        {testResult.note && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                <h4 className="font-medium text-yellow-800 mb-1">開発メモ</h4>
                                <p className="text-yellow-700 text-sm">{testResult.note}</p>
                            </div>
                        )}

                        {/* タイムスタンプ */}
                        <div className="mt-4 pt-3 border-t border-green-200">
                            <p className="text-green-600 text-xs">
                                テスト実行時刻: {testResult.timestamp}
                            </p>
                        </div>
                    </div>
                )}

                {/* システム情報 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">システム情報</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-600">アーキテクチャ:</span>
                            <span className="ml-2 text-gray-800">プライバシー保護新システム</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-600">投票重み:</span>
                            <span className="ml-2 text-gray-800">完全非表示（バックエンドのみ）</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-600">重複制御:</span>
                            <span className="ml-2 text-gray-800">メールアドレス + ページ別</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-600">セキュリティ:</span>
                            <span className="ml-2 text-gray-800">プライベートスプレッドシート</span>
                        </div>
                    </div>
                </div>

                {/* 開発者向け注意事項 */}
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="font-medium text-amber-800 mb-2">⚠️ 開発者向け注意事項</h3>
                    <ul className="text-amber-700 text-sm space-y-1">
                        <li>• このページは開発・テスト専用です</li>
                        <li>• 本番環境では削除またはアクセス制限してください</li>
                        <li>• プライベートスプレッドシートIDの設定が必要です</li>
                        <li>• 実際のGAS実装時はprivate-votes.gsを使用してください</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
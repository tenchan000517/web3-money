'use client';
import { useState, useEffect } from 'react';
import { Applicant } from '@/lib/types';
import { addAuthenticatedVote, UserSessionManager } from '@/lib/api';

interface VotingCardProps {
    applicant: Applicant;
    campaignId: string;
    rank: number;
    onVoteSuccess: () => void;
}

export default function VotingCard({ applicant, campaignId, rank, onVoteSuccess }: VotingCardProps) {
    const [showVoteModal, setShowVoteModal] = useState(false);
    const [voting, setVoting] = useState(false);
    const [userForm, setUserForm] = useState({
        financeId: '',
        email: '',
        name: ''
    });

    // コンポーネントマウント時にキャッシュをチェック
    useEffect(() => {
        const cachedUser = UserSessionManager.getUserSession();
        if (cachedUser) {
            setUserForm(cachedUser);
        }
    }, []);

    const handleVoteClick = () => {
        // 最新のキャッシュを確認して自動入力
        const cachedUser = UserSessionManager.getUserSession();
        if (cachedUser) {
            setUserForm(cachedUser);
        } else {
            // キャッシュなしの場合は空にリセット
            setUserForm({ financeId: '', email: '', name: '' });
        }

        setShowVoteModal(true);
    };

    const handleVoteSubmit = async () => {
        // 入力検証
        if (!userForm.financeId.trim()) {
            alert('フィナンシェIDを入力してください');
            return;
        }

        if (!userForm.email.trim()) {
            alert('メールアドレスを入力してください');
            return;
        }

        if (!userForm.name.trim()) {
            alert('お名前を入力してください');
            return;
        }

        // メールアドレスの簡易検証
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userForm.email.trim())) {
            alert('有効なメールアドレスを入力してください');
            return;
        }

        setVoting(true);

        try {
            // 認証付き投票を実行（サーバー側で全ての検証を実行）
            await addAuthenticatedVote(
                userForm.financeId.trim(),
                userForm.email.trim(),
                userForm.name.trim(),
                campaignId,
                applicant.id
            );

            // 成功時：キャッシュに保存
            UserSessionManager.saveUserSession(
                userForm.financeId.trim(),
                userForm.email.trim(),
                userForm.name.trim()
            );

            alert('✅ 応援ありがとうございました！');
            onVoteSuccess();
            setShowVoteModal(false);

        } catch (error) {
            console.error('Failed to vote:', error);

            // サーバー側の検証結果をそのまま表示
            const errorMessage = (error as Error).message || '投票に失敗しました';
            alert(`❌ ${errorMessage}`);

            // エラーの場合もキャッシュは保存（次回入力の手間を省く）
            if (userForm.financeId.trim() && userForm.email.trim() && userForm.name.trim()) {
                UserSessionManager.saveUserSession(
                    userForm.financeId.trim(),
                    userForm.email.trim(),
                    userForm.name.trim()
                );
            }

            setShowVoteModal(false);
        } finally {
            setVoting(false);
        }
    };

    const handleInputChange = (field: keyof typeof userForm, value: string) => {
        setUserForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 既存のヘルパー関数を維持
    const getName = (): string => {
        return (applicant.name ||
            applicant['お名前'] ||
            applicant['氏名'] ||
            applicant['名前'] ||
            `申請者${rank}`) as string;
    };

    const getReason = (): string => {
        return (applicant.reason ||
            applicant['支援理由'] ||
            applicant['理由'] ||
            applicant['支援内容'] ||
            '記載なし') as string;
    };

    const getAmount = () => {
        const amount = applicant.amount ||
            applicant['希望金額'] ||
            applicant['金額'] ||
            applicant['支援金額'] ||
            0;
        return typeof amount === 'string' ? parseInt(amount.replace(/[^\d]/g, ''), 10) || 0 : amount;
    };

    const getRankEmoji = (rank: number) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return rank <= 10 ? '🏅' : '';
        }
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'border-l-4 border-yellow-400 bg-gradient-to-r from-yellow-50 to-white';
        if (rank === 2) return 'border-l-4 border-gray-400 bg-gradient-to-r from-gray-50 to-white';
        if (rank === 3) return 'border-l-4 border-orange-400 bg-gradient-to-r from-orange-50 to-white';
        return 'border-l-4 border-blue-200 bg-white';
    };

    return (
        <>
            <div className={`rounded-lg shadow hover:shadow-md transition-all duration-200 ${getRankColor(rank)}`}>
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            {/* ランクとタイトル */}
                            <div className="flex items-center gap-3 mb-3">
                                {rank <= 10 && (
                                    <span className="text-2xl">{getRankEmoji(rank)}</span>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-500">#{rank}</span>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {getName()}
                                    </h3>
                                </div>
                            </div>

                            {/* 申請内容 */}
                            <div className="space-y-3 mb-4">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-sm font-medium text-gray-700 mb-1">💡 支援理由</p>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {getReason()}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-700">💰 希望金額:</span>
                                        <span className="text-lg font-semibold text-green-600">
                                            ¥{getAmount().toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 投票数と投票ボタン */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">💖</span>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-pink-600">
                                                {applicant.voteCount || 0}
                                            </div>
                                            <div className="text-xs text-gray-500">票</div>
                                        </div>
                                    </div>

                                    {rank <= 3 && (
                                        <div className="text-xs text-gray-500">
                                            {rank === 1 ? '🎉 1位!' : rank === 2 ? '✨ 2位' : '🌟 3位'}
                                        </div>
                                    )}
                                </div>

                                <div className="text-right">
                                    <button
                                        onClick={handleVoteClick}
                                        disabled={voting}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${voting
                                                ? 'bg-blue-300 text-white cursor-not-allowed'
                                                : 'bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transform hover:scale-105 shadow-md'
                                            }`}
                                    >
                                        {voting ? '投票中...' : '💖 応援する'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🆕 認証・応援フォームモーダル */}
            {showVoteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                    <span className="text-2xl">💖</span>
                                    この申請者を応援しますか？
                                </h3>
                                <button
                                    onClick={() => setShowVoteModal(false)}
                                    className="text-gray-500 hover:text-gray-700 p-2"
                                    disabled={voting}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* 申請者情報 */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-gray-800 mb-2">{getName()}</h4>
                                <p className="text-sm text-gray-600 mb-2">
                                    <span className="font-medium">理由:</span> {getReason()}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">金額:</span> ¥{getAmount().toLocaleString()}
                                </p>
                            </div>

                            {/* 本人確認フォーム */}
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        フィナンシェID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={userForm.financeId}
                                        onChange={(e) => handleInputChange('financeId', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        placeholder="例: FINANCE001"
                                        disabled={voting}
                                        maxLength={50}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        メールアドレス <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={userForm.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        placeholder="例: user@example.com"
                                        disabled={voting}
                                        maxLength={254}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        お名前 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={userForm.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        placeholder="例: 田中太郎"
                                        disabled={voting}
                                        maxLength={100}
                                    />
                                </div>
                            </div>

                            {/* アクションボタン */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleVoteSubmit}
                                    disabled={voting}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-lg hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                >
                                    {voting ? (
                                        <>
                                            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            応援中...
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-lg">💖</span>
                                            応援する
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowVoteModal(false)}
                                    disabled={voting}
                                    className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 font-medium transition-colors"
                                >
                                    キャンセル
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
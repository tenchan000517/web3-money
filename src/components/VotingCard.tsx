'use client';
import { useState, useEffect } from 'react';
import { Applicant } from '@/lib/types';
import { addAuthenticatedVote, UserSessionManager } from '@/lib/api';
import { Heart, Medal, Trophy, Award, Star, Lightbulb, FileText, MessageCircle, X, RotateCw, Video, ChevronDown, ChevronUp } from 'lucide-react';

interface VotingCardProps {
    applicant: Applicant;
    campaignId: string;
    rank: number;
    onVoteSuccess: () => void;
    votePage?: 'basic' | 'premium'; // 🆕 投票ページ（基本 or プレミアム）
    // showWeightedScore?: boolean; // 🆕 重み付きスコアを表示するか（未使用）
}

export default function VotingCard({ applicant, campaignId, rank, onVoteSuccess, votePage = 'basic' }: VotingCardProps) {
    const [showVoteModal, setShowVoteModal] = useState(false);
    const [voting, setVoting] = useState(false);
    const [youtubeOptIn, setYoutubeOptIn] = useState(false); // 🆕 YouTube出演選択
    const [showDetailedReason, setShowDetailedReason] = useState(false); // アコーディオン状態
    const [showThoughts, setShowThoughts] = useState(false); // アコーディオン状態
    const [isMobile, setIsMobile] = useState(false); // モバイル判定
    const [userForm, setUserForm] = useState({
        financeId: '',
        email: '',
        name: ''
    });

    // コンポーネントマウント時にキャッシュをチェック & モバイル判定
    useEffect(() => {
        const cachedUser = UserSessionManager.getUserSession();
        if (cachedUser) {
            setUserForm(cachedUser);
        }

        // モバイル判定
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
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
                applicant.id,
                votePage, // 🆕 投票ページを追加
                votePage === 'premium' ? youtubeOptIn : undefined // 🆕 プレミアムページのみYouTube選択
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

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy className="w-6 h-6 text-yellow-400" />;
            case 2: return <Medal className="w-6 h-6 text-gray-400" />;
            case 3: return <Award className="w-6 h-6 text-orange-400" />;
            default: return rank <= 10 ? <Star className="w-6 h-6 text-blue-400" /> : null;
        }
    };

    const getRankColor = (rank: number) => {
        // 蛍光ラインを削除し、白枠とグラデーション背景に変更
        if (rank === 1) return 'border border-white/20 bg-gradient-to-br from-yellow-900/30 to-gray-900 text-white shadow-lg';
        if (rank === 2) return 'border border-white/20 bg-gradient-to-br from-gray-800/50 to-gray-900 text-white shadow-lg';
        if (rank === 3) return 'border border-white/20 bg-gradient-to-br from-orange-900/30 to-gray-900 text-white shadow-lg';
        return 'border border-white/10 bg-gradient-to-br from-gray-800/30 to-gray-900 text-white shadow-md';
    };

    return (
        <>
            <div className={`rounded-lg shadow hover:shadow-md transition-all duration-200 ${getRankColor(rank)}`}>
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            {/* ランクとタイトル */}
                            <div className="flex items-center gap-3 mb-3">
                                {rank <= 10 && getRankIcon(rank)}
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold text-white">
                                        {getName()}
                                    </h3>
                                </div>
                            </div>

                            {/* 申請内容 */}
                            <div className="space-y-3 mb-4">

                                {/* 支援理由 */}
                                <div className="rounded-lg p-3 bg-gray-800">
                                    <p className="text-sm font-medium mb-1 text-gray-300 flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4" />
                                        支援理由
                                    </p>
                                    <p className="text-sm leading-relaxed text-gray-400">
                                        {getReason()}
                                    </p>
                                </div>

                                {/* 希望金額 */}
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-300">希望金額:</span>
                                        <span className="text-lg font-semibold text-green-400 font-mono">
                                            {applicant.amount || '0'}
                                        </span>
                                    </div>
                                </div>

                                {/* 詳細用途 */}
                                {applicant.detailedReason && (
                                    <div className="rounded-lg bg-gray-800">
                                        <button
                                            onClick={() => setShowDetailedReason(!showDetailedReason)}
                                            className="w-full p-3 text-left hover:bg-gray-700 transition-colors rounded-lg"
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    詳細な使用用途
                                                </p>
                                                {showDetailedReason ? 
                                                    <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                                }
                                            </div>
                                        </button>
                                        {showDetailedReason && (
                                            <div className="px-3 pb-3">
                                                <p className="text-sm leading-relaxed text-gray-400 whitespace-pre-line">
                                                    {applicant.detailedReason}
                                                </p>
                                            </div>
                                        )}
                                        {!showDetailedReason && (
                                            <div className="px-3 pb-3">
                                                <p className="text-sm leading-relaxed text-gray-400 whitespace-pre-line">
                                                    {applicant.detailedReason.length > (isMobile ? 75 : 150) 
                                                        ? `${applicant.detailedReason.substring(0, isMobile ? 75 : 150)}...` 
                                                        : applicant.detailedReason
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 応募への想い */}
                                {applicant.thoughts && (
                                    <div className="rounded-lg bg-gray-800">
                                        <button
                                            onClick={() => setShowThoughts(!showThoughts)}
                                            className="w-full p-3 text-left hover:bg-gray-700 transition-colors rounded-lg"
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                    <MessageCircle className="w-4 h-4" />
                                                    応募への想い
                                                </p>
                                                {showThoughts ? 
                                                    <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                                }
                                            </div>
                                        </button>
                                        {showThoughts && (
                                            <div className="px-3 pb-3">
                                                <p className="text-sm leading-relaxed text-gray-400 whitespace-pre-line">
                                                    {applicant.thoughts}
                                                </p>
                                            </div>
                                        )}
                                        {!showThoughts && (
                                            <div className="px-3 pb-3">
                                                <p className="text-sm leading-relaxed text-gray-400 whitespace-pre-line">
                                                    {applicant.thoughts.length > (isMobile ? 75 : 150) 
                                                        ? `${applicant.thoughts.substring(0, isMobile ? 75 : 150)}...` 
                                                        : applicant.thoughts
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 申請日時 */}
                                {applicant.timestamp && (
                                    <div className="text-xs text-gray-500 text-right">
                                        申請日時: {new Date(applicant.timestamp).toLocaleDateString('ja-JP')}
                                    </div>
                                )}
                            </div>

                            {/* 投票数と投票ボタン */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <Heart className="w-6 h-6 text-pink-400" />
                                        <div className="flex items-center gap-1">
                                            <span className="text-xl font-bold text-pink-400">
                                                {applicant.voteCount || 0}
                                            </span>
                                            <span className="text-sm text-gray-400">票</span>
                                        </div>
                                    </div>

                                    {rank <= 3 && (
                                        <div className="text-sm text-gray-400 flex items-center gap-1">
                                            {rank === 1 ? <><Trophy className="w-6 h-6" /> RANK1!</> : 
                                             rank === 2 ? <><Star className="w-6 h-6" /> RANK2</> : 
                                             <><Award className="w-6 h-6" /> RANK3</>}
                                        </div>
                                    )}
                                </div>

                                <div className="text-right">
                                    <button
                                        onClick={handleVoteClick}
                                        disabled={voting}
                                        className={`${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-sm'} rounded-lg font-medium transition-all duration-200 ${voting
                                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                : votePage === 'basic'
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 shadow-md'
                                                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 transform hover:scale-105 shadow-md'
                                            }`}
                                    >
                                        {voting ? '投票中...' : '投票する'}
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
                                    <Heart className="w-6 h-6 text-pink-500" />
                                    この申請者を応援しますか？
                                </h3>
                                <button
                                    onClick={() => setShowVoteModal(false)}
                                    className="text-gray-500 hover:text-gray-700 p-2"
                                    disabled={voting}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* 申請者情報 */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-gray-800 mb-2">{getName()}</h4>
                                <p className="text-sm text-gray-600 mb-2">
                                    <span className="font-medium">理由:</span> {getReason()}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">金額:</span> {getAmount().toLocaleString()}
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

                            {/* YouTube出演選択（プレミアムページのみ） */}
                            {votePage === 'premium' && (
                                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={youtubeOptIn}
                                            onChange={(e) => setYoutubeOptIn(e.target.checked)}
                                            disabled={voting}
                                            className="w-5 h-5 text-yellow-600 bg-white border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
                                        />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                <Video className="w-4 h-4" />
                                                YouTube出演を希望する
                                            </span>
                                            <p className="text-xs text-gray-600 mt-1">
                                                支援を受けた場合、YouTube動画への出演を希望します
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            )}

                            {/* アクションボタン */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleVoteSubmit}
                                    disabled={voting}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-lg hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                >
                                    {voting ? (
                                        <>
                                            <RotateCw className="w-5 h-5 animate-spin" />
                                            応援中...
                                        </>
                                    ) : (
                                        <>
                                            <Heart className="w-5 h-5" />
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
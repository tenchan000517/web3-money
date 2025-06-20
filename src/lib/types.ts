// 既存の型定義を以下に更新

export interface Notice {
    id: string;
    title: string;
    content: string;
    startDate?: string;  // 🆕 オプショナルに変更
    endDate?: string;    // 🆕 オプショナルに変更
    isPermanent?: boolean; // 🆕 永続表示フラグ追加
    createdAt: string;
}

export interface Campaign {
    id: string;
    title: string;
    formUrl?: string;
    sheetUrl: string;
    status: 'draft' | 'active' | 'ended' | 'archived';
    startDate: string;
    endDate: string;
    fields?: FormField[];
    createdAt: string;
}

export interface Applicant {
    id: string;
    campaignId?: string;
    name: string; // Web3ネーム（ニックネーム可）
    reason?: string; // 支援理由
    amount?: string; // 正規化済み希望金額（カンマ区切り）
    sns?: string; // SNSアカウント
    detailedReason?: string; // 詳細な使用用途
    thoughts?: string; // 応募への想い
    timestamp?: string; // 申請日時
    voteCount?: number;
    weightedVoteScore?: number; // 🆕 重み付き投票スコア
    basicVoteCount?: number; // 🆕 基本ページからの投票数
    premiumVoteCount?: number; // 🆕 プレミアムページからの投票数
    youtubeOptInCount?: number; // 🆕 YouTube出演希望数
    [key: string]: unknown; // 動的フィールド対応
}

export interface FormField {
    key: string;
    displayName: string;
    type: 'text' | 'email' | 'textarea' | 'number' | 'date';
    visible: boolean;
    order: number;
}

// 🆕 認証関連の型定義
export interface User {
    id: string;
    financeId: string;
    email: string;
    name: string;
    createdAt: string;
    lastLoginAt: string;
    isNewUser?: boolean;
}

export interface UserVote {
    id: string;
    financeId: string;
    email: string;
    campaignId: string;
    applicantId: string;
    votedAt: string;
    votePage: 'basic' | 'premium'; // 🆕 投票したページ（基本 or プレミアム）
    voteWeight: number; // 🆕 投票の重み（basic: 1, premium: 5）
    youtubeOptIn?: boolean; // 🆕 YouTube出演選択（プレミアムページのみ）
}

export interface CampaignSettings {
    campaignId: string;
    allowMultipleVotes: boolean;
    maxVotesPerUser: number;
    createdAt?: string;
    enableTwoPageVoting?: boolean; // 🆕 2ページ投票システムの有効化
    basicPageWeight?: number; // 🆕 基本ページの投票重み（デフォルト: 1）
    premiumPageWeight?: number; // 🆕 プレミアムページの投票重み（デフォルト: 5）
}

export interface VoteEligibilityCheck {
    canVote: boolean;
    reason?: string;
    remainingVotes?: number;
}

// 🆕 認証フォーム用の型
export interface AuthForm {
    financeId: string;
    email: string;
    name: string;
}

// 🆕 投票モーダルの状態管理
export interface VoteModalState {
    isOpen: boolean;
    applicant: Applicant | null;
    loading: boolean;
    error: string | null;
}

// API レスポンス型
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp?: string;
}

export interface ConnectionTestResult {
    success: boolean;
    message: string;
    data?: {
        sheetName: string;
        rowCount: number;
        headers: string[];
    };
    guide?: {
        title: string;
        steps: string[];
    };
}

export interface FormFieldsResult {
    success: boolean;
    fields?: FormField[];
    message?: string;
}

// 🆕 認証API関連のレスポンス型
export interface RegisterLoginResponse {
    id: string;
    financeId: string;
    email: string;
    name: string;
    isNewUser: boolean;
}

export interface AuthenticatedVoteResponse {
    success: true;
    voteId: string;
}

// 🆕 統計データ（認証対応版）
export interface SystemStats {
    notices: number;
    campaigns: number;
    votes: number;
    users: number;
    userVotes: number;
    campaignSettings: number;
    lastUpdated: string;
}

// 🆕 投票カード用のプロパティ
export interface VotingCardProps {
    applicant: Applicant;
    campaignId: string;
    rank: number;
    onVoteSuccess: () => void;
    votePage?: 'basic' | 'premium'; // 🆕 どのページから投票するか
    showWeightedScore?: boolean; // 🆕 重み付きスコアを表示するか
}

// 🆕 YouTube出演選択モーダル用
export interface YouTubeOptInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (optIn: boolean) => void;
    applicantName: string;
}

// 🆕 ユーザーセッションキャッシュ
export interface UserSessionCache {
    financeId: string;
    email: string;
    name: string;
    cachedAt: number; // タイムスタンプ
}

// 🆕 プライベート投票システム関連型定義
export interface PrivateVoteData {
    id: string;
    financeId: string;
    email: string;
    name: string;
    campaignId: string;
    applicantId: string;
    votePage: 'basic' | 'premium';
    voteWeight: number; // バックエンドでのみ使用、フロントエンドには非送信
    youtubeOptIn: boolean;
    timestamp: string;
    ipHash?: string; // セキュリティ用IPハッシュ
    sessionId?: string; // セッション識別用
}

export interface PrivateVoteRequest {
    financeId: string;
    email: string;
    name: string;
    campaignId: string;
    applicantId: string;
    votePage: 'basic' | 'premium';
    youtubeOptIn?: boolean;
}

export interface PrivateVoteResponse {
    success: boolean;
    voteId?: string;
    message: string;
    // 重み情報は絶対に含めない
}

export interface PrivateVoteAggregation {
    [applicantId: string]: {
        totalVotes: number;
        weightedScore: number; // 管理者専用
        basicVotes: number;
        premiumVotes: number;
        youtubeOptIns: number;
    };
}

export interface PrivateConnectionTestResult {
    status: 'ok' | 'error';
    message: string;
    timestamp: string;
    features?: string[];
    note?: string;
    error?: string;
}

// 🆕 重複投票チェック結果
export interface DuplicateVoteCheck {
    isDuplicate: boolean;
    reason?: string;
    existingVotePage?: 'basic' | 'premium';
}

// 🆕 投票セキュリティ設定
export interface VoteSecurityConfig {
    enableIPValidation: boolean;
    enableSessionTracking: boolean;
    maxVotesPerSession: number;
    enableEmailDomainRestriction: boolean;
    allowedEmailDomains: string[];
    enableTimestampValidation: boolean;
    voteTimeWindowMinutes: number;
}

// 🆕 管理者専用投票データ
export interface AdminVoteDataResponse {
    success: boolean;
    totalVotes: number;
    aggregation: PrivateVoteAggregation;
    securityFlags?: {
        suspiciousVotes: number;
        duplicateAttempts: number;
        invalidEmails: number;
    };
}

// エラー型
export interface ApiError extends Error {
    status?: number;
    code?: string;
}
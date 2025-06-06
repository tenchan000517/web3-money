import axios from 'axios';
import { Notice, Campaign, Applicant, ConnectionTestResult, FormFieldsResult } from './types';
import {
    User,
    UserVote,
    CampaignSettings,
    VoteEligibilityCheck,
    RegisterLoginResponse,
    AuthenticatedVoteResponse,
    SystemStats
} from './types';

// 🚨 緊急修正：強制的にAPIルートを使用
const API_BASE_URL = '/api/gas';

console.log('🔧 Emergency API Fix Active - Version 2');
console.log('🚀 API_BASE_URL forced to:', API_BASE_URL);
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('🌍 NEXT_PUBLIC_GAS_API_URL:', process.env.NEXT_PUBLIC_GAS_API_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// リクエストログ
api.interceptors.request.use(
    (config) => {
        const fullUrl = `${config.baseURL}${config.url}`;
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${fullUrl}`);
        console.log('📦 Config:', {
            baseURL: config.baseURL,
            url: config.url,
            method: config.method
        });

        // 緊急チェック：直接GASにアクセスしていないか確認
        if (fullUrl.includes('script.google.com')) {
            console.error('🚨 CRITICAL: Still accessing Google Apps Script directly!');
            console.error('🚨 URL:', fullUrl);
            alert('🚨 エラー: まだ直接Google Apps Scriptにアクセスしています。開発者に連絡してください。');
        } else {
            console.log('✅ Good: Using Next.js API Route');
        }

        return config;
    },
    (error) => {
        console.error('📡 Request Error:', error);
        return Promise.reject(error);
    }
);

// レスポンスログ
api.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status}`, response.data);
        return response;
    },
    (error) => {
        console.error('❌ API Response Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
            fullUrl: `${error.config?.baseURL}${error.config?.url}`
        });
        return Promise.reject(error);
    }
);

// エラーハンドリング用のヘルパー関数
const handleApiResponse = <T>(response: { data: unknown }): T => {
    const data = response.data as Record<string, unknown>;

    console.log('🔍 Handling API response:', data);

    if (data.success) {
        return data.data as T;
    }

    const errorMsg = (data.error as string) || (data.message as string) || 'API request failed';
    console.error('❌ API Error:', errorMsg);
    throw new Error(errorMsg);
};

// お知らせAPI
export const getNotices = async (): Promise<Notice[]> => {
    console.log('🔄 getNotices called');
    const response = await api.get('?path=notices');
    return handleApiResponse(response);
};

export const createNotice = async (notice: Omit<Notice, 'id' | 'createdAt'>): Promise<Notice> => {
    console.log('🔄 createNotice called:', notice);
    const response = await api.post('?path=notices', notice);
    return handleApiResponse(response);
};

export const updateNotice = async (id: string, notice: Omit<Notice, 'id' | 'createdAt'>): Promise<Notice> => {
    console.log('🔄 updateNotice called:', { id, notice });
    const response = await api.put(`?path=notices&id=${id}`, notice);
    return handleApiResponse(response);
};

export const deleteNotice = async (id: string): Promise<void> => {
    console.log('🔄 deleteNotice called:', id);
    const response = await api.delete(`?path=notices&id=${id}`);
    handleApiResponse(response);
};

// キャンペーンAPI
export const getCampaigns = async (status?: string): Promise<Campaign[]> => {
    console.log('🔄 getCampaigns called:', { status });
    const url = status ? `?path=campaigns&status=${status}` : '?path=campaigns';
    const response = await api.get(url);
    return handleApiResponse(response);
};

export const getCampaign = async (id: string): Promise<Campaign & { applicants: Applicant[] }> => {
    console.log('🔄 getCampaign called:', { id });
    const response = await api.get(`?path=campaign&id=${id}`);
    return handleApiResponse(response);
};

export const createCampaign = async (campaign: Omit<Campaign, 'id' | 'createdAt' | 'status'>): Promise<Campaign> => {
    console.log('🔄 createCampaign called:', campaign);
    const response = await api.post('?path=campaigns', campaign);
    return handleApiResponse(response);
};

export const updateCampaignStatus = async (id: string, status: Campaign['status']): Promise<void> => {
    console.log('🔄 updateCampaignStatus called:', { id, status });
    const response = await api.put(`?path=campaigns&id=${id}`, { status });
    handleApiResponse(response);
};

// 投票API
export const addVote = async (campaignId: string, applicantId: string): Promise<void> => {
    console.log('🔄 addVote called:', { campaignId, applicantId });
    const response = await api.post('?path=votes', { campaignId, applicantId });
    handleApiResponse(response);
};

// フォーム連携API（緊急修正版）
export const testFormConnection = async (sheetUrl: string): Promise<ConnectionTestResult> => {
    console.log('🔄 testFormConnection called:', { sheetUrl });
    console.log('🧪 This should use Next.js API Route, not Google Apps Script directly');

    try {
        const response = await api.post('?path=test-connection', { sheetUrl });
        console.log('🧪 testFormConnection response:', response.data);

        // 緊急対応：レスポンスを ConnectionTestResult 形式に変換
        const data = response.data;
        if (data.success) {
            return {
                success: true,
                message: data.data?.message || data.data?.status || 'Connection successful',
                data: data.data
            };
        } else {
            return {
                success: false,
                message: data.error || data.message || 'Connection failed'
            };
        }
    } catch (error) {
        console.error('🧪 testFormConnection error:', error);
        return {
            success: false,
            message: 'Connection test failed: ' + (error as Error).message
        };
    }
};

export const getFormFields = async (sheetUrl: string): Promise<FormFieldsResult> => {
    console.log('🔄 getFormFields called:', { sheetUrl });
    const response = await api.post('?path=form-fields', { sheetUrl });
    return handleApiResponse(response);
};

// 🆕 認証API関数群

/**
 * ユーザー登録・ログイン
 */
export const registerOrLoginUser = async (
    financeId: string,
    email: string,
    name: string
): Promise<RegisterLoginResponse> => {
    console.log('🔄 registerOrLoginUser called:', { financeId, email, name });
    const response = await api.post('?path=register-login', { financeId, email, name });
    return handleApiResponse(response);
};

/**
 * ユーザー情報取得
 */
export const getUserByFinanceId = async (financeId: string): Promise<User | null> => {
    console.log('🔄 getUserByFinanceId called:', { financeId });
    const response = await api.get(`?path=user&financeId=${financeId}`);
    return handleApiResponse(response);
};

/**
 * ユーザーの投票履歴取得
 */
export const getUserVoteHistory = async (
    financeId: string,
    campaignId?: string
): Promise<UserVote[]> => {
    console.log('🔄 getUserVoteHistory called:', { financeId, campaignId });
    const url = campaignId
        ? `?path=user-votes&financeId=${financeId}&campaignId=${campaignId}`
        : `?path=user-votes&financeId=${financeId}`;
    const response = await api.get(url);
    return handleApiResponse(response);
};

/**
 * 投票可能性チェック
 */
export const canUserVote = async (
    financeId: string,
    campaignId: string,
    applicantId: string
): Promise<VoteEligibilityCheck> => {
    console.log('🔄 canUserVote called:', { financeId, campaignId, applicantId });
    const response = await api.post('?path=can-vote', { financeId, campaignId, applicantId });
    return handleApiResponse(response);
};

/**
 * 認証付き投票
 */
export const addAuthenticatedVote = async (
    financeId: string,
    email: string,
    name: string,
    campaignId: string,
    applicantId: string,
    votePage: 'basic' | 'premium' = 'basic', // 🆕 投票ページパラメータ（基本 or プレミアム）
    youtubeOptIn?: boolean // 🆕 YouTube出演選択（プレミアムページのみ）
): Promise<AuthenticatedVoteResponse> => {
    console.log('🔄 addAuthenticatedVote called:', {
        financeId,
        email,
        name,
        campaignId,
        applicantId,
        votePage, // 🆕 ログに追加
        youtubeOptIn // 🆕 YouTube出演選択もログに追加
    });
    const response = await api.post('?path=authenticated-vote', {
        financeId,
        email,
        name,
        campaignId,
        applicantId,
        votePage, // 🆕 リクエストボディに追加
        youtubeOptIn // 🆕 YouTube出演選択もリクエストに追加
    });
    return handleApiResponse(response);
};

/**
 * キャンペーン設定取得
 */
export const getCampaignSettings = async (campaignId: string): Promise<CampaignSettings> => {
    console.log('🔄 getCampaignSettings called:', { campaignId });
    const response = await api.get(`?path=campaign-settings&campaignId=${campaignId}`);
    return handleApiResponse(response);
};

/**
 * 全キャンペーン設定取得（管理者用）
 */
export const getAllCampaignSettings = async (): Promise<CampaignSettings[]> => {
    console.log('🔄 getAllCampaignSettings called');
    const response = await api.get('?path=all-campaign-settings');
    return handleApiResponse(response);
};

/**
 * キャンペーン設定更新（管理者用）
 */
export const updateCampaignSettings = async (
    campaignId: string,
    allowMultipleVotes: boolean,
    maxVotesPerUser: number
): Promise<void> => {
    console.log('🔄 updateCampaignSettings called:', {
        campaignId,
        allowMultipleVotes,
        maxVotesPerUser
    });
    const response = await api.put(`?path=campaign-settings&campaignId=${campaignId}`, {
        allowMultipleVotes,
        maxVotesPerUser
    });
    handleApiResponse(response);
};

/**
 * 認証機能付きシステム統計取得
 */
export const getSystemStatsWithAuth = async (): Promise<SystemStats> => {
    console.log('🔄 getSystemStatsWithAuth called');
    const response = await api.get('?path=system-stats-auth');
    return handleApiResponse(response);
};

/**
 * 認証用シート初期化（開発・メンテナンス用）
 */
export const initializeAuthSheets = async (): Promise<void> => {
    console.log('🔄 initializeAuthSheets called');
    const response = await api.post('?path=initialize-auth-sheets');
    handleApiResponse(response);
};

// 🆕 ユーザーセッションキャッシュ管理
export class UserSessionManager {
    private static readonly CACHE_KEY = 'web3money_user_session';
    private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24時間

    /**
     * セッションキャッシュを保存
     */
    static saveUserSession(financeId: string, email: string, name: string): void {
        try {
            const sessionData = {
                financeId,
                email,
                name,
                cachedAt: Date.now()
            };

            // メモリ内キャッシュ（ページリロードで消える）
            if (typeof window !== 'undefined') {
                (window as unknown as Record<string, unknown>).__userSessionCache = sessionData;
            }

            console.log('💾 User session cached:', { financeId, email, name });
        } catch (error) {
            console.error('Failed to save user session:', error);
        }
    }

    /**
     * セッションキャッシュを取得
     */
    static getUserSession(): { financeId: string; email: string; name: string } | null {
        try {
            if (typeof window === 'undefined') return null;

            // 修正: anyをunknownに変更
            const cached = (window as unknown as { __userSessionCache?: unknown }).__userSessionCache;
            if (!cached) return null;

            const sessionData = cached as {
                financeId: string;
                email: string;
                name: string;
                cachedAt: number;
            };

            // キャッシュ期限チェック
            const now = Date.now();
            if (now - sessionData.cachedAt > this.CACHE_DURATION) {
                this.clearUserSession();
                return null;
            }

            console.log('📥 User session retrieved from cache:', {
                financeId: sessionData.financeId,
                email: sessionData.email,
                name: sessionData.name
            });

            return {
                financeId: sessionData.financeId,
                email: sessionData.email,
                name: sessionData.name
            };
        } catch (error) {
            console.error('Failed to get user session:', error);
            return null;
        }
    }

    /**
     * セッションキャッシュをクリア
     */
    static clearUserSession(): void {
        try {
            if (typeof window !== 'undefined') {
                // 修正: anyをunknownに変更
                delete (window as unknown as { __userSessionCache?: unknown }).__userSessionCache;
            }
            console.log('🗑️ User session cache cleared');
        } catch (error) {
            console.error('Failed to clear user session:', error);
        }
    }
    /**
     * セッションが有効かチェック
     */
    static hasValidSession(): boolean {
        return this.getUserSession() !== null;
    }
}

// リトライ機能付きAPI呼び出し
export const apiWithRetry = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            console.log(`🔄 Retry attempt ${i + 1}/${maxRetries}`, error);
            if (i === maxRetries - 1) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
    throw new Error('Max retries exceeded');
};
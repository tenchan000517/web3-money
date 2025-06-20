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

/**
 * 読み取り専用GASから申請者データを直接取得（Googleフォームデータ）
 * 管理ダッシュボードをバイパスして実際のフォーム申請データを表示
 */
export const getApplicantsFromReadonlyGAS = async (): Promise<Applicant[]> => {
    console.log('🔄 getApplicantsFromReadonlyGAS called - 読み取り専用GAS直接呼び出し');
    
    const READONLY_GAS_URL = 'https://script.google.com/macros/s/AKfycbzqF7tHHQ9prKEA8jwwSQI0c90Ui3cUSKsG4_KVBjDpTeWi5K1Ejiux7k7INMgU_oI3/exec';
    
    try {
        console.log('📋 読み取り専用GASに直接接続:', READONLY_GAS_URL);
        
        // 読み取り専用GASの applicants エンドポイントを呼び出し
        const response = await axios.get(`${READONLY_GAS_URL}?path=applicants`, {
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('✅ 読み取り専用GAS レスポンス:', response.data);
        
        if (response.data && response.data.success && response.data.data) {
            const applicantsData = response.data.data.applicants || [];
            console.log(`✅ Googleフォーム申請者データ取得成功: ${applicantsData.length}名`);
            console.log('🔍 生データ構造確認:', applicantsData[0]); // 最初のデータ構造をログ出力
            
            // データ構造を既存のApplicant型に変換（実際のフィールド名に基づく）
            const convertedApplicants = applicantsData.map((applicant: Record<string, unknown>, index: number) => {
                // 実際のフィールド名を確認してマッピング
                console.log(`📋 申請者${index + 1}の全フィールド:`, Object.keys(applicant));
                
                // 正確なフィールド名マッピング（Web3ネーム対応）
                // 全てのフィールドキーを確認
                const allKeys = Object.keys(applicant);
                console.log(`👤 申請者${index + 1}の全キー:`, allKeys);
                
                // 名前フィールドを様々なパターンで検索
                let name = '';
                const namePatterns = [
                    'お名前（ニックネーム可）',
                    'おなまえニックネーム可',
                    'お名前',
                    'name',
                    '名前'
                ];
                
                // 完全一致を試行
                for (const pattern of namePatterns) {
                    if (applicant[pattern]) {
                        name = applicant[pattern];
                        console.log(`✅ 名前フィールド発見 (${pattern}):`, name);
                        break;
                    }
                }
                
                // 完全一致が見つからない場合、部分一致を試行
                if (!name) {
                    for (const key of allKeys) {
                        if (key.includes('名前') || key.includes('ニックネーム') || key.toLowerCase().includes('name')) {
                            name = applicant[key];
                            console.log(`⚠️ 名前フィールド部分一致発見 (${key}):`, name);
                            break;
                        }
                    }
                }
                
                // それでも見つからない場合はデフォルト
                if (!name) {
                    name = `申請者${index + 1}`;
                    console.log(`❌ 名前フィールドが見つからないためデフォルト使用:`, name);
                }
                
                const reason = applicant['支援金使用用途（できるだけ簡潔に記載ください）'] ||
                             applicant['支援金使用用途できるだけ簡潔に記載ください'] || 
                             applicant['用途'] || 
                             applicant['理由'] || 
                             applicant['reason'] || '';
                
                const rawAmount = applicant['出資希望額'] || 
                                applicant['希望額'] || 
                                applicant['金額'] || 
                                applicant['amount'] || '';
                
                // 金額の正規化処理
                const normalizeAmount = (amountStr: string): string => {
                    if (!amountStr) return '';
                    
                    console.log('💰 金額正規化前:', amountStr);
                    
                    // 全角数字を半角数字に変換
                    const convertFullWidthToHalf = (str: string): string => {
                        return str.replace(/[０-９]/g, (s) => {
                            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
                        });
                    };
                    
                    let str = amountStr.toString().toLowerCase();
                    str = convertFullWidthToHalf(str); // 全角→半角変換
                    console.log('💰 全角→半角変換後:', str);
                    
                    let finalAmount = 0;
                    
                    // 万円の処理
                    if (str.includes('万')) {
                        // 「10万円」「250万円」等
                        const beforeMan = str.split('万')[0];
                        const numStr = beforeMan.replace(/[^0-9]/g, '');
                        console.log('💰 万円処理 - 抽出数値:', numStr);
                        const manNum = parseInt(numStr);
                        if (!isNaN(manNum)) {
                            finalAmount = manNum * 10000;
                            console.log('💰 万円処理 - 最終金額:', finalAmount);
                        }
                    } 
                    // 通常の数値（「50,000円」等）
                    else {
                        const numStr = str.replace(/[^0-9]/g, '');
                        console.log('💰 通常処理 - 抽出数値:', numStr);
                        const num = parseInt(numStr);
                        if (!isNaN(num)) {
                            finalAmount = num;
                            console.log('💰 通常処理 - 最終金額:', finalAmount);
                        }
                    }
                    
                    const result = finalAmount > 0 ? finalAmount.toLocaleString() : amountStr;
                    console.log('💰 金額正規化後:', result);
                    return result;
                };
                
                const sns = applicant['SNSアカウントについて'] ||
                          applicant['snsアカウントについて'] || 
                          applicant['SNS'] || '';
                          
                const detailedReason = applicant['支援金使用用途についてできるだけ詳細にご記載ください（50,000文字以内）'] ||
                                     applicant['支援金使用用途についてできるだけ詳細にご記載ください50000文字以内'] ||
                                     applicant['詳細用途'] || '';
                                     
                const thoughts = applicant['最後にあなたが今回の応募にかける想いをお好きなだけ記載ください。（50,000文字以内）'] ||
                               applicant['最後にあなたが今回の応募にかける想いをお好きなだけ記載ください50000文字以内'] ||
                               applicant['想い'] || '';
                
                return {
                    id: applicant.id || `readonly_${index}`,
                    name: name,
                    reason: reason,
                    amount: normalizeAmount(rawAmount),
                    sns: sns,
                    detailedReason: detailedReason,
                    thoughts: thoughts,
                    voteCount: 0,
                    timestamp: applicant['タイムスタンプ'] || applicant['timestamp'] || ''
                };
            });
            
            console.log('🔄 変換済み申請者データ:', convertedApplicants);
            return convertedApplicants;
        }
        
        console.log('⚠️ 読み取り専用GASからデータが取得できませんでした');
        return [];
        
    } catch (error) {
        console.error('❌ 読み取り専用GAS接続エラー:', error);
        throw new Error(`読み取り専用GASからの申請者データ取得に失敗: ${(error as Error).message}`);
    }
};

// 🆕 ユーザーセッションキャッシュ管理
export class UserSessionManager {
    // private static readonly CACHE_KEY = 'web3money_user_session';
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
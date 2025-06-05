import axios from 'axios';
import { Notice, Campaign, Applicant, ApiResponse, ConnectionTestResult, FormFieldsResult } from './types';

// 開発環境では内部プロキシを使用、本番環境では直接GAS URLを使用
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? '/api/gas'  // Next.js内部プロキシ経由
  : process.env.NEXT_PUBLIC_GAS_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// エラーハンドリング用のヘルパー関数
const handleApiResponse = <T>(response: { data: ApiResponse<T> }): T => {
  if (response.data.success) {
    return response.data.data!;
  }
  throw new Error(response.data.error || response.data.message || 'API request failed');
};

// お知らせAPI
export const getNotices = async (): Promise<Notice[]> => {
  const response = await api.get<ApiResponse<Notice[]>>('?path=notices');
  return handleApiResponse(response);
};

export const createNotice = async (notice: Omit<Notice, 'id' | 'createdAt'>): Promise<Notice> => {
  const response = await api.post<ApiResponse<Notice>>('?path=notices', notice);
  return handleApiResponse(response);
};

export const updateNotice = async (id: string, notice: Omit<Notice, 'id' | 'createdAt'>): Promise<Notice> => {
  const response = await api.put<ApiResponse<Notice>>(`?path=notices&id=${id}`, notice);
  return handleApiResponse(response);
};

export const deleteNotice = async (id: string): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>(`?path=notices&id=${id}`);
  handleApiResponse(response);
};

// キャンペーンAPI
export const getCampaigns = async (status?: string): Promise<Campaign[]> => {
  const url = status ? `?path=campaigns&status=${status}` : '?path=campaigns';
  const response = await api.get<ApiResponse<Campaign[]>>(url);
  return handleApiResponse(response);
};

export const getCampaign = async (id: string): Promise<Campaign & { applicants: Applicant[] }> => {
  const response = await api.get<ApiResponse<Campaign & { applicants: Applicant[] }>>(`?path=campaign&id=${id}`);
  return handleApiResponse(response);
};

export const createCampaign = async (campaign: Omit<Campaign, 'id' | 'createdAt' | 'status'>): Promise<Campaign> => {
  const response = await api.post<ApiResponse<Campaign>>('?path=campaigns', campaign);
  return handleApiResponse(response);
};

export const updateCampaignStatus = async (id: string, status: Campaign['status']): Promise<void> => {
  const response = await api.put<ApiResponse<void>>(`?path=campaigns&id=${id}`, { status });
  handleApiResponse(response);
};

// 投票API
export const addVote = async (campaignId: string, applicantId: string): Promise<void> => {
  const response = await api.post<ApiResponse<void>>('?path=votes', { campaignId, applicantId });
  handleApiResponse(response);
};

// フォーム連携API
export const testFormConnection = async (sheetUrl: string): Promise<ConnectionTestResult> => {
  const response = await api.post<ApiResponse<ConnectionTestResult>>('?path=test-connection', { sheetUrl });
  return handleApiResponse(response);
};

export const getFormFields = async (sheetUrl: string): Promise<FormFieldsResult> => {
  const response = await api.post<ApiResponse<FormFieldsResult>>('?path=form-fields', { sheetUrl });
  return handleApiResponse(response);
};

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
      if (i === maxRetries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
};
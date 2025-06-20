/**
 * WEB3 MONEY システム - 読み取り専用APIハブ
 * Googleフォーム申請データ専用読み取りGAS
 * 
 * 役割: 申請データの読み取り専用APIを提供
 * 対象: Googleフォームで送信された申請者データ
 * 権限: 読み取りのみ（書き込み不可）
 */

// 読み取り専用スプレッドシート設定
// getActiveSpreadsheet()を使用するためID設定は不要

// WebApp エンドポイント - GET
function doGet(e) {
  try {
    console.log('[READONLY] doGet called with params:', e?.parameter);
    const params = e && e.parameter ? e.parameter : {};
    return handleReadOnlyRequest('GET', params);
  } catch (error) {
    console.error('[READONLY] doGet Error:', error);
    return createReadOnlyErrorResponse(error.toString());
  }
}

// WebApp エンドポイント - POST
function doPost(e) {
  try {
    console.log('[READONLY] doPost called with params:', e?.parameter);
    const params = e && e.parameter ? e.parameter : {};
    let data = {};
    
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
        console.log('[READONLY] Received POST data:', data);
      } catch (parseError) {
        console.error('[READONLY] Failed to parse POST data:', parseError);
        data = {};
      }
    }
    
    const method = params.method || 'POST';
    return handleReadOnlyRequest(method, params, data);
  } catch (error) {
    console.error('[READONLY] doPost Error:', error);
    return createReadOnlyErrorResponse(error.toString());
  }
}

/**
 * 読み取り専用リクエスト処理のメインハンドラー
 */
function handleReadOnlyRequest(method, params, data = null) {
  try {
    let result;
    const path = params.path || '';
    
    console.log(`[READONLY] API Request: ${method}:${path}`, { params, data });
    
    // 読み取り専用APIエンドポイントのルーティング
    const endpoint = `${method}:${path}`;
    
    switch(endpoint) {
      // ヘルスチェック・接続テスト
      case 'GET:health':
      case 'POST:test-connection':
        result = testReadOnlyConnection();
        break;
        
      // 申請者データ取得（読み取り専用）
      case 'GET:applicants':
        result = getApplicantsData(params.campaignId);
        break;
        
      // フォームフィールド検出
      case 'POST:form-fields':
        result = detectFormFields();
        break;
        
      // シート情報取得
      case 'GET:sheet-info':
        result = getSheetInfo();
        break;
        
      // 申請統計取得
      case 'GET:applicant-stats':
        result = getApplicantStats();
        break;
        
      default:
        throw new Error(`[READONLY] Invalid endpoint: ${endpoint}. Available endpoints: health, applicants, form-fields, sheet-info, applicant-stats`);
    }
    
    console.log(`[READONLY] API Success: ${endpoint}`, result);
    
    return createReadOnlySuccessResponse(result);
    
  } catch (error) {
    console.error(`[READONLY] API Error for ${method}:${params.path}:`, error);
    return createReadOnlyErrorResponse(error.toString(), error.message);
  }
}

/**
 * 読み取り専用接続テスト
 */
function testReadOnlyConnection() {
  try {
    console.log('[READONLY] Testing connection to readonly spreadsheet');
    
    // スプレッドシート接続テスト
    const sheet = getReadOnlySheet();
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    const result = {
      status: 'ok',
      message: '読み取り専用スプレッドシート接続成功',
      timestamp: getCurrentTimestamp(),
      sheetInfo: {
        name: sheet.getName(),
        rowCount: values.length,
        columnCount: values.length > 0 ? values[0].length : 0,
        hasHeaders: values.length > 0,
        headers: values.length > 0 ? values[0] : []
      },
      capabilities: [
        '申請者データ読み取り',
        'フォームフィールド検出',
        '統計データ提供',
        'APIハブ機能'
      ]
    };
    
    console.log('[READONLY] Connection test successful:', result);
    return result;
    
  } catch (error) {
    console.error('[READONLY] Connection test failed:', error);
    throw new Error('読み取り専用スプレッドシートへの接続に失敗しました: ' + error.toString());
  }
}

/**
 * 申請者データ取得（読み取り専用）
 */
function getApplicantsData(campaignId) {
  try {
    console.log('[READONLY] Getting applicants data for campaign:', campaignId);
    
    const sheet = getReadOnlySheet();
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length <= 1) {
      return {
        applicants: [],
        totalCount: 0,
        message: '申請データが見つかりません'
      };
    }
    
    const headers = values[0];
    const applicants = [];
    
    // データ行を処理
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const applicant = {};
      
      // ヘッダーに基づいてデータをマッピング
      headers.forEach((header, index) => {
        const key = normalizeFieldKey(header);
        applicant[key] = row[index] || '';
      });
      
      // 必須フィールドが存在する場合のみ追加
      if (applicant.name || applicant.お名前 || applicant.申請者名) {
        applicant.id = generateApplicantId(i);
        applicant.rowIndex = i;
        applicants.push(applicant);
      }
    }
    
    console.log(`[READONLY] Retrieved ${applicants.length} applicants`);
    
    return {
      applicants: applicants,
      totalCount: applicants.length,
      headers: headers,
      lastUpdated: getCurrentTimestamp()
    };
    
  } catch (error) {
    console.error('[READONLY] Failed to get applicants data:', error);
    throw new Error('申請者データの取得に失敗しました: ' + error.toString());
  }
}

/**
 * フォームフィールド検出
 */
function detectFormFields() {
  try {
    console.log('[READONLY] Detecting form fields');
    
    const sheet = getReadOnlySheet();
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length === 0) {
      throw new Error('スプレッドシートにデータがありません');
    }
    
    const headers = values[0];
    const fields = [];
    
    headers.forEach((header, index) => {
      if (header && header.toString().trim() !== '') {
        const normalizedKey = normalizeFieldKey(header);
        const fieldType = detectFieldType(header, values, index);
        
        fields.push({
          key: normalizedKey,
          displayName: header.toString(),
          type: fieldType,
          visible: true,
          order: index + 1,
          columnIndex: index
        });
      }
    });
    
    console.log(`[READONLY] Detected ${fields.length} form fields`);
    
    return {
      fields: fields,
      totalFields: fields.length,
      detectedAt: getCurrentTimestamp()
    };
    
  } catch (error) {
    console.error('[READONLY] Failed to detect form fields:', error);
    throw new Error('フォームフィールドの検出に失敗しました: ' + error.toString());
  }
}

/**
 * シート情報取得
 */
function getSheetInfo() {
  try {
    console.log('[READONLY] Getting sheet information');
    
    const sheet = getReadOnlySheet();
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const info = {
      spreadsheetId: ss.getId(),
      sheetName: sheet.getName(),
      totalRows: values.length,
      totalColumns: values.length > 0 ? values[0].length : 0,
      dataRows: Math.max(0, values.length - 1),
      hasHeaders: values.length > 0,
      headers: values.length > 0 ? values[0] : [],
      lastModified: getCurrentTimestamp(),
      permissions: 'readonly',
      purpose: 'form-data-api-hub'
    };
    
    console.log('[READONLY] Sheet info retrieved:', info);
    return info;
    
  } catch (error) {
    console.error('[READONLY] Failed to get sheet info:', error);
    throw new Error('シート情報の取得に失敗しました: ' + error.toString());
  }
}

/**
 * 申請統計取得
 */
function getApplicantStats() {
  try {
    console.log('[READONLY] Getting applicant statistics');
    
    const applicantsData = getApplicantsData();
    const applicants = applicantsData.applicants;
    
    const stats = {
      totalApplicants: applicants.length,
      fieldsAnalysis: {},
      dataQuality: {
        completeRecords: 0,
        incompleteRecords: 0,
        emptyRecords: 0
      },
      generatedAt: getCurrentTimestamp()
    };
    
    // データ品質分析
    applicants.forEach(applicant => {
      const filledFields = Object.values(applicant).filter(value => 
        value && value.toString().trim() !== ''
      ).length;
      
      if (filledFields === 0) {
        stats.dataQuality.emptyRecords++;
      } else if (filledFields >= 3) { // 最低3フィールド埋まっていれば完全とみなす
        stats.dataQuality.completeRecords++;
      } else {
        stats.dataQuality.incompleteRecords++;
      }
    });
    
    console.log('[READONLY] Statistics generated:', stats);
    return stats;
    
  } catch (error) {
    console.error('[READONLY] Failed to get statistics:', error);
    throw new Error('統計データの取得に失敗しました: ' + error.toString());
  }
}

/**
 * ユーティリティ関数群
 */

// 読み取り専用スプレッドシート取得
function getReadOnlySheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    
    if (sheets.length === 0) {
      throw new Error('スプレッドシートにシートがありません');
    }
    
    // 最初のシートを使用（通常はForm responsesシート）
    return sheets[0];
    
  } catch (error) {
    console.error('[READONLY] Failed to get readonly sheet:', error);
    throw new Error('読み取り専用スプレッドシートの取得に失敗しました: ' + error.toString());
  }
}

// フィールドキー正規化
function normalizeFieldKey(header) {
  return header.toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9ぁ-んァ-ンー一-龯]/g, '')
    .substring(0, 50); // 最大50文字
}

// フィールドタイプ検出
function detectFieldType(header, values, columnIndex) {
  const headerLower = header.toString().toLowerCase();
  
  // ヘッダー名による判定
  if (headerLower.includes('email') || headerLower.includes('メール')) {
    return 'email';
  }
  if (headerLower.includes('date') || headerLower.includes('日付') || headerLower.includes('時刻')) {
    return 'date';
  }
  if (headerLower.includes('amount') || headerLower.includes('金額') || headerLower.includes('数量')) {
    return 'number';
  }
  if (headerLower.includes('reason') || headerLower.includes('理由') || headerLower.includes('詳細')) {
    return 'textarea';
  }
  
  // データの内容による判定
  if (values.length > 1) {
    const sampleValue = values[1][columnIndex];
    if (sampleValue && !isNaN(sampleValue)) {
      return 'number';
    }
  }
  
  return 'text'; // デフォルト
}

// 申請者ID生成
function generateApplicantId(rowIndex) {
  return `applicant_${rowIndex}_${Date.now().toString(36)}`;
}

// タイムスタンプ取得
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * レスポンス作成関数
 */
function createReadOnlySuccessResponse(data) {
  const response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);
  
  response.setContent(JSON.stringify({
    success: true,
    data: data,
    source: 'readonly-api-hub',
    timestamp: getCurrentTimestamp()
  }));
  
  return response;
}

function createReadOnlyErrorResponse(error, message = null) {
  const response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);
  
  response.setContent(JSON.stringify({
    success: false,
    error: error,
    message: message || 'An error occurred in readonly API',
    source: 'readonly-api-hub',
    timestamp: getCurrentTimestamp()
  }));
  
  return response;
}

/**
 * 開発用テスト関数
 */
function testReadOnlyAPI() {
  try {
    console.log('=== 読み取り専用API テスト ===');
    
    // 接続テスト
    console.log('1. 接続テスト');
    const connectionTest = testReadOnlyConnection();
    console.log('✅ 接続テスト成功:', connectionTest);
    
    // 申請者データ取得テスト
    console.log('2. 申請者データ取得テスト');
    const applicantsData = getApplicantsData();
    console.log('✅ 申請者データ取得成功:', applicantsData);
    
    // フォームフィールド検出テスト
    console.log('3. フォームフィールド検出テスト');
    const fieldsData = detectFormFields();
    console.log('✅ フィールド検出成功:', fieldsData);
    
    // 統計データ取得テスト
    console.log('4. 統計データ取得テスト');
    const statsData = getApplicantStats();
    console.log('✅ 統計データ取得成功:', statsData);
    
    console.log('🎉 全テスト成功！');
    return { success: true, message: '読み取り専用API全機能テスト完了' };
    
  } catch (error) {
    console.error('❌ テスト失敗:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * ログ出力用ヘルパー
 */
function logReadOnlyInfo(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[READONLY-INFO ${timestamp}] ${message}`, data || '');
}

function logReadOnlyError(message, error = null) {
  const timestamp = new Date().toISOString();
  console.error(`[READONLY-ERROR ${timestamp}] ${message}`, error || '');
}
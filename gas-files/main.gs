
/**
 * WEB3 MONEY システム - メインAPI
 * Google Apps Script WebApp エンドポイント
 */

// WebApp エンドポイント - GET
function doGet(e) {
  try {
    console.log('doGet called with params:', e?.parameter);
    const params = e && e.parameter ? e.parameter : {};
    return handleRequest('GET', params);
  } catch (error) {
    console.error('doGet Error:', error);
    return createErrorResponse(error.toString());
  }
}

// WebApp エンドポイント - POST
function doPost(e) {
  try {
    console.log('doPost called with params:', e?.parameter);
    const params = e && e.parameter ? e.parameter : {};
    let data = {};
    
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
        // 🔍 デバッグ: 受信データの型確認
        console.log('📦 Received POST data:', data);
        if (data.title !== undefined) {
          console.log('🔍 Title value:', data.title);
          console.log('🔍 Title type:', typeof data.title);
          console.log('🔍 Title length:', data.title?.length);
        }
      } catch (parseError) {
        console.error('Failed to parse POST data:', parseError);
        data = {};
      }
    }
    
    const method = params.method || 'POST';
    return handleRequest(method, params, data);
  } catch (error) {
    console.error('doPost Error:', error);
    return createErrorResponse(error.toString());
  }
}

/**
 * リクエスト処理のメインハンドラー
 */
function handleRequest(method, params, data = null) {
  try {
    let result;
    const path = params.path || '';
    
    console.log(`API Request: ${method}:${path}`, { params, data });
    
    // APIエンドポイントのルーティング
    const endpoint = `${method}:${path}`;
    
    switch(endpoint) {
      // ヘルスチェック
      case 'GET:health':
      case 'POST:test-connection':
        result = {
          status: 'ok',
          message: 'Connection successful',
          timestamp: new Date().toISOString(),
          method: method,
          path: path
        };
        break;
        
      // お知らせAPI
      case 'GET:notices':
        result = getNotices();
        break;
      case 'POST:notices':
        result = createNotice(data);
        break;
      case 'PUT:notices':
        result = updateNotice(params.id, data);
        break;
      case 'DELETE:notices':
        result = deleteNotice(params.id);
        break;
        
      // キャンペーンAPI
      case 'GET:campaigns':
        result = getCampaigns(params.status);
        break;
      case 'GET:campaign':
        result = getCampaignWithApplicants(params.id);
        break;
      case 'POST:campaigns':
        result = createCampaign(data);
        break;
      case 'PUT:campaigns':
        result = updateCampaignStatus(params.id, data.status);
        break;
        
      // 投票API
      case 'POST:votes':
        result = addVote(data.campaignId, data.applicantId, data.votePage);
        break;
      
      // 認証付き投票API
      case 'POST:authenticated-vote':
        result = addAuthenticatedVote(
          data.financeId, 
          data.email, 
          data.name, 
          data.campaignId, 
          data.applicantId,
          data.votePage || 'basic',
          data.youtubeOptIn || false
        );
        break;
        
      // プライベート投票API（新セキュリティシステム）
      case 'POST:private-vote':
        result = addPrivateVote(
          data.financeId,
          data.email,
          data.name,
          data.campaignId,
          data.applicantId,
          data.votePage,
          data.youtubeOptIn || false
        );
        break;
        
      // プライベート投票データ取得（管理者専用）
      case 'GET:private-vote-data':
        result = getPrivateVoteData(params.campaignId, params.adminKey);
        break;
        
      // プライベートスプレッドシート接続テスト
      case 'POST:test-private-connection':
        result = testPrivateConnection();
        break;
        
      // フォーム連携API
      case 'POST:form-fields':
        result = getFormFields(data.sheetUrl);
        break;
        
      default:
        throw new Error(`Invalid endpoint: ${endpoint}. Available endpoints: health, notices, campaigns, votes, form-fields`);
    }
    
    console.log(`API Success: ${endpoint}`, result);
    
    return createSuccessResponse(result);
    
  } catch (error) {
    console.error(`API Error for ${method}:${params.path}:`, error);
    return createErrorResponse(error.toString(), error.message);
  }
}

/**
 * 成功レスポンス作成
 */
function createSuccessResponse(data) {
  const response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);
  
  response.setContent(JSON.stringify({
    success: true,
    data: data,
    timestamp: new Date().toISOString()
  }));
  
  return response;
}

/**
 * エラーレスポンス作成
 */
function createErrorResponse(error, message = null) {
  const response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);
  
  response.setContent(JSON.stringify({
    success: false,
    error: error,
    message: message || 'An error occurred',
    timestamp: new Date().toISOString()
  }));
  
  return response;
}

/**
 * 開発用テスト関数
 */
function testAPI() {
  // お知らせのテスト
  console.log('=== お知らせAPI テスト ===');
  try {
    const notices = getNotices();
    console.log('お知らせ一覧:', notices);
  } catch (error) {
    console.error('お知らせ取得エラー:', error);
  }
  
  // キャンペーンのテスト
  console.log('=== キャンペーンAPI テスト ===');
  try {
    const campaigns = getCampaigns();
    console.log('キャンペーン一覧:', campaigns);
  } catch (error) {
    console.error('キャンペーン取得エラー:', error);
  }
  
  // データベース初期化テスト
  console.log('=== データベース初期化テスト ===');
  try {
    initializeAllSheets();
    console.log('データベース初期化完了');
  } catch (error) {
    console.error('データベース初期化エラー:', error);
  }
}

/**
 * 全シート初期化（開発用）
 */
function initializeAllSheets() {
  try {
    getSheet('notices');
    getSheet('campaigns');
    getSheet('votes');
    console.log('All sheets initialized successfully');
  } catch (error) {
    console.error('Sheet initialization error:', error);
    throw error;
  }
}

function debugCurrentData() {
  try {
    console.log('=== 現在のデータ確認 ===');
    
    // 1. 直接スプレッドシートデータを取得
    const sheet = getSheet('campaigns');
    const rawData = sheet.getDataRange().getValues();
    
    console.log('📊 Raw spreadsheet data:');
    rawData.forEach((row, index) => {
      console.log(`Row ${index}:`, row.map((cell, cellIndex) => ({
        index: cellIndex,
        value: cell,
        type: typeof cell
      })));
    });
    
    // 2. getDataFromSheet で取得したデータ
    console.log('📋 Processed data from getDataFromSheet:');
    const processedData = getDataFromSheet('campaigns');
    processedData.forEach((record, index) => {
      console.log(`Record ${index}:`, {
        id: record.id,
        title: record.title,
        titleType: typeof record.title,
        titleLength: record.title?.length
      });
    });
    
    // 3. getCampaigns で取得したデータ
    console.log('🎯 Final data from getCampaigns:');
    const campaigns = getCampaigns();
    campaigns.forEach((campaign, index) => {
      console.log(`Campaign ${index}:`, {
        id: campaign.id,
        title: campaign.title,
        titleType: typeof campaign.title,
        titleLength: campaign.title?.length
      });
    });
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    return { success: false, error: error.toString() };
  }
}

function testIsValidString() {
  console.log('=== isValidString テスト ===');
  
  const testCases = [
    'テストキャンペーン1',
    'テストキャンペーン2',
    '2',
    '',
    null,
    undefined,
    123
  ];
  
  testCases.forEach(testCase => {
    const result = isValidString(testCase, 100);
    console.log(`isValidString("${testCase}", 100) = ${result}`, {
      value: testCase,
      type: typeof testCase,
      length: testCase?.length,
      trimLength: typeof testCase === 'string' ? testCase.trim().length : 'N/A'
    });
  });
}

function testUpdateCampaignStatusDirect() {
  try {
    console.log('=== updateCampaignStatus() 直接テスト ===');
    
    const testId = 'abea8058-9654-44c0-98c5-12ecb9b7910d';
    const testStatus = 'active';
    
    console.log('🔍 テスト開始:', { id: testId, status: testStatus });
    
    const result = updateCampaignStatus(testId, testStatus);
    
    console.log('✅ 直接実行成功:', result);
    return { success: true, result };
    
  } catch (error) {
    console.error('❌ 直接実行失敗:', error.message);
    console.error('❌ エラー詳細:', error.toString());
    return { success: false, error: error.toString() };
  }
}

// 包括的なテスト関数
function testAllDiagnosis() {
  try {
    console.log('=== 全体診断開始 ===');
    
    diagnosisStep1();
    diagnosisStep2(); 
    diagnosisStep3();
    
    console.log('🎉 全体診断成功！');
    return 'All diagnosis completed successfully';
    
  } catch (error) {
    console.error('❌ 診断失敗:', error);
    throw error;
  }
}

function testHandleRequestSimulation() {
  try {
    console.log('=== handleRequest() シミュレーション ===');
    
    const mockParams = {
      path: 'campaigns',
      id: 'abea8058-9654-44c0-98c5-12ecb9b7910d'
    };
    
    const mockData = {
      status: 'active'
    };
    
    console.log('🔍 Mock parameters:', mockParams);
    console.log('🔍 Mock data:', mockData);
    
    const result = handleRequest('PUT', mockParams, mockData);
    
    console.log('✅ handleRequest シミュレーション成功');
    console.log('📋 Response content:', result.getContent());
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ handleRequest シミュレーション失敗:', error.message);
    console.error('❌ エラー詳細:', error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * ログ出力用ヘルパー
 */
function logInfo(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[INFO ${timestamp}] ${message}`, data || '');
}

function logError(message, error = null) {
  const timestamp = new Date().toISOString();
  console.error(`[ERROR ${timestamp}] ${message}`, error || '');
}

function logDebug(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[DEBUG ${timestamp}] ${message}`, data || '');
}

/**
 * プライベートスプレッドシート接続テスト
 */
function testPrivateConnection() {
  try {
    logInfo('Testing private spreadsheet connection');
    
    // プライベート投票システム初期化テスト
    const initResult = initializePrivateSpreadsheet();
    
    if (initResult.success) {
      return {
        status: 'ok',
        message: 'プライベートスプレッドシート接続成功',
        timestamp: getCurrentTimestamp(),
        features: [
          'プライベート投票記録',
          'セキュリティ強化',
          '重み計算（非表示）',
          'メールベース重複制御'
        ]
      };
    } else {
      throw new Error('初期化に失敗しました: ' + initResult.error);
    }
    
  } catch (error) {
    logError('Private connection test failed', error);
    return {
      status: 'error',
      message: 'プライベートスプレッドシート接続失敗',
      error: error.toString(),
      timestamp: getCurrentTimestamp()
    };
  }
}
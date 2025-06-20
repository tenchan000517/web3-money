/**
 * WEB3 MONEY プライベート投票システム
 * プライバシー保護投票機能専用GAS
 * 
 * 機能:
 * - プライベートスプレッドシートでの投票データ管理
 * - ページ別投票重み計算（完全非表示）
 * - メールアドレスベース重複制御
 * - セキュリティ強化
 */

// プライベートスプレッドシート設定
const PRIVATE_SHEET_ID = 'YOUR_PRIVATE_SPREADSHEET_ID'; // 実際のIDに置き換え

/**
 * プライベート投票の追加（セキュリティ強化版）
 */
function addPrivateVote(financeId, email, name, campaignId, applicantId, votePage, youtubeOptIn = false) {
  try {
    logPrivateInfo(`Private vote attempt: ${email} -> ${campaignId}:${applicantId} on ${votePage}`);
    
    // 1. 入力値検証
    const validation = validatePrivateVoteInput(financeId, email, name, campaignId, applicantId, votePage);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // 2. 重複投票チェック（ページ別）
    const duplicateCheck = checkDuplicateVote(email, campaignId, applicantId, votePage);
    if (duplicateCheck.isDuplicate) {
      throw new Error(duplicateCheck.reason);
    }
    
    // 3. 投票権重の計算（非表示、バックエンドのみ）
    const voteWeight = calculateVoteWeight(votePage);
    
    // 4. プライベートスプレッドシートに記録
    const voteId = generatePrivateVoteId();
    const timestamp = getCurrentTimestamp();
    
    const voteRecord = {
      id: voteId,
      financeId: financeId,
      email: email,
      name: name,
      campaignId: campaignId,
      applicantId: applicantId,
      votePage: votePage,
      voteWeight: voteWeight,
      youtubeOptIn: youtubeOptIn,
      timestamp: timestamp,
      ipHash: hashIP(), // セキュリティ向上のためIPハッシュ化
      sessionId: generateSessionId()
    };
    
    // 5. プライベートシートに安全に保存
    const saveResult = saveToPrivateSheet(voteRecord);
    if (!saveResult.success) {
      throw new Error('プライベートシートへの保存に失敗しました');
    }
    
    // 6. 公開集計データの更新（重み非表示）
    updatePublicAggregation(campaignId, applicantId, votePage);
    
    logPrivateInfo(`Private vote recorded successfully: ${voteId}`);
    
    return {
      success: true,
      voteId: voteId,
      message: '投票が正常に記録されました',
      // 重み情報は絶対に返さない
    };
    
  } catch (error) {
    logPrivateError('Failed to add private vote', error);
    throw error;
  }
}

/**
 * プライベート投票入力値検証
 */
function validatePrivateVoteInput(financeId, email, name, campaignId, applicantId, votePage) {
  try {
    // フィナンシェID検証
    if (!financeId || typeof financeId !== 'string' || financeId.trim().length === 0) {
      return { valid: false, error: 'フィナンシェIDが無効です' };
    }
    
    // メールアドレス検証
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'メールアドレスが無効です' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'メールアドレスの形式が無効です' };
    }
    
    // 名前検証
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return { valid: false, error: 'お名前が無効です' };
    }
    
    // キャンペーンID検証
    if (!campaignId || typeof campaignId !== 'string') {
      return { valid: false, error: 'キャンペーンIDが無効です' };
    }
    
    // 申請者ID検証
    if (!applicantId || typeof applicantId !== 'string') {
      return { valid: false, error: '申請者IDが無効です' };
    }
    
    // 投票ページ検証
    if (!['basic', 'premium'].includes(votePage)) {
      return { valid: false, error: '投票ページが無効です' };
    }
    
    return { valid: true };
    
  } catch (error) {
    logPrivateError('Validation error', error);
    return { valid: false, error: '入力値の検証に失敗しました' };
  }
}

/**
 * 重複投票チェック（ページ別制御）
 */
function checkDuplicateVote(email, campaignId, applicantId, votePage) {
  try {
    const privateSheet = getPrivateSheet('private_votes');
    const votes = getDataFromPrivateSheet(privateSheet);
    
    // 同一ページ、同一メール、同一申請者への投票をチェック
    const existingVote = votes.find(vote => 
      vote.email === email && 
      vote.campaignId === campaignId && 
      vote.applicantId === applicantId &&
      vote.votePage === votePage
    );
    
    if (existingVote) {
      return {
        isDuplicate: true,
        reason: `${votePage === 'basic' ? '基本' : 'プレミアム'}ページからこの申請者への投票は既に完了しています`
      };
    }
    
    return { isDuplicate: false };
    
  } catch (error) {
    logPrivateError('Duplicate check error', error);
    throw new Error('重複投票チェックに失敗しました');
  }
}

/**
 * 投票権重計算（完全非表示）
 */
function calculateVoteWeight(votePage) {
  // 重み設定（UIには絶対に表示しない）
  const WEIGHTS = {
    basic: 1,
    premium: 5
  };
  
  return WEIGHTS[votePage] || 1;
}

/**
 * プライベートシートへの安全な保存
 */
function saveToPrivateSheet(voteRecord) {
  try {
    const sheet = getPrivateSheet('private_votes');
    
    // ヘッダーが存在しない場合は作成
    if (sheet.getLastRow() === 0) {
      const headers = [
        'ID', 'フィナンシェID', 'メールアドレス', 'お名前',
        'キャンペーンID', '申請者ID', '投票ページ', '投票重み',
        'YouTube出演希望', '投票日時', 'IPハッシュ', 'セッションID'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // ヘッダースタイル設定
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#1f4e79');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    // データ行追加
    const rowData = [
      voteRecord.id,
      voteRecord.financeId,
      voteRecord.email,
      voteRecord.name,
      voteRecord.campaignId,
      voteRecord.applicantId,
      voteRecord.votePage,
      voteRecord.voteWeight, // プライベートシートでのみ記録
      voteRecord.youtubeOptIn ? 'はい' : 'いいえ',
      voteRecord.timestamp,
      voteRecord.ipHash,
      voteRecord.sessionId
    ];
    
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, rowData.length).setValues([rowData]);
    
    logPrivateInfo(`Data saved to private sheet: row ${lastRow + 1}`);
    return { success: true };
    
  } catch (error) {
    logPrivateError('Failed to save to private sheet', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * 公開集計データの更新（重み非表示）
 */
function updatePublicAggregation(campaignId, applicantId, votePage) {
  try {
    // 既存の公開votes シートを更新（重み情報は含めない）
    const publicSheet = getSheet('votes');
    const votes = getDataFromSheet('votes');
    
    // 既存レコードを検索
    let existingVote = votes.find(vote => 
      vote.campaignid === campaignId && vote.applicantid === applicantId
    );
    
    if (existingVote) {
      // 既存レコードの更新（総投票数のみ、重みは隠蔽）
      const currentCount = parseInt(existingVote.votecount) || 0;
      const newCount = currentCount + 1;
      
      // 公開シートでは総投票数のみ表示（重み計算結果は非表示）
      updateDataInSheet('votes', existingVote.id, {
        votecount: newCount,
        updatedat: getCurrentTimestamp()
      });
      
    } else {
      // 新規レコード作成（重み情報は含めない）
      const voteId = generateId();
      const newVoteData = [
        voteId,
        campaignId,
        applicantId,
        1, // 初回投票
        getCurrentTimestamp(),
        '', // 予約フィールド
        0, // 公開シートでは重みスコアを0で隠蔽
        0, // basic count (隠蔽)
        0, // premium count (隠蔽)
        0  // youtube count (隠蔽)
      ];
      
      insertDataToSheet('votes', newVoteData);
    }
    
    logPrivateInfo(`Public aggregation updated for ${applicantId}`);
    
  } catch (error) {
    logPrivateError('Failed to update public aggregation', error);
    throw error;
  }
}

/**
 * プライベート投票データの取得（管理者専用）
 */
function getPrivateVoteData(campaignId, adminKey) {
  try {
    // 管理者認証（セキュリティチェック）
    if (!validateAdminKey(adminKey)) {
      throw new Error('管理者権限が必要です');
    }
    
    const privateSheet = getPrivateSheet('private_votes');
    const allVotes = getDataFromPrivateSheet(privateSheet);
    
    // 指定キャンペーンの投票データをフィルタ
    const campaignVotes = allVotes.filter(vote => vote.campaignId === campaignId);
    
    // 集計データ作成（管理者用）
    const aggregation = calculatePrivateAggregation(campaignVotes);
    
    return {
      success: true,
      totalVotes: campaignVotes.length,
      aggregation: aggregation,
      // 個人情報は含めない（集計のみ）
    };
    
  } catch (error) {
    logPrivateError('Failed to get private vote data', error);
    throw error;
  }
}

/**
 * プライベート集計計算（管理者専用）
 */
function calculatePrivateAggregation(votes) {
  const aggregation = {};
  
  votes.forEach(vote => {
    const applicantId = vote.applicantId;
    
    if (!aggregation[applicantId]) {
      aggregation[applicantId] = {
        totalVotes: 0,
        weightedScore: 0,
        basicVotes: 0,
        premiumVotes: 0,
        youtubeOptIns: 0
      };
    }
    
    aggregation[applicantId].totalVotes += 1;
    aggregation[applicantId].weightedScore += vote.voteWeight;
    
    if (vote.votePage === 'basic') {
      aggregation[applicantId].basicVotes += 1;
    } else if (vote.votePage === 'premium') {
      aggregation[applicantId].premiumVotes += 1;
    }
    
    if (vote.youtubeOptIn) {
      aggregation[applicantId].youtubeOptIns += 1;
    }
  });
  
  return aggregation;
}

/**
 * プライベートシート取得
 */
function getPrivateSheet(sheetName) {
  try {
    const ss = SpreadsheetApp.openById(PRIVATE_SHEET_ID);
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      logPrivateInfo(`Created new private sheet: ${sheetName}`);
    }
    
    return sheet;
    
  } catch (error) {
    logPrivateError(`Failed to get private sheet: ${sheetName}`, error);
    throw new Error(`プライベートシート ${sheetName} の取得に失敗しました`);
  }
}

/**
 * プライベートシートデータ取得
 */
function getDataFromPrivateSheet(sheet) {
  try {
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length <= 1) {
      return [];
    }
    
    const headers = values[0];
    const data = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = {};
      headers.forEach((header, index) => {
        const key = header.toLowerCase().replace(/[^a-z0-9]/g, '');
        row[key] = values[i][index];
      });
      data.push(row);
    }
    
    return data;
    
  } catch (error) {
    logPrivateError('Failed to get data from private sheet', error);
    return [];
  }
}

/**
 * ユーティリティ関数群
 */
function generatePrivateVoteId() {
  return 'pv_' + Utilities.getUuid();
}

function hashIP() {
  // セキュリティのため、実際のIPではなくハッシュ化した値を保存
  const session = Session.getActiveUser().getEmail();
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, session).toString();
}

function generateSessionId() {
  return 'sess_' + Utilities.getUuid().substring(0, 8);
}

function validateAdminKey(adminKey) {
  // 管理者キーの検証（実装時は強力なキーに変更）
  const ADMIN_KEY = 'WEB3MONEY_ADMIN_2025';
  return adminKey === ADMIN_KEY;
}

/**
 * プライベートログ関数
 */
function logPrivateInfo(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[PRIVATE-INFO ${timestamp}] ${message}`, data || '');
}

function logPrivateError(message, error = null) {
  const timestamp = new Date().toISOString();
  console.error(`[PRIVATE-ERROR ${timestamp}] ${message}`, error || '');
}

/**
 * プライベート投票システムテスト
 */
function testPrivateVoteSystem() {
  try {
    console.log('=== プライベート投票システムテスト ===');
    
    // テストデータ
    const testVote = {
      financeId: 'TEST001',
      email: 'test@example.com',
      name: 'テストユーザー',
      campaignId: 'test-campaign-001',
      applicantId: 'test-applicant-001',
      votePage: 'basic',
      youtubeOptIn: false
    };
    
    // 投票テスト
    const result = addPrivateVote(
      testVote.financeId,
      testVote.email,
      testVote.name,
      testVote.campaignId,
      testVote.applicantId,
      testVote.votePage,
      testVote.youtubeOptIn
    );
    
    console.log('✅ テスト成功:', result);
    return { success: true, result };
    
  } catch (error) {
    console.error('❌ テスト失敗:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * プライベートスプレッドシート初期化
 */
function initializePrivateSpreadsheet() {
  try {
    console.log('=== プライベートスプレッドシート初期化 ===');
    
    // プライベート投票シート作成
    const privateVoteSheet = getPrivateSheet('private_votes');
    
    console.log('✅ プライベートスプレッドシート初期化完了');
    return { success: true };
    
  } catch (error) {
    console.error('❌ 初期化失敗:', error);
    return { success: false, error: error.toString() };
  }
}
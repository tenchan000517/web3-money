/**
 * WEB3 MONEY システム - データベース操作
 * Google Sheets をデータベースとして使用
 */

// スプレッドシート設定
const SHEET_ID = '1k20RBGQ4Gj1s62YYYkHGvYHmws44odB0N3CoWPXgVm4'; // 実際のスプレッドシートIDに置き換えてください

/**
 * シート取得・作成
 */
function getSheet(sheetName) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      logInfo(`Creating new sheet: ${sheetName}`);
      sheet = ss.insertSheet(sheetName);
      initializeSheet(sheet, sheetName);
    }
    
    return sheet;
  } catch (error) {
    logError(`Failed to get/create sheet: ${sheetName}`, error);
    throw new Error(`Database error: ${error.toString()}`);
  }
}

/**
 * シート初期化
 */
function initializeSheet(sheet, sheetName) {
  try {
    logInfo(`Initializing sheet: ${sheetName}`);
    
    switch(sheetName) {
      case 'notices':
        sheet.getRange(1, 1, 1, 6).setValues([[
          'ID', 'Title', 'Content', 'StartDate', 'EndDate', 'CreatedAt'
        ]]);
        // ヘッダー行のスタイル設定
        const noticeHeader = sheet.getRange(1, 1, 1, 6);
        noticeHeader.setBackground('#4285f4');
        noticeHeader.setFontColor('white');
        noticeHeader.setFontWeight('bold');
        sheet.setFrozenRows(1);
        break;
        
      case 'campaigns':
        sheet.getRange(1, 1, 1, 9).setValues([[
          'ID', 'Title', 'FormUrl', 'SheetUrl', 'Status', 'StartDate', 'EndDate', 'Fields', 'CreatedAt'
        ]]);
        // ヘッダー行のスタイル設定
        const campaignHeader = sheet.getRange(1, 1, 1, 9);
        campaignHeader.setBackground('#34a853');
        campaignHeader.setFontColor('white');
        campaignHeader.setFontWeight('bold');
        sheet.setFrozenRows(1);
        break;
        
      case 'votes':
        sheet.getRange(1, 1, 1, 5).setValues([[
          'ID', 'CampaignId', 'ApplicantId', 'VoteCount', 'UpdatedAt'
        ]]);
        // ヘッダー行のスタイル設定
        const voteHeader = sheet.getRange(1, 1, 1, 5);
        voteHeader.setBackground('#ea4335');
        voteHeader.setFontColor('white');
        voteHeader.setFontWeight('bold');
        sheet.setFrozenRows(1);
        break;
        
      default:
        logError(`Unknown sheet type: ${sheetName}`);
    }
    
    logInfo(`Sheet initialized successfully: ${sheetName}`);
  } catch (error) {
    logError(`Failed to initialize sheet: ${sheetName}`, error);
    throw error;
  }
}

/**
 * ユニークID生成
 */
function generateId() {
  return Utilities.getUuid();
}

/**
 * 現在のタイムスタンプ取得
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * 配列をオブジェクトに変換
 */
function arrayToObject(headers, row) {
  const obj = {};
  headers.forEach((header, index) => {
    const key = header.toLowerCase().replace(/[^a-z0-9]/g, '');
    obj[key] = row[index] || '';
  });
  return obj;
}

/**
 * 日付の検証
 */
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * 文字列の検証
 */
function isValidString(str, maxLength = 1000) {
  return typeof str === 'string' && str.trim().length > 0 && str.length <= maxLength;
}

/**
 * データの取得（共通）
 */
function getDataFromSheet(sheetName, filterFunction = null) {
  try {
    const sheet = getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      logInfo(`No data found in sheet: ${sheetName}`);
      return [];
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    let results = rows.map(row => arrayToObject(headers, row));
    
    // フィルター適用
    if (filterFunction) {
      results = results.filter(filterFunction);
    }
    
    logInfo(`Retrieved ${results.length} records from ${sheetName}`);
    return results;
  } catch (error) {
    logError(`Failed to get data from sheet: ${sheetName}`, error);
    throw new Error(`Database query error: ${error.toString()}`);
  }
}

/**
 * データの挿入（共通）
 */
function insertDataToSheet(sheetName, rowData) {
  try {
    const sheet = getSheet(sheetName);
    
    // 🚨 修正: 文字列として保存するためのセル書式設定
    const lastRow = sheet.getLastRow() + 1;
    
    // データを挿入
    sheet.appendRow(rowData);
    
    // 🔧 キャンペーンシートの場合、タイトル列（B列）を文字列として設定
    if (sheetName === 'campaigns') {
      const titleCell = sheet.getRange(lastRow, 2); // B列（タイトル列）
      titleCell.setNumberFormat('@STRING@'); // 文字列書式を設定
      titleCell.setValue(rowData[1]); // タイトル値を再設定
    }
    
    logInfo(`Inserted data to ${sheetName}:`, rowData);
    return true;
  } catch (error) {
    logError(`Failed to insert data to sheet: ${sheetName}`, error);
    throw new Error(`Database insert error: ${error.toString()}`);
  }
}

/**
 * データの更新（共通）
 */
function updateDataInSheet(sheetName, id, updateData) {
  try {
    const sheet = getSheet(sheetName);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        // IDは更新しない（列1はID）
        for (let j = 1; j < updateData.length; j++) {
          if (updateData[j] !== undefined) {
            sheet.getRange(i + 1, j + 1).setValue(updateData[j]);
          }
        }
        logInfo(`Updated data in ${sheetName} for ID: ${id}`);
        return true;
      }
    }
    
    throw new Error(`Record not found with ID: ${id}`);
  } catch (error) {
    logError(`Failed to update data in sheet: ${sheetName}`, error);
    throw new Error(`Database update error: ${error.toString()}`);
  }
}

/**
 * データの削除（共通）
 */
function deleteDataFromSheet(sheetName, id) {
  try {
    const sheet = getSheet(sheetName);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        sheet.deleteRow(i + 1);
        logInfo(`Deleted data from ${sheetName} for ID: ${id}`);
        return true;
      }
    }
    
    throw new Error(`Record not found with ID: ${id}`);
  } catch (error) {
    logError(`Failed to delete data from sheet: ${sheetName}`, error);
    throw new Error(`Database delete error: ${error.toString()}`);
  }
}

/**
 * 外部スプレッドシートへのアクセス
 */
function accessExternalSheet(sheetUrl) {
  try {
    const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      throw new Error('Invalid spreadsheet URL format');
    }
    
    const sheetId = match[1];
    logInfo(`Accessing external sheet: ${sheetId}`);
    
    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheets()[0]; // 最初のシートを使用
    
    if (!sheet) {
      throw new Error('No sheets found in the spreadsheet');
    }
    
    return sheet;
  } catch (error) {
    logError('Failed to access external sheet', error);
    
    if (error.toString().includes('Permission denied')) {
      throw new Error('PERMISSION_DENIED');
    } else if (error.toString().includes('Invalid spreadsheet URL')) {
      throw new Error('INVALID_URL');
    } else {
      throw new Error('UNKNOWN_ERROR');
    }
  }
}

/**
 * 外部スプレッドシートのデータ取得
 */
function getDataFromExternalSheet(sheetUrl) {
  try {
    const sheet = accessExternalSheet(sheetUrl);
    const data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      throw new Error('NO_DATA');
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    logInfo(`Retrieved ${rows.length} rows from external sheet`);
    
    return {
      sheetName: sheet.getName(),
      headers: headers,
      rows: rows,
      rowCount: rows.length
    };
  } catch (error) {
    logError('Failed to get data from external sheet', error);
    throw error;
  }
}

/**
 * データベース統計情報取得
 */
function getDatabaseStats() {
  try {
    const stats = {
      notices: 0,
      campaigns: 0,
      votes: 0,
      lastUpdated: getCurrentTimestamp()
    };
    
    // 各シートのレコード数を取得
    try {
      const noticeSheet = getSheet('notices');
      stats.notices = Math.max(0, noticeSheet.getDataRange().getNumRows() - 1);
    } catch (e) {
      logInfo('Notices sheet not found or empty');
    }
    
    try {
      const campaignSheet = getSheet('campaigns');
      stats.campaigns = Math.max(0, campaignSheet.getDataRange().getNumRows() - 1);
    } catch (e) {
      logInfo('Campaigns sheet not found or empty');
    }
    
    try {
      const voteSheet = getSheet('votes');
      stats.votes = Math.max(0, voteSheet.getDataRange().getNumRows() - 1);
    } catch (e) {
      logInfo('Votes sheet not found or empty');
    }
    
    return stats;
  } catch (error) {
    logError('Failed to get database stats', error);
    throw error;
  }
}

/**
 * データベースの健全性チェック
 */
function checkDatabaseHealth() {
  try {
    const health = {
      status: 'healthy',
      checks: [],
      timestamp: getCurrentTimestamp()
    };
    
    // 各シートの存在確認
    const sheets = ['notices', 'campaigns', 'votes'];
    
    for (const sheetName of sheets) {
      try {
        const sheet = getSheet(sheetName);
        const rowCount = Math.max(0, sheet.getDataRange().getNumRows() - 1);
        health.checks.push({
          sheet: sheetName,
          status: 'ok',
          rowCount: rowCount
        });
      } catch (error) {
        health.status = 'unhealthy';
        health.checks.push({
          sheet: sheetName,
          status: 'error',
          error: error.toString()
        });
      }
    }
    
    return health;
  } catch (error) {
    logError('Database health check failed', error);
    return {
      status: 'error',
      error: error.toString(),
      timestamp: getCurrentTimestamp()
    };
  }
}
/**
 * WEB3 MONEY システム - フォーム連携機能
 * Googleフォーム・スプレッドシート連携機能を提供
 */

/**
 * フォーム接続テスト
 */
function testFormConnection(sheetUrl) {
  try {
    logInfo(`Testing form connection: ${sheetUrl}`);
    
    if (!sheetUrl || typeof sheetUrl !== 'string') {
      return {
        success: false,
        error: 'INVALID_URL',
        message: 'スプレッドシートURLが無効です',
        guide: getConnectionGuide('INVALID_URL')
      };
    }
    
    // URL形式の検証
    const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      return {
        success: false,
        error: 'INVALID_URL',
        message: '無効なスプレッドシートURLです',
        guide: getConnectionGuide('INVALID_URL')
      };
    }
    
    const sheetId = match[1];
    logInfo(`Extracted sheet ID: ${sheetId}`);
    
    try {
      // スプレッドシートにアクセス
      const ss = SpreadsheetApp.openById(sheetId);
      const sheet = ss.getSheets()[0];
      
      if (!sheet) {
        return {
          success: false,
          error: 'NO_SHEET',
          message: 'シートが見つかりません',
          guide: getConnectionGuide('NO_SHEET')
        };
      }
      
      // データの存在確認
      const data = sheet.getDataRange().getValues();
      
      if (data.length === 0) {
        return {
          success: false,
          error: 'NO_DATA',
          message: 'シートにデータがありません',
          guide: getConnectionGuide('NO_DATA')
        };
      }
      
      const headers = data[0];
      const rowCount = data.length - 1;
      
      // 成功レスポンス
      const result = {
        success: true,
        data: {
          sheetName: sheet.getName(),
          headers: headers,
          rowCount: rowCount,
          sampleData: data.length > 1 ? data[1] : null,
          sheetId: sheetId,
          lastUpdated: sheet.getLastUpdatedDate()
        },
        message: `接続成功！${rowCount}件のデータを検出しました`
      };
      
      logInfo('Form connection test successful', result);
      return result;
      
    } catch (error) {
      logError('Sheet access error', error);
      
      if (error.toString().includes('Permission denied') || 
          error.toString().includes('access') ||
          error.toString().includes('権限')) {
        return {
          success: false,
          error: 'PERMISSION_DENIED',
          message: 'スプレッドシートへのアクセス権限がありません',
          guide: getConnectionGuide('PERMISSION_DENIED')
        };
      } else if (error.toString().includes('not found') || 
                 error.toString().includes('見つかりません')) {
        return {
          success: false,
          error: 'SHEET_NOT_FOUND',
          message: '指定されたスプレッドシートが見つかりません',
          guide: getConnectionGuide('SHEET_NOT_FOUND')
        };
      } else {
        return {
          success: false,
          error: 'UNKNOWN_ERROR',
          message: '不明なエラーが発生しました: ' + error.toString(),
          guide: getConnectionGuide('UNKNOWN_ERROR')
        };
      }
    }
    
  } catch (error) {
    logError('Form connection test failed', error);
    return {
      success: false,
      error: 'SYSTEM_ERROR',
      message: 'システムエラーが発生しました: ' + error.toString(),
      guide: getConnectionGuide('SYSTEM_ERROR')
    };
  }
}

/**
 * フォーム項目情報取得
 */
function getFormFields(sheetUrl) {
  try {
    logInfo(`Getting form fields: ${sheetUrl}`);
    
    // まず接続テストを実行
    const connectionResult = testFormConnection(sheetUrl);
    if (!connectionResult.success) {
      return {
        success: false,
        error: connectionResult.error,
        message: connectionResult.message,
        guide: connectionResult.guide
      };
    }
    
    const data = connectionResult.data;
    const headers = data.headers;
    
    // フィールド情報を構築
    const fields = headers.map((header, index) => {
      const field = {
        key: header,
        displayName: header,
        type: 'text', // デフォルト
        visible: true,
        order: index,
        sampleValue: '',
        description: ''
      };
      
      // サンプルデータがある場合、データ型を推測
      if (data.sampleData && index < data.sampleData.length) {
        const sampleValue = data.sampleData[index];
        field.sampleValue = sampleValue;
        
        if (sampleValue) {
          field.type = inferDataType(sampleValue, header);
        }
      }
      
      // 項目名から用途を推測して説明を追加
      field.description = inferFieldDescription(header);
      
      return field;
    });
    
    const result = {
      success: true,
      fields: fields,
      totalFields: fields.length,
      sheetInfo: {
        name: data.sheetName,
        rowCount: data.rowCount,
        lastUpdated: data.lastUpdated
      }
    };
    
    logInfo(`Retrieved ${fields.length} form fields`);
    return result;
    
  } catch (error) {
    logError('Failed to get form fields', error);
    return {
      success: false,
      error: 'FIELD_ANALYSIS_ERROR',
      message: '項目分析に失敗しました: ' + error.toString()
    };
  }
}

/**
 * データ型推測
 */
function inferDataType(value, fieldName) {
  try {
    const strValue = String(value).trim().toLowerCase();
    const fieldNameLower = fieldName.toLowerCase();
    
    // 日付系
    if (fieldNameLower.includes('日') || 
        fieldNameLower.includes('date') ||
        fieldNameLower.includes('時') ||
        !isNaN(Date.parse(strValue))) {
      return 'date';
    }
    
    // 数値系
    if (fieldNameLower.includes('金額') ||
        fieldNameLower.includes('額') ||
        fieldNameLower.includes('数') ||
        fieldNameLower.includes('amount') ||
        fieldNameLower.includes('price') ||
        fieldNameLower.includes('count') ||
        (!isNaN(parseFloat(strValue)) && isFinite(strValue))) {
      return 'number';
    }
    
    // メール
    if (fieldNameLower.includes('メール') ||
        fieldNameLower.includes('mail') ||
        strValue.includes('@')) {
      return 'email';
    }
    
    // 電話番号
    if (fieldNameLower.includes('電話') ||
        fieldNameLower.includes('tel') ||
        fieldNameLower.includes('phone') ||
        /^\d{2,4}-\d{2,4}-\d{4}$/.test(strValue)) {
      return 'tel';
    }
    
    // URL
    if (fieldNameLower.includes('url') ||
        fieldNameLower.includes('リンク') ||
        strValue.startsWith('http')) {
      return 'url';
    }
    
    // 長いテキスト（理由、説明など）
    if (fieldNameLower.includes('理由') ||
        fieldNameLower.includes('説明') ||
        fieldNameLower.includes('内容') ||
        fieldNameLower.includes('詳細') ||
        strValue.length > 50) {
      return 'textarea';
    }
    
    return 'text';
    
  } catch (error) {
    logError('Error inferring data type', error);
    return 'text';
  }
}

/**
 * 項目説明推測
 */
function inferFieldDescription(fieldName) {
  try {
    const fieldNameLower = fieldName.toLowerCase();
    
    if (fieldNameLower.includes('名前') || fieldNameLower.includes('氏名')) {
      return '申請者の氏名';
    } else if (fieldNameLower.includes('メール')) {
      return '連絡用メールアドレス';
    } else if (fieldNameLower.includes('電話')) {
      return '連絡用電話番号';
    } else if (fieldNameLower.includes('金額') || fieldNameLower.includes('額')) {
      return '希望する支援金額';
    } else if (fieldNameLower.includes('理由')) {
      return '支援を必要とする理由';
    } else if (fieldNameLower.includes('用途') || fieldNameLower.includes('目的')) {
      return '支援金の使用目的';
    } else if (fieldNameLower.includes('住所')) {
      return '申請者の住所';
    } else if (fieldNameLower.includes('年齢')) {
      return '申請者の年齢';
    } else if (fieldNameLower.includes('職業')) {
      return '申請者の職業';
    } else if (fieldNameLower.includes('日') || fieldNameLower.includes('date')) {
      return '申請日または希望日';
    }
    
    return ''; // 推測できない場合は空文字
    
  } catch (error) {
    logError('Error inferring field description', error);
    return '';
  }
}

/**
 * 接続ガイド情報取得
 */
function getConnectionGuide(errorType) {
  try {
    const guides = {
      'INVALID_URL': {
        title: 'URLが無効です',
        steps: [
          'GoogleスプレッドシートのURLを確認してください',
          'URL形式: https://docs.google.com/spreadsheets/d/... である必要があります',
          'ブラウザのアドレスバーから正確なURLをコピーしてください'
        ]
      },
      'PERMISSION_DENIED': {
        title: 'アクセス権限の設定が必要です',
        steps: [
          'スプレッドシートを開いてください',
          '右上の「共有」ボタンをクリック',
          `以下のメールアドレスに編集権限を追加: ${getScriptEmail()}`,
          'または「リンクを知っている全員」に閲覧権限以上を設定してください',
          '設定後、再度接続テストを実行してください'
        ]
      },
      'SHEET_NOT_FOUND': {
        title: 'スプレッドシートが見つかりません',
        steps: [
          'URLが正しいか確認してください',
          'スプレッドシートが削除されていないか確認してください',
          'アクセス権限があるか確認してください',
          '別のスプレッドシートURLを試してください'
        ]
      },
      'NO_SHEET': {
        title: 'シートが存在しません',
        steps: [
          'スプレッドシート内にシートが作成されているか確認してください',
          'Googleフォームと連携されているか確認してください',
          'フォームの回答がスプレッドシートに記録されているか確認してください'
        ]
      },
      'NO_DATA': {
        title: 'データが存在しません',
        steps: [
          'Googleフォームで回答が送信されているか確認してください',
          'スプレッドシートにヘッダー行があるか確認してください',
          'フォームとスプレッドシートの連携が正しく設定されているか確認してください'
        ]
      },
      'UNKNOWN_ERROR': {
        title: '予期しないエラーが発生しました',
        steps: [
          'しばらく時間をおいて再度お試しください',
          'URLが正しいか再度確認してください',
          'スプレッドシートのアクセス権限を確認してください',
          'それでも解決しない場合は管理者にお問い合わせください'
        ]
      },
      'SYSTEM_ERROR': {
        title: 'システムエラーが発生しました',
        steps: [
          'しばらく時間をおいて再度お試しください',
          'システムメンテナンス中の可能性があります',
          '管理者にお問い合わせください'
        ]
      }
    };
    
    return guides[errorType] || guides['UNKNOWN_ERROR'];
    
  } catch (error) {
    logError('Error getting connection guide', error);
    return {
      title: 'ガイド情報の取得に失敗しました',
      steps: ['管理者にお問い合わせください']
    };
  }
}

/**
 * スクリプト実行アカウントのメールアドレス取得
 */
function getScriptEmail() {
  try {
    return Session.getActiveUser().getEmail();
  } catch (error) {
    logError('Failed to get script email', error);
    return 'apps-script@example.com';
  }
}

/**
 * フォームレスポンスの検証
 */
function validateFormResponse(data, fields) {
  try {
    logInfo('Validating form response');
    
    const errors = [];
    const warnings = [];
    
    // 必須項目のチェック
    const requiredFields = fields.filter(f => f.required);
    for (const field of requiredFields) {
      if (!data[field.key] || String(data[field.key]).trim() === '') {
        errors.push(`必須項目が入力されていません: ${field.displayName}`);
      }
    }
    
    // データ型のチェック
    for (const field of fields) {
      const value = data[field.key];
      if (value && String(value).trim() !== '') {
        switch (field.type) {
          case 'number':
            if (isNaN(parseFloat(value))) {
              errors.push(`数値形式が正しくありません: ${field.displayName}`);
            }
            break;
          case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              warnings.push(`メールアドレス形式を確認してください: ${field.displayName}`);
            }
            break;
          case 'date':
            if (isNaN(Date.parse(value))) {
              warnings.push(`日付形式を確認してください: ${field.displayName}`);
            }
            break;
        }
      }
    }
    
    const result = {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      checkedFields: fields.length
    };
    
    logInfo('Form response validation completed', result);
    return result;
    
  } catch (error) {
    logError('Form response validation failed', error);
    return {
      valid: false,
      errors: ['検証処理でエラーが発生しました'],
      warnings: [],
      checkedFields: 0
    };
  }
}

/**
 * スプレッドシート情報の詳細取得
 */
function getDetailedSheetInfo(sheetUrl) {
  try {
    logInfo(`Getting detailed sheet info: ${sheetUrl}`);
    
    const connectionResult = testFormConnection(sheetUrl);
    if (!connectionResult.success) {
      return connectionResult;
    }
    
    const sheet = accessExternalSheet(sheetUrl);
    const data = sheet.getDataRange().getValues();
    
    const info = {
      success: true,
      sheetInfo: {
        name: sheet.getName(),
        id: sheet.getSheetId(),
        lastUpdated: sheet.getLastUpdatedDate(),
        maxRows: sheet.getMaxRows(),
        maxColumns: sheet.getMaxColumns(),
        dataRange: {
          numRows: data.length,
          numColumns: data.length > 0 ? data[0].length : 0
        }
      },
      headers: data.length > 0 ? data[0] : [],
      sampleData: data.length > 1 ? data.slice(1, 4) : [], // 最大3行のサンプル
      statistics: {
        totalResponses: data.length - 1,
        lastResponseTime: data.length > 1 ? new Date().toISOString() : null,
        averageResponseLength: 0
      }
    };
    
    // 平均レスポンス長の計算
    if (data.length > 1) {
      const responseLengths = data.slice(1).map(row => 
        row.reduce((sum, cell) => sum + String(cell || '').length, 0)
      );
      info.statistics.averageResponseLength = Math.round(
        responseLengths.reduce((sum, len) => sum + len, 0) / responseLengths.length
      );
    }
    
    logInfo('Detailed sheet info retrieved successfully');
    return info;
    
  } catch (error) {
    logError('Failed to get detailed sheet info', error);
    return {
      success: false,
      error: 'DETAILED_INFO_ERROR',
      message: '詳細情報の取得に失敗しました: ' + error.toString()
    };
  }
}
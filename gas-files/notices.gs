/**
 * WEB3 MONEY システム - お知らせ機能
 * お知らせのCRUD操作を提供
 */

/**
 * お知らせ一覧取得
 * 現在期間内のもののみを返す
 */
function getNotices() {
  try {
    logInfo('Getting notices list');
    
    const filterFunction = (notice) => {
      try {
        const now = new Date();
        const startDate = new Date(notice.startdate);
        const endDate = new Date(notice.enddate);
        
        // 日付が有効で、現在が期間内かチェック
        return isValidDate(notice.startdate) && 
               isValidDate(notice.enddate) && 
               startDate <= now && 
               now <= endDate;
      } catch (error) {
        logError('Date validation error for notice', error);
        return false;
      }
    };
    
    const notices = getDataFromSheet('notices', filterFunction);
    
    // 作成日時でソート（新しい順）
    notices.sort((a, b) => {
      try {
        return new Date(b.createdat) - new Date(a.createdat);
      } catch (error) {
        return 0;
      }
    });
    
    // 結果を整形
    const formattedNotices = notices.map(notice => ({
      id: notice.id,
      title: notice.title,
      content: notice.content,
      startDate: notice.startdate,
      endDate: notice.enddate,
      createdAt: notice.createdat
    }));
    
    logInfo(`Retrieved ${formattedNotices.length} active notices`);
    return formattedNotices;
    
  } catch (error) {
    logError('Failed to get notices', error);
    throw new Error('お知らせの取得に失敗しました: ' + error.toString());
  }
}

/**
 * 全お知らせ取得（管理用）
 * 期間に関係なく全て取得
 */
function getAllNotices() {
  try {
    logInfo('Getting all notices (admin)');
    
    const notices = getDataFromSheet('notices');
    
    // 作成日時でソート（新しい順）
    notices.sort((a, b) => {
      try {
        return new Date(b.createdat) - new Date(a.createdat);
      } catch (error) {
        return 0;
      }
    });
    
    // 結果を整形
    const formattedNotices = notices.map(notice => ({
      id: notice.id,
      title: notice.title,
      content: notice.content,
      startDate: notice.startdate,
      endDate: notice.enddate,
      createdAt: notice.createdat
    }));
    
    logInfo(`Retrieved ${formattedNotices.length} total notices`);
    return formattedNotices;
    
  } catch (error) {
    logError('Failed to get all notices', error);
    throw new Error('全お知らせの取得に失敗しました: ' + error.toString());
  }
}

/**
 * お知らせ作成
 */
function createNotice(data) {
  try {
    logInfo('Creating new notice', data);
    
    // データ検証
    if (!isValidString(data.title, 100)) {
      throw new Error('タイトルが無効です（1-100文字で入力してください）');
    }
    
    if (!isValidString(data.content, 1000)) {
      throw new Error('内容が無効です（1-1000文字で入力してください）');
    }
    
    if (!isValidDate(data.startDate)) {
      throw new Error('開始日が無効です');
    }
    
    if (!isValidDate(data.endDate)) {
      throw new Error('終了日が無効です');
    }
    
    // 日付の論理チェック
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (startDate > endDate) {
      throw new Error('終了日は開始日より後の日付を指定してください');
    }
    
    // 新しいお知らせのデータ準備
    const id = generateId();
    const timestamp = getCurrentTimestamp();
    
    const rowData = [
      id,
      data.title.trim(),
      data.content.trim(),
      data.startDate,
      data.endDate,
      timestamp
    ];
    
    // データベースに挿入
    insertDataToSheet('notices', rowData);
    
    const newNotice = {
      id: id,
      title: data.title.trim(),
      content: data.content.trim(),
      startDate: data.startDate,
      endDate: data.endDate,
      createdAt: timestamp
    };
    
    logInfo('Notice created successfully', newNotice);
    return newNotice;
    
  } catch (error) {
    logError('Failed to create notice', error);
    throw new Error('お知らせの作成に失敗しました: ' + error.toString());
  }
}

/**
 * お知らせ更新
 */
function updateNotice(id, data) {
  try {
    logInfo(`Updating notice: ${id}`, data);
    
    // IDの検証
    if (!id || typeof id !== 'string') {
      throw new Error('無効なIDです');
    }
    
    // データ検証
    if (!isValidString(data.title, 100)) {
      throw new Error('タイトルが無効です（1-100文字で入力してください）');
    }
    
    if (!isValidString(data.content, 1000)) {
      throw new Error('内容が無効です（1-1000文字で入力してください）');
    }
    
    if (!isValidDate(data.startDate)) {
      throw new Error('開始日が無効です');
    }
    
    if (!isValidDate(data.endDate)) {
      throw new Error('終了日が無効です');
    }
    
    // 日付の論理チェック
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (startDate > endDate) {
      throw new Error('終了日は開始日より後の日付を指定してください');
    }
    
    // 更新データ準備（IDは更新しない）
    const updateData = [
      undefined, // ID列はスキップ
      data.title.trim(),
      data.content.trim(),
      data.startDate,
      data.endDate,
      undefined  // 作成日時はそのまま
    ];
    
    // データベースを更新
    updateDataInSheet('notices', id, updateData);
    
    const updatedNotice = {
      id: id,
      title: data.title.trim(),
      content: data.content.trim(),
      startDate: data.startDate,
      endDate: data.endDate
    };
    
    logInfo('Notice updated successfully', updatedNotice);
    return updatedNotice;
    
  } catch (error) {
    logError('Failed to update notice', error);
    throw new Error('お知らせの更新に失敗しました: ' + error.toString());
  }
}

/**
 * お知らせ削除
 */
function deleteNotice(id) {
  try {
    logInfo(`Deleting notice: ${id}`);
    
    // IDの検証
    if (!id || typeof id !== 'string') {
      throw new Error('無効なIDです');
    }
    
    // データベースから削除
    deleteDataFromSheet('notices', id);
    
    logInfo(`Notice deleted successfully: ${id}`);
    return { success: true, id: id };
    
  } catch (error) {
    logError('Failed to delete notice', error);
    throw new Error('お知らせの削除に失敗しました: ' + error.toString());
  }
}

/**
 * 特定のお知らせ取得
 */
function getNoticeById(id) {
  try {
    logInfo(`Getting notice by ID: ${id}`);
    
    if (!id || typeof id !== 'string') {
      throw new Error('無効なIDです');
    }
    
    const notices = getDataFromSheet('notices', notice => notice.id === id);
    
    if (notices.length === 0) {
      throw new Error('指定されたお知らせが見つかりません');
    }
    
    const notice = notices[0];
    const formattedNotice = {
      id: notice.id,
      title: notice.title,
      content: notice.content,
      startDate: notice.startdate,
      endDate: notice.enddate,
      createdAt: notice.createdat
    };
    
    logInfo('Notice retrieved successfully', formattedNotice);
    return formattedNotice;
    
  } catch (error) {
    logError('Failed to get notice by ID', error);
    throw new Error('お知らせの取得に失敗しました: ' + error.toString());
  }
}

/**
 * 期限切れお知らせのクリーンアップ
 * 定期実行用（手動実行またはトリガー設定）
 */
function cleanupExpiredNotices() {
  try {
    logInfo('Starting cleanup of expired notices');
    
    const sheet = getSheet('notices');
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      logInfo('No notices to cleanup');
      return { cleaned: 0 };
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    const now = new Date();
    const expiredIds = [];
    
    // 期限切れのお知らせを特定
    rows.forEach(row => {
      try {
        const notice = arrayToObject(headers, row);
        const endDate = new Date(notice.enddate);
        
        // 終了日から30日経過したものを削除対象とする
        const expiryThreshold = new Date(endDate.getTime() + (30 * 24 * 60 * 60 * 1000));
        
        if (now > expiryThreshold) {
          expiredIds.push(notice.id);
        }
      } catch (error) {
        logError('Error processing notice for cleanup', error);
      }
    });
    
    // 期限切れお知らせを削除
    let cleanedCount = 0;
    for (const id of expiredIds) {
      try {
        deleteDataFromSheet('notices', id);
        cleanedCount++;
        logInfo(`Cleaned up expired notice: ${id}`);
      } catch (error) {
        logError(`Failed to cleanup notice: ${id}`, error);
      }
    }
    
    logInfo(`Cleanup completed. Cleaned ${cleanedCount} expired notices`);
    return { cleaned: cleanedCount, expiredIds: expiredIds };
    
  } catch (error) {
    logError('Failed to cleanup expired notices', error);
    throw new Error('期限切れお知らせのクリーンアップに失敗しました: ' + error.toString());
  }
}

/**
 * お知らせ統計情報取得
 */
function getNoticeStats() {
  try {
    logInfo('Getting notice statistics');
    
    const allNotices = getDataFromSheet('notices');
    const now = new Date();
    
    let active = 0;
    let expired = 0;
    let future = 0;
    
    allNotices.forEach(notice => {
      try {
        const startDate = new Date(notice.startdate);
        const endDate = new Date(notice.enddate);
        
        if (now < startDate) {
          future++;
        } else if (now > endDate) {
          expired++;
        } else {
          active++;
        }
      } catch (error) {
        logError('Error processing notice for stats', error);
      }
    });
    
    const stats = {
      total: allNotices.length,
      active: active,
      expired: expired,
      future: future,
      lastUpdated: getCurrentTimestamp()
    };
    
    logInfo('Notice statistics retrieved', stats);
    return stats;
    
  } catch (error) {
    logError('Failed to get notice statistics', error);
    throw new Error('お知らせ統計の取得に失敗しました: ' + error.toString());
  }
}
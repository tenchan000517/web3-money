/**
 * WEB3 MONEY システム - キャンペーン機能
 * 支援金投票キャンペーンのCRUD操作を提供
 */

/**
 * キャンペーン一覧取得
 */
function getCampaigns(status = null) {
  try {
    logInfo(`Getting campaigns list, status filter: ${status}`);
    
    console.log('🔍 getCampaigns: Getting data from sheet...');
    let filterFunction = null;
    if (status) {
      filterFunction = (campaign) => campaign.status === status;
    }
    
    const campaigns = getDataFromSheet('campaigns', filterFunction);
    console.log('🔍 getCampaigns: Raw data retrieved, count:', campaigns.length);
    
    // 作成日時でソート（新しい順）
    campaigns.sort((a, b) => {
      try {
        return new Date(b.createdat) - new Date(a.createdat);
      } catch (error) {
        return 0;
      }
    });
    
    console.log('🔍 getCampaigns: Starting format processing...');
    
    // 結果を整形
    const formattedCampaigns = campaigns.map((campaign, index) => {
      console.log(`🔍 Processing campaign ${index + 1}:`, {
        id: campaign.id,
        title: campaign.title,
        titleType: typeof campaign.title
      });
      
      let fields = [];
      try {
        if (campaign.fields && campaign.fields !== '') {
          fields = JSON.parse(campaign.fields);
        }
      } catch (error) {
        logError('Failed to parse campaign fields', error);
        fields = [];
      }
      
      // 🚨 タイトルの型変換を確実に実行
      let title = campaign.title;
      if (typeof title !== 'string') {
        console.log(`🔧 Converting title from ${typeof title} to string:`, title);
        title = String(title);
      }
      
      // 🚨 タイトルの検証を追加
      if (!isValidString(title, 100)) {
        console.error('❌ Title validation failed in getCampaigns:', {
          original: campaign.title,
          converted: title,
          type: typeof title,
          length: title.length
        });
        // ❌ ここでエラーが発生している可能性！
        throw new Error('キャンペーン名が無効です（1-100文字で入力してください）');
      }
      
      return {
        id: campaign.id,
        title: title, // 文字列に変換済み
        formUrl: campaign.formurl || '',
        sheetUrl: campaign.sheeturl || '',
        status: campaign.status || 'draft',
        startDate: campaign.startdate,
        endDate: campaign.enddate,
        fields: fields,
        createdAt: campaign.createdat
      };
    });
    
    console.log('✅ getCampaigns: Format processing completed');
    logInfo(`Retrieved ${formattedCampaigns.length} campaigns`);
    return formattedCampaigns;
    
  } catch (error) {
    console.error('❌ getCampaigns ERROR:', error);
    logError('Failed to get campaigns', error);
    throw new Error('キャンペーンの取得に失敗しました: ' + error.toString());
  }
}

/**
 * 申請者情報付きキャンペーン取得
 */
function getCampaignWithApplicants(campaignId) {
  try {
    logInfo(`Getting campaign with applicants: ${campaignId}`);
    
    if (!campaignId || typeof campaignId !== 'string') {
      throw new Error('無効なキャンペーンIDです');
    }
    
    const campaigns = getCampaigns();
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      throw new Error('指定されたキャンペーンが見つかりません');
    }
    
    // 申請者データを取得
    let applicants = [];
    if (campaign.sheetUrl) {
      try {
        applicants = getApplicantsFromSheet(campaign.sheetUrl, campaignId);
      } catch (error) {
        logError('Failed to fetch applicants', error);
        // 申請者データの取得に失敗してもキャンペーン情報は返す
      }
    }
    
    const result = {
      ...campaign,
      applicants: applicants
    };
    
    logInfo(`Retrieved campaign with ${applicants.length} applicants`);
    return result;
    
  } catch (error) {
    logError('Failed to get campaign with applicants', error);
    throw new Error('キャンペーンデータの取得に失敗しました: ' + error.toString());
  }
}

/**
 * キャンペーン作成
 */
function createCampaign(data) {
  try {
    logInfo('Creating new campaign', data);
    
    // 🔍 デバッグ: タイトルの詳細情報
    console.log('🔍 Title before validation:', {
      value: data.title,
      type: typeof data.title,
      length: data.title?.length,
      isString: typeof data.title === 'string',
      trimmed: typeof data.title === 'string' ? data.title.trim() : 'N/A'
    });
    
    // データ検証
    if (!isValidString(data.title, 100)) {
      console.error('❌ Title validation failed:', data.title);
      throw new Error('キャンペーン名が無効です（1-100文字で入力してください）');
    }
    
    if (!data.sheetUrl || !isValidString(data.sheetUrl, 500)) {
      throw new Error('スプレッドシートURLが無効です');
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
    
    // フィールド情報をJSON文字列に変換
    let fieldsJson = '[]';
    if (data.fields && Array.isArray(data.fields)) {
      try {
        fieldsJson = JSON.stringify(data.fields);
      } catch (error) {
        logError('Failed to serialize fields', error);
        fieldsJson = '[]';
      }
    }
    
    // 新しいキャンペーンのデータ準備
    const id = generateId();
    const timestamp = getCurrentTimestamp();
    
    const rowData = [
      id,
      data.title.trim(),
      data.formUrl || '',
      data.sheetUrl.trim(),
      'draft',  // 初期ステータス
      data.startDate,
      data.endDate,
      fieldsJson,
      timestamp
    ];
    
    // データベースに挿入
    insertDataToSheet('campaigns', rowData);
    
    const newCampaign = {
      id: id,
      title: data.title.trim(),
      formUrl: data.formUrl || '',
      sheetUrl: data.sheetUrl.trim(),
      status: 'draft',
      startDate: data.startDate,
      endDate: data.endDate,
      fields: data.fields || [],
      createdAt: timestamp
    };
    
    logInfo('Campaign created successfully', newCampaign);
    return newCampaign;
    
  } catch (error) {
    logError('Failed to create campaign', error);
    throw new Error('キャンペーンの作成に失敗しました: ' + error.toString());
  }
}

/**
 * キャンペーンステータス更新
 */
function updateCampaignStatus(id, status) {
  try {
    console.log('🔍 updateCampaignStatus START:', { id, status });
    logInfo(`Updating campaign status: ${id} -> ${status}`);
    
    // IDの検証
    console.log('🔍 Step 1: ID validation');
    if (!id || typeof id !== 'string') {
      console.error('❌ ID validation failed:', id);
      throw new Error('無効なIDです');
    }
    console.log('✅ ID validation passed');
    
    // ステータスの検証
    console.log('🔍 Step 2: Status validation');
    const validStatuses = ['draft', 'active', 'ended', 'archived'];
    if (!validStatuses.includes(status)) {
      console.error('❌ Status validation failed:', status);
      throw new Error('無効なステータスです');
    }
    console.log('✅ Status validation passed');
    
    // 現在のキャンペーン情報を取得して存在確認
    console.log('🔍 Step 3: Getting campaigns list...');
    const campaigns = getCampaigns();
    console.log('✅ getCampaigns completed, count:', campaigns.length);
    
    console.log('🔍 Step 4: Finding target campaign...');
    const campaign = campaigns.find(c => c.id === id);
    console.log('🔍 Target campaign found:', campaign ? 'YES' : 'NO');
    
    if (!campaign) {
      console.error('❌ Campaign not found with ID:', id);
      console.log('📋 Available campaigns:', campaigns.map(c => ({ id: c.id, title: c.title })));
      throw new Error('指定されたキャンペーンが見つかりません');
    }
    
    console.log('🔍 Step 5: Campaign found:', {
      id: campaign.id,
      title: campaign.title,
      titleType: typeof campaign.title,
      status: campaign.status
    });
    
    // ステータス変更の妥当性チェック
    console.log('🔍 Step 6: Date validation...');
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    
    if (status === 'active') {
      if (now > endDate) {
        console.error('❌ Cannot activate expired campaign');
        throw new Error('終了日を過ぎているため、アクティブにできません');
      }
    }
    console.log('✅ Date validation passed');
    
    // データベースを更新（ステータス列のみ）
    console.log('🔍 Step 7: Database update...');
    const sheet = getSheet('campaigns');
    const values = sheet.getDataRange().getValues();
    
    let updated = false;
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        console.log('🔍 Updating row:', i + 1, 'Status column (5) to:', status);
        sheet.getRange(i + 1, 5).setValue(status); // ステータス列（5列目）を更新
        updated = true;
        break;
      }
    }
    
    if (!updated) {
      console.error('❌ Could not find row to update');
      throw new Error('更新対象のデータが見つかりません');
    }
    
    console.log('✅ Database update completed');
    console.log('🎉 updateCampaignStatus SUCCESS');
    
    logInfo(`Campaign status updated successfully: ${id} -> ${status}`);
    return { success: true, id: id, status: status };
    
  } catch (error) {
    console.error('❌ updateCampaignStatus ERROR at step:', error.message);
    console.error('❌ Full error:', error);
    logError('Failed to update campaign status', error);
    
    // 🚨 重要：エラーメッセージを正確に設定
    throw new Error('キャンペーンステータスの更新に失敗しました: ' + error.toString());
  }
}

/**
 * 外部スプレッドシートから申請者データを取得
 */
function getApplicantsFromSheet(sheetUrl, campaignId) {
  try {
    logInfo(`Getting applicants from sheet: ${sheetUrl}`);
    
    const externalData = getDataFromExternalSheet(sheetUrl);
    const headers = externalData.headers;
    const rows = externalData.rows;
    
    const applicants = rows.map((row, index) => {
      const applicant = { 
        id: `applicant_${campaignId}_${index}`,
        campaignId: campaignId
      };
      
      // 各列のデータをマッピング
      headers.forEach((header, headerIndex) => {
        if (headerIndex < row.length) {
          applicant[header] = row[headerIndex];
        }
      });
      
      // よく使われる項目名の正規化
      applicant.name = applicant.name || 
                      applicant['お名前'] || 
                      applicant['氏名'] || 
                      applicant['名前'] || 
                      `申請者${index + 1}`;
      
      applicant.reason = applicant.reason || 
                        applicant['支援理由'] || 
                        applicant['理由'] || 
                        applicant['支援内容'] || 
                        '';
      
      // 金額の正規化
      let amount = applicant.amount || 
                   applicant['希望金額'] || 
                   applicant['金額'] || 
                   applicant['支援金額'] || 
                   0;
      
      if (typeof amount === 'string') {
        // 文字列から数値を抽出
        amount = parseInt(amount.replace(/[^\d]/g, ''), 10) || 0;
      }
      applicant.amount = amount;
      
      // 投票数を取得
      applicant.voteCount = getVoteCount(campaignId, applicant.id);
      
      return applicant;
    });
    
    logInfo(`Retrieved ${applicants.length} applicants`);
    return applicants;
    
  } catch (error) {
    logError('Error fetching applicants', error);
    throw new Error('申請者データの取得に失敗しました: ' + error.toString());
  }
}

/**
 * キャンペーン削除
 */
function deleteCampaign(id) {
  try {
    logInfo(`Deleting campaign: ${id}`);
    
    if (!id || typeof id !== 'string') {
      throw new Error('無効なIDです');
    }
    
    // 関連する投票データも削除
    try {
      const votes = getDataFromSheet('votes', vote => vote.campaignid === id);
      for (const vote of votes) {
        deleteDataFromSheet('votes', vote.id);
      }
      logInfo(`Deleted ${votes.length} related votes`);
    } catch (error) {
      logError('Error deleting related votes', error);
      // 投票データ削除エラーは警告として扱い、処理を続行
    }
    
    // キャンペーンを削除
    deleteDataFromSheet('campaigns', id);
    
    logInfo(`Campaign deleted successfully: ${id}`);
    return { success: true, id: id };
    
  } catch (error) {
    logError('Failed to delete campaign', error);
    throw new Error('キャンペーンの削除に失敗しました: ' + error.toString());
  }
}

/**
 * キャンペーン統計情報取得
 */
function getCampaignStats() {
  try {
    logInfo('Getting campaign statistics');
    
    const allCampaigns = getDataFromSheet('campaigns');
    const now = new Date();
    
    const stats = {
      total: allCampaigns.length,
      draft: 0,
      active: 0,
      ended: 0,
      archived: 0,
      expiringSoon: 0, // 3日以内に終了
      lastUpdated: getCurrentTimestamp()
    };
    
    allCampaigns.forEach(campaign => {
      try {
        // ステータス別カウント
        const status = campaign.status || 'draft';
        if (stats.hasOwnProperty(status)) {
          stats[status]++;
        }
        
        // もうすぐ終了するキャンペーンをカウント
        if (status === 'active') {
          const endDate = new Date(campaign.enddate);
          const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 3 && diffDays >= 0) {
            stats.expiringSoon++;
          }
        }
      } catch (error) {
        logError('Error processing campaign for stats', error);
      }
    });
    
    logInfo('Campaign statistics retrieved', stats);
    return stats;
    
  } catch (error) {
    logError('Failed to get campaign statistics', error);
    throw new Error('キャンペーン統計の取得に失敗しました: ' + error.toString());
  }
}

/**
 * 期限切れキャンペーンの自動終了
 * 定期実行用（手動実行またはトリガー設定）
 */
function autoEndExpiredCampaigns() {
  try {
    logInfo('Starting auto-end of expired campaigns');
    
    const activeCampaigns = getCampaigns('active');
    const now = new Date();
    let endedCount = 0;
    
    for (const campaign of activeCampaigns) {
      try {
        const endDate = new Date(campaign.endDate);
        
        if (now > endDate) {
          updateCampaignStatus(campaign.id, 'ended');
          endedCount++;
          logInfo(`Auto-ended expired campaign: ${campaign.title}`);
        }
      } catch (error) {
        logError(`Failed to auto-end campaign: ${campaign.id}`, error);
      }
    }
    
    logInfo(`Auto-end completed. Ended ${endedCount} campaigns`);
    return { ended: endedCount };
    
  } catch (error) {
    logError('Failed to auto-end expired campaigns', error);
    throw new Error('期限切れキャンペーンの自動終了に失敗しました: ' + error.toString());
  }
}
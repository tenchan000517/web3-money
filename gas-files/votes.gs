/**
 * WEB3 MONEY システム - 投票機能
 * 投票の追加・集計機能を提供
 */

/**
 * 投票追加（重み付き対応）
 */
function addVote(campaignId, applicantId, votePage = 'basic', youtubeOptIn = false) {
  try {
    logInfo(`Adding vote: campaign=${campaignId}, applicant=${applicantId}, page=${votePage}, youtubeOptIn=${youtubeOptIn}`);
    
    // パラメータ検証
    if (!campaignId || typeof campaignId !== 'string') {
      throw new Error('無効なキャンペーンIDです');
    }
    
    if (!applicantId || typeof applicantId !== 'string') {
      throw new Error('無効な申請者IDです');
    }
    
    if (!['basic', 'premium'].includes(votePage)) {
      throw new Error('無効な投票ページです');
    }
    
    // キャンペーンの存在・ステータス確認
    const campaigns = getCampaigns();
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      throw new Error('指定されたキャンペーンが見つかりません');
    }
    
    if (campaign.status !== 'active') {
      throw new Error('このキャンペーンは投票受付中ではありません');
    }
    
    // 投票期間の確認
    const now = new Date();
    const endDate = new Date(campaign.endDate);
    
    if (now > endDate) {
      throw new Error('投票期間が終了しています');
    }
    
    // キャンペーン設定を取得して重みを決定
    const settings = getCampaignSettings(campaignId);
    const voteWeight = votePage === 'basic' ? (settings.basicPageWeight || 1) : (settings.premiumPageWeight || 5);
    
    // 既存の投票記録を確認・更新
    const sheet = getSheet('votes');
    const values = sheet.getDataRange().getValues();
    
    let found = false;
    for (let i = 1; i < values.length; i++) {
      if (values[i][1] === campaignId && values[i][2] === applicantId) {
        // 既存レコードの投票数と重み付きスコアを更新
        const currentCount = values[i][3] || 0;
        const currentWeightedScore = values[i][6] || 0;
        const currentBasicCount = values[i][7] || 0;
        const currentPremiumCount = values[i][8] || 0;
        const currentYoutubeOptInCount = values[i][9] || 0;
        
        const newCount = currentCount + 1;
        const newWeightedScore = currentWeightedScore + voteWeight;
        const newBasicCount = votePage === 'basic' ? currentBasicCount + 1 : currentBasicCount;
        const newPremiumCount = votePage === 'premium' ? currentPremiumCount + 1 : currentPremiumCount;
        const newYoutubeOptInCount = (votePage === 'premium' && youtubeOptIn) ? currentYoutubeOptInCount + 1 : currentYoutubeOptInCount;
        
        sheet.getRange(i + 1, 4).setValue(newCount);
        sheet.getRange(i + 1, 5).setValue(getCurrentTimestamp());
        sheet.getRange(i + 1, 7).setValue(newWeightedScore);
        sheet.getRange(i + 1, 8).setValue(newBasicCount);
        sheet.getRange(i + 1, 9).setValue(newPremiumCount);
        sheet.getRange(i + 1, 10).setValue(newYoutubeOptInCount);
        
        logInfo(`Updated existing vote record: ${applicantId} -> ${newCount} votes, weighted score: ${newWeightedScore}`);
        found = true;
        break;
      }
    }
    
    // 新規投票記録を作成
    if (!found) {
      const id = generateId();
      const timestamp = getCurrentTimestamp();
      const basicCount = votePage === 'basic' ? 1 : 0;
      const premiumCount = votePage === 'premium' ? 1 : 0;
      const youtubeOptInCount = (votePage === 'premium' && youtubeOptIn) ? 1 : 0;
      
      const rowData = [
        id, 
        campaignId, 
        applicantId, 
        1, // 総投票数
        timestamp,
        '', // 予約フィールド
        voteWeight, // 重み付きスコア
        basicCount, // 基本ページ投票数
        premiumCount, // プレミアムページ投票数
        youtubeOptInCount // YouTube出演希望数
      ];
      
      insertDataToSheet('votes', rowData);
      logInfo(`Created new vote record: ${applicantId} -> 1 vote, weighted score: ${voteWeight}`);
    }
    
    logInfo('Vote added successfully');
    return { success: true };
    
  } catch (error) {
    logError('Failed to add vote', error);
    throw new Error('投票の追加に失敗しました: ' + error.toString());
  }
}

/**
 * 投票数取得
 */
function getVoteCount(campaignId, applicantId) {
  try {
    const votes = getDataFromSheet('votes', vote => 
      vote.campaignid === campaignId && vote.applicantid === applicantId
    );
    
    if (votes.length === 0) {
      return 0;
    }
    
    // 最新の投票記録の投票数を返す
    const latestVote = votes.sort((a, b) => 
      new Date(b.updatedat) - new Date(a.updatedat)
    )[0];
    
    return parseInt(latestVote.votecount) || 0;
    
  } catch (error) {
    logError('Failed to get vote count', error);
    return 0;
  }
}

/**
 * 投票データ取得（重み付きスコア含む）
 */
function getVoteData(campaignId, applicantId) {
  try {
    const votes = getDataFromSheet('votes', vote => 
      vote.campaignid === campaignId && vote.applicantid === applicantId
    );
    
    if (votes.length === 0) {
      return {
        voteCount: 0,
        weightedScore: 0,
        basicCount: 0,
        premiumCount: 0,
        youtubeOptInCount: 0
      };
    }
    
    // 最新の投票記録を返す
    const latestVote = votes.sort((a, b) => 
      new Date(b.updatedat) - new Date(a.updatedat)
    )[0];
    
    return {
      voteCount: parseInt(latestVote.votecount) || 0,
      weightedScore: parseInt(latestVote.weightedscore) || 0,
      basicCount: parseInt(latestVote.basicvotecount) || 0,
      premiumCount: parseInt(latestVote.premiumvotecount) || 0,
      youtubeOptInCount: parseInt(latestVote.youtubeoptincount) || 0
    };
    
  } catch (error) {
    logError('Failed to get vote data', error);
    return {
      voteCount: 0,
      weightedScore: 0,
      basicCount: 0,
      premiumCount: 0,
      youtubeOptInCount: 0
    };
  }
}

/**
 * キャンペーンの全投票取得
 */
function getVotes(campaignId) {
  try {
    logInfo(`Getting votes for campaign: ${campaignId}`);
    
    if (!campaignId || typeof campaignId !== 'string') {
      throw new Error('無効なキャンペーンIDです');
    }
    
    const votes = getDataFromSheet('votes', vote => vote.campaignid === campaignId);
    
    // 結果を整形
    const formattedVotes = votes.map(vote => ({
      id: vote.id,
      campaignId: vote.campaignid,
      applicantId: vote.applicantid,
      voteCount: parseInt(vote.votecount) || 0,
      updatedAt: vote.updatedat
    }));
    
    // 投票数でソート（多い順）
    formattedVotes.sort((a, b) => b.voteCount - a.voteCount);
    
    logInfo(`Retrieved ${formattedVotes.length} vote records`);
    return formattedVotes;
    
  } catch (error) {
    logError('Failed to get votes', error);
    throw new Error('投票データの取得に失敗しました: ' + error.toString());
  }
}

/**
 * キャンペーンの投票統計取得
 */
function getVoteStats(campaignId) {
  try {
    logInfo(`Getting vote statistics for campaign: ${campaignId}`);
    
    if (!campaignId || typeof campaignId !== 'string') {
      throw new Error('無効なキャンペーンIDです');
    }
    
    const votes = getVotes(campaignId);
    
    const stats = {
      campaignId: campaignId,
      totalVotes: 0,
      totalApplicants: votes.length,
      averageVotes: 0,
      maxVotes: 0,
      minVotes: 0,
      lastVoteTime: null,
      topApplicants: [],
      lastUpdated: getCurrentTimestamp()
    };
    
    if (votes.length > 0) {
      // 統計計算
      stats.totalVotes = votes.reduce((sum, vote) => sum + vote.voteCount, 0);
      stats.averageVotes = Math.round(stats.totalVotes / votes.length * 100) / 100;
      stats.maxVotes = Math.max(...votes.map(v => v.voteCount));
      stats.minVotes = Math.min(...votes.map(v => v.voteCount));
      
      // 最新投票時刻
      const latestVote = votes.sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      )[0];
      stats.lastVoteTime = latestVote.updatedAt;
      
      // トップ申請者（上位5位）
      stats.topApplicants = votes
        .sort((a, b) => b.voteCount - a.voteCount)
        .slice(0, 5)
        .map((vote, index) => ({
          rank: index + 1,
          applicantId: vote.applicantId,
          voteCount: vote.voteCount
        }));
    }
    
    logInfo('Vote statistics calculated', stats);
    return stats;
    
  } catch (error) {
    logError('Failed to get vote statistics', error);
    throw new Error('投票統計の取得に失敗しました: ' + error.toString());
  }
}

/**
 * 全キャンペーンの投票統計取得
 */
function getAllVoteStats() {
  try {
    logInfo('Getting all vote statistics');
    
    const campaigns = getCampaigns();
    const allStats = [];
    
    for (const campaign of campaigns) {
      try {
        const stats = getVoteStats(campaign.id);
        stats.campaignTitle = campaign.title;
        stats.campaignStatus = campaign.status;
        allStats.push(stats);
      } catch (error) {
        logError(`Failed to get stats for campaign: ${campaign.id}`, error);
        // エラーが発生したキャンペーンはスキップして続行
      }
    }
    
    logInfo(`Retrieved statistics for ${allStats.length} campaigns`);
    return allStats;
    
  } catch (error) {
    logError('Failed to get all vote statistics', error);
    throw new Error('全投票統計の取得に失敗しました: ' + error.toString());
  }
}

/**
 * 投票データのエクスポート
 */
function exportVoteData(campaignId) {
  try {
    logInfo(`Exporting vote data for campaign: ${campaignId}`);
    
    if (!campaignId || typeof campaignId !== 'string') {
      throw new Error('無効なキャンペーンIDです');
    }
    
    // キャンペーン情報を取得
    const campaign = getCampaignWithApplicants(campaignId);
    
    if (!campaign) {
      throw new Error('指定されたキャンペーンが見つかりません');
    }
    
    // 投票データを取得
    const votes = getVotes(campaignId);
    
    // エクスポート用データを構築
    const exportData = {
      campaign: {
        id: campaign.id,
        title: campaign.title,
        status: campaign.status,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        createdAt: campaign.createdAt
      },
      applicants: campaign.applicants.map(applicant => ({
        id: applicant.id,
        name: applicant.name,
        reason: applicant.reason,
        amount: applicant.amount,
        voteCount: applicant.voteCount
      })),
      votes: votes,
      statistics: getVoteStats(campaignId),
      exportedAt: getCurrentTimestamp()
    };
    
    logInfo('Vote data exported successfully');
    return exportData;
    
  } catch (error) {
    logError('Failed to export vote data', error);
    throw new Error('投票データのエクスポートに失敗しました: ' + error.toString());
  }
}

/**
 * 認証付き投票（ユーザー認証あり）
 */
function addAuthenticatedVote(financeId, email, name, campaignId, applicantId, votePage = 'basic', youtubeOptIn = false) {
  try {
    logInfo(`Authenticated vote attempt: ${financeId} -> ${campaignId}:${applicantId} on ${votePage}, youtubeOptIn=${youtubeOptIn}`);
    
    // 1. ユーザー登録・ログイン
    const user = registerOrLoginUser(financeId, email, name);
    
    // 2. 投票可能性チェック（ページごとにチェック）
    const eligibility = canUserVoteOnPage(financeId, campaignId, applicantId, votePage);
    if (!eligibility.canVote) {
      throw new Error(eligibility.reason);
    }
    
    // 3. 通常の投票処理（重み付き）
    const voteResult = addVote(campaignId, applicantId, votePage, youtubeOptIn);
    
    if (voteResult.success) {
      // 4. ユーザー投票履歴を記録
      const userVoteId = generateId();
      const timestamp = getCurrentTimestamp();
      const settings = getCampaignSettings(campaignId);
      const voteWeight = votePage === 'basic' ? (settings.basicPageWeight || 1) : (settings.premiumPageWeight || 5);
      
      const userVoteData = [
        userVoteId,
        financeId,
        email,
        campaignId,
        applicantId,
        timestamp,
        votePage,
        voteWeight,
        youtubeOptIn ? 'TRUE' : 'FALSE' // YouTube出演選択
      ];
      
      insertDataToSheet('user_votes', userVoteData);
      
      logInfo(`User vote recorded: ${userVoteId}`);
      
      return {
        success: true,
        voteId: userVoteId
      };
    }
    
    throw new Error('投票処理に失敗しました');
    
  } catch (error) {
    logError('Failed to add authenticated vote', error);
    throw error;
  }
}

/**
 * 不正投票のクリーンアップ
 * 開発用・メンテナンス用
 */
function cleanupInvalidVotes() {
  try {
    logInfo('Starting cleanup of invalid votes');
    
    const allVotes = getDataFromSheet('votes');
    const validCampaigns = getCampaigns().map(c => c.id);
    
    let cleanedCount = 0;
    const invalidVotes = allVotes.filter(vote => {
      // 存在しないキャンペーンへの投票を検出
      return !validCampaigns.includes(vote.campaignid);
    });
    
    for (const vote of invalidVotes) {
      try {
        deleteDataFromSheet('votes', vote.id);
        cleanedCount++;
        logInfo(`Cleaned up invalid vote: ${vote.id}`);
      } catch (error) {
        logError(`Failed to cleanup vote: ${vote.id}`, error);
      }
    }
    
    logInfo(`Cleanup completed. Cleaned ${cleanedCount} invalid votes`);
    return { cleaned: cleanedCount };
    
  } catch (error) {
    logError('Failed to cleanup invalid votes', error);
    throw new Error('不正投票のクリーンアップに失敗しました: ' + error.toString());
  }
}

/**
 * 投票データのバックアップ
 */
function backupVoteData() {
  try {
    logInfo('Starting vote data backup');
    
    const timestamp = getCurrentTimestamp().replace(/[:.]/g, '-');
    const backupSheetName = `votes_backup_${timestamp}`;
    
    // バックアップシート作成
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const originalSheet = getSheet('votes');
    const backupSheet = ss.insertSheet(backupSheetName);
    
    // データをコピー
    const data = originalSheet.getDataRange().getValues();
    if (data.length > 0) {
      backupSheet.getRange(1, 1, data.length, data[0].length).setValues(data);
    }
    
    // スタイルをコピー
    backupSheet.getRange(1, 1, 1, data[0].length).setBackground('#ea4335');
    backupSheet.getRange(1, 1, 1, data[0].length).setFontColor('white');
    backupSheet.getRange(1, 1, 1, data[0].length).setFontWeight('bold');
    backupSheet.setFrozenRows(1);
    
    logInfo(`Vote data backup created: ${backupSheetName}`);
    return { 
      success: true, 
      backupSheet: backupSheetName,
      recordCount: data.length - 1,
      createdAt: getCurrentTimestamp()
    };
    
  } catch (error) {
    logError('Failed to backup vote data', error);
    throw new Error('投票データのバックアップに失敗しました: ' + error.toString());
  }
}
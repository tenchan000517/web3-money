/**
 * WEB3 MONEY システム - 認証機能
 * ユーザー管理・投票認証機能
 */

/**
 * ユーザー登録・ログイン
 */
function registerOrLoginUser(financeId, email, name) {
  try {
    logInfo(`User registration/login attempt: ${financeId}, ${email}`);
    
    // 入力検証
    if (!isValidString(financeId, 50)) {
      throw new Error('フィナンシェIDが無効です（1-50文字で入力してください）');
    }
    
    if (!isValidEmail(email)) {
      throw new Error('メールアドレスが無効です');
    }
    
    if (!isValidString(name, 100)) {
      throw new Error('お名前が無効です（1-100文字で入力してください）');
    }
    
    const emailLower = email.toLowerCase().trim();
    const financeIdTrim = financeId.trim();
    const nameTrim = name.trim();
    
    // 既存ユーザーを検索（フィナンシェID または メールアドレス）
    const existingUsers = getDataFromSheet('users', user => 
      user.financeid === financeIdTrim || user.email.toLowerCase() === emailLower
    );
    
    const timestamp = getCurrentTimestamp();
    
    if (existingUsers.length > 0) {
      // 既存ユーザーの場合
      const user = existingUsers[0];
      
      // 🔍 重複チェック：異なる情報で既に登録されている場合
      if (user.financeid !== financeIdTrim && user.email.toLowerCase() !== emailLower) {
        throw new Error('このフィナンシェIDまたはメールアドレスは既に別のアカウントで使用されています');
      }
      
      // 情報の不一致チェック
      if (user.financeid !== financeIdTrim) {
        throw new Error('このメールアドレスは別のフィナンシェIDで登録されています');
      }
      
      if (user.email.toLowerCase() !== emailLower) {
        throw new Error('このフィナンシェIDは別のメールアドレスで登録されています');
      }
      
      if (user.name !== nameTrim) {
        throw new Error('登録されている名前と一致しません');
      }
      
      // 最終ログイン時刻を更新
      updateUserLastLogin(user.id, timestamp);
      
      logInfo(`Existing user login: ${user.id}`);
      return {
        id: user.id,
        financeId: financeIdTrim,
        email: emailLower,
        name: nameTrim,
        isNewUser: false
      };
      
    } else {
      // 新規ユーザーの場合：ユーザーを作成
      const userId = generateId();
      
      const rowData = [
        userId,
        financeIdTrim,
        emailLower,
        nameTrim,
        timestamp,
        timestamp
      ];
      
      insertDataToSheet('users', rowData);
      
      logInfo(`New user created: ${userId}`);
      return {
        id: userId,
        financeId: financeIdTrim,
        email: emailLower,
        name: nameTrim,
        isNewUser: true
      };
    }
    
  } catch (error) {
    logError('Failed to register/login user', error);
    throw new Error('ユーザー登録・ログインに失敗しました: ' + error.toString());
  }
}

/**
 * 最終ログイン時刻更新
 */
function updateUserLastLogin(userId, timestamp) {
  try {
    const sheet = getSheet('users');
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === userId) {
        sheet.getRange(i + 1, 6).setValue(timestamp); // LastLoginAt列を更新
        break;
      }
    }
  } catch (error) {
    logError('Failed to update last login', error);
  }
}

/**
 * ユーザー情報取得
 */
function getUserByFinanceId(financeId) {
  try {
    const users = getDataFromSheet('users', user => user.financeid === financeId);
    
    if (users.length === 0) {
      return null;
    }
    
    const user = users[0];
    return {
      id: user.id,
      financeId: user.financeid,
      email: user.email,
      name: user.name,
      createdAt: user.createdat,
      lastLoginAt: user.lastloginat
    };
    
  } catch (error) {
    logError('Failed to get user by finance ID', error);
    return null;
  }
}

/**
 * ユーザーの投票履歴取得
 */
function getUserVoteHistory(financeId, campaignId = null) {
  try {
    // フィナンシェIDまたはメールアドレスで検索
    const user = getUserByFinanceId(financeId);
    if (!user) return [];
    
    let filterFunction = vote => 
      vote.financeid === user.financeId || vote.email === user.email;
    
    if (campaignId) {
      filterFunction = vote => 
        (vote.financeid === user.financeId || vote.email === user.email) && 
        vote.campaignid === campaignId;
    }
    
    const votes = getDataFromSheet('user_votes', filterFunction);
    
    return votes.map(vote => ({
      id: vote.id,
      financeId: vote.financeid,
      email: vote.email,
      campaignId: vote.campaignid,
      applicantId: vote.applicantid,
      votedAt: vote.votedat
    }));
    
  } catch (error) {
    logError('Failed to get user vote history', error);
    return [];
  }
}

/**
 * 投票可能性チェック
 */
function canUserVote(financeId, campaignId, applicantId) {
  try {
    logInfo(`Checking vote eligibility: ${financeId} -> ${campaignId}:${applicantId}`);
    
    // ユーザー情報を取得（存在しない場合は新規ユーザーとして扱う）
    const user = getUserByFinanceId(financeId);
    
    // キャンペーン設定取得
    const settings = getCampaignSettings(campaignId);
    
    if (user) {
      // 既存ユーザーの場合：投票履歴をチェック
      const allUserVotes = getUserVoteHistory(financeId, campaignId);
      
      // 同一相手への重複投票チェック
      const hasVotedForApplicant = allUserVotes.some(vote => vote.applicantId === applicantId);
      if (hasVotedForApplicant) {
        return {
          canVote: false,
          reason: 'この申請者には既に投票済みです'
        };
      }
      
      // 複数投票制限チェック
      if (!settings.allowMultipleVotes && allUserVotes.length > 0) {
        return {
          canVote: false,
          reason: 'このキャンペーンでは1人1票までです'
        };
      }
      
      // 最大投票数チェック
      if (settings.maxVotesPerUser > 0 && allUserVotes.length >= settings.maxVotesPerUser) {
        return {
          canVote: false,
          reason: `このキャンペーンでは1人${settings.maxVotesPerUser}票まで。既に${allUserVotes.length}票投票済みです`
        };
      }
    }
    
    // 新規ユーザーまたは投票可能
    return { canVote: true, reason: null };
    
  } catch (error) {
    logError('Failed to check if user can vote', error);
    return {
      canVote: false,
      reason: '投票可能性のチェックに失敗しました'
    };
  }
}
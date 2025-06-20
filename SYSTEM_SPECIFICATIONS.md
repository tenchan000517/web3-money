# WEB3 MONEY システム仕様書

## 1. システム概要

### 1.1 目的
WEB3 MONEYは、レリモバ契約者向けの限定サービスを提供するWebアプリケーションです。契約レベル（基本/プレミアム）に応じた投票権重を持つ支援金キャンペーン投票システムと、お知らせ機能を中心とした会員限定サービスを提供します。

### 1.2 主要機能
- **お知らせ機能**: 契約者向けの重要なお知らせの表示
- **投票システム**: 支援金キャンペーンへの投票（契約レベル別の投票権重）
- **アクセス制御**: レリモバサイトからのリファラーチェックによる認証
- **管理機能**: お知らせとキャンペーンの管理

### 1.3 技術スタック
- **フロントエンド**: Next.js 15.3.2, React 19, TypeScript, Tailwind CSS
- **バックエンド**: Google Apps Script (GAS)
- **データベース**: Google Sheets
- **デプロイ**: Vercel (推定)

## 2. システムアーキテクチャ

### 2.1 全体構成
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   レリモバ      │────>│   WEB3 MONEY     │────>│  Google Apps    │
│ お客様サイト    │     │   (Next.js)      │     │    Script       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │                          │
                               ▼                          ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │     Vercel       │     │  Google Sheets  │
                        │   (Hosting)      │     │   (Database)    │
                        └──────────────────┘     └─────────────────┘
```

### 2.2 ディレクトリ構造
```
web3-money/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # APIルート
│   │   ├── admin/          # 管理画面
│   │   ├── main/           # メインアプリケーション
│   │   ├── relay/          # アクセス認証
│   │   └── voting/         # 投票ページ
│   ├── components/         # Reactコンポーネント
│   └── lib/               # ユーティリティとタイプ定義
├── gas-files/             # Google Apps Scriptコード
├── public/                # 静的アセット
└── doc/                   # ドキュメント
```

## 3. 機能仕様

### 3.1 アクセス制御

#### 3.1.1 リファラーチェック
- **実装場所**: `/src/app/relay/page.tsx`
- **許可されるリファラー**:
  - `xmobile.ne.jp/customer/`
  - `xmobile.ne.jp/thanks/`
  - `xmobile.ne.jp/mypage/`
  - `localhost` (開発用)
  - `127.0.0.1` (開発用)

#### 3.1.2 アクセスフロー
1. ユーザーがレリモバサイトからリンクをクリック
2. `/relay`ページでリファラーチェック
3. 認証成功後、`/main`ページへリダイレクト
4. 開発モード時は直接アクセス可能

### 3.2 お知らせ機能

#### 3.2.1 データ構造
```typescript
interface Notice {
    id: string;
    title: string;
    content: string;
    startDate?: string;
    endDate?: string;
    isPermanent?: boolean;
    createdAt: string;
}
```

#### 3.2.2 表示ロジック
- 現在日時が`startDate`と`endDate`の間にあるお知らせを表示
- `isPermanent`がtrueの場合は常に表示
- 新しい順にソート

### 3.3 投票システム

#### 3.3.1 投票権重システム
- **基本契約者** (`/voting/basic`): 投票権重 = 1
- **プレミアム契約者** (`/voting/premium`): 投票権重 = 5

#### 3.3.2 投票プロセス
1. ユーザー認証（ファイナンスID、メール、名前）
2. 投票対象の選択
3. プレミアムユーザーはYouTube出演オプトイン選択可能
4. 投票の送信と集計

#### 3.3.3 データ構造
```typescript
interface UserVote {
    id: string;
    financeId: string;
    email: string;
    campaignId: string;
    applicantId: string;
    votedAt: string;
    votePage: 'basic' | 'premium';
    voteWeight: number;
    youtubeOptIn?: boolean;
}
```

### 3.4 キャンペーン管理

#### 3.4.1 キャンペーンライフサイクル
1. **Draft**: 下書き状態
2. **Active**: 投票受付中
3. **Ended**: 投票終了
4. **Archived**: アーカイブ済み

#### 3.4.2 Google Sheets連携
- キャンペーンデータはGoogle Sheetsから自動同期
- フォームフィールドの動的検出
- リアルタイムでの投票集計

## 4. API仕様

### 4.1 エンドポイント一覧

| パス | メソッド | 説明 |
|------|----------|------|
| `/api/gas?path=notices` | GET/POST/PUT/DELETE | お知らせCRUD |
| `/api/gas?path=campaigns` | GET/POST/PUT/DELETE | キャンペーンCRUD |
| `/api/gas?path=votes` | POST | 投票送信 |
| `/api/gas?path=test-connection` | POST | Sheets接続テスト |
| `/api/gas?path=form-fields` | POST | フォームフィールド取得 |
| `/api/gas?path=register-login` | POST | ユーザー認証 |
| `/api/gas?path=check-vote-eligibility` | POST | 投票資格確認 |

### 4.2 APIゲートウェイ
- **実装**: `/src/app/api/gas/route.ts`
- Google Apps ScriptへのプロキシとしてNext.js APIルートを使用
- CORS制御とセキュリティヘッダーの管理

## 5. データフロー

### 5.1 投票フロー
```
ユーザー入力
    ↓
フロントエンド検証
    ↓
Next.js APIルート (/api/gas)
    ↓
Google Apps Script
    ↓
Google Sheets更新
    ↓
レスポンス返却
```

### 5.2 データ同期
- お知らせ: リアルタイム取得
- キャンペーン: 定期的な同期
- 投票集計: リアルタイム更新

## 6. セキュリティ設計

### 6.1 現在の実装
- リファラーベースのアクセス制御
- Next.js APIルートによるGASエンドポイントの隠蔽
- セキュリティヘッダーの設定

### 6.2 セキュリティ上の懸念事項
- API認証の欠如
- CORS設定が過度に寛容（`*`を許可）
- クライアントサイドでのリファラーチェック
- 入力サニタイゼーションの不足

## 7. パフォーマンス考慮事項

### 7.1 最適化ポイント
- コンポーネントのメモ化不足
- Google Sheetsの全行スキャン（O(n)）
- 大量のconsole.logによるパフォーマンス低下

### 7.2 推奨改善
- React.memoとuseMemoの活用
- データベースクエリの最適化
- 本番環境でのログ削除

## 8. 開発・運用

### 8.1 開発環境
```bash
npm run dev    # 開発サーバー起動 (localhost:3000)
npm run build  # プロダクションビルド
npm run start  # プロダクションサーバー起動
npm run lint   # ESLintチェック
```

### 8.2 環境変数
- `NODE_ENV`: 環境（development/production）
- `NEXT_PUBLIC_GAS_API_URL`: Google Apps ScriptのURL（現在未使用）

### 8.3 デプロイメント
- 推定: Vercelへの自動デプロイ
- ブランチ戦略: mainブランチへのプッシュで自動デプロイ

## 9. 今後の拡張性

### 9.1 計画されている機能
- より詳細な投票分析
- ユーザーダッシュボード
- 投票履歴の表示

### 9.2 技術的改善提案
1. **認証システムの強化**
   - JWT認証の実装
   - セッション管理の導入

2. **データベースの移行**
   - Google Sheetsから本格的なDBへ
   - PostgreSQLやMySQLの検討

3. **テスト戦略**
   - ユニットテストの追加
   - E2Eテストの実装

4. **監視とログ**
   - 構造化ログの導入
   - エラートラッキング（Sentry等）

## 10. 制約事項

### 10.1 技術的制約
- Google Sheetsの同時接続数制限
- Google Apps Scriptの実行時間制限（6分）
- リファラーチェックの信頼性

### 10.2 ビジネス制約
- レリモバ契約者のみのアクセス
- 契約レベルによる機能制限

---

**文書バージョン**: 1.0  
**作成日**: 2025年6月20日  
**作成者**: システムレビューチーム
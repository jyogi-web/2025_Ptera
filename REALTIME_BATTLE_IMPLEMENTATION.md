# リアルタイムバトル実装ガイド

## 概要
Firestore Snapshotsを使用してリアルタイムバトルシステムを実装しました。

## アーキテクチャ

### データフロー
```
┌─────────────────────────────────────────────────┐
│ 1. プレイヤーアクション (Attack/Retreat)          │
│    ↓                                             │
│ 2. Server Action (Next.js) → gRPC → Backend      │
│    ↓                                             │
│ 3. バックエンドがFirestoreに保存                  │
│    ↓                                             │
│ 4. Firestore Snapshot リスナーが変更を検知       │
│    ↓                                             │
│ 5. UIが自動更新                                  │
└─────────────────────────────────────────────────┘
```

## 実装ファイル

### 1. フック: `front/src/hooks/useBattleRealtime.ts`
Firestore Snapshotsを使用してバトル状態をリアルタイムで監視

**主な機能:**
- `battleId`が設定されると自動的にリアルタイム監視を開始
- バトル状態が変更されると即座にUIが更新
- コンポーネントのアンマウント時に自動的にリスナーを解除

### 2. バトルアクション: `front/src/hooks/useBattle.ts`
Server Actionsを呼び出してバトルアクションを実行

**変更点:**
- `battleState`の管理を削除 (useBattleRealtimeに移行)
- 各アクション関数は`battleId`と`playerId`を受け取る
- アクション実行後はFirestoreの自動更新に任せる

### 3. ページコンポーネント: `front/src/app/(authorized)/battle/page.tsx`
両方のフックを組み合わせてリアルタイムバトルを実現

**実装パターン:**
```typescript
const { startBattle, attack, retreat } = useBattle();
const { battleState } = useBattleRealtime(battleId);

// バトル開始
const newBattleId = await startBattle(myCircleId, opponentCircleId);
setBattleId(newBattleId); // リアルタイム監視開始

// 攻撃実行
await attack(battleId, userId); // Firestoreが自動更新 → UIが自動更新
```

## セキュリティルール

### 開発環境: `front/firestore.rules`
```javascript
match /battles/{battleId} {
  // 開発中は認証済みユーザーなら誰でも読み取り可能
  allow read: if isAuthenticated();

  // 書き込みはバックエンドのみ (Server Actions経由)
  allow write: if false;
}
```

**注意**: 開発環境では簡素化されたルールを使用しています。認証済みユーザーなら誰でもバトルを閲覧できます。

### 本番環境: `front/firestore.rules.production`
本番環境用により厳密なルールを用意しています:

```javascript
match /battles/{battleId} {
  // バトル参加者のみ読み取り可能
  allow read: if isAuthenticated() && isBattleParticipant(resource.data);

  // 書き込みはバックエンドのみ
  allow write: if false;
}

function isBattleParticipant(battleData) {
  let playerMeId = getField(getField(battleData, 'playerMe', {}), 'playerId', '');
  let playerOpponentId = getField(getField(battleData, 'playerOpponent', {}), 'playerId', '');

  return request.auth.uid == playerMeId || request.auth.uid == playerOpponentId;
}
```

## デプロイ手順

### 1. Firestoreセキュリティルールのデプロイ

#### 方法A: Firebase CLI (推奨)
```bash
cd front

# 開発環境用ルール
firebase deploy --only firestore:rules

# 本番環境用ルール (本番デプロイ時)
# 1. firestore.rules を一時的にリネーム
mv firestore.rules firestore.rules.dev
mv firestore.rules.production firestore.rules

# 2. デプロイ
firebase deploy --only firestore:rules

# 3. 元に戻す
mv firestore.rules firestore.rules.production
mv firestore.rules.dev firestore.rules
```

#### 方法B: Firebase Console
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクトを選択
3. Firestore Database → Rules タブを開く
4. `firestore.rules` (開発用) または `firestore.rules.production` (本番用) の内容をコピー&ペースト
5. 「公開」をクリック

### 2. デプロイ確認
```bash
# Firebaseプロジェクトの確認
firebase projects:list

# 現在のルールを確認
firebase firestore:rules
```

## テスト方法

### 1. ローカルテスト
```bash
# フロントエンド起動
cd front
npm run dev

# バックエンド起動
cd backend
go run cmd/server/main.go
```

### 2. 動作確認項目
- [ ] バトル開始時にリアルタイム監視が開始される
- [ ] 攻撃ボタンを押すと即座にダメージが反映される
- [ ] 交代ボタンを押すとカードが入れ替わる
- [ ] 複数のブラウザで同じバトルを開いても同期される
- [ ] エラー時に適切なエラーメッセージが表示される
- [ ] バトル終了時に勝敗が表示される

## メリット

### ✅ 実装がシンプル
- gRPCストリーミングの複雑さを回避
- Firestoreのネイティブ機能を活用

### ✅ 高いパフォーマンス
- クライアントサイドでリアルタイム更新
- 余計なポーリング不要

### ✅ セキュア
- Firestoreセキュリティルールで参加者のみアクセス可能
- 書き込みはバックエンドのみ

### ✅ スケーラブル
- Firestore自体がスケーラブル
- 追加のインフラ不要

## 今後の改善点

### 1. 認証の強化
現在は`user.id`をクライアントから送信していますが、Server Actionで認証情報を取得する方が安全:

```typescript
// actions/battle.ts
import { getServerSession } from "next-auth";

export async function attackAction(battleId: string) {
  const session = await getServerSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await battleClient.attack({ battleId, playerId: userId });
}
```

### 2. エラーハンドリングの改善
- gRPCエラーを適切に変換
- ユーザーフレンドリーなエラーメッセージ
- リトライロジックの追加

### 3. オフライン対応
- Firestoreのオフライン永続化を有効化
- オフライン時のUI表示

### 4. パフォーマンスモニタリング
- Firebase Performance Monitoring
- リアルタイム接続の監視

## トラブルシューティング

### 権限エラー: "Missing or insufficient permissions"

**症状**:
```
FirebaseError: Missing or insufficient permissions.
```

**原因と対処法**:

#### 1. Firestoreルールがデプロイされていない
```bash
# ルールをデプロイ
cd front
firebase deploy --only firestore:rules
```

#### 2. Firebase CLIがログインしていない
```bash
# ログイン状態を確認
firebase login:list

# ログインしていない場合
firebase login
```

#### 3. プロジェクトが正しく設定されていない
```bash
# 現在のプロジェクトを確認
firebase use

# プロジェクトを選択
firebase use <project-id>
```

#### 4. ローカルエミュレータを使用する (推奨: 開発中)
```bash
# Firestoreエミュレータを起動
firebase emulators:start --only firestore

# .env.localでエミュレータを使用するよう設定
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=localhost
FIRESTORE_EMULATOR_HOST=localhost:8080
```

#### 5. Firebase Consoleで手動デプロイ
Firebase CLIがうまく動作しない場合:
1. [Firebase Console](https://console.firebase.google.com/) → Firestore Database → Rules
2. `firestore.rules` の内容をコピー&ペースト
3. 「公開」をクリック
4. ブラウザをリロード

### リアルタイム更新が動作しない
1. Firebase設定を確認
   ```bash
   # .env.local のFirebase設定を確認
   cat front/.env.local
   ```
2. セキュリティルールがデプロイされているか確認
3. ブラウザのコンソールでエラーを確認
4. Firestoreのデータが実際に更新されているか確認
   - Firebase Console → Firestore Database → データを確認

### パフォーマンス問題
1. 不要なリスナーが残っていないか確認
2. `useEffect`のクリーンアップが正しく実行されているか確認
3. `battleId`の変更頻度を確認
4. React DevTools Profilerで再レンダリングを確認

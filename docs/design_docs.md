# Design Docs

## プロジェクト概要

**Ptera Card System** - 部員のカードを作成・管理するWebアプリケーション

### コンセプト

- カメラで部員を撮影し、ビジュアルカードを作成
- グループ単位でメンバーを管理
- 部内限定で閲覧可能
- 4年後に自動削除(卒業を想定)

---

## 使用技術

### Frontend

- **Next.js 16** - Reactフレームワーク
- **TypeScript** - 型安全な開発
- **TailwindCSS v4** - スタイリング
- **Vercel** - ホスティング

### Backend

- **MVP段階**: Next.js Server Actions / Route Handlers
  - Firebase SDK直接利用
  - シンプルで高速な開発
- **将来的な拡張(オプション)**: Go + Docker
  - 複雑な画像処理が必要になった場合
  - ゲーム機能の高負荷処理
  - バッチ処理

### BaaS

- Firebase
  - **Authentication** (Email/Password, Google)
  - **Firestore** (NoSQLデータベース)
  - **Storage** (画像保存)
  - **Cloud Functions** (サーバーレス関数)
  - **Cloud Scheduler** (定期実行)

---

## 機能一覧

### MVP機能 (Phase 1)

#### [認証機能](./features/authentication.md)

- ユーザー登録・ログイン
- 部内限定アクセス制御

#### [カード生成機能](./features/card-creation.md)

- カメラで部員を撮影
- カード情報入力
  - 名前、学年、役職、趣味、画像、説明、所属グループ、作成者、timestamp

#### [鑑賞機能](./features/card-gallery.md)

- ギャラリー表示
- クリックで詳細表示

### Phase 2: グループ機能

#### [グループ作成機能](./features/groups.md)

**目的**:

- サークル内のメンバーを管理する
- メンバーを知る
- 結束力をあげる

**必要項目**:

- サークル名
- サークル説明
- サークルのメンバー

**必要な権限**:

- サークルの管理者
- サークルのメンバーを追加する権限
- サークルのメンバーを削除する権限
- サークルの名前を変更する権限
- サークルの説明を変更する権限
- サークルの削除する権限

### Phase 3-7: 追加機能

#### [4年たったら作ったカードが消える機能](./features/auto-deletion.md)

- Cloud Functions + Cloud Scheduler
- 削除予定通知(オプション)

#### ゲーム部分(詳細仕様は今後決定)

- 刹那の見切り
- カードバトル

#### ガチャ(詳細仕様は今後決定)

- カードの装飾
- 武器
- 便利アイテム

#### カード部分でAI(詳細仕様は今後決定)

- 画像生成
- 説明文作成

---

---

## 技術スタック詳細

### データベース選定理由 (NoSQL vs RDB)

**現状: Cloud Firestore (NoSQL) を採用**

**理由**:

1. **データ構造の適合性**:
   - 「カード」情報は1つのドキュメントとして完結しており、頻繁なJoin(結合)操作が不要。
   - フロントエンド(JSON)とデータベースの形式が一致しており、変換コストが低い。
2. **開発スピードと柔軟性**:
   - スキーマレスであるため、開発初期の仕様変更（項目の追加・削除）に柔軟に対応可能。
   - マイグレーション作業が不要。
3. **リアルタイム性**:
   - Firestoreのリアルタイムリスナーにより、カードの追加やグループ更新を即座にUIに反映できる。

**RDB (PostgreSQL等) が必要になるタイミング**:
以下の要件が必須となった際は、RDBの併用または移行を検討します。

- **複雑な集計**: 「全期間の特定条件での統計」など、GROUP BYを多用する処理が必要な場合。
- **厳密なトランザクション**: ゲーム内通貨やアイテムトレードなど、銀行のような整合性が求められる機能。
- **ACID特性への依存**: 複雑な複合条件検索（3つ以上のフィールドにまたがる不等号フィルタなど）が多発する場合。

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 16.x | Reactフレームワーク |
| React | 19.x | UIライブラリ |
| TypeScript | 5.x | 型安全な開発 |
| TailwindCSS | 4.x | スタイリング |
| react-webcam | 7.x | カメラ機能 |
| Firebase SDK | 11.x | Firebase連携 |
| Biome | 2.x | リンター/フォーマッター |

### バックエンド・インフラ

| 技術 | 用途 |
|------|------|
| Firebase Authentication | ユーザー認証 |
| Cloud Firestore | NoSQLデータベース |
| Firebase Storage | 画像ストレージ |
| Cloud Functions | サーバーレス関数 |
| Cloud Scheduler | 定期実行ジョブ |
| Vercel | ホスティング |

---

## データモデル設計

### 主要コレクション

```typescript
// users コレクション
interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// cards コレクション
interface Card {
  id: string;
  name: string;
  grade: string;
  role: string;
  hobbies: string[];
  imageUrl: string;
  description: string;
  groupIds: string[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiryDate: Timestamp;
  template: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
  };
}

// groups コレクション
interface Group {
  id: string;
  name: string;
  description: string;
  adminIds: string[];
  memberIds: string[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

詳細は[技術設計詳細セクション](#技術設計詳細)を参照

---

## 開発フェーズ計画

### Phase 1: 基本認証とカード作成 (MVP)

**目標**: カードを作成・閲覧できる最小限の機能

**実装項目**:

#### 1. Firebase セットアップ

- [ ] Firebaseプロジェクト作成
- [ ] Authentication有効化(Email/Password, Google)
- [ ] Firestoreデータベース作成
- [ ] Storage設定
- [ ] セキュリティルール適用
- [ ] 環境変数設定(.env.local)

#### 2. [認証機能](./features/authentication.md)

- [ ] ログイン画面実装
- [ ] サインアップ画面実装
- [ ] ログアウト機能実装
- [ ] 認証状態管理(Context API)
- [ ] 認証ガード(未認証時のリダイレクト)

#### 3. [カード作成機能](./features/card-creation.md)

- [ ] カメラ撮影UI実装(`react-webcam`)
- [ ] カード情報入力フォーム
- [ ] 画像アップロード機能(Firebase Storage)
- [ ] Firestoreへのデータ保存
- [ ] 基本テンプレート実装(1種類)

#### 4. [鑑賞機能](./features/card-gallery.md)

- [ ] カード一覧画面(ギャラリー表示)
- [ ] カード詳細表示(モーダル)
- [ ] 自分のカード編集機能
- [ ] 自分のカード削除機能

**完了条件**:

- 認証済みユーザーがカードを作成できる
- カード一覧が表示される
- カード詳細が閲覧できる
- 自分のカードを編集・削除できる

---

### Phase 2: [グループ機能](./features/groups.md)

**実装項目**:

#### 1. グループ管理

- [ ] グループ作成画面
- [ ] グループ一覧表示
- [ ] グループ詳細表示
- [ ] メンバー管理UI
- [ ] 権限管理UI

#### 2. カードとグループの連携

- [ ] カード作成時のグループ選択(複数選択可能)
- [ ] グループごとのカード一覧表示
- [ ] グループフィルター機能

**完了条件**:

- グループを作成できる
- グループにメンバーを追加できる
- グループごとにカードを管理できる
- 権限が正しく機能する

---

### Phase 3: カスタマイズ機能

**実装項目**:

#### 1. カードテンプレート

- [ ] 複数テンプレート追加(3-5種類)
- [ ] テンプレート選択UI
- [ ] カラーカスタマイズ機能
- [ ] リアルタイムプレビュー

#### 2. 検索・フィルター

- [ ] 名前検索機能
- [ ] 学年フィルター
- [ ] 役職フィルター
- [ ] グループフィルター
- [ ] ソート機能

---

### Phase 4: [自動削除機能](./features/auto-deletion.md)

**実装項目**:

#### 1. 有効期限設定

- [ ] カード作成時に4年後の日付を自動設定
- [ ] カード詳細での有効期限表示

#### 2. 自動削除システム

- [ ] Cloud Functions for Firebaseのセットアップ
- [ ] 定期実行関数の実装
- [ ] Cloud Schedulerの設定
- [ ] 削除前の通知機能(オプション)

---

### Phase 5-7: 将来機能

- **Phase 5**: ガチャ機能(詳細仕様は今後決定)
- **Phase 6**: AI機能(詳細仕様は今後決定)
- **Phase 7**: ゲーム機能(詳細仕様は今後決定)

---

## 技術的な推奨事項

### MVP開発における推奨構成

**採用する構成**: **パターンA - シンプル構成**

```
Frontend (Next.js 16)
├─ App Router
├─ Server Actions (バックエンドロジック)
├─ Route Handlers (API)
└─ Firebase SDK
    ├─ Authentication
    ├─ Firestore
    └─ Storage
```

**推奨理由**:

- ✅ 技術スタックがシンプル(TypeScript一本)
- ✅ デプロイが簡単(Vercelのみ)
- ✅ 開発速度が速い
- ✅ 学習コストが低い
- ✅ コスト削減

**Goサーバーの導入タイミング**:

- 画像処理が複雑になった場合
- ゲーム機能で高負荷処理が必要になった場合
- バッチ処理が増えた場合

### 将来的なアーキテクチャ移行計画

#### Phase 1-4: REST/HTTP (現行)

```
Browser → Next.js (REST) → Firebase
```

#### Phase 5-6: Goサーバー導入

```
Browser → Next.js → Go Server (REST) → Firebase
```

**導入理由**:

- 複雑な画像処理・AI処理
- ゲーム機能の実装
- パフォーマンス最適化

#### Phase 7以降: gRPC移行(オプション)

```
Browser → Next.js (BFF) → Go Server (gRPC) → Firebase
                      ↓
                  WebSocket (リアルタイム通信)
```

**gRPC移行の判断基準**:

必要条件(すべて満たす場合):

- [ ] リアルタイムゲーム機能が必須
- [ ] 秒間1000リクエスト以上の負荷
- [ ] マイクロサービス化が必要(3つ以上のサービス)
- [ ] ミリ秒単位の最適化が必要

**gRPC移行のメリット**:

- 型安全性の向上(Protocol Buffers)
- パフォーマンス向上(バイナリ通信)
- 双方向ストリーミング
- マイクロサービス間通信の効率化

**移行ステップ**:

1. Go Server実装完了
2. Protocol Buffers定義作成
3. 一部APIをgRPC化(段階的移行)
4. パフォーマンス測定・検証
5. 全APIのgRPC化

**注意事項**:

- gRPCは開発の複雑性が増すため、必要性を十分検討
- まずはREST/WebSocketで実装し、ボトルネックがあればgRPC検討
- チームのgRPC習熟度を考慮

---

## 次のステップ

### 1. Firebaseプロジェクト作成

- Firebaseコンソールでプロジェクト作成
- 必要なサービスを有効化

### 2. 依存関係のインストール

```bash
cd front
npm install firebase react-webcam
```

### 3. プロジェクト構造の準備

- 型定義ファイル作成
- フォルダ構造の整理
- 環境変数設定

### 4. 認証機能から実装開始

- Phase 1の実装をステップバイステップで進める

---

## 技術設計詳細

詳細な技術設計は以下のドキュメントを参照してください:

### データモデル設計

#### Firestore コレクション構造

**users コレクション**

```typescript
interface User {
  uid: string;              // Firebase Auth UID
  displayName: string;      // 表示名
  email: string;            // メールアドレス
  photoURL?: string;        // プロフィール画像URL
  createdAt: Timestamp;     // 作成日時
  updatedAt: Timestamp;     // 更新日時
}
```

**cards コレクション**

```typescript
interface Card {
  id: string;               // 自動生成ID
  name: string;             // カードの名前
  grade: string;            // 学年 (例: "1年", "2年", etc.)
  role: string;             // 役職 (例: "部長", "副部長", etc.)
  hobbies: string[];        // 趣味の配列
  imageUrl: string;         // Firebase Storage URL
  description: string;      // 簡単な説明
  groupIds: string[];       // 所属グループID配列(複数可)
  createdBy: string;        // 作成者のUID
  createdAt: Timestamp;     // 作成日時
  updatedAt: Timestamp;     // 更新日時
  expiryDate: Timestamp;    // 4年後の削除日
  template: {               // カスタマイズ情報
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
  };
}
```

**groups コレクション**

```typescript
interface Group {
  id: string;               // 自動生成ID
  name: string;             // サークル名
  description: string;      // サークル説明
  adminIds: string[];       // 管理者のUID配列
  memberIds: string[];      // メンバーのUID配列
  createdBy: string;        // 作成者のUID
  createdAt: Timestamp;     // 作成日時
  updatedAt: Timestamp;     // 更新日時
}
```

**permissions サブコレクション** (`groups/{groupId}/permissions/{userId}`)

```typescript
interface GroupPermission {
  userId: string;           // ユーザーID
  canAddMembers: boolean;    // メンバー追加権限
  canRemoveMembers: boolean; // メンバー削除権限
  canEditInfo: boolean;      // 名前・説明変更権限
  canDelete: boolean;        // グループ削除権限
  grantedAt: Timestamp;      // 権限付与日時
}
```

#### データベース構造図

```
firestore/
├── users/{userId}
│   ├── uid: string
│   ├── displayName: string
│   ├── email: string
│   └── ...
│
├── cards/{cardId}
│   ├── name: string
│   ├── grade: string
│   ├── groupIds: string[]
│   ├── imageUrl: string
│   └── ...
│
└── groups/{groupId}
    ├── name: string
    ├── adminIds: string[]
    ├── memberIds: string[]
    └── permissions/{userId}
        ├── canAddMembers: boolean
        ├── canRemoveMembers: boolean
        └── ...
```

### セキュリティ設計

#### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ヘルパー関数
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isGroupAdmin(groupId) {
      return request.auth.uid in get(/databases/$(database)/documents/groups/$(groupId)).data.adminIds;
    }

    function isGroupMember(groupId) {
      return request.auth.uid in get(/databases/$(database)/documents/groups/$(groupId)).data.memberIds;
    }

    // Users コレクション
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated() && isOwner(userId);
      allow delete: if false;
    }

    // Cards コレクション
    match /cards/{cardId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.createdBy == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.createdBy == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.createdBy == request.auth.uid;
    }

    // Groups コレクション
    match /groups/{groupId} {
      allow read: if isAuthenticated() && isGroupMember(groupId);
      allow create: if isAuthenticated() && request.resource.data.createdBy == request.auth.uid;
      allow update: if isAuthenticated() && isGroupAdmin(groupId);
      allow delete: if isAuthenticated() && isGroupAdmin(groupId);

      match /permissions/{userId} {
        allow read: if isAuthenticated() && isGroupMember(groupId);
        allow write: if isAuthenticated() && isGroupAdmin(groupId);
      }
    }
  }
}
```

#### Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /cards/{cardId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024  // 5MB制限
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 備考

- この設計ドキュメントは開発を進めながら随時更新します
- 機能の優先順位は状況に応じて変更可能です
- 詳細な機能仕様は[featuresディレクトリ](./features/)を参照してください

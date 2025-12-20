# Firestore セキュリティルール クイックスタートガイド

## エラーが出ている場合 (Missing or insufficient permissions)

すぐに試す3つの方法:

### 方法1: Firebase Consoleから手動デプロイ (最速)

1. ブラウザで [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクトを選択
3. 左メニューから「Firestore Database」をクリック
4. 上部タブの「ルール」をクリック
5. 以下のルールをコピーして貼り付け:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    // Users Collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);
    }

    // Circles Collection
    match /circles/{circleId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
    }

    // Cards Collection
    match /cards/{cardId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && resource.data.creatorId == request.auth.uid;
    }

    // Battles Collection - 開発用 (誰でも読み取り可能)
    match /battles/{battleId} {
      allow read: if isAuthenticated();
      allow write: if false;
    }

    // Default rule
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

6. 右上の「公開」ボタンをクリック
7. ブラウザでアプリをリロード

### 方法2: Firebase CLIでデプロイ

```bash
cd front

# Firebase CLIがインストールされていない場合
npm install -g firebase-tools

# ログイン
firebase login

# プロジェクトを確認
firebase use

# ルールをデプロイ
firebase deploy --only firestore:rules
```

### 方法3: ローカルエミュレータを使用 (開発用)

```bash
cd front

# Firestoreエミュレータを起動
firebase emulators:start --only firestore

# 別のターミナルでNext.jsを起動
npm run dev
```

エミュレータを使用する場合、`front/src/lib/firebase.ts` を以下のように修正:

```typescript
import { getApps, initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ... 既存のコード ...

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 開発環境でエミュレータを使用
if (process.env.NODE_ENV === 'development') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // エミュレータが既に接続されている場合は無視
  }
}
```

## 確認方法

デプロイ後、以下のコマンドで確認できます:

```bash
# Firebase Consoleでルールを確認
# https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/rules

# CLIで現在のルールを表示
firebase firestore:rules

# ルールをローカルファイルにダウンロード
firebase firestore:rules > current-rules.txt
```

## まだエラーが出る場合

### 1. ブラウザのキャッシュをクリア
- Ctrl/Cmd + Shift + R で強制リロード
- またはブラウザの開発者ツール → Application → Clear Storage

### 2. Firebaseの認証状態を確認
ブラウザのコンソールで:
```javascript
import { auth } from '@/lib/firebase';
console.log('Auth user:', auth.currentUser);
```

### 3. Firestoreの接続を確認
```javascript
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

// テストクエリ
getDocs(collection(db, 'users')).then(
  snap => console.log('Success:', snap.size),
  err => console.error('Error:', err)
);
```

## セキュリティに関する注意

**重要**: 現在の開発用ルールでは、認証済みユーザーなら誰でもバトルを閲覧できます。

本番環境では `firestore.rules.production` を使用してください:
- バトル参加者のみがバトルを閲覧可能
- より厳密なバリデーション

## 参考リンク

- [Firebase Consoleでルールをテスト](https://console.firebase.google.com/)
- [Firestore セキュリティルール公式ドキュメント](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase CLI リファレンス](https://firebase.google.com/docs/cli)

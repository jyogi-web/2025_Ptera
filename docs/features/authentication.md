# 認証機能

## 概要

Firebase Authenticationを使用したユーザー認証システム。部内限定のアプリケーションのため、認証されたユーザーのみがアクセス可能。

## 目的

- 部員の身元確認
- セキュアなアクセス制御
- ユーザーごとのカード管理

## 機能要件

### 必須機能

- [ ] ユーザー登録(サインアップ)
- [ ] ログイン
- [ ] ログアウト
- [ ] 認証状態の永続化
- [ ] 未認証時のリダイレクト

### オプション機能

- [ ] パスワードリセット
- [ ] メール認証
- [ ] プロフィール編集

## 技術仕様

### 認証方式

#### 1. Email/Password認証

```typescript
// サインアップ
const signUp = async (email: string, password: string, displayName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  // Firestoreにユーザー情報を保存
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    uid: userCredential.user.uid,
    displayName,
    email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// ログイン
const signIn = async (email: string, password: string) => {
  await signInWithEmailAndPassword(auth, email, password);
};

// ログアウト
const logout = async () => {
  await signOut(auth);
};
```

#### 2. Google認証(オプション)

```typescript
const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  // 初回ログイン時のみFirestoreにユーザー情報を保存
  const userDoc = await getDoc(doc(db, 'users', result.user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      displayName: result.user.displayName,
      email: result.user.email,
      photoURL: result.user.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};
```

### データモデル

```typescript
interface User {
  uid: string;              // Firebase Auth UID
  displayName: string;      // 表示名
  email: string;            // メールアドレス
  photoURL?: string;        // プロフィール画像URL(Google認証時)
  createdAt: Timestamp;     // 作成日時
  updatedAt: Timestamp;     // 更新日時
}
```

### 認証状態管理

```typescript
// AuthContext.tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firestoreからユーザー情報を取得
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        setUser(userDoc.data() as User);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## UI設計

### ログイン画面

```
┌─────────────────────────────┐
│      Ptera Card System      │
│                             │
│  ┌───────────────────────┐  │
│  │ Email                 │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Password              │  │
│  └───────────────────────┘  │
│                             │
│  [ ログイン ]               │
│                             │
│  アカウントをお持ちでない方  │
│  [ 新規登録 ]               │
│                             │
│  または                     │
│  [ Google でログイン ]      │
└─────────────────────────────┘
```

### サインアップ画面

```
┌─────────────────────────────┐
│        新規登録             │
│                             │
│  ┌───────────────────────┐  │
│  │ 表示名                 │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Email                 │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Password              │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Password(確認)        │  │
│  └───────────────────────┘  │
│                             │
│  [ 登録 ]                   │
│                             │
│  すでにアカウントをお持ちの方│
│  [ ログイン ]               │
└─────────────────────────────┘
```

## セキュリティ

### Firestore Security Rules

```javascript
match /users/{userId} {
  // 認証済みユーザーは全員読み取り可能
  allow read: if request.auth != null;
  // 自分のデータのみ作成・更新可能
  allow create, update: if request.auth != null && request.auth.uid == userId;
  // 削除は不可
  allow delete: if false;
}
```

### バリデーション

- **Email**: 有効なメールアドレス形式
- **Password**: 最低8文字以上
- **表示名**: 1文字以上、50文字以内

## エラーハンドリング

```typescript
// エラーメッセージのマッピング
const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'このメールアドレスは既に使用されています';
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません';
    case 'auth/weak-password':
      return 'パスワードは8文字以上で設定してください';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'メールアドレスまたはパスワードが正しくありません';
    default:
      return '認証エラーが発生しました';
  }
};
```

## テスト項目

- [ ] 正常系: ユーザー登録
- [ ] 正常系: ログイン
- [ ] 正常系: ログアウト
- [ ] 異常系: 無効なメールアドレスでの登録
- [ ] 異常系: 短いパスワードでの登録
- [ ] 異常系: 既存メールアドレスでの登録
- [ ] 異常系: 間違ったパスワードでのログイン
- [ ] 認証状態の永続化確認
- [ ] 未認証時のリダイレクト確認

## 実装の優先順位

### Phase 1 (MVP)
1. Email/Password認証の基本実装
2. 認証状態管理(Context API)
3. ログイン/サインアップ画面
4. 未認証時のリダイレクト

### Phase 2
1. Google認証
2. パスワードリセット機能
3. プロフィール編集機能
4. メール認証

## 参考リソース

- [Firebase Authentication ドキュメント](https://firebase.google.com/docs/auth)
- [Next.js with Firebase Authentication](https://github.com/vercel/next.js/tree/canary/examples/with-firebase-authentication)

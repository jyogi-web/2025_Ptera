# カード作成機能

## 概要

カメラで部員を撮影し、部員情報を入力してカードを作成する機能。

## 目的

- 部員のビジュアルカードを作成
- 部員情報を記録
- 部内メンバーを視覚的に把握

## 機能要件

### 必須機能

- [ ] カメラでリアルタイム撮影
- [ ] 撮影した画像のプレビュー
- [ ] カード情報の入力フォーム
- [ ] 画像のアップロード(Firebase Storage)
- [ ] カードデータの保存(Firestore)
- [ ] 基本テンプレートの適用

### オプション機能

- [ ] 画像の編集(トリミング、フィルター)
- [ ] 複数枚の写真撮影と選択
- [ ] 画像アップロード(ファイル選択)

## カード情報

### 必須項目

| 項目 | 型 | 説明 | バリデーション |
|------|-----|------|--------------|
| name | string | 名前 | 1-50文字 |
| grade | string | 学年 | 選択式(1年~4年) |
| role | string | 役職 | 1-30文字 |
| hobbies | string[] | 趣味 | 最大5個 |
| description | string | 簡単な説明 | 1-200文字 |
| imageUrl | string | 画像URL | 必須 |

### 自動設定項目

| 項目 | 型 | 説明 |
|------|-----|------|
| createdBy | string | 作成者UID |
| createdAt | Timestamp | 作成日時 |
| updatedAt | Timestamp | 更新日時 |
| expiryDate | Timestamp | 4年後の削除日 |
| groupIds | string[] | 所属グループID(作成後に追加可能) |

## 技術仕様

### カメラ撮影

```typescript
import Webcam from 'react-webcam';

const CameraCapture = () => {
  const webcamRef = useRef<Webcam>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    setImageSrc(imageSrc);
  }, [webcamRef]);

  return (
    <div>
      {!imageSrc ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 1280,
              height: 720,
              facingMode: 'user',
            }}
          />
          <button onClick={capture}>撮影</button>
        </>
      ) : (
        <>
          <img src={imageSrc} alt="Captured" />
          <button onClick={() => setImageSrc(null)}>撮り直し</button>
        </>
      )}
    </div>
  );
};
```

### 画像アップロード

```typescript
const uploadImage = async (imageBlob: Blob, userId: string): Promise<string> => {
  // ファイル名を生成(ユニークID)
  const fileName = `${Date.now()}_${userId}.jpg`;
  const storageRef = ref(storage, `cards/${userId}/${fileName}`);

  // アップロード
  await uploadBytes(storageRef, imageBlob);

  // ダウンロードURLを取得
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

// Base64からBlobに変換
const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};
```

### カード作成処理

```typescript
interface CardFormData {
  name: string;
  grade: string;
  role: string;
  hobbies: string[];
  description: string;
  template: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
  };
}

const createCard = async (
  formData: CardFormData,
  imageSrc: string,
  userId: string
): Promise<void> => {
  try {
    // 1. 画像をアップロード
    const imageBlob = dataURLtoBlob(imageSrc);
    const imageUrl = await uploadImage(imageBlob, userId);

    // 2. 4年後の日付を計算
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 4);

    // 3. Firestoreにカード情報を保存
    await addDoc(collection(db, 'cards'), {
      ...formData,
      imageUrl,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      expiryDate: Timestamp.fromDate(expiryDate),
      groupIds: [],
    });

    console.log('カードが作成されました');
  } catch (error) {
    console.error('カード作成エラー:', error);
    throw error;
  }
};
```

### データモデル

```typescript
interface Card {
  id: string;               // 自動生成ID
  name: string;             // カードの名前
  grade: string;            // 学年
  role: string;             // 役職
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

## UI設計

### カード作成フロー

```
1. カメラ撮影
   ↓
2. プレビュー確認
   ↓
3. カード情報入力
   ↓
4. テンプレート選択(基本テンプレート)
   ↓
5. プレビュー確認
   ↓
6. 作成完了
```

### カード作成画面

```
┌─────────────────────────────────────┐
│        カード作成                   │
├─────────────────────────────────────┤
│                                     │
│  [カメラビュー/撮影済み画像]        │
│                                     │
│  [ 撮影 ] [ 撮り直し ]              │
│                                     │
├─────────────────────────────────────┤
│  名前: ┌─────────────────┐         │
│        └─────────────────┘         │
│                                     │
│  学年: [ 1年 ▼ ]                   │
│                                     │
│  役職: ┌─────────────────┐         │
│        └─────────────────┘         │
│                                     │
│  趣味: ┌─────────────────┐         │
│        │ (複数入力可能)   │         │
│        └─────────────────┘         │
│        [ + 追加 ]                  │
│                                     │
│  説明: ┌─────────────────┐         │
│        │                 │         │
│        │                 │         │
│        └─────────────────┘         │
│                                     │
├─────────────────────────────────────┤
│  [プレビュー]  [ カード作成 ]       │
└─────────────────────────────────────┘
```

## セキュリティ

### Firestore Security Rules

```javascript
match /cards/{cardId} {
  // 認証済みユーザーは全員読み取り可能
  allow read: if request.auth != null;

  // 認証済みユーザーは誰でも作成可能
  allow create: if request.auth != null
                && request.resource.data.createdBy == request.auth.uid
                && request.resource.data.name is string
                && request.resource.data.name.size() > 0
                && request.resource.data.name.size() <= 50;

  // 作成者のみ更新可能
  allow update: if request.auth != null
                && resource.data.createdBy == request.auth.uid;

  // 作成者のみ削除可能
  allow delete: if request.auth != null
                && resource.data.createdBy == request.auth.uid;
}
```

### Storage Security Rules

```javascript
match /cards/{userId}/{fileName} {
  // 認証済みユーザーのみ読み取り可能
  allow read: if request.auth != null;

  // 自分のフォルダのみアップロード可能
  allow write: if request.auth != null
               && request.auth.uid == userId
               && request.resource.size < 5 * 1024 * 1024  // 5MB制限
               && request.resource.contentType.matches('image/.*');
}
```

## バリデーション

### フロントエンド

```typescript
const validateCardForm = (data: CardFormData): string[] => {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('名前を入力してください');
  }
  if (data.name.length > 50) {
    errors.push('名前は50文字以内で入力してください');
  }

  if (!data.grade) {
    errors.push('学年を選択してください');
  }

  if (!data.role || data.role.trim().length === 0) {
    errors.push('役職を入力してください');
  }
  if (data.role.length > 30) {
    errors.push('役職は30文字以内で入力してください');
  }

  if (data.hobbies.length === 0) {
    errors.push('趣味を最低1つ入力してください');
  }
  if (data.hobbies.length > 5) {
    errors.push('趣味は5つまでです');
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push('説明を入力してください');
  }
  if (data.description.length > 200) {
    errors.push('説明は200文字以内で入力してください');
  }

  return errors;
};
```

## エラーハンドリング

```typescript
const handleCardCreation = async (data: CardFormData, imageSrc: string) => {
  try {
    // バリデーション
    const errors = validateCardForm(data);
    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }

    // カード作成
    await createCard(data, imageSrc, currentUser.uid);

    // 成功メッセージ
    toast.success('カードが作成されました');
    router.push('/cards');
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('カード作成に失敗しました');
    }
  }
};
```

## テスト項目

- [ ] カメラの起動
- [ ] 画像の撮影
- [ ] 画像のプレビュー表示
- [ ] 撮り直し機能
- [ ] フォーム入力
- [ ] バリデーションチェック
- [ ] 画像アップロード
- [ ] Firestoreへのデータ保存
- [ ] 作成完了後の遷移
- [ ] エラー時の表示

## パフォーマンス最適化

### 画像の最適化

```typescript
// 画像を圧縮してアップロード
import imageCompression from 'browser-image-compression';

const compressImage = async (imageBlob: Blob): Promise<Blob> => {
  const options = {
    maxSizeMB: 1,          // 最大1MB
    maxWidthOrHeight: 1024, // 最大1024px
    useWebWorker: true,
  };

  try {
    const compressedBlob = await imageCompression(imageBlob, options);
    return compressedBlob;
  } catch (error) {
    console.error('画像圧縮エラー:', error);
    return imageBlob; // 圧縮失敗時は元のBlobを返す
  }
};
```

## 実装の優先順位

### Phase 1 (MVP)
1. カメラ撮影機能
2. 基本情報入力フォーム
3. 画像アップロード
4. Firestoreへの保存
5. 基本テンプレート

### Phase 2
1. 画像圧縮
2. 画像編集(トリミング)
3. ファイルアップロード機能
4. 複数テンプレート

## 参考リソース

- [react-webcam ドキュメント](https://www.npmjs.com/package/react-webcam)
- [Firebase Storage ドキュメント](https://firebase.google.com/docs/storage)
- [browser-image-compression](https://www.npmjs.com/package/browser-image-compression)

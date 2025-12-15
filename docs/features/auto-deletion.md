# 自動削除機能

## 概要

カード作成から4年後に自動的にカードとその関連データを削除する機能。

## 目的

- 卒業生のデータを自動的にクリーンアップ
- ストレージ容量の節約
- データの鮮度維持

## 機能要件

### 必須機能

- [ ] カード作成時に4年後の削除日を自動設定
- [ ] 定期的な期限切れカードのチェック
- [ ] 期限切れカードの自動削除
- [ ] 関連画像の削除

### オプション機能

- [ ] 削除前の警告通知(30日前、7日前)
- [ ] 削除予定カードの一覧表示
- [ ] 削除のキャンセル/延長
- [ ] 削除履歴の記録

## 技術仕様

### 有効期限の設定

```typescript
// カード作成時に4年後の日付を計算
const createCardWithExpiry = async (cardData: CardFormData) => {
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 4);

  await addDoc(collection(db, 'cards'), {
    ...cardData,
    expiryDate: Timestamp.fromDate(expiryDate),
    createdAt: serverTimestamp(),
  });
};
```

### Cloud Functions による自動削除

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// 毎日午前2時に実行
export const deleteExpiredCards = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const db = admin.firestore();
    const storage = admin.storage();
    const now = admin.firestore.Timestamp.now();

    // 期限切れのカードを取得
    const expiredCardsSnapshot = await db
      .collection('cards')
      .where('expiryDate', '<=', now)
      .get();

    console.log(`期限切れカード: ${expiredCardsSnapshot.size}件`);

    // 削除処理
    const deletePromises = expiredCardsSnapshot.docs.map(async (doc) => {
      const card = doc.data();

      try {
        // 1. Storageから画像を削除
        if (card.imageUrl) {
          const imageRef = storage.bucket().file(getStoragePath(card.imageUrl));
          await imageRef.delete();
        }

        // 2. Firestoreからカードを削除
        await doc.ref.delete();

        console.log(`カード削除完了: ${doc.id}`);
      } catch (error) {
        console.error(`カード削除エラー: ${doc.id}`, error);
      }
    });

    await Promise.all(deletePromises);

    return null;
  });

// Storage URLからパスを抽出
const getStoragePath = (url: string): string => {
  const matches = url.match(/\/o\/(.+?)\?/);
  return matches ? decodeURIComponent(matches[1]) : '';
};
```

### 削除予定の警告通知

```typescript
// 30日前の警告
export const warnExpiringSoon = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const db = admin.firestore();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const expiringCardsSnapshot = await db
      .collection('cards')
      .where('expiryDate', '<=', admin.firestore.Timestamp.fromDate(thirtyDaysLater))
      .where('expiryDate', '>', admin.firestore.Timestamp.now())
      .get();

    // ユーザーに通知を送信
    const notificationPromises = expiringCardsSnapshot.docs.map(async (doc) => {
      const card = doc.data();
      // メール通知またはアプリ内通知を実装
      console.log(`警告通知送信: ${card.name} (${doc.id})`);
    });

    await Promise.all(notificationPromises);

    return null;
  });
```

## UI設計

### 削除予定カード表示

```
┌─────────────────────────────────────────────┐
│  削除予定のカード                           │
├─────────────────────────────────────────────┤
│                                             │
│  ⚠ 以下のカードは間もなく削除されます       │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 山田太郎                            │   │
│  │ 削除予定日: 2025/01/15              │   │
│  │ 残り: 15日                          │   │
│  │              [ 詳細 ] [ 延長 ]      │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Cloud Scheduler 設定

```bash
# 毎日午前2時に削除関数を実行
gcloud scheduler jobs create pubsub delete-expired-cards \
  --schedule="0 2 * * *" \
  --topic=delete-expired-cards \
  --message-body="trigger" \
  --time-zone="Asia/Tokyo"
```

## テスト項目

- [ ] カード作成時の有効期限設定
- [ ] 期限切れカードの検出
- [ ] カードの削除処理
- [ ] 関連画像の削除
- [ ] Cloud Functionsの動作確認
- [ ] スケジューラの動作確認
- [ ] 通知機能のテスト

## セキュリティ

- Cloud Functionsは管理者権限で実行
- 削除処理はトランザクションで保護
- エラー時のロールバック対応

## コスト試算

- Cloud Functions: 無料枠内(月1日1回実行)
- Cloud Scheduler: $0.10/月
- Firestore読み取り: 削除対象カード数により変動

## 実装の優先順位

### Phase 1
1. 有効期限の設定機能
2. 有効期限の表示

### Phase 2
1. Cloud Functions セットアップ
2. 自動削除処理の実装
3. Cloud Scheduler 設定

### Phase 3
1. 削除前の警告通知
2. 削除予定カード一覧
3. 削除のキャンセル/延長機能

## 参考リソース

- [Cloud Functions for Firebase](https://firebase.google.com/docs/functions)
- [Cloud Scheduler](https://cloud.google.com/scheduler/docs)
- [Scheduled Functions](https://firebase.google.com/docs/functions/schedule-functions)

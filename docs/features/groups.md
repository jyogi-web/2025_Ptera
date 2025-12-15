# グループ機能

## 概要

サークル内のメンバーをグループ単位で管理する機能。

## 目的

- サークル内のメンバーを管理する
- メンバーを知る
- 結束力を上げる

## 機能要件

### 必須機能

- [ ] グループ作成
- [ ] グループ一覧表示
- [ ] グループ詳細表示
- [ ] メンバー追加
- [ ] メンバー削除
- [ ] グループ名・説明の編集
- [ ] グループ削除
- [ ] 権限管理

### オプション機能

- [ ] グループアイコン設定
- [ ] グループカラー設定
- [ ] グループ招待リンク
- [ ] グループ活動履歴

## データモデル

### Group

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

### GroupPermission (サブコレクション)

```typescript
// groups/{groupId}/permissions/{userId}
interface GroupPermission {
  userId: string;           // ユーザーID
  canAddMembers: boolean;    // メンバー追加権限
  canRemoveMembers: boolean; // メンバー削除権限
  canEditInfo: boolean;      // 名前・説明変更権限
  canDelete: boolean;        // グループ削除権限
  grantedAt: Timestamp;      // 権限付与日時
}
```

## 技術仕様

### グループ作成

```typescript
const createGroup = async (
  name: string,
  description: string,
  userId: string
): Promise<string> => {
  // グループを作成
  const groupRef = await addDoc(collection(db, 'groups'), {
    name,
    description,
    adminIds: [userId],
    memberIds: [userId],
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 作成者に全権限を付与
  await setDoc(doc(db, 'groups', groupRef.id, 'permissions', userId), {
    userId,
    canAddMembers: true,
    canRemoveMembers: true,
    canEditInfo: true,
    canDelete: true,
    grantedAt: serverTimestamp(),
  });

  return groupRef.id;
};
```

### グループ一覧取得

```typescript
const useUserGroups = (userId: string) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const groupsRef = collection(db, 'groups');
    const q = query(
      groupsRef,
      where('memberIds', 'array-contains', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groupsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Group[];
      setGroups(groupsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  return { groups, loading };
};
```

### メンバー追加

```typescript
const addMember = async (groupId: string, userId: string) => {
  const groupRef = doc(db, 'groups', groupId);
  await updateDoc(groupRef, {
    memberIds: arrayUnion(userId),
    updatedAt: serverTimestamp(),
  });
};
```

### メンバー削除

```typescript
const removeMember = async (groupId: string, userId: string) => {
  const groupRef = doc(db, 'groups', groupId);

  // メンバー配列から削除
  await updateDoc(groupRef, {
    memberIds: arrayRemove(userId),
    adminIds: arrayRemove(userId), // 管理者だった場合も削除
    updatedAt: serverTimestamp(),
  });

  // 権限も削除
  await deleteDoc(doc(db, 'groups', groupId, 'permissions', userId));
};
```

### 権限管理

```typescript
// 権限の付与
const grantPermission = async (
  groupId: string,
  userId: string,
  permissions: Partial<Omit<GroupPermission, 'userId' | 'grantedAt'>>
) => {
  const permissionRef = doc(db, 'groups', groupId, 'permissions', userId);
  const permissionDoc = await getDoc(permissionRef);

  if (permissionDoc.exists()) {
    // 既存の権限を更新
    await updateDoc(permissionRef, permissions);
  } else {
    // 新規権限を作成
    await setDoc(permissionRef, {
      userId,
      canAddMembers: false,
      canRemoveMembers: false,
      canEditInfo: false,
      canDelete: false,
      ...permissions,
      grantedAt: serverTimestamp(),
    });
  }
};

// 管理者に昇格
const promoteToAdmin = async (groupId: string, userId: string) => {
  const groupRef = doc(db, 'groups', groupId);
  await updateDoc(groupRef, {
    adminIds: arrayUnion(userId),
  });

  // 全権限を付与
  await grantPermission(groupId, userId, {
    canAddMembers: true,
    canRemoveMembers: true,
    canEditInfo: true,
    canDelete: true,
  });
};

// 管理者から降格
const demoteFromAdmin = async (groupId: string, userId: string) => {
  const groupRef = doc(db, 'groups', groupId);
  await updateDoc(groupRef, {
    adminIds: arrayRemove(userId),
  });

  // 権限を削除
  await deleteDoc(doc(db, 'groups', groupId, 'permissions', userId));
};
```

### グループ削除

```typescript
const deleteGroup = async (groupId: string) => {
  // 1. 権限サブコレクションを削除
  const permissionsRef = collection(db, 'groups', groupId, 'permissions');
  const permissionsSnapshot = await getDocs(permissionsRef);
  const deletePromises = permissionsSnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  // 2. グループを削除
  await deleteDoc(doc(db, 'groups', groupId));

  // 3. カードのgroupIdsから削除
  const cardsRef = collection(db, 'cards');
  const q = query(cardsRef, where('groupIds', 'array-contains', groupId));
  const cardsSnapshot = await getDocs(q);
  const updatePromises = cardsSnapshot.docs.map(cardDoc =>
    updateDoc(cardDoc.ref, {
      groupIds: arrayRemove(groupId),
    })
  );
  await Promise.all(updatePromises);
};
```

## UI設計

### グループ一覧画面

```
┌─────────────────────────────────────────────┐
│  グループ一覧              [ + 新規作成 ]    │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ サークルA                           │   │
│  │ メンバー: 15人                      │   │
│  │ 説明: 技術系サークル                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ サークルB                           │   │
│  │ メンバー: 8人                       │   │
│  │ 説明: イベント企画サークル          │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### グループ詳細画面

```
┌─────────────────────────────────────────────┐
│  サークルA                                  │
│  [ 編集 ] [ 削除 ] (管理者のみ)            │
├─────────────────────────────────────────────┤
│  説明: 技術系サークルです                  │
│                                             │
│  メンバー (15人)            [ + 追加 ]      │
│  ┌─────────────────────────────────────┐   │
│  │ 👤 山田太郎 (管理者) [ ⚙ 権限 ]     │   │
│  │ 👤 佐藤花子           [ × 削除 ]     │   │
│  │ 👤 鈴木次郎           [ × 削除 ]     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  このグループのカード一覧                  │
│  ┌──────┐  ┌──────┐  ┌──────┐            │
│  │ Card │  │ Card │  │ Card │            │
│  └──────┘  └──────┘  └──────┘            │
│                                             │
└─────────────────────────────────────────────┘
```

### 権限管理モーダル

```
      ┌─────────────────────────────┐
      │  権限設定: 佐藤花子         │
      ├─────────────────────────────┤
      │                             │
      │  ☐ メンバー追加権限         │
      │  ☐ メンバー削除権限         │
      │  ☐ グループ情報編集権限     │
      │  ☐ グループ削除権限         │
      │                             │
      │  または                     │
      │  [ 管理者に昇格 ]           │
      │                             │
      ├─────────────────────────────┤
      │  [ キャンセル ]  [ 保存 ]   │
      └─────────────────────────────┘
```

## セキュリティ

### Firestore Security Rules

```javascript
match /groups/{groupId} {
  // グループメンバーのみ読み取り可能
  allow read: if request.auth != null
              && request.auth.uid in resource.data.memberIds;

  // 認証済みユーザーは誰でもグループ作成可能
  allow create: if request.auth != null
                && request.resource.data.createdBy == request.auth.uid
                && request.auth.uid in request.resource.data.adminIds
                && request.auth.uid in request.resource.data.memberIds;

  // 管理者のみ更新可能
  allow update: if request.auth != null
                && request.auth.uid in resource.data.adminIds;

  // 管理者のみ削除可能
  allow delete: if request.auth != null
                && request.auth.uid in resource.data.adminIds;

  // Permissions サブコレクション
  match /permissions/{userId} {
    // グループメンバーは読み取り可能
    allow read: if request.auth != null
                && request.auth.uid in get(/databases/$(database)/documents/groups/$(groupId)).data.memberIds;

    // 管理者のみ書き込み可能
    allow write: if request.auth != null
                 && request.auth.uid in get(/databases/$(database)/documents/groups/$(groupId)).data.adminIds;
  }
}
```

## 権限チェック

```typescript
const useGroupPermissions = (groupId: string, userId: string) => {
  const [permissions, setPermissions] = useState<GroupPermission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const permissionRef = doc(db, 'groups', groupId, 'permissions', userId);

    const unsubscribe = onSnapshot(permissionRef, (doc) => {
      if (doc.exists()) {
        setPermissions(doc.data() as GroupPermission);
      } else {
        setPermissions(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [groupId, userId]);

  return { permissions, loading };
};

// 使用例
const GroupDetail = ({ group, currentUserId }) => {
  const { permissions } = useGroupPermissions(group.id, currentUserId);
  const isAdmin = group.adminIds.includes(currentUserId);

  return (
    <div>
      {isAdmin && <button>グループ削除</button>}
      {permissions?.canAddMembers && <button>メンバー追加</button>}
      {permissions?.canEditInfo && <button>グループ編集</button>}
    </div>
  );
};
```

## バリデーション

```typescript
const validateGroup = (name: string, description: string): string[] => {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('グループ名を入力してください');
  }
  if (name.length > 50) {
    errors.push('グループ名は50文字以内で入力してください');
  }

  if (!description || description.trim().length === 0) {
    errors.push('説明を入力してください');
  }
  if (description.length > 200) {
    errors.push('説明は200文字以内で入力してください');
  }

  return errors;
};
```

## テスト項目

- [ ] グループ作成
- [ ] グループ一覧表示
- [ ] グループ詳細表示
- [ ] メンバー追加
- [ ] メンバー削除
- [ ] グループ名・説明の編集
- [ ] グループ削除
- [ ] 権限の付与
- [ ] 権限の剥奪
- [ ] 管理者昇格
- [ ] 管理者降格
- [ ] 権限に基づくUI表示制御
- [ ] セキュリティルールの確認

## 実装の優先順位

### Phase 1
1. グループ作成機能
2. グループ一覧表示
3. グループ詳細表示
4. メンバー追加・削除
5. 管理者機能(編集・削除)

### Phase 2
1. 詳細な権限管理
2. 権限管理UI
3. グループフィルター機能

### Phase 3
1. グループアイコン
2. グループカラー
3. 招待リンク

## ユースケース

### ケース1: 新しいサークルを作成

1. ユーザーが「新規作成」をクリック
2. グループ名と説明を入力
3. 作成ボタンをクリック
4. グループが作成され、作成者が管理者として登録される

### ケース2: メンバーを追加

1. 管理者がグループ詳細画面を開く
2. 「メンバー追加」をクリック
3. ユーザー一覧から追加したいユーザーを選択
4. メンバーが追加される

### ケース3: 権限を付与

1. 管理者がメンバーの権限設定をクリック
2. 付与したい権限にチェックを入れる
3. 保存ボタンをクリック
4. 権限が付与される

## 参考リソース

- [Firestore Array Operations](https://firebase.google.com/docs/firestore/manage-data/add-data#update_elements_in_an_array)
- [Firestore Subcollections](https://firebase.google.com/docs/firestore/data-model#subcollections)

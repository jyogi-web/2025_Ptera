# 鑑賞機能(カードギャラリー)

## 概要

作成されたカードを一覧表示し、詳細を閲覧できる機能。

## 目的

- 部員のカードを視覚的に一覧表示
- カードの詳細情報を確認
- 自分のカードを編集・削除

## 機能要件

### 必須機能

- [ ] カード一覧表示(ギャラリービュー)
- [ ] カード詳細表示(モーダル)
- [ ] 自分のカード編集
- [ ] 自分のカード削除
- [ ] ローディング状態の表示

### オプション機能

- [ ] 検索機能
- [ ] フィルター機能(学年、役職、グループ)
- [ ] ソート機能(作成日、名前順)
- [ ] ページネーション/無限スクロール
- [ ] リスト表示/グリッド表示切り替え

## 技術仕様

### カード一覧取得

```typescript
const useCards = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const cardsRef = collection(db, 'cards');
    const q = query(cardsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cardsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Card[];
        setCards(cardsData);
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { cards, loading, error };
};
```

### カード詳細取得

```typescript
const useCard = (cardId: string) => {
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cardRef = doc(db, 'cards', cardId);

    const unsubscribe = onSnapshot(cardRef, (doc) => {
      if (doc.exists()) {
        setCard({ id: doc.id, ...doc.data() } as Card);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [cardId]);

  return { card, loading };
};
```

### カード編集

```typescript
const updateCard = async (cardId: string, data: Partial<Card>) => {
  const cardRef = doc(db, 'cards', cardId);
  await updateDoc(cardRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};
```

### カード削除

```typescript
const deleteCard = async (cardId: string, imageUrl: string) => {
  try {
    // 1. Storageから画像を削除
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);

    // 2. Firestoreからカードを削除
    await deleteDoc(doc(db, 'cards', cardId));

    console.log('カードが削除されました');
  } catch (error) {
    console.error('削除エラー:', error);
    throw error;
  }
};
```

## UI設計

### ギャラリー表示

```
┌─────────────────────────────────────────────┐
│  カード一覧                  [ + 新規作成 ]  │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │ Card │  │ Card │  │ Card │  │ Card │  │
│  │      │  │      │  │      │  │      │  │
│  │ 名前 │  │ 名前 │  │ 名前 │  │ 名前 │  │
│  │ 学年 │  │ 学年 │  │ 学年 │  │ 学年 │  │
│  └──────┘  └──────┘  └──────┘  └──────┘  │
│                                             │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │ Card │  │ Card │  │ Card │  │ Card │  │
│  │      │  │      │  │      │  │      │  │
│  │ 名前 │  │ 名前 │  │ 名前 │  │ 名前 │  │
│  │ 学年 │  │ 学年 │  │ 学年 │  │ 学年 │  │
│  └──────┘  └──────┘  └──────┘  └──────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### カード詳細モーダル

```
      ┌─────────────────────────────┐
      │         [ × ]               │
      ├─────────────────────────────┤
      │                             │
      │    ┌───────────────┐        │
      │    │               │        │
      │    │   画像        │        │
      │    │               │        │
      │    └───────────────┘        │
      │                             │
      │    名前: 山田太郎            │
      │    学年: 2年                │
      │    役職: 部長                │
      │    趣味: サッカー、読書      │
      │                             │
      │    説明:                    │
      │    よろしくお願いします!    │
      │                             │
      │    作成日: 2024/01/15       │
      │                             │
      ├─────────────────────────────┤
      │  [ 編集 ]  [ 削除 ]         │
      │          (自分のカードのみ) │
      └─────────────────────────────┘
```

### カードコンポーネント

```typescript
interface CardItemProps {
  card: Card;
  onClick: () => void;
}

const CardItem: React.FC<CardItemProps> = ({ card, onClick }) => {
  return (
    <div
      className="cursor-pointer rounded-lg shadow-md hover:shadow-lg transition-shadow"
      onClick={onClick}
      style={{
        backgroundColor: card.template.backgroundColor || '#ffffff',
        borderColor: card.template.borderColor || '#e5e7eb',
        borderWidth: '2px',
      }}
    >
      <div className="aspect-square relative">
        <Image
          src={card.imageUrl}
          alt={card.name}
          fill
          className="object-cover rounded-t-lg"
        />
      </div>
      <div className="p-4" style={{ color: card.template.textColor || '#000000' }}>
        <h3 className="font-bold text-lg">{card.name}</h3>
        <p className="text-sm">{card.grade}</p>
        <p className="text-sm text-gray-600">{card.role}</p>
      </div>
    </div>
  );
};
```

### カード詳細モーダル

```typescript
interface CardDetailModalProps {
  card: Card;
  currentUserId: string;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  currentUserId,
  onClose,
  onEdit,
  onDelete,
}) => {
  const isOwner = card.createdBy === currentUserId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">カード詳細</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <Image
            src={card.imageUrl}
            alt={card.name}
            width={400}
            height={400}
            className="rounded-lg w-full"
          />
        </div>

        <div className="space-y-2">
          <div>
            <span className="font-semibold">名前:</span> {card.name}
          </div>
          <div>
            <span className="font-semibold">学年:</span> {card.grade}
          </div>
          <div>
            <span className="font-semibold">役職:</span> {card.role}
          </div>
          <div>
            <span className="font-semibold">趣味:</span> {card.hobbies.join(', ')}
          </div>
          <div>
            <span className="font-semibold">説明:</span>
            <p className="mt-1">{card.description}</p>
          </div>
          <div className="text-sm text-gray-500">
            作成日: {card.createdAt.toDate().toLocaleDateString()}
          </div>
        </div>

        {isOwner && (
          <div className="mt-6 flex gap-2">
            <button
              onClick={onEdit}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              編集
            </button>
            <button
              onClick={onDelete}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              削除
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
```

## 検索・フィルター機能

### テキスト検索

```typescript
const searchCards = (cards: Card[], searchQuery: string): Card[] => {
  if (!searchQuery.trim()) return cards;

  return cards.filter((card) =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.hobbies.some(hobby => hobby.toLowerCase().includes(searchQuery.toLowerCase()))
  );
};
```

### フィルター

```typescript
interface FilterOptions {
  grades?: string[];
  roles?: string[];
  groupIds?: string[];
}

const filterCards = (cards: Card[], filters: FilterOptions): Card[] => {
  let filtered = cards;

  if (filters.grades && filters.grades.length > 0) {
    filtered = filtered.filter(card => filters.grades!.includes(card.grade));
  }

  if (filters.roles && filters.roles.length > 0) {
    filtered = filtered.filter(card => filters.roles!.includes(card.role));
  }

  if (filters.groupIds && filters.groupIds.length > 0) {
    filtered = filtered.filter(card =>
      card.groupIds.some(id => filters.groupIds!.includes(id))
    );
  }

  return filtered;
};
```

### ソート

```typescript
type SortOption = 'createdAt' | 'name' | 'grade';

const sortCards = (cards: Card[], sortBy: SortOption, order: 'asc' | 'desc'): Card[] => {
  const sorted = [...cards].sort((a, b) => {
    switch (sortBy) {
      case 'createdAt':
        return a.createdAt.toMillis() - b.createdAt.toMillis();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'grade':
        return a.grade.localeCompare(b.grade);
      default:
        return 0;
    }
  });

  return order === 'desc' ? sorted.reverse() : sorted;
};
```

## パフォーマンス最適化

### ページネーション

```typescript
const PAGE_SIZE = 12;

const usePaginatedCards = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    const cardsRef = collection(db, 'cards');
    let q = query(
      cardsRef,
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE)
    );

    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }

    const snapshot = await getDocs(q);
    const newCards = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Card[];

    setCards(prev => [...prev, ...newCards]);
    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    setLoading(false);
  };

  return { cards, loading, loadMore };
};
```

### 画像の遅延読み込み

```typescript
<Image
  src={card.imageUrl}
  alt={card.name}
  loading="lazy"
  placeholder="blur"
  blurDataURL="/placeholder.png"
/>
```

## テスト項目

- [ ] カード一覧の表示
- [ ] カード詳細モーダルの表示
- [ ] 自分のカードの編集
- [ ] 自分のカードの削除
- [ ] 他人のカードの編集・削除不可確認
- [ ] 検索機能
- [ ] フィルター機能
- [ ] ソート機能
- [ ] ページネーション
- [ ] ローディング状態の表示
- [ ] エラー時の表示

## 実装の優先順位

### Phase 1 (MVP)
1. カード一覧表示(グリッドレイアウト)
2. カード詳細モーダル
3. 自分のカード編集・削除
4. ローディング状態

### Phase 2
1. 検索機能
2. フィルター機能
3. ソート機能

### Phase 3
1. ページネーション
2. リスト/グリッド表示切り替え
3. 無限スクロール

## 参考リソース

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Firestore Query Documentation](https://firebase.google.com/docs/firestore/query-data/queries)

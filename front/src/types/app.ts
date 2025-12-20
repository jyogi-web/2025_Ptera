// 認証済みユーザーなど、アプリ内のユーザー実体
export interface User {
  id: string; // Auth UID
  name: string; // Display Name
  iconUrl: string; // Photo URL
  email?: string; // Email
  circleId?: string; // Circle ID
}

// ユーザーのステータス情報（ランク、CP、学年など）
export interface UserStats {
  grade: string; // 学年（例: "大学3年目"）
  rank: number; // ユーザーのランク
  cp: number; // 部費（CP）
}

// カード表示用データ
export interface Card {
  id: string; // カード自体のID
  creatorId: string; // 作成者のユーザーID
  name: string; // 名前
  grade: number; // 学年
  position: string; // 役割
  affiliatedGroup?: string; // サークル名 (Legacy/Display purpose)
  circleId?: string; // Circle ID (System)
  hobby: string; // 趣味
  description: string; // 説明文
  imageUrl: string; // 画像URL
  createdAt: Date | string; // 作成日時 (serialization safe)
  expiryDate: Date | string; // 有効期限 (serialization safe)
  // バトル用ステータス（Converterで生成、Firestoreにはない場合も）
  maxHp: number;
  attack: number;
  flavor: string;
}

export interface Circle {
  id: string;
  name: string;
  description?: string;
  memberIds: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

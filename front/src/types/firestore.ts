import type {
  DocumentData,
  DocumentReference,
  Timestamp,
} from "firebase/firestore";

export interface FirestoreCard {
  name: string; // 名前
  grade: number; // 学年
  position: string; // 役割
  hobby: string; // 趣味
  description: string; // 説明文
  imageUrl: string; // 画像URL
  creatorId: string; // 作成者
  affiliatedGroupRef?: DocumentReference<DocumentData>; // サークル名(参照) - Legacy
  circleId?: string; // Circle ID (System)
  createdAt: Timestamp; // 作成日時
  expiryDate: Timestamp; // 有効期限
}

export interface FirestoreUser {
  id: string; // Auth UID
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  circleId?: string; // Circle ID
  favoriteCardIds?: string[]; // 推しメンのカードID配列
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreCircle {
  name: string;
  description?: string;
  imageUrl?: string;
  memberIds?: string[]; // Array of User IDs (optional, might get large)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreGroup {
  name: string;
  description: string;
  memberIds: string[]; // User UIDs
  imageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

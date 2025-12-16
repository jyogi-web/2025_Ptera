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
  affiliatedGroupRef?: DocumentReference<DocumentData>; // サークル名(参照)
  createdAt: Timestamp; // 作成日時
}

// 認証済みユーザーなど、アプリ内のユーザー実体
export interface User {
  id: string; // ユーザーID
  name: string; // 名前
  iconUrl: string; // アイコンURL
  email?: string; // Eメール
}

// カード表示用データ
export interface Card {
  id: string; // カード自体のID
  creatorId: string; // 作成者のユーザーID
  name: string; // 名前
  grade: number; // 学年
  position: string; // 役割
  affiliatedGroup?: string; // サークル名
  hobby: string; // 趣味
  description: string; // 説明文
  imageUrl: string; // 画像URL
  createdAt: Date; // 作成日時
}

import type { UserInfo } from "firebase/auth";
import type { Card, User } from "@/types/app";
import type { FirestoreCard } from "@/types/firestore";

/**
 * Firebase AuthのUserInfoをアプリ内のUser型に変換する
 */
export const convertUser = (firebaseUser: UserInfo): User => {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || "No Name",
    iconUrl: firebaseUser.photoURL || "",
    email: firebaseUser.email || undefined,
  };
};

/**
 * Firestoreから取得したCardデータをアプリ内のCard型に変換する
 */
export const convertCard = (docId: string, data: FirestoreCard): Card => {
  return {
    id: docId,
    creatorId: data.creatorId,
    name: data.name,
    grade: data.grade,
    position: data.position,
    affiliatedGroup: data.affiliatedGroupRef?.id, // DocumentReferenceからIDを取得する場合の仮実装。必要に応じてパスやデータを取得するロジックに変更
    hobby: data.hobby,
    description: data.description,
    imageUrl: data.imageUrl,
    createdAt: data.createdAt.toDate(),
  };
};

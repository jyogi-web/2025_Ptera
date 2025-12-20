import type { UserInfo } from "firebase/auth";
import type { Card, User } from "@/types/app";
import type { FirestoreCard, FirestoreUser } from "@/types/firestore";

/**
 * 学年に応じた卒業日（3月31日）を計算する
 */
export const calculateGraduationDate = (
  grade: number,
  currentDate: Date = new Date(),
): Date => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11

  // 現在が4月以降の場合は学年度は currentYear、3月以前の場合は currentYear-1
  const academicYear = currentMonth >= 3 ? currentYear : currentYear - 1; // 4月=3, 3月=2

  // 卒業年度を計算（4年生なら今年度末、3年生なら1年後...）
  const graduationYear = academicYear + (5 - grade); // 4年生: +1, 3年生: +2, 2年生: +3, 1年生: +4

  // 卒業日は3月31日
  return new Date(graduationYear, 2, 31); // month=2 is March (0-indexed)
};

/**
 * Firebase AuthのUserInfoをアプリ内のUser型に変換する
 */
export const convertUser = (
  firebaseUser: UserInfo,
  firestoreUser?: FirestoreUser,
): User => {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || "No Name",
    iconUrl: firebaseUser.photoURL || "",
    email: firebaseUser.email || undefined,
    circleId: firestoreUser?.circleId,
  };
};

/**
 * Firestoreから取得したCardデータをアプリ内のCard型に変換する
 */
export const convertCard = (docId: string, data: FirestoreCard): Card => {
  const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
  const defaultExpiryDate = calculateGraduationDate(data.grade, createdAt);

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

    createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
    expiryDate: data.expiryDate ? data.expiryDate.toDate() : defaultExpiryDate,
  };
};

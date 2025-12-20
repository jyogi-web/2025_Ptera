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
  // Validate grade parameter
  if (!Number.isInteger(grade) || grade < 1 || grade > 4) {
    throw new Error("Grade must be an integer between 1 and 4");
  }

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
  let defaultExpiryDate: Date;

  try {
    defaultExpiryDate = calculateGraduationDate(data.grade, createdAt);
  } catch (error) {
    console.error(
      "Invalid grade in card data, using fallback expiry date:",
      error,
    );
    // フォールバック: 作成日から4年後
    defaultExpiryDate = new Date(createdAt);
    defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 4);
  }

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

    // バトルステータス生成 (一旦ランダム + 学年補正)
    // 学年: 1~4, その他は1扱い
    maxHp: 500 + (data.grade || 1) * 50 + Math.floor(Math.random() * 100),
    attack: 100 + (data.grade || 1) * 20 + Math.floor(Math.random() * 50),
    flavor: "今日も元気にお布団から出られない。",
  };
};

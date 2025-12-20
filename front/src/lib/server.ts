import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { cookies } from "next/headers";

function getAdminApp() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set",
    );
  }

  try {
    const credentials = JSON.parse(serviceAccountKey);
    return initializeApp({
      credential: cert(credentials),
    });
  } catch (error) {
    throw new Error(
      `Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ${error instanceof Error ? error.message : "Invalid JSON"}`,
    );
  }
}

const app = getAdminApp();

export const adminAuth = getAuth(app);
export const adminDB = getFirestore(app);

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true, // checkRevoked
    );
    return decodedClaims;
  } catch (error) {
    console.error("Session verification failed", error);
    return null;
  }
}

/**
 * Firestoreのドキュメントデータをバリデーション
 */
function validateCardData(
  docId: string,
  data: Record<string, unknown>,
): {
  valid: boolean;
  card?: import("@/types/app").Card;
  error?: string;
} {
  // 必須フィールドのチェック
  if (typeof data.name !== "string" || data.name.trim().length === 0) {
    return { valid: false, error: `Card ${docId}: name is missing or invalid` };
  }

  if (typeof data.grade !== "number" || Number.isNaN(data.grade)) {
    return {
      valid: false,
      error: `Card ${docId}: grade is missing or invalid`,
    };
  }

  if (typeof data.position !== "string" || data.position.trim().length === 0) {
    return {
      valid: false,
      error: `Card ${docId}: position is missing or invalid`,
    };
  }

  if (
    typeof data.creatorId !== "string" ||
    data.creatorId.trim().length === 0
  ) {
    return {
      valid: false,
      error: `Card ${docId}: creatorId is missing or invalid`,
    };
  }

  if (typeof data.hobby !== "string") {
    return {
      valid: false,
      error: `Card ${docId}: hobby is missing or invalid`,
    };
  }

  if (typeof data.description !== "string") {
    return {
      valid: false,
      error: `Card ${docId}: description is missing or invalid`,
    };
  }

  if (typeof data.imageUrl !== "string") {
    return {
      valid: false,
      error: `Card ${docId}: imageUrl is missing or invalid`,
    };
  }

  // Timestampフィールドの安全な変換
  let createdAt: Date;
  let expiryDate: Date;

  try {
    if (
      data.createdAt &&
      typeof data.createdAt === "object" &&
      data.createdAt !== null &&
      "toDate" in data.createdAt &&
      typeof data.createdAt.toDate === "function"
    ) {
      createdAt = data.createdAt.toDate();
    } else {
      return {
        valid: false,
        error: `Card ${docId}: createdAt is not a valid Timestamp`,
      };
    }

    // expiryDateはオプショナル。存在しない場合は4年後をデフォルトとする
    if (
      data.expiryDate &&
      typeof data.expiryDate === "object" &&
      data.expiryDate !== null &&
      "toDate" in data.expiryDate &&
      typeof data.expiryDate.toDate === "function"
    ) {
      expiryDate = data.expiryDate.toDate();
    } else {
      // デフォルト: 4年後
      expiryDate = new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000);
    }
  } catch (error) {
    return {
      valid: false,
      error: `Card ${docId}: Failed to convert Timestamp - ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }

  // オプショナルフィールドの安全な取得
  const affiliatedGroup =
    data.affiliatedGroupRef &&
    typeof data.affiliatedGroupRef === "object" &&
    data.affiliatedGroupRef !== null &&
    "id" in data.affiliatedGroupRef &&
    typeof data.affiliatedGroupRef.id === "string"
      ? data.affiliatedGroupRef.id
      : undefined;

  return {
    valid: true,
    card: {
      id: docId,
      creatorId: data.creatorId,
      name: data.name,
      grade: data.grade,
      position: data.position,
      affiliatedGroup,
      hobby: data.hobby,
      description: data.description,
      imageUrl: data.imageUrl,
      createdAt,
      expiryDate,
    },
  };
}

/**
 * サーバー側でカードデータを取得
 */
export async function getCardsFromServer() {
  try {
    const cardsRef = adminDB.collection("cards");
    const snapshot = await cardsRef
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const cards: import("@/types/app").Card[] = [];
    const errors: string[] = [];

    for (const doc of snapshot.docs) {
      const result = validateCardData(doc.id, doc.data());

      if (result.valid && result.card) {
        cards.push(result.card);
      } else if (result.error) {
        console.warn(result.error);
        errors.push(result.error);
      }
    }

    if (errors.length > 0) {
      console.warn(
        `Retrieved ${cards.length} valid cards, skipped ${errors.length} invalid documents`,
      );
    }

    return cards;
  } catch (error) {
    console.error("Failed to fetch cards from server:", error);
    throw error;
  }
}

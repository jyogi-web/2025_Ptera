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

  // デバッグ: 環境変数の最初の50文字を表示
  console.log(
    "FIREBASE_SERVICE_ACCOUNT_KEY (first 50 chars):",
    serviceAccountKey.substring(0, 50),
  );
  console.log("Length:", serviceAccountKey.length);

  try {
    const credentials = JSON.parse(serviceAccountKey);
    return initializeApp({
      credential: cert(credentials),
    });
  } catch (error) {
    console.error(
      "Raw value causing error:",
      serviceAccountKey.substring(0, 100),
    );
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
 * サーバー側でカードデータを取得
 */
export async function getCardsFromServer() {
  try {
    const cardsRef = adminDB.collection("cards");
    const snapshot = await cardsRef
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const cards = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        creatorId: data.creatorId,
        name: data.name,
        grade: data.grade,
        position: data.position,
        affiliatedGroup: data.affiliatedGroupRef?.id,
        hobby: data.hobby,
        description: data.description,
        imageUrl: data.imageUrl,
        createdAt: data.createdAt?.toDate(),
        expiryDate: data.expiryDate?.toDate(),
      };
    });

    return cards;
  } catch (error) {
    console.error("Failed to fetch cards from server:", error);
    throw error;
  }
}

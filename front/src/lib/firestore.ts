import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  type QueryConstraint,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { convertCard } from "@/helper/converter";
import type { Card, Circle, User } from "@/types/app";
import type {
  FirestoreCard,
  FirestoreCircle,
  FirestoreUser,
} from "@/types/firestore";
import { db } from "./firebase";

const CARDS_COLLECTION = "cards";
const USERS_COLLECTION = "users";
const CIRCLES_COLLECTION = "circles";

/**
 * Validate card data before writing to Firestore
 */
const validateCardData = (data: Partial<FirestoreCard>) => {
  const errors: string[] = [];

  // Required fields & Type checks
  if (typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.push("Name is required");
  }

  if (typeof data.grade !== "number" || Number.isNaN(data.grade)) {
    errors.push("Grade must be a valid number");
  }

  if (typeof data.position !== "string" || data.position.trim().length === 0) {
    errors.push("Position is required");
  }

  if (
    typeof data.creatorId !== "string" ||
    data.creatorId.trim().length === 0
  ) {
    errors.push("Creator ID is missing");
  }

  // Optional string fields sanitization check (if present, must be string)
  if (data.hobby !== undefined && typeof data.hobby !== "string") {
    errors.push("Hobby must be a string");
  }
  if (data.description !== undefined && typeof data.description !== "string") {
    errors.push("Description must be a string");
  }
  if (data.imageUrl !== undefined && typeof data.imageUrl !== "string") {
    errors.push("Image URL must be a string");
  }
  if (data.circleId !== undefined && typeof data.circleId !== "string") {
    errors.push("Circle ID must be a string");
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(", ")}`);
  }

  // Return sanitized object
  return {
    name: data.name?.trim() || "",
    grade: Number(data.grade),
    position: data.position?.trim() || "",
    hobby: data.hobby?.trim() || "",
    description: data.description?.trim() || "",
    imageUrl: data.imageUrl?.trim() || "",
    creatorId: data.creatorId?.trim() || "",
    circleId: data.circleId?.trim() || "",
    expiryDate: data.expiryDate,
  };
};

export const addCard = async (
  inputData: Omit<
    FirestoreCard,
    "createdAt" | "affiliatedGroupRef" | "expiryDate"
  > & { expiryDate?: Date },
): Promise<string> => {
  // Separate expiryDate from other data
  const { expiryDate, ...cardData } = inputData;

  // Run validation on card data (without expiryDate)
  const sanitizedData = validateCardData(cardData);

  // Convert expiryDate to Timestamp if provided, otherwise set to 4 years from now
  const expiryTimestamp = expiryDate
    ? Timestamp.fromDate(expiryDate)
    : Timestamp.fromDate(new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000));

  const docRef = await addDoc(collection(db, CARDS_COLLECTION), {
    ...sanitizedData,
    createdAt: serverTimestamp(),
    expiryDate: expiryTimestamp,
  });
  return docRef.id;
};

/**
 * Get recent cards from Firestore
 */
/**
 * Type guard to check if data is valid FirestoreCard
 */
// biome-ignore lint/suspicious/noExplicitAny: Need to check any object from Firestore
const isValidFirestoreCard = (id: string, data: any): data is FirestoreCard => {
  if (!data || typeof data !== "object") {
    console.error(
      `[Firestore:Read] Document ${id} is missing or not an object`,
    );
    return false;
  }

  const missingFields: string[] = [];

  // Required fields check
  if (typeof data.name !== "string") missingFields.push("name");
  if (typeof data.grade !== "number") missingFields.push("grade");
  if (typeof data.position !== "string") missingFields.push("position");
  if (typeof data.creatorId !== "string") missingFields.push("creatorId");
  // expiryDate is optional - if missing, a default will be calculated in converter
  if (
    data.expiryDate !== undefined &&
    typeof data.expiryDate.toDate !== "function"
  )
    missingFields.push("expiryDate (type)");
  // Optional but expected types if present
  if (data.hobby !== undefined && typeof data.hobby !== "string")
    missingFields.push("hobby (type)");
  if (data.description !== undefined && typeof data.description !== "string")
    missingFields.push("description (type)");
  if (data.imageUrl !== undefined && typeof data.imageUrl !== "string")
    missingFields.push("imageUrl (type)");

  if (missingFields.length > 0) {
    console.error(
      `[Firestore:Read] Document ${id} is invalid. Missing/Invalid fields: ${missingFields.join(
        ", ",
      )}`,
    );
    return false;
  }

  return true;
};

export const getCards = async (circleId?: string): Promise<Card[]> => {
  const constraints: QueryConstraint[] = [
    orderBy("createdAt", "desc"),
    limit(20),
  ];

  if (circleId) {
    constraints.unshift(where("circleId", "==", circleId));
  }

  const q = query(collection(db, CARDS_COLLECTION), ...constraints);

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs
    .map((doc) => {
      const data = doc.data();
      if (isValidFirestoreCard(doc.id, data)) {
        return convertCard(doc.id, data);
      }
      return null;
    })
    .filter((card): card is Card => card !== null);
};

export const getCard = async (cardId: string): Promise<Card | null> => {
  const docRef = doc(db, CARDS_COLLECTION, cardId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    if (isValidFirestoreCard(docSnap.id, data)) {
      return convertCard(docSnap.id, data);
    }
  }
  return null;
};

export const updateCard = async (
  cardId: string,
  data: Partial<FirestoreCard>,
): Promise<void> => {
  const docRef = doc(db, CARDS_COLLECTION, cardId);

  // Consider validating data here if needed, similar to validateCardData
  // allowing partial updates.

  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteCard = async (cardId: string): Promise<void> => {
  const docRef = doc(db, CARDS_COLLECTION, cardId);
  await deleteDoc(docRef);
};

// --- User & Circle Management ---

export const createUser = async (user: User): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, user.id);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      id: user.id,
      displayName: user.name,
      email: user.email || "",
      photoURL: user.iconUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};

export const getUser = async (
  userId: string,
): Promise<FirestoreUser | null> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as FirestoreUser;
  }
  return null;
};

export const createCircle = async (
  name: string,
  userId: string,
): Promise<string> => {
  const circleRef = doc(collection(db, CIRCLES_COLLECTION)); // Auto-generate ID
  const userRef = doc(db, USERS_COLLECTION, userId);

  try {
    await runTransaction(db, async (transaction) => {
      // Create Circle Document
      transaction.set(circleRef, {
        name,
        memberIds: [userId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update User with Circle ID
      transaction.update(userRef, {
        circleId: circleRef.id,
        updatedAt: serverTimestamp(),
      });
    });

    return circleRef.id;
  } catch (error) {
    console.error("Failed to create circle:", error);
    throw error;
  }
};

export const joinCircle = async (
  userId: string,
  circleId: string,
): Promise<void> => {
  const circleRef = doc(db, CIRCLES_COLLECTION, circleId);
  const userRef = doc(db, USERS_COLLECTION, userId);

  try {
    await runTransaction(db, async (transaction) => {
      // First read the circle document and validate it exists
      const circleDoc = await transaction.get(circleRef);

      if (!circleDoc.exists()) {
        throw new Error(`Circle with ID ${circleId} does not exist`);
      }

      // Update user document with circleId
      transaction.update(userRef, {
        circleId: circleId,
        updatedAt: serverTimestamp(),
      });

      // Update circle document with userId
      transaction.update(circleRef, {
        memberIds: arrayUnion(userId),
        updatedAt: serverTimestamp(),
      });
    });
  } catch (error) {
    console.error("Failed to join circle:", error);
    throw error; // Re-throw to let callers handle
  }
};

export const getCircles = async (): Promise<Circle[]> => {
  const q = query(
    collection(db, CIRCLES_COLLECTION),
    orderBy("createdAt", "desc"),
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data() as FirestoreCircle;
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      memberIds: data.memberIds || [],
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  });
};

/**
 * ユーザーの推しメンを設定（1人まで）
 * 既存の推しメンは自動的に解除される
 */
export const addFavoriteCard = async (
  userId: string,
  cardId: string,
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, userId);

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);

    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const currentFavorites = userDoc.data().favoriteCardIds || [];

    // 既に同じカードが登録されている場合は何もしない
    if (currentFavorites.includes(cardId)) {
      return;
    }

    // 新しい推しメン（1人のみ）
    transaction.update(userRef, {
      favoriteCardIds: [cardId],
      updatedAt: serverTimestamp(),
    });
  });
};

/**
 * ユーザーの推しメンリストから削除
 */
export const removeFavoriteCard = async (
  userId: string,
  cardId: string,
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, userId);

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);

    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const favoriteCardIds = userDoc.data().favoriteCardIds || [];
    const updatedFavorites = favoriteCardIds.filter(
      (id: string) => id !== cardId,
    );

    transaction.update(userRef, {
      favoriteCardIds: updatedFavorites,
      updatedAt: serverTimestamp(),
    });
  });
};

/**
 * ユーザーの推しメンカードを取得
 */
export const getFavoriteCards = async (userId: string): Promise<Card[]> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    return [];
  }

  const favoriteCardIds = userDoc.data().favoriteCardIds || [];

  if (favoriteCardIds.length === 0) {
    return [];
  }

  // 推しメンカードを取得
  const cards: Card[] = [];

  for (const cardId of favoriteCardIds) {
    const cardRef = doc(db, CARDS_COLLECTION, cardId);
    const cardDoc = await getDoc(cardRef);

    if (cardDoc.exists()) {
      const card = convertCard(cardDoc.id, cardDoc.data() as FirestoreCard);
      cards.push(card);
    }
  }

  return cards;
};

export const deleteBattle = async (battleId: string): Promise<void> => {
  console.log("Starting deleteBattle for:", battleId);
  const battleRef = doc(db, "battles", battleId);
  const battleDoc = await getDoc(battleRef);

  if (battleDoc.exists()) {
    console.log("Found battle doc. Deleting...");
    await import("firebase/firestore").then(({ deleteDoc }) =>
      deleteDoc(battleRef),
    );
  } else {
    console.log("Battle doc not found (already deleted?)");
  }

  // Find and delete the associated Battle Request document
  // Strategy 1: Check battle doc for requestId
  let requestId = battleDoc.data()?.requestId;
  console.log("Strategy 1 requestId:", requestId);

  // Strategy 2: If not found, query battle_requests by battleId
  if (!requestId) {
    console.log("Querying battle_requests for battleId:", battleId);
    const q = query(
      collection(db, "battle_requests"),
      where("battleId", "==", battleId),
      limit(1),
    );
    const snapshot = await getDocs(q);
    console.log("Query snapshot size:", snapshot.size);
    if (!snapshot.empty) {
      requestId = snapshot.docs[0].id;
      console.log("Found requestId from query:", requestId);
    }
  }

  if (requestId) {
    console.log("Deleting request:", requestId);
    const requestRef = doc(db, "battle_requests", requestId);
    await import("firebase/firestore").then(({ deleteDoc }) =>
      deleteDoc(requestRef),
    );
    console.log("Deleted request successfully");
  } else {
    console.warn(
      "Could not find associated battle_request for battle:",
      battleId,
    );
  }
};

export const saveGameRecord = async (
  userId: string,
  circleId: string | undefined,
  gameId: string,
  score: number,
  displayName: string,
  photoURL: string,
): Promise<void> => {
  try {
    await addDoc(collection(db, "game_records"), {
      userId,
      circleId: circleId || null,
      gameId,
      score,
      displayName,
      photoURL: photoURL || "",
      createdAt: serverTimestamp(),
    });
    console.log("Game record saved successfully");
  } catch (error) {
    console.error("Error saving game record:", error);
  }
};

export interface GameRecord {
  id: string;
  userId: string;
  displayName: string;
  photoURL: string;
  score: number;
  createdAt: Date;
}

export const getGameRanking = async (
  gameId: string,
  limitCount = 10,
): Promise<GameRecord[]> => {
  try {
    const q = query(
      collection(db, "game_records"),
      where("gameId", "==", gameId),
      orderBy("score", "asc"),
      limit(limitCount),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        displayName: data.displayName || "Unknown",
        photoURL: data.photoURL || "",
        score: data.score,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error("Error fetching game ranking:", error);
    return [];
  }
};

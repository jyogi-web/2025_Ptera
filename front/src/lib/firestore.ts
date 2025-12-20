import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
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

  if (!data.expiryDate || typeof data.expiryDate.toDate !== "function") {
    errors.push("Expiry Date is required and must be a Timestamp");
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
  inputData: Omit<FirestoreCard, "createdAt" | "affiliatedGroupRef">,
): Promise<string> => {
  // Run validation
  const sanitizedData = validateCardData(inputData);

  const docRef = await addDoc(collection(db, CARDS_COLLECTION), {
    ...sanitizedData,
    createdAt: serverTimestamp(),
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
  if (!data.expiryDate || typeof data.expiryDate.toDate !== "function")
    missingFields.push("expiryDate");
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
  let q = query(
    collection(db, CARDS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(20),
  );

  if (circleId) {
    q = query(
      collection(db, CARDS_COLLECTION),
      where("circleId", "==", circleId),
      orderBy("createdAt", "desc"),
      limit(20),
    );
  }

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
  // Create Circle Document
  const circleRef = await addDoc(collection(db, CIRCLES_COLLECTION), {
    name,
    memberIds: [userId],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update User with Circle ID
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    circleId: circleRef.id,
    updatedAt: serverTimestamp(),
  });

  return circleRef.id;
};

export const joinCircle = async (
  userId: string,
  circleId: string,
): Promise<void> => {
  // Update User with Circle ID
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    circleId: circleId,
    updatedAt: serverTimestamp(),
  });

  // Update Circle with Member ID
  const circleRef = doc(db, CIRCLES_COLLECTION, circleId);
  await updateDoc(circleRef, {
    memberIds: arrayUnion(userId),
    updatedAt: serverTimestamp(),
  });
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
    };
  });
};

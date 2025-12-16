import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { convertCard } from "@/helper/converter";
import type { Card } from "@/types/app";
import type { FirestoreCard } from "@/types/firestore";
import { db } from "./firebase";

const CARDS_COLLECTION = "cards";

/**
 * Add a new card to Firestore
 */
export const addCard = async (
  data: Omit<FirestoreCard, "createdAt" | "affiliatedGroupRef">,
): Promise<string> => {
  const docRef = await addDoc(collection(db, CARDS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Get recent cards from Firestore
 */
export const getCards = async (): Promise<Card[]> => {
  const q = query(
    collection(db, CARDS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(20),
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    // Cast data to FirestoreCard (assuming data is valid for now)
    const data = doc.data() as FirestoreCard;
    return convertCard(doc.id, data);
  });
};

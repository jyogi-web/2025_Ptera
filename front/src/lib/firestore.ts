import {
    collection,
    addDoc,
    serverTimestamp,
    getDocs,
    query,
    orderBy,
    limit,
} from "firebase/firestore";
import { db } from "./firebase";
import type { FirestoreCard } from "@/types/firestore";
import type { Card } from "@/types/app";
import { convertCard } from "@/helper/converter";

const CARDS_COLLECTION = "cards";

/**
 * Add a new card to Firestore
 */
export const addCard = async (
    data: Omit<FirestoreCard, "createdAt" | "affiliatedGroupRef">
): Promise<string> => {
    console.log("addCard: Starting...", data);
    try {
        const docRef = await addDoc(collection(db, CARDS_COLLECTION), {
            ...data,
            createdAt: serverTimestamp(),
        });
        console.log("addCard: Doc written with ID:", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("addCard: Error adding doc", e);
        throw e;
    }
};

/**
 * Get recent cards from Firestore
 */
export const getCards = async (): Promise<Card[]> => {
    const q = query(
        collection(db, CARDS_COLLECTION),
        orderBy("createdAt", "desc"),
        limit(20)
    );
    const querySnapshot = await getDocs(q);
    console.log("getCards: Snapshot metadata", {
        fromCache: querySnapshot.metadata.fromCache,
        hasPendingWrites: querySnapshot.metadata.hasPendingWrites
    });

    return querySnapshot.docs.map((doc) => {
        // Cast data to FirestoreCard (assuming data is valid for now)
        const data = doc.data() as FirestoreCard;
        return convertCard(doc.id, data);
    });
};

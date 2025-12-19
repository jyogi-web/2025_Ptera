import "server-only";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { cookies } from "next/headers";

function getAdminApp() {
    const apps = getApps();
    if (apps.length > 0) {
        return apps[0];
    }

    // Load service account from environment variable
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
        throw new Error(
            "FIREBASE_SERVICE_ACCOUNT_KEY is not defined in environment variables.",
        );
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        return initializeApp({
            credential: cert(serviceAccount),
        });
    } catch (error) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY", error);
        throw new Error("Invalid JSON in FIREBASE_SERVICE_ACCOUNT_KEY.");
    }
}

export const adminAuth = getAuth(getAdminApp());

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

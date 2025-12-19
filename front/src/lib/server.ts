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

    // CI/テスト環境ではダミー値を使用してビルドを通す
    const isDummyMode = process.env.CI === "true";

    if (isDummyMode) {
        return initializeApp(
            {
                projectId: "dummy-project",
                credential: cert({
                    projectId: "dummy-project",
                    clientEmail: "dummy@example.com",
                    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD\n-----END PRIVATE KEY-----\n",
                }),
            },
            "dummy-app",
        );
    }

    return initializeApp({
        credential: cert(
            // 環境変数から認証情報を取得
            JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string),
        ),
    });
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

import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getAdminApp() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  // Load service account from local file
  // In production, this should preferably come from an environment variable
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const serviceAccount = require(`${process.cwd()}/serviceAccountKey.json`);

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export const adminAuth = getAuth(getAdminApp());

import { cookies } from "next/headers";

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

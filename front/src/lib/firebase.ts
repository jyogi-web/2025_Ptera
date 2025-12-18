import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const getFirebaseConfig = () => {
  // CI/テスト環境ではダミー値を使用してビルドを通す
  const isDummyMode = process.env.CI === "true";

  const config = {
    apiKey:
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() ||
      (isDummyMode ? "dummy-api-key" : ""),
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ||
      (isDummyMode ? "dummy-project.firebaseapp.com" : ""),
    projectId:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
      (isDummyMode ? "dummy-project" : ""),
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ||
      (isDummyMode ? "dummy-project.appspot.com" : ""),
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ||
      (isDummyMode ? "123456789012" : ""),
    appId:
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() ||
      (isDummyMode ? "1:123456789012:web:abcdef123456" : ""),
  };

  // 開発/本番環境で環境変数が不足している場合は警告
  if (!isDummyMode) {
    // 本番/開発環境では厳格なバリデーション
    const missingVars = Object.entries(config)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required Firebase environment variables: ${missingVars.join(", ")}`
      );
    }
  }

  return config;
};

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase (SSR safe)
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

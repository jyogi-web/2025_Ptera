"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { convertUser } from "@/helper/converter";
import { auth } from "@/lib/firebase";
import type { User } from "@/types/app";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  clearError: () => void;
  loginWithGoogle: () => Promise<Error | null>;
  loginWithEmail: (email: string, pass: string) => Promise<Error | null>;
  signupWithEmail: (email: string, pass: string) => Promise<Error | null>;
  logout: () => Promise<Error | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Basic conversion
        let appUser = convertUser(firebaseUser);

        try {
          // Fetch additional data from Firestore
          const { getUser, createUser } = await import("@/lib/firestore");
          const firestoreUser = await getUser(appUser.id);

          if (firestoreUser) {
            // Merge Firestore data (circleId)
            appUser = convertUser(firebaseUser, firestoreUser);
          } else {
            // Create new user document
            await createUser(appUser);
            // No extra data to merge yet
          }
        } catch (e) {
          console.error("Failed to sync user with Firestore:", e);
        }

        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const loginWithGoogle = async (): Promise<Error | null> => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return null;
    } catch (e) {
      const err = e as Error;
      setError(err);
      return err;
    }
  };

  const loginWithEmail = async (
    email: string,
    pass: string,
  ): Promise<Error | null> => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return null;
    } catch (e) {
      const err = e as Error;
      setError(err);
      return err;
    }
  };

  const signupWithEmail = async (
    email: string,
    pass: string,
  ): Promise<Error | null> => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      return null;
    } catch (e) {
      const err = e as Error;
      setError(err);
      return err;
    }
  };

  const logout = async (): Promise<Error | null> => {
    setError(null);
    try {
      await signOut(auth);
      return null;
    } catch (e) {
      const err = e as Error;
      setError(err);
      return err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        clearError,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

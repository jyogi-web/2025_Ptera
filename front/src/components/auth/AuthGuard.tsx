"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <output
        aria-live="polite"
        className="flex min-h-screen items-center justify-center bg-gray-900 text-white"
      >
        <div className="text-xl animate-pulse">読み込み中...</div>
      </output>
    );
  }

  if (!user) {
    // Return null while redirecting to avoid flashing content
    return null;
  }

  return <>{children}</>;
}

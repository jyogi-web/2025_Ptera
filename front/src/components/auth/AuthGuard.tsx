"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!user.circleId && pathname !== "/circle") {
        router.push("/circle");
      }
    }
  }, [user, loading, router, pathname]);

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

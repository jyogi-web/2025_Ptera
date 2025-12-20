"use client";

import { Animator, AnimatorGeneralProvider } from "@arwes/react";
import { doc, onSnapshot } from "firebase/firestore";
import { Loader2, LogIn } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { getFavoriteCards } from "@/lib/firestore";
import type { Card, UserStats } from "@/types/app";
import { HeaderInfoPanel } from "./HeaderInfoPanel";
import { HeaderStatusPanel } from "./HeaderStatusPanel";

// ヘッダーを非表示にするパスのリスト (Module Scope)
const HIDDEN_PATHS = ["/login", "/"] as const;

export const Header = (): React.JSX.Element | null => {
  const { user, loading, loginWithGoogle } = useAuth();
  const [activate, setActivate] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const pathname = usePathname();

  // 現在のパスが非表示リストに含まれているかチェック
  const isHeaderVisible =
    !pathname ||
    !HIDDEN_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );

  // TODO: ユーザーデータから実際の値を取得するように実装する
  // 現在はモックデータを使用しています
  // 今後、以下のデータをAuthContextまたはAPIから取得する必要があります
  const mockUserStats: UserStats = {
    grade: "大学3年目",
    rank: 42,
    cp: 15000,
  };

  // Compute 'today' only once or on mount
  const today = useMemo(() => {
    return new Date().toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }, []);

  useEffect(() => {
    setActivate(true);
  }, []);

  const [favorite, setFavorite] = useState<Card | null>(null);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.id);

    // Subscribe to user document changes to react to favorite updates in real-time
    const unsubscribe = onSnapshot(
      userRef,
      async (snapshot) => {
        try {
          const data = snapshot.data();
          const favoriteCardIds: string[] = data?.favoriteCardIds || [];

          if (favoriteCardIds.length === 0) {
            setFavorite(null);
            return;
          }

          // Load the latest favorite card (the last one in the array)
          const favorites = await getFavoriteCards(user.id);
          if (favorites.length > 0)
            setFavorite(favorites[favorites.length - 1]);
        } catch (e) {
          console.error("Failed to update favorite for header:", e);
        }
      },
      (err) => {
        console.error("Favorite snapshot error:", err);
      },
    );

    return () => unsubscribe();
  }, [user]);

  if (!isHeaderVisible) return null;

  const gradeLabel = favorite
    ? `大学${favorite.grade}年目`
    : mockUserStats.grade;

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
      // Optionally dispatch a toast here
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <AnimatorGeneralProvider duration={{ enter: 200, exit: 200 }}>
        {/* role="banner" is redundant for header element. pointer-events-none ensures clicks pass through the header container, 
                while pointer-events-auto is re-applied to interactive children. */}
        <header className="fixed top-0 left-0 w-full z-50 pointer-events-none">
          {/* 背景のぼかしとオーバーレイ */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md border-b border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.5)] pointer-events-auto">
            <div className="w-full h-16 flex items-center justify-center">
              {/* ログイン時: HUDステータスパネル */}
              {user && (
                <div className="flex items-center justify-center w-full space-x-0 text-sm md:text-base">
                  <HeaderStatusPanel active={activate} favorite={favorite} />
                  <HeaderInfoPanel
                    active={activate}
                    today={today}
                    grade={gradeLabel}
                  />
                </div>
              )}

              {/* 未ログイン時 (ローディング中でない場合のみ表示) */}
              {!user && !loading && (
                <div className="pointer-events-auto flex justify-end w-full px-6">
                  <Animator active={activate}>
                    <button
                      type="button"
                      onClick={handleLogin}
                      disabled={isLoggingIn}
                      aria-label="Sign in with Google"
                      aria-busy={isLoggingIn}
                      className={`flex items-center space-x-2 px-4 py-2 bg-cyan-900/30 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-800/50 hover:text-cyan-200 transition-all rounded-sm uppercase font-mono text-sm tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${isLoggingIn ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {isLoggingIn ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <LogIn size={16} />
                      )}
                      <span>{isLoggingIn ? "Signing in..." : "Login"}</span>
                    </button>
                  </Animator>
                </div>
              )}
              {loading && (
                <div className="flex items-center space-x-3 px-6 py-2 pointer-events-none select-none">
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500 blur-md opacity-20 animate-pulse"></div>
                    <Loader2
                      className="relative z-10 text-cyan-400 animate-spin"
                      size={20}
                    />
                  </div>
                  <span className="font-mono text-cyan-400 text-sm tracking-[0.2em] animate-pulse">
                    SYSTEM_AUTH...
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>
      </AnimatorGeneralProvider>
      {/* コンテンツを押し下げるためのスペーサー */}
      <div className="h-20"></div>
    </>
  );
};

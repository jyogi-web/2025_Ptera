"use client";

import { Animator, AnimatorGeneralProvider } from "@arwes/react";
import { Loader2, LogIn } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { HeaderInfoPanel } from "./HeaderInfoPanel";
import { HeaderStatusPanel } from "./HeaderStatusPanel";

// ヘッダーを非表示にするパスのリスト (Module Scope)
const HIDDEN_PATHS = ["/login"] as const;

export const Header = (): React.JSX.Element | null => {
  const { user, loading, loginWithGoogle } = useAuth();
  const [activate, setActivate] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const pathname = usePathname();

  // 現在のパスが非表示リストに含まれているかチェック
  const isHeaderVisible =
    !pathname || !HIDDEN_PATHS.some((path) => pathname.includes(path));

  // 学年のモックデータ
  // 学年のモックデータ (In a real app, these would come from props or a store)
  const mockGrade = "大学3年目";
  const mockRank = 42;
  const mockCP = 15000;

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

  if (!isHeaderVisible) return null;

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
                  <HeaderStatusPanel
                    active={activate}
                    rank={mockRank}
                    cp={mockCP}
                  />
                  <HeaderInfoPanel
                    active={activate}
                    today={today}
                    grade={mockGrade}
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

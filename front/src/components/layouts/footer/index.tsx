"use client";

import { Animator, AnimatorGeneralProvider } from "@arwes/react";
import { Book, Home, Rocket, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { CameraFAB } from "./CameraFAB";

const FOOTER_ITEMS = [
  {
    label: "ホーム",
    href: "/home",
    icon: Home,
  },
  {
    label: "バインダー",
    href: "/binder",
    icon: Book,
  },
  {
    label: "サークル",
    href: "/circle",
    icon: Users,
  },
  {
    label: "ガチャ",
    href: "/gacha",
    icon: Rocket,
  },
];

export const Footer = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [activate, setActivate] = useState(false);

  useEffect(() => {
    setActivate(true);
  }, []);

  // ログインしていない場合は表示しない
  if (!user) return null;

  // 特定のパスで非表示にする場合はここに追加
  const hiddenPaths = ["/login", "/", "/battle"];
  if (hiddenPaths.includes(pathname)) return null;

  return (
    <AnimatorGeneralProvider duration={{ enter: 200, exit: 200 }}>
      <div className="h-24 md:h-28" /> {/* Spacer */}
      {/* Camera FAB */}
      <CameraFAB activate={activate} />
      <footer className="fixed bottom-0 left-0 w-full h-20 z-50 pointer-events-none">
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md border-t border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] pointer-events-auto">
          <div className="w-full max-w-md mx-auto h-20 flex items-center justify-between px-6 md:px-8">
            {FOOTER_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Animator key={item.href} active={activate}>
                  <button
                    type="button"
                    onClick={() => router.push(item.href)}
                    className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 w-16 ${
                      isActive
                        ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] scale-110"
                        : "text-slate-500 hover:text-cyan-200/70"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-cyan-950/50 border border-cyan-500/30 shadow-[inset_0_0_10px_rgba(6,182,212,0.2)]"
                          : "border border-transparent"
                      }`}
                    >
                      <Icon
                        size={24}
                        strokeWidth={isActive ? 2 : 1.5}
                        className={isActive ? "animate-pulse-slow" : ""}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-bold tracking-wider ${
                        isActive ? "text-cyan-400" : "text-slate-500"
                      }`}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="absolute -top-1 w-8 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
                    )}
                  </button>
                </Animator>
              );
            })}
          </div>
        </div>
      </footer>
    </AnimatorGeneralProvider>
  );
};

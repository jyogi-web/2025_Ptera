"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface FloatingCard {
  id: number;
  src: string;
  top: string;
  left?: string;
  right?: string;
  animation: string;
  rotate: string;
  scale: string;
  delay: string;
  hiddenOnMobile: boolean;
  mobileStyle?: {
    top: string;
    left?: string;
    right?: string;
    scale: string;
  };
  onlyMobile?: boolean;
  opacity?: number;
}

// Randomize initial positions for cards to make it feel organic
const floatingCards: FloatingCard[] = [
  // Desktop specific / Shared positions
  {
    id: 1,
    src: "/assets/student_card_1.png",
    top: "10%",
    left: "5%",
    animation: "animate-float-slow",
    rotate: "-6deg",
    scale: "1.0",
    delay: "0s",
    hiddenOnMobile: false,
    mobileStyle: { top: "5%", left: "-5%", scale: "0.8" },
  },
  {
    id: 2,
    src: "/assets/student_card_2.png",
    top: "15%",
    right: "8%",
    animation: "animate-float-medium",
    rotate: "8deg",
    scale: "0.9",
    delay: "1s",
    hiddenOnMobile: false,
    mobileStyle: { top: "8%", right: "-5%", scale: "0.75" },
  },
  {
    id: 3,
    src: "/assets/student_card_3.png",
    top: "70%",
    left: "8%",
    animation: "animate-float-fast",
    rotate: "-12deg",
    scale: "1.1",
    delay: "2s",
    hiddenOnMobile: true,
  },
  {
    id: 4,
    src: "/assets/student_card_1.png",
    top: "55%",
    right: "8%",
    animation: "animate-float-slow",
    rotate: "5deg",
    scale: "0.8",
    delay: "3s",
    hiddenOnMobile: true,
  },
  {
    id: 5,
    src: "/assets/student_card_2.png",
    top: "35%",
    left: "25%",
    animation: "animate-float-medium",
    rotate: "3deg",
    scale: "0.6",
    opacity: 0.6,
    delay: "4s",
    hiddenOnMobile: true,
  },
  {
    id: 6,
    src: "/assets/student_card_3.png",
    top: "40%",
    right: "30%",
    animation: "animate-float-fast",
    rotate: "-4deg",
    scale: "0.6",
    opacity: 0.6,
    delay: "5s",
    hiddenOnMobile: true,
  },

  // Mobile specific filler cards (smaller, blurred, background)
  {
    id: 7,
    src: "/assets/student_card_3.png",
    top: "60%",
    left: "-10%",
    animation: "animate-float-slow",
    rotate: "15deg",
    scale: "0.6",
    opacity: 0.4,
    delay: "0.5s",
    hiddenOnMobile: false,
    onlyMobile: true,
  },
  {
    id: 8,
    src: "/assets/student_card_1.png",
    top: "75%",
    right: "-10%",
    animation: "animate-float-medium",
    rotate: "-10deg",
    scale: "0.6",
    opacity: 0.4,
    delay: "1.5s",
    hiddenOnMobile: false,
    onlyMobile: true,
  },
];

export default function Home() {
  useAuth();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const daysRemaining = 1459;
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setShowContent(true);

    // Check initial size and set up listener
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check (only runs on client)
    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#050510] text-white">
      {/* Background Layers */}
      <div className="absolute inset-0 z-0 bg-[#050510]">
        {/* Base Nebula Texture */}
        <div className="absolute inset-0 opacity-100">
          <Image
            src="/assets/cyber_bg.png"
            alt="Background"
            fill
            quality={60}
            className="object-cover opacity-60 md:opacity-40 md:blur-[2px]"
            priority
          />
        </div>

        {/* Moving Grid Overlay */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-screen animate-pan will-change-transform"
          style={{
            backgroundImage: "url('/assets/hex_grid.png')",
            backgroundSize: "80px 80px",
          }}
        ></div>

        {/* Particle Overlay (Simple CSS implementation) */}
        <div
          className="absolute inset-0 opacity-20 hidden md:block"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
            maskImage:
              "linear-gradient(to bottom, transparent, white, transparent)",
          }}
        ></div>

        {/* Vignette - balanced */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#000000_95%)] opacity-90"></div>
      </div>

      {/* Floating Cards Layer */}
      <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
        {floatingCards.map((card) => (
          <div
            key={card.id}
            className={`absolute ${card.animation} transition-all duration-1000 ${card.hiddenOnMobile ? "hidden md:block" : ""} ${card.onlyMobile ? "block md:hidden" : ""}`}
            style={{
              top:
                isMobile && card.mobileStyle ? card.mobileStyle.top : card.top,
              left:
                isMobile && card.mobileStyle
                  ? card.mobileStyle.left
                  : card.left,
              right:
                isMobile && card.mobileStyle
                  ? card.mobileStyle.right
                  : card.right,
              transform: `rotate(${card.rotate}) scale(${isMobile && card.mobileStyle ? card.mobileStyle.scale : card.scale})`,
              opacity: card.opacity || 0.9,
              animationDelay: card.delay,
            }}
          >
            <div className="relative w-[120px] h-[160px] md:w-[180px] md:h-[260px] rounded-xl overflow-hidden border-[1px] border-cyan-400/30 shadow-[0_0_15px_rgba(0,255,255,0.2)] md:shadow-[0_0_30px_rgba(0,255,255,0.3)] backdrop-blur-sm">
              <Image
                src={card.src}
                alt=""
                fill
                className="object-cover opacity-90 hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent mix-blend-overlay"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <main
        className={`relative z-20 flex flex-col items-center text-center transition-opacity duration-1000 ${showContent ? "opacity-100" : "opacity-0"} px-4 w-full max-w-4xl`}
      >
        {/* Title Section */}
        <h1 className="relative mb-6 text-5xl sm:text-6xl md:text-8xl font-black tracking-widest select-none flex flex-col md:block items-center drop-shadow-[0_0_15px_rgba(255,0,255,0.5)]">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-pink-400 to-purple-600 text-glow-pink mr-0 md:mr-4 block md:inline mb-2 md:mb-0">
            さく
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-pink-400 to-purple-600 text-glow-pink block md:inline mb-2 md:mb-0">
            さく
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-500 text-glow-blue ml-0 md:ml-4 block md:inline">
            トレカ
          </span>
        </h1>

        <p className="mb-16 text-sm sm:text-lg md:text-2xl font-bold tracking-wider text-cyan-50 drop-shadow-md px-2 max-w-lg mx-auto leading-relaxed">
          4年間の青春（データ）、
          <br className="block md:hidden" />
          回収します。
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleLogin}
          className="group relative px-8 py-4 mb-2 overflow-hidden rounded-full bg-[#050510]/80 border border-cyan-400/50 text-cyan-50 font-bold tracking-widest text-lg transition-all hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] focus:outline-none w-full max-w-xs md:w-auto"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
          <div className="flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Googleでログイン
          </div>
        </button>
      </main>

      {/* Counter / Footer - Moved outside main to pin to viewport */}
      <div className="absolute bottom-6 md:bottom-10 md:right-10 flex flex-col items-center md:items-end text-cyan-400/80 font-mono text-xs md:text-sm tracking-widest w-full md:w-auto z-30 pointer-events-none">
        <div className="animate-pulse bg-black/50 px-2 py-1 rounded border border-cyan-900/50 backdrop-blur-sm">
          REMAINING TIME: {daysRemaining} DAYS
        </div>
        <div className="w-16 md:w-32 h-[1px] md:h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent md:to-cyan-400 mt-2"></div>
      </div>
    </div>
  );
}

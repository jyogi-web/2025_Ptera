"use client";

import { CharacterDisplay } from "@/components/home/CharacterDisplay";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen pt-20 pb-24 overflow-y-auto overflow-x-hidden bg-black/90">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-900/20 rounded-full blur-[100px] animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 flex flex-col items-center">
        {/* Character Display Area */}
        {/* TODO: 実際のデータに置き換える */}
        <CharacterDisplay
          name="推しメン"
          partnerName="佐藤健太 (3年生)"
          imageUrl="/mock/character_placeholder.png" // 仮の画像パス
        />
      </div>
    </div>
  );
}

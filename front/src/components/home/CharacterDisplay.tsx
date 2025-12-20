"use client";

import Image from "next/image";

interface CharacterDisplayProps {
  name: string;
  partnerName: string;
  imageUrl?: string;
}

export const CharacterDisplay = ({
  name,
  partnerName,
  imageUrl,
}: CharacterDisplayProps) => {
  return (
    <div className="relative w-full max-w-sm aspect-[3/4] mx-auto my-4">
      {/* ホログラフィックな背景エフェクト */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-sm z-0" />

      {/* 装飾的なコーナー */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-xl z-20" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-xl z-20" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-xl z-20" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-xl z-20" />

      {/* キャラクター画像エリア */}
      <div className="absolute inset-2 top-2 bottom-16 rounded-lg overflow-hidden bg-slate-900/50 z-10 border border-white/10">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
            <div className="text-4xl mb-2">👤</div>
            <p className="font-mono text-xs">NO SIGNAL</p>
          </div>
        )}

        {/* パーティクルエフェクト (装飾用) */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center" />
      </div>

      {/* 情報パネル */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex flex-col items-center">
        {/* 推しメンラベル */}
        <div className="mb-2">
          <span className="text-white font-bold text-lg drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">
            推しメン
          </span>
        </div>

        {/* パートナー名 */}
        <div className="w-[90%] bg-black/60 border-t border-b border-cyan-500/50 py-1 text-center backdrop-blur-md">
          <p className="text-cyan-100 text-sm font-medium tracking-wide">
            パートナー：{partnerName}
          </p>
        </div>
      </div>
    </div>
  );
};

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
    <div className="relative w-full max-w-xs aspect-[3/4] mx-auto my-4 group">
      {/* Main Container Glow */}
      <div className="absolute inset-0 bg-cyan-900/10 rounded-xl border border-cyan-500/50 shadow-[0_0_20px_rgba(0,218,193,0.2)] backdrop-blur-md z-0" />

      {/* Cyber Decorative Corners (CSS) */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 z-20 shadow-[0_0_10px_rgba(0,218,193,0.8)]" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 z-20 shadow-[0_0_10px_rgba(0,218,193,0.8)]" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400 z-20 shadow-[0_0_10px_rgba(0,218,193,0.8)]" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 z-20 shadow-[0_0_10px_rgba(0,218,193,0.8)]" />

      {/* Character Image Area */}
      <div className="absolute inset-3 bottom-20 rounded-sm overflow-hidden bg-black/60 z-10 border border-cyan-900/50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
            priority
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-cyan-700/50 bg-[url('/grid.svg')] bg-center bg-opacity-10">
            <div className="text-4xl mb-2 animate-pulse">?</div>
            <p className="font-mono text-xs tracking-widest">NO DATA</p>
          </div>
        )}

        {/* Scanline Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none" />
      </div>

      {/* Info Panel */}
      <div className="absolute bottom-4 left-3 right-3 z-20 flex flex-col items-center gap-3">
        {/* Label Badge */}
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-400 blur-[8px] opacity-40"></div>
          <div className="relative bg-black/80 border border-cyan-500/80 px-6 py-1 clip-path-polygon-[10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px]">
            <span className="text-cyan-300 font-bold text-sm tracking-[0.2em] uppercase font-mono drop-shadow-[0_0_5px_rgba(0,218,193,0.8)]">
              OSHI-MEN
            </span>
          </div>
        </div>

        {/* Partner Name Box */}
        <div className="w-full relative">
          <div className="absolute -left-1 top-1/2 w-1 h-3 bg-cyan-500/50"></div>
          <div className="absolute -right-1 top-1/2 w-1 h-3 bg-cyan-500/50"></div>
          <div className="bg-gradient-to-r from-cyan-950/80 via-black/80 to-cyan-950/80 border-t border-b border-cyan-900/50 py-2 text-center">
            <p className="text-white text-sm font-medium tracking-wider font-mono">
              {partnerName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

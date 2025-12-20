"use client";

import Image from "next/image";
import { calculateGraduationDate } from "@/helper/converter";
import type { Card as CardType } from "@/types/app";

interface CardProps {
  card: CardType;
  label?: string;
  onClick?: (card: CardType) => void;
}

export default function Card({ card, label, onClick }: CardProps) {
  const getDaysUntilGraduation = (grade: number): number => {
    try {
      const graduationDate = calculateGraduationDate(grade);
      const now = new Date();
      const diffTime = graduationDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays); // 負の値は0にする（既に卒業済み）
    } catch (error) {
      console.error("Invalid grade for graduation calculation:", error);
      return 0; // エラーの場合は0を返す（卒業済み扱い）
    }
  };

  const daysUntilGraduation = getDaysUntilGraduation(card.grade);

  return (
    <button
      type="button"
      className="relative rounded-xl bg-gradient-to-b from-cyan-500/20 via-fuchsia-500/10 to-transparent p-[2px] cursor-pointer hover:from-cyan-500/30 hover:via-fuchsia-500/20 transition-all hover:scale-105 w-full text-left"
      onClick={() => onClick?.(card)}
    >
      <div className="rounded-xl bg-gray-900/80 p-2">
        {label && (
          <span className="absolute -top-1 -left-1 select-none rounded-md bg-cyan-500 px-1.5 py-0.5 text-[10px] font-bold text-black shadow">
            {label}
          </span>
        )}

        <div className="absolute top-1 right-1 bg-gradient-to-r from-purple-600/90 to-pink-600/90 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-lg z-10">
          {card.grade}年
        </div>

        <div className="aspect-[3/4] rounded-lg bg-gray-800 overflow-hidden relative">
          {card.imageUrl ? (
            <Image
              src={card.imageUrl}
              alt={card.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 200px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              <div className="text-center">
                <div className="text-2xl mb-2">👤</div>
                <div>No Image</div>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
        </div>

        <div className="mt-2 px-1 space-y-1">
          <p className="text-sm font-bold truncate text-white">{card.name}</p>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-cyan-400 font-mono">{card.position}</span>
            <span className="text-gray-400">
              {daysUntilGraduation > 0
                ? `卒業まで${daysUntilGraduation}日`
                : "卒業済み"}
            </span>
          </div>
          {card.hobby && (
            <p className="text-[10px] text-gray-400 truncate">
              🎯 {card.hobby}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

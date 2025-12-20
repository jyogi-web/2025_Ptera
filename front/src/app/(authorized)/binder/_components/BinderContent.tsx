"use client";

import { useState } from "react";
import type { Card } from "@/types/app";
import { BinderGrid, FavoriteButton } from "./BinderGrid";

interface BinderContentProps {
  cards: Card[];
}

export function BinderContent({ cards }: BinderContentProps) {
  const [isSelectingFavorite, setIsSelectingFavorite] = useState(false);

  return (
    <>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-wide">マイ・バインダー</h1>
          <p className="text-sm text-gray-400">Total Cards: {cards.length}</p>
        </div>
        {cards.length > 0 && (
          <FavoriteButton
            isSelectingFavorite={isSelectingFavorite}
            onToggle={() => setIsSelectingFavorite(!isSelectingFavorite)}
            disabled={false}
          />
        )}
      </div>

      {/* Empty State */}
      {cards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-gray-400 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-label="空のバインダーアイコン"
            >
              <title>空のバインダーアイコン</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-lg font-semibold mb-2">カードがありません</p>
            <p className="text-sm">
              カメラから新しいカードを作成してみましょう！
            </p>
          </div>
        </div>
      )}

      {/* Grid */}
      {cards.length > 0 && (
        <BinderGrid
          cards={cards}
          isSelectingFavorite={isSelectingFavorite}
          onFavoriteSelected={() => setIsSelectingFavorite(false)}
        />
      )}
    </>
  );
}

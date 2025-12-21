"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { Card } from "@/types/app";
import { styles } from "../_styles/page.styles";
import { BinderGrid } from "./BinderGrid";

interface BinderContentProps {
  cards: Card[];
}

export function BinderContent({ cards }: BinderContentProps) {
  const [isSelectingFavorite, setIsSelectingFavorite] = useState(false);
  const { user } = useAuth();
  const requireJoin = !!user && !user.circleId;

  return (
    <div style={styles.contentWrapper} className="w-full max-w-7xl mx-auto">
      {/* Header */}
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.totalCardsBox}>
          <span style={styles.totalCardsLabel}>Total Cards:</span>
          <span style={styles.totalCardsValue}>
            {cards.length.toString().padStart(2, "0")}
          </span>
        </div>
        {cards.length > 0 && (
          <button
            type="button"
            onClick={() => setIsSelectingFavorite(!isSelectingFavorite)}
            style={{
              ...styles.actionButton,
              ...(isSelectingFavorite ? styles.actionButtonActive : {}),
            }}
          >
            <span style={styles.actionButtonText}>
              {isSelectingFavorite ? "完了" : "推しメン登録"}
            </span>
          </button>
        )}
      </div>

      {/* Scrollable Area */}
      <div style={styles.scrollableGrid}>
        {requireJoin && (
          <div className="mb-4 p-4 rounded border border-yellow-400 bg-yellow-900/20 text-yellow-200">
            <div className="font-bold">Circle membership required</div>
            <div className="text-sm">
              First-time users must join a circle before using this feature.
              Please complete circle membership first.
            </div>
          </div>
        )}
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
      </div>
    </div>
  );
}

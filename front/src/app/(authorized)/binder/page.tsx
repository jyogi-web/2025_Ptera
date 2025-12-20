"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Card from "@/components/Card";
import { getCards } from "@/lib/firestore";
import type { Card as CardType } from "@/types/app";

export default function BinderPage() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCards();
        setCards(data);
      } catch (err) {
        console.error("Failed to fetch cards:", err);
        setError(
          err instanceof Error
            ? err.message
            : "カードの取得に失敗しました。",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  // ラベル情報を別途管理（最初の3枚に"1st"ラベル）
  const getLabel = (index: number): string | undefined => {
    return index < 3 ? "1st" : undefined;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-md px-4 py-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-wide">マイ・バインダー</h1>
          <p className="text-sm text-gray-400">Total Cards: {cards.length}</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
            <p className="text-gray-400 text-sm">カードを読み込んでいます...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-red-400 text-center mb-4">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-label="エラーアイコン"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-lg font-semibold mb-2">エラーが発生しました</p>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
            >
              再読み込み
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && cards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-gray-400 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-label="空のバインダーアイコン"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-lg font-semibold mb-2">カードがありません</p>
              <p className="text-sm">カメラから新しいカードを作成してみましょう！</p>
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && cards.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {cards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                label={getLabel(index)}
                onClick={(card) => {
                  console.log("Card clicked:", card);
                  // TODO: カード詳細ページへの遷移など
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

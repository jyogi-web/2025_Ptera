"use client";

import { useCallback, useEffect, useState } from "react";
import Card from "@/components/Card";
import type { Card as CardType } from "@/types/app";

// import { getCards } from "@/lib/firestore"; // 一旦コメントアウト

const createMockCards = (): CardType[] => {
  return Array.from({ length: 12 }).map((_, i) => {
    const card: CardType = {
      id: `card-${i + 1}`,
      creatorId: `user-${(i % 3) + 1}`,
      name: `メンバー ${i + 1}`,
      grade: (i % 4) + 1,
      position: ["部長", "副部長", "会計", "部員"][i % 4],
      hobby: ["プログラミング", "ゲーム", "音楽", "読書"][i % 4],
      description: `これはテストデータです。メンバー${i + 1}の説明文。`,
      imageUrl: i % 2 === 0 ? "https://placehold.co/300x400/1e293b/22d3ee" : "",
      affiliatedGroup: i < 6 ? "開発チーム" : "企画チーム",
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    };
    return card;
  });
};

export default function BinderPage() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

  // Firestoreからカードを取得する関数（後で実装）
  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Firestoreからデータ取得
      // const fetchedCards = await getCards();
      // setCards(fetchedCards);

      // 現在はモックデータを使用
      await new Promise((resolve) => setTimeout(resolve, 500)); // ローディング演出
      const mockCards = createMockCards();
      setCards(mockCards);
    } catch (error) {
      console.error("Failed to fetch cards:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleCardClick = (card: CardType) => {
    setSelectedCard(card);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm">
          <h1 className="text-3xl font-bold tracking-wide bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            マイ・バインダー
          </h1>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-400">
              Total Cards:{" "}
              <span className="text-cyan-400 font-bold">{cards.length}</span>
            </p>
            <button
              type="button"
              onClick={fetchCards}
              disabled={loading}
              className="text-xs px-3 py-1 bg-cyan-900/50 border border-cyan-500/50 text-cyan-400 rounded hover:bg-cyan-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "読み込み中..." : "更新"}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-4" />
              <p className="text-gray-400">カードを読み込み中...</p>
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && cards.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {cards.map((card) => (
              <Card
                key={card.id}
                card={card}
                label={card.grade === 4 ? "4th" : undefined}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && cards.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-400 text-lg">カードがまだありません</p>
            <p className="text-gray-500 text-sm mt-2">
              カメラページから部員をカード化してみましょう
            </p>
          </div>
        )}

        {/* Selected Card Modal (簡易実装) */}
        {selectedCard && (
          <button
            type="button"
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCard(null)}
          >
            <div
              className="bg-gray-900 border border-cyan-500/50 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <h2 className="text-xl font-bold text-cyan-400 mb-4">
                {selectedCard.name}
              </h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-400">学年:</span>{" "}
                  <span className="text-white">{selectedCard.grade}年</span>
                </p>
                <p>
                  <span className="text-gray-400">役職:</span>{" "}
                  <span className="text-white">{selectedCard.position}</span>
                </p>
                <p>
                  <span className="text-gray-400">趣味:</span>{" "}
                  <span className="text-white">{selectedCard.hobby}</span>
                </p>
                {selectedCard.affiliatedGroup && (
                  <p>
                    <span className="text-gray-400">所属:</span>{" "}
                    <span className="text-white">
                      {selectedCard.affiliatedGroup}
                    </span>
                  </p>
                )}
                <p className="text-gray-300 mt-4">{selectedCard.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="mt-6 w-full py-2 bg-cyan-900/50 border border-cyan-500/50 text-cyan-400 rounded hover:bg-cyan-800/50 transition-colors"
              >
                閉じる
              </button>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

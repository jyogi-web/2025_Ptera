"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import { useAuth } from "@/context/AuthContext";
import { getCards } from "@/lib/firestore";
import type { Card as CardType } from "@/types/app";

export default function BinderPage() {
  const { user } = useAuth();
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      // Only fetch if user logged in. If user has no circleId, it fetches "global" cards (depends on getCards logic)
      // or we can skip fetching. For now, pass what we have.
      // Ideally, if no circleId, we might want to show nothing or public cards?
      // Based on plan: "自分のサークルのカードのみを表示".
      if (!user?.circleId) {
        setLoading(false);
        return;
      }
      try {
        const fetchedCards = await getCards(user.circleId);
        setCards(fetchedCards);
      } catch (error) {
        console.error("Failed to fetch cards", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCards();
    } else {
      // Wait for auth to load, or if not logged in (though AuthGuard prevents this), do nothing
      if (loading === false && !user) setLoading(false);
    }
  }, [user, loading]);

  // ラベル情報を別途管理（最初の3枚に"1st"ラベル）
  const getLabel = (index: number): string | undefined => {
    return index < 3 ? "1st" : undefined;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-md px-4 py-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-wide">マイ・バインダー</h1>
          <p className="text-sm text-gray-400">Total Cards: {cards.length}</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-3">
          {cards.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500 py-10">
              カードがまだありません。
            </div>
          ) : (
            cards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                label={getLabel(index)}
                onClick={(card) => {
                  console.log("Card clicked:", card);
                  // TODO: カード詳細ページへの遷移など
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

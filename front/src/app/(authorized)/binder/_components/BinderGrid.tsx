"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Card from "@/components/Card";
import { useAuth } from "@/context/AuthContext";
import { addFavoriteCard, getFavoriteCards } from "@/lib/firestore";
import type { Card as CardType } from "@/types/app";

interface BinderGridProps {
  cards: CardType[];
  isSelectingFavorite: boolean;
  onFavoriteSelected: () => void;
}

export function BinderGrid({
  cards,
  isSelectingFavorite,
  onFavoriteSelected,
}: BinderGridProps) {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [favoriteCardIds, setFavoriteCardIds] = useState<string[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;

      try {
        const favorites = await getFavoriteCards(user.id);
        setFavoriteCardIds(favorites.map((card) => card.id));
      } catch (error) {
        console.error("Failed to load favorites:", error);
      }
    };

    loadFavorites();
  }, [user]);

  const getLabel = (index: number): string | undefined => {
    return index < 3 ? "1st" : undefined;
  };

  const handleCardClick = async (card: CardType) => {
    if (!user || processing) return;

    if (isSelectingFavorite) {
      const isFavorite = favoriteCardIds.includes(card.id);

      if (isFavorite) {
        toast("既に推しメン登録済みです", {
          icon: "⭐",
          duration: 2000,
        });
        onFavoriteSelected();
        return;
      }

      try {
        setProcessing(true);
        await addFavoriteCard(user.id, card.id);
        setFavoriteCardIds([card.id]);
        toast.success(`${card.name}を推しメンに登録しました！`, {
          icon: "⭐",
          duration: 3000,
        });
        onFavoriteSelected();
      } catch (error) {
        console.error("Failed to update favorite:", error);
        toast.error("操作に失敗しました");
        onFavoriteSelected();
      } finally {
        setProcessing(false);
      }
      return;
    }

    toast("カード詳細ページは未実装です", {
      icon: "ℹ️",
      duration: 2000,
    });
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`transition-all ${
              processing ? "opacity-50 pointer-events-none" : ""
            } ${
              isSelectingFavorite
                ? "ring-2 ring-yellow-400 ring-offset-2 scale-105"
                : ""
            }`}
          >
            <Card
              card={card}
              label={getLabel(index)}
              onClick={() => handleCardClick(card)}
            />
            {favoriteCardIds.includes(card.id) && (
              <div className="text-center text-yellow-400 text-xs mt-1">
                ⭐ 推しメン
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FavoriteButton({
  isSelectingFavorite,
  onToggle,
  disabled,
}: {
  isSelectingFavorite: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-bold transition-all text-sm ${
        isSelectingFavorite
          ? "bg-yellow-500 text-white shadow-lg"
          : "bg-blue-500 text-white hover:bg-blue-600"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isSelectingFavorite ? "⭐ 選択中" : "推しメン登録"}
    </button>
  );
}

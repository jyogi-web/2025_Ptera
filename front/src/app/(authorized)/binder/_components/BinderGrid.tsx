import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { addFavoriteCard, getFavoriteCards } from "@/lib/firestore";
import type { Card as CardType } from "@/types/app";
import { cyberToastStyle } from "../_styles/toast.styles";
import { BinderCard } from "./BinderCard";

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

  const handleCardClick = async (card: CardType) => {
    if (!user || processing) return;

    if (isSelectingFavorite) {
      const isFavorite = favoriteCardIds.includes(card.id);

      if (isFavorite) {
        toast("既に推しメン登録済みです", {
          icon: "",
          duration: 2000,
          style: cyberToastStyle,
        });
        onFavoriteSelected();
        return;
      }

      try {
        setProcessing(true);
        await addFavoriteCard(user.id, card.id);
        setFavoriteCardIds([card.id]);
        toast.success(`${card.name}を推しメンに登録しました`, {
          icon: "",
          duration: 3000,
          style: {
            ...cyberToastStyle,
            border: "1px solid #facc15", // Yellow border for success
            color: "#fef08a",
            boxShadow: "0 0 15px rgba(250, 204, 21, 0.3)",
          },
        });
        onFavoriteSelected();
      } catch (error) {
        console.error("Failed to update favorite:", error);
        toast.error("操作に失敗しました", {
          style: {
            ...cyberToastStyle,
            border: "1px solid #ef4444", // Red border for error
            color: "#fecaca",
            boxShadow: "0 0 15px rgba(239, 68, 68, 0.3)",
          },
        });
        onFavoriteSelected();
      } finally {
        setProcessing(false);
      }
      return;
    }

    toast("カード詳細ページは未実装です", {
      icon: "",
      duration: 2000,
      style: cyberToastStyle,
    });
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {cards.map((card) => (
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
            <BinderCard
              card={card}
              onClick={() => handleCardClick(card)}
              isFavorite={favoriteCardIds.includes(card.id)}
            />
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
      {isSelectingFavorite ? " 選択中" : "推しメン登録"}
    </button>
  );
}

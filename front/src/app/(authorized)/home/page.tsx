"use client";

import { useEffect, useState } from "react";
import { CharacterDisplay } from "@/components/home/CharacterDisplay";
import { useAuth } from "@/context/AuthContext";
import { getFavoriteCards } from "@/lib/firestore";
import type { Card } from "@/types/app";

import { styles } from "./_styles/page.styles";

export default function Home() {
  const { user } = useAuth();
  const [favoriteCard, setFavoriteCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const favorites = await getFavoriteCards(user.id);
        // 最新の推しメンを表示（配列の最後）
        if (favorites.length > 0) {
          setFavoriteCard(favorites[favorites.length - 1]);
        }
      } catch (error) {
        console.error("Failed to load favorite cards:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  return (
    <div style={styles.container}>
      {/* Background Ambience */}
      <div style={styles.backgroundAmbience}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-900/20 rounded-full blur-[100px] animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div style={styles.contentWrapper}>
        {/* Character Display Area */}
        {loading ? (
          <div className="text-gray-400 text-center py-20">読み込み中...</div>
        ) : favoriteCard ? (
          <CharacterDisplay
            name="推しメン"
            partnerName={`${favoriteCard.name} (${favoriteCard.grade}年生)`}
            imageUrl={favoriteCard.imageUrl}
          />
        ) : (
          <div className="text-gray-400 text-center py-20">
            <p className="mb-2">推しメンが登録されていません</p>
            <p className="text-sm">バインダーからカードを選択してください</p>
          </div>
        )}
      </div>
    </div>
  );
}

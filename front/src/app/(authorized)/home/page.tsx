"use client";

import { Animator } from "@arwes/react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getFavoriteCards } from "@/lib/firestore";
import type { Card } from "@/types/app";
import Loading from "../loading";
import { CharacterDisplay } from "./_components/CharacterDisplay";

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

  if (loading) {
    return <Loading />;
  }

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
        <Animator active={true}>
          <div className="w-full relative flex flex-col items-center">
            {/* Character Display Area */}
            <div className="relative w-full p-4">
              <div className="relative z-10">
                {loading ? (
                  <div className="text-cyan-500/50 font-mono text-center py-20 animate-pulse text-sm">
                    LOADING DATA...
                  </div>
                ) : favoriteCard ? (
                  <CharacterDisplay
                    name="推しメン"
                    partnerName={`${favoriteCard.name} (${favoriteCard.grade}年生)`}
                    imageUrl={favoriteCard.imageUrl}
                  />
                ) : (
                  <div className="text-gray-400 text-center py-20 flex flex-col items-center gap-4">
                    <p className="text-lg text-[#f700ff] [text-shadow:0_0_10px_rgba(247,0,255,0.5)]">
                      NO DATA FOUND
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      SELECT FROM BINDER
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Animator>
      </div>
    </div>
  );
}

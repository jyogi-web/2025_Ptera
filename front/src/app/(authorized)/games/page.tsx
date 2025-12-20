"use client";

import { Animator, Text } from "@arwes/react";
import { useAuth } from "@/context/AuthContext";
import Loading from "../loading";
import { GameCard } from "./_components/GameCard";
import { styles } from "./_styles/page.styles";

export default function GameHub() {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <div style={styles.container}>
      <Animator active={true}>
        <div style={styles.header}>
          <Text as="h1" style={styles.title}>
            GAME_SELECT
          </Text>
        </div>

        <div style={styles.grid}>
          <GameCard
            title="SETSUNA"
            description=""
            href="/games/setsuna"
            color="#00dac1"
          />
          {/* Placeholder for future games */}
          <GameCard
            title="COMING_SOON"
            description="Next Operation..."
            href="#"
            color="#444"
            disabled
          />
        </div>
      </Animator>
    </div>
  );
}

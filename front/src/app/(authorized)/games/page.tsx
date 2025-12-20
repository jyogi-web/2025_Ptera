"use client";

import { Animator, Text } from "@arwes/react";
import { GameCard } from "./_components/GameCard";
import { styles } from "./_styles/page.styles";

export default function GameHub() {
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
            description="反射神経を研ぎ澄ませ。瞬間勝負のQRバトル。"
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

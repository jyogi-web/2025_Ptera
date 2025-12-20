"use client";

import { Animator } from "@arwes/react";
import { memo } from "react";
import { calculateGraduationDate } from "@/helper/converter";
import type { Card } from "@/types/app";

export type HeaderStatusPanelProps = {
  active: boolean;
  favorite?: Card | null;
};

export const HeaderStatusPanel = memo(
  ({ active, favorite }: HeaderStatusPanelProps) => {
    // Compute remaining days until graduation for favorite card
    let favoriteLabel = "推しメン: 未設定";

    if (favorite) {
      try {
        const grad = calculateGraduationDate(favorite.grade);
        const now = new Date();
        const diff = Math.ceil(
          (grad.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        const days = Math.max(0, diff);
        favoriteLabel = `${favorite.name} (${favorite.grade}年) — ${days > 0 ? `卒業まで${days}日` : "卒業済み"}`;
      } catch (e) {
        console.error("Failed to compute graduation for favorite:", e);
        favoriteLabel = `${favorite.name} (${favorite.grade}年)`;
      }
    }

    return (
      <Animator active={active}>
        <section
          className="relative flex-1 w-full min-w-[200px] h-16 text-white -mr-4 z-10"
          style={{ filter: "drop-shadow(0 0 1px cyan)" }}
          aria-label="Favorite Status"
        >
          <div
            className="h-full px-4 flex flex-col justify-center bg-gradient-to-r from-blue-900/90 to-cyan-900/90"
            style={{
              clipPath: "polygon(0 0, 100% 0, calc(100% - 20px) 100%, 0 100%)",
            }}
          >
            <div className="relative z-10 flex flex-col space-y-0.5 pr-4">
              <div className="font-bold text-cyan-100 text-xs md:text-sm truncate">
                {favoriteLabel}
              </div>
            </div>
          </div>
        </section>
      </Animator>
    );
  },
);

HeaderStatusPanel.displayName = "HeaderStatusPanel";

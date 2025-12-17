"use client";

import { Animator } from "@arwes/react";

export type HeaderStatusPanelProps = {
  active: boolean;
  rank: number;
  cp: number;
};

const RANK_THRESHOLDS = {
  DIRECTOR: 40,
  VICE_DIRECTOR: 30,
  DEPUTY: 20,
  MEMBER: 10,
} as const;

const getRankTitle = (rank: number): string => {
  if (rank >= RANK_THRESHOLDS.DIRECTOR) return "部長級";
  if (rank >= RANK_THRESHOLDS.VICE_DIRECTOR) return "副部長級";
  if (rank >= RANK_THRESHOLDS.DEPUTY) return "副部級";
  if (rank >= RANK_THRESHOLDS.MEMBER) return "部員級";
  return "新入部員";
};

export const HeaderStatusPanel = ({
  active,
  rank = 0,
  cp = 0,
}: HeaderStatusPanelProps) => {
  const rankTitle = getRankTitle(rank);
  // Assuming maxRank is 50 for now based on context, or it could be passed as a prop.
  // Progress calculation example:
  const maxRank = 50;
  const progressPercent = Math.min(100, Math.max(0, (rank / maxRank) * 100));

  return (
    <Animator active={active}>
      <section
        className="relative flex-1 w-full min-w-[200px] h-16 text-white -mr-4 z-10"
        style={{ filter: "drop-shadow(0 0 1px cyan)" }}
        aria-label="User Status"
      >
        <div
          className="h-full px-4 flex flex-col justify-center bg-gradient-to-r from-blue-900/90 to-cyan-900/90"
          style={{
            clipPath: "polygon(0 0, 100% 0, calc(100% - 20px) 100%, 0 100%)",
          }}
        >
          <div className="relative z-10 flex flex-col space-y-0.5 pr-4">
            {/* ランク */}
            <div className="flex justify-between items-baseline">
              <div className="font-bold text-cyan-100 text-xs md:text-sm whitespace-nowrap">
                Rank:{" "}
                <span className="text-white text-sm md:text-base">{rank}</span>
                <span className="text-xs text-cyan-300">（{rankTitle}）</span>
              </div>
            </div>
            {/* プログレスバー */}
            <div
              className="h-1.5 w-full bg-cyan-900/50 rounded-full overflow-hidden my-0.5"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={maxRank}
              aria-valuenow={rank}
              aria-label="Rank Progress"
            >
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            {/* 部費 */}
            <div className="text-xs md:text-sm text-cyan-200 font-mono whitespace-nowrap">
              部費 : {cp} CP
            </div>
          </div>
        </div>
      </section>
    </Animator>
  );
};

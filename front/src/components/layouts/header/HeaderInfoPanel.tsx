"use client";

import { Animator } from "@arwes/react";
import { Menu } from "lucide-react";
import { memo } from "react";

/**
 * Props for the HeaderInfoPanel component.
 */
type HeaderInfoPanelProps = {
  /** Whether the panel is currently active/visible. */
  active: boolean;
  /** Formatted date string to display (e.g., "2023/10/01"). */
  today: string;
  /** The user's grade label (e.g., "大学3年目"). */
  grade: string;
  /** Optional handler for the menu button click. */
  onMenuClick?: () => void;
};

export const HeaderInfoPanel = memo(
  ({ active, today, grade, onMenuClick }: HeaderInfoPanelProps) => {
    return (
      <Animator active={active}>
        {/* 右パネル: 日付・学年・メニュー */}
        <div className="relative flex-1 w-full min-w-[200px] h-16 text-white z-0 drop-shadow-emerald-glow">
          <div
            className="h-full pl-8 pr-3 flex items-center justify-between bg-gradient-to-r from-emerald-900/90 to-teal-900/90"
            style={{ clipPath: "polygon(20px 0, 100% 0, 100% 100%, 0 100%)" }}
          >
            <div className="relative z-10 flex flex-col items-center mr-4 flex-grow">
              <div className="text-xs md:text-sm text-emerald-100 font-mono tracking-wider whitespace-nowrap">
                {today}
              </div>
              <div className="text-sm md:text-base font-bold text-white tracking-widest whitespace-nowrap">
                {grade}
              </div>
            </div>

            {/* メニューボタン */}
            <div className="relative z-10 border-l border-emerald-500/50 pl-3">
              <button
                type="button"
                onClick={onMenuClick}
                aria-label="Toggle menu"
                className="p-1.5 hover:bg-emerald-500/20 rounded-md transition-colors text-emerald-300 hover:text-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </Animator>
    );
  },
);

HeaderInfoPanel.displayName = "HeaderInfoPanel";

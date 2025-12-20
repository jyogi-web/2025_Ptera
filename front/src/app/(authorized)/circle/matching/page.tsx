"use client";

import { Animator, FrameCorners } from "@arwes/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BattleRequestList } from "@/components/BattleRequestList";
import { useAuth } from "@/context/AuthContext";
import { useBattle } from "@/hooks/useBattle";
import { getCircles } from "@/lib/firestore";
import type { Circle } from "@/types/app";
import { styles } from "./_styles/page.styles";

export default function MatchingPage() {
  const { user } = useAuth();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const { sendRequest, loading: loadingBattle } = useBattle();

  useEffect(() => {
    const fetchCircles = async () => {
      try {
        const fetchedCircles = await getCircles();
        setCircles(fetchedCircles);
      } catch (error) {
        console.error("Failed to fetch circles", error);
        toast.error("サークル一覧の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchCircles();
  }, []);

  const handleSendRequest = async (
    targetCircleId: string,
    targetCircleName: string,
  ) => {
    if (!confirm(`サークル「${targetCircleName}」に対戦を申し込みますか？`))
      return;
    if (!user?.circleId) return;
    await sendRequest(user.circleId, targetCircleId);
    toast.success(`サークル「${targetCircleName}」に申請を送信しました！`);
  };

  const opponentCircles = circles.filter((c) => c.id !== user?.circleId);

  if (!user?.circleId) {
    return (
      <div style={styles.container}>
        <div className="flex items-center justify-center h-full text-red-500 font-mono">
          Unauthorized Access: No Circle Affiliation
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.dashboardContent}>
        <Animator active={true}>
          <div className="w-full max-w-4xl relative flex flex-col h-full">
            {/* Main Frame Wrapper - using absolute positioning to stretch */}
            <div className="flex-1 relative min-h-0">
              <FrameCorners
                strokeWidth={2}
                cornerLength={20}
                style={{
                  ...styles.frameCornersCommon,
                  ...styles.frameCornersMain,
                }}
              />

              <div className="relative z-10 p-6 md:p-8 h-full flex flex-col">
                <div className="flex-none flex items-center justify-between mb-4 border-b border-gray-700/50 pb-2">
                  <div>
                    <p style={styles.panelTitle}>TACTICAL OPERATIONS</p>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                      <span style={styles.headerGradient}>BATTLE MATCHING</span>
                    </h1>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-mono">
                        SECURE LINK ESTABLISHED
                      </p>
                      <p className="text-xs text-cyan-500 font-mono animate-pulse">
                        MONITORING FREQUENCIES...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Requests List */}
                <div className="flex-none mb-6">
                  <BattleRequestList myCircleId={user.circleId} />
                </div>

                {/* Opponent Selection */}
                <div className="flex-1 flex flex-col min-h-0 relative group">
                  <FrameCorners
                    strokeWidth={2}
                    cornerLength={20}
                    style={{
                      ...styles.frameCornersCommon,
                      ...styles.frameCornersOpponent,
                    }}
                  />
                  <div className="relative z-10 p-6 flex flex-col h-full">
                    <div style={styles.panelHeader}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                        <h3
                          className="text-lg md:text-xl font-bold font-mono tracking-wider text-orange-400"
                          style={styles.scanTitle}
                        >
                          SCAN FOR OPPONENTS
                        </h3>
                      </div>
                      <span className="text-xs text-orange-500/50 font-mono">
                        RANGE: GLOBAL
                      </span>
                    </div>

                    <div
                      className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3"
                      style={styles.requestsScrollContainer}
                    >
                      {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-4">
                          <div style={styles.radarContainer}>
                            <div style={styles.radarCircle} />
                            <div
                              style={styles.radarLine}
                              className="animate-spin"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-orange-500/50 font-mono text-xs animate-pulse">
                                SCANNING...
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : opponentCircles.length === 0 ? (
                        <div className="text-center py-10 border border-orange-900/30 bg-orange-900/10 rounded">
                          <p className="text-orange-400 font-mono mb-2">
                            NO HOSTILES DETECTED
                          </p>
                          <p className="text-gray-500 text-sm">
                            他のサークルが見つかりません
                          </p>
                        </div>
                      ) : (
                        opponentCircles.map((circle) => (
                          <div
                            key={circle.id}
                            // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard accessible for visual effects
                            tabIndex={0}
                            className="group/item relative flex items-center justify-between p-4 mb-3 overflow-hidden
                              bg-gradient-to-r from-slate-900/80 to-slate-900/40
                              border border-orange-500/20 border-l-4 border-l-orange-500/40
                              transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                              hover:bg-gradient-to-r hover:from-orange-500/15 hover:to-orange-500/5
                              hover:border-orange-500/60 hover:border-l-orange-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:translate-x-1
                              focus-visible:bg-gradient-to-r focus-visible:from-orange-500/15 focus-visible:to-orange-500/5
                              focus-visible:border-orange-500/60 focus-visible:border-l-orange-500 focus-visible:shadow-[0_0_20px_rgba(249,115,22,0.15)] focus-visible:translate-x-1
                              outline-none"
                            style={{
                              clipPath:
                                "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 font-mono mb-1">
                                TARGET_ID: {circle.id.substring(0, 6)}...
                              </span>
                              <span className="font-bold text-white text-lg tracking-wide group-hover/item:text-orange-300 group-focus-visible/item:text-orange-300 transition-colors">
                                {circle.name}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleSendRequest(circle.id, circle.name)
                              }
                              disabled={loadingBattle}
                              className="relative flex items-center gap-2 px-5 py-2
                                bg-gradient-to-br from-orange-500/10 to-orange-500/20
                                border border-orange-500/50 text-orange-200 text-sm font-bold tracking-widest uppercase cursor-pointer
                                transition-all duration-200
                                hover:bg-orange-500/80 hover:shadow-[0_0_20px_rgba(249,115,22,0.6)] hover:border-orange-500 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]
                                focus-visible:bg-orange-500/80 focus-visible:shadow-[0_0_20px_rgba(249,115,22,0.6)] focus-visible:border-orange-500 focus-visible:text-white focus-visible:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]
                                outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                clipPath:
                                  "polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px)",
                              }}
                            >
                              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                              CHALLENGE
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-none mt-4 pt-4 border-t border-gray-700/50">
                  <p className="text-sm text-gray-500 text-center">
                    Logged in as:{" "}
                    <span className="font-mono text-cyan-400">
                      {user.id.substring(0, 8)}...
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Animator>
      </div>
    </div>
  );
}

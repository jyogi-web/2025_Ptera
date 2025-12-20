"use client";

import { FrameCorners } from "@arwes/react";
import { useRouter } from "next/navigation";
import { useBattle } from "@/hooks/useBattle";
import { useBattleRequests } from "@/hooks/useBattleRequests";

interface BattleRequestListProps {
  myCircleId: string;
}

export function BattleRequestList({ myCircleId }: BattleRequestListProps) {
  const {
    incomingRequests,
    outgoingRequests,
    loading: loadingReqs,
  } = useBattleRequests(myCircleId);
  const { acceptRequest, rejectRequest, loading: loadingAction } = useBattle();
  const router = useRouter();

  // Custom styles for this component to match page.styles.ts
  const styles = {
    panelTitle: {
      fontSize: "10px",
      textTransform: "uppercase" as const,
      letterSpacing: "2px",
      display: "block",
    },
    neonTextCyan: {
      color: "#00dac1",
      textShadow: "0 0 10px rgba(0, 218, 193, 0.5)",
      fontFamily: "'Orbitron', sans-serif",
    },
    neonTextPurple: {
      color: "#f700ff",
      textShadow: "0 0 10px rgba(247, 0, 255, 0.5)",
      fontFamily: "'Orbitron', sans-serif",
    },
  };

  if (loadingReqs) {
    return (
      <div className="text-center p-4 text-cyan-500/50 font-mono animate-pulse">
        SCANNING REQUESTS...
      </div>
    );
  }

  if (incomingRequests.length === 0 && outgoingRequests.length === 0) {
    return (
      <div className="text-center p-8 border border-gray-800 rounded bg-gray-900/50">
        <p className="text-gray-500 font-mono text-sm mb-2">
          NO ACTIVE SIGNALS
        </p>
        <p className="text-gray-400">対戦リクエストはありません</p>
      </div>
    );
  }

  const handleAccept = async (requestId: string) => {
    const battleId = await acceptRequest(requestId);
    if (battleId) {
      router.push(`/battle/${battleId}`);
    }
  };

  const handleReject = async (requestId: string) => {
    await rejectRequest(requestId);
  };

  return (
    <div className="space-y-8">
      {/* 受信box */}
      {incomingRequests.length > 0 && (
        <div className="relative group">
          <FrameCorners
            strokeWidth={2}
            cornerLength={15}
            style={{
              color: "#00dac1",
              backgroundColor: "rgba(0, 218, 193, 0.05)",
              zIndex: 0,
            }}
          />
          <div className="relative z-10 p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-cyan-900/50 pb-2">
              <div className="w-2 h-2 bg-cyan-500 animate-pulse rounded-full" />
              <h3 className="text-lg font-bold" style={styles.neonTextCyan}>
                INCOMING SIGNALS ({incomingRequests.length})
              </h3>
            </div>

            <div className="space-y-4">
              {incomingRequests.map((req) => (
                <div
                  key={req.requestId}
                  className="flex flex-col md:flex-row justify-between items-center transition-all duration-300"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(0, 218, 193, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)",
                    border: "1px solid rgba(0, 218, 193, 0.2)",
                    borderLeft: "4px solid rgba(0, 218, 193, 0.5)",
                    padding: "16px",
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                  }}
                >
                  <div className="mb-4 md:mb-0 w-full md:w-auto">
                    <span style={{ ...styles.panelTitle, color: "#5f7e97" }}>
                      FROM
                    </span>
                    <div className="text-white font-bold text-lg tracking-wide">
                      {req.fromCircleName || "Unknown Circle"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 font-mono">
                      STATUS:{" "}
                      <span
                        className={
                          req.status === "pending"
                            ? "text-yellow-400"
                            : "text-gray-400"
                        }
                      >
                        {req.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {req.status === "pending" && (
                    <div className="flex gap-3 w-full md:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => handleAccept(req.requestId)}
                        disabled={loadingAction}
                        className="px-6 py-2 bg-cyan-900/30 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:border-cyan-400 rounded font-bold transition-all disabled:opacity-50 text-sm tracking-wider uppercase"
                      >
                        ACCEPT
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(req.requestId)}
                        disabled={loadingAction}
                        className="px-6 py-2 bg-red-900/30 hover:bg-red-500/20 text-red-400 border border-red-500/50 hover:border-red-400 rounded font-bold transition-all disabled:opacity-50 text-sm tracking-wider uppercase"
                      >
                        REJECT
                      </button>
                    </div>
                  )}
                  {req.status === "accepted" && (
                    <div className="px-4 py-1 bg-green-900/20 border border-green-500/30 text-green-400 text-sm font-mono tracking-wider">
                      APPROVED
                    </div>
                  )}
                  {req.status === "rejected" && (
                    <div className="px-4 py-1 bg-red-900/20 border border-red-500/30 text-red-400 text-sm font-mono tracking-wider">
                      REJECTED
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 送信box */}
      {outgoingRequests.length > 0 && (
        <div className="relative group">
          <FrameCorners
            strokeWidth={2}
            cornerLength={15}
            style={{
              color: "#f700ff", // Purple/Pink for outgoing/opponent
              backgroundColor: "rgba(247, 0, 255, 0.05)",
              zIndex: 0,
            }}
          />
          <div className="relative z-10 p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-purple-900/50 pb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <h3 className="text-lg font-bold" style={styles.neonTextPurple}>
                OUTGOING SIGNALS ({outgoingRequests.length})
              </h3>
            </div>

            <div className="space-y-4">
              {outgoingRequests.map((req) => (
                <div
                  key={req.requestId}
                  className="flex flex-col md:flex-row justify-between items-center transition-all duration-300"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(247, 0, 255, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)",
                    border: "1px solid rgba(247, 0, 255, 0.2)",
                    borderLeft: "4px solid rgba(247, 0, 255, 0.5)",
                    padding: "16px",
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                  }}
                >
                  <div className="mb-4 md:mb-0 w-full md:w-auto">
                    <span style={{ ...styles.panelTitle, color: "#5f7e97" }}>
                      TARGETING
                    </span>
                    <div className="text-white font-bold text-lg tracking-wide">
                      {req.toCircleName || "Unknown Circle"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 font-mono">
                      STATUS:{" "}
                      <span
                        className={
                          req.status === "pending"
                            ? "text-yellow-400"
                            : "text-gray-400"
                        }
                      >
                        {req.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="w-full md:w-auto flex justify-end">
                    {req.status === "pending" && (
                      <span className="text-yellow-400 font-mono text-sm animate-pulse">
                        AWAITING RESPONSE...
                      </span>
                    )}
                    {req.status === "accepted" && (
                      <button
                        type="button"
                        onClick={() =>
                          req.battleId && router.push(`/battle/${req.battleId}`)
                        }
                        className="px-6 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/50 hover:border-green-400 rounded font-bold transition-all text-sm tracking-wider uppercase flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                        ENGAGE LINK
                      </button>
                    )}
                    {req.status === "rejected" && (
                      <span className="text-red-400 font-mono text-sm">
                        CONNECTION REFUSED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

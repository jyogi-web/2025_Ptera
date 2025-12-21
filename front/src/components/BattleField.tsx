import { useState } from "react";
import BattleCard from "@/components/BattleCard";
import type {
  BattleState,
  Card as ProtoCard,
} from "@/generated/ptera/v1/ptera_pb";

interface BattleFieldProps {
  state: BattleState;
  onAttack: () => void;
  onRetreat: (index: number) => void;
  onFinish: () => void;
}

export default function BattleField({
  state,
  onAttack,
  onRetreat,
  onFinish,
}: BattleFieldProps) {
  // NOTE: Proto generated types use camelCase locally if generated with appropriate options,
  // but looking at valid file content, fields like `playerMe` are available.
  const { playerMe, playerOpponent, winnerId, currentTurn, currentPlayerId } =
    state;
  const myHp = playerMe?.hp || 0;
  const opponentHp = playerOpponent?.hp || 0;

  // UI State
  const [isLogMinimized, setIsLogMinimized] = useState(false);

  // Deck unpacking
  const myDeck = playerMe?.deck || [];
  const opponentDeck = playerOpponent?.deck || [];

  const myActive = myDeck.length > 0 ? myDeck[0] : null;
  const myBench = myDeck.slice(1);
  const opponentActive = opponentDeck.length > 0 ? opponentDeck[0] : null;
  const opponentBench = opponentDeck.slice(1);

  // Turn Logic
  const isMyTurn = currentPlayerId === playerMe?.playerId;
  const isFirstPlayer =
    (currentTurn % 2 !== 0 && isMyTurn) || (currentTurn % 2 === 0 && !isMyTurn);

  const myTurnLabel = isFirstPlayer ? "先行 (First)" : "後攻 (Second)";
  const opponentTurnLabel = isFirstPlayer ? "後攻 (Second)" : "先行 (First)";

  // Helper to adapt Proto Card to Component Card props
  const adaptCard = (pCard: ProtoCard) => {
    return {
      ...pCard,
      // Only set imageUrl if it exists, otherwise use empty string
      imageUrl: pCard.imageUrl || "",
      createdAt: new Date(), // Dummy
      expiryDate: new Date(),
      // Use currentHp for display if available, else maxHp
      maxHp: pCard.currentHp ?? pCard.maxHp, // Hack to show current HP
    };
  };

  // Define clip paths for specific Z-shape layout
  // Top Shape (Opponent): Top-Left Cut, Top-Right Square
  const clipPathOpponent =
    "polygon(10% 0, 100% 0, 100% 55%, 60% 55%, 40% 35%, 0 35%, 0 10%)";

  // Bottom Shape (Player): Bottom-Left Square, Bottom-Right Cut
  const clipPathPlayer =
    "polygon(100% 90%, 100% 60%, 60% 60%, 40% 40%, 0 40%, 0 100%, 90% 100%)";

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none font-sans">
      {/* --- LAYER 1: BACKGROUND SHAPES (Clipped) --- */}

      {/* Opponent Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ clipPath: clipPathOpponent }}
      >
        <div
          className="absolute inset-0 bg-red-500"
          style={{ filter: "drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))" }}
        />
        <div
          className={`absolute inset-[2px] transition-colors duration-300 ${!isMyTurn && !winnerId ? "bg-red-900/40" : "bg-red-950/80"}`}
        />
      </div>

      {/* Player Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ clipPath: clipPathPlayer }}
      >
        <div
          className="absolute inset-0 bg-cyan-500"
          style={{ filter: "drop-shadow(0 0 10px rgba(6, 182, 212, 0.5))" }}
        />
        <div
          className={`absolute inset-[2px] transition-colors duration-300 ${isMyTurn && !winnerId ? "bg-blue-900/40" : "bg-blue-950/80"}`}
        />
      </div>

      {/* --- LAYER 2: CENTER DECORATIONS --- */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 60%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>
        {/* Cut Lines */}
        <div
          className="absolute"
          style={{
            top: "35%",
            left: "0%",
            width: "40%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.3))",
          }}
        ></div>
        <div
          className="absolute"
          style={{
            top: "55%",
            right: "0%",
            width: "40%",
            height: "1px",
            background:
              "linear-gradient(-90deg, transparent, rgba(239, 68, 68, 0.3))",
          }}
        ></div>
      </div>

      {/* --- LAYER 3: CONTENT (Unclipped Overlay) --- */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none">
        {/* Opponent Content Area (Top Half) */}
        <div className="h-[55%] relative w-full p-4 pointer-events-auto flex flex-col justify-between">
          {/* Opponent Header */}
          <div className="flex justify-between items-start pl-8 pr-2 pt-1">
            <div className="flex flex-col">
              <h3 className="text-red-300 font-bold flex items-center gap-2 text-lg drop-shadow-md">
                {playerOpponent?.circleName || "Opponent"}
                <span
                  className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${!isMyTurn ? "border-red-500 text-red-100 bg-red-600" : "border-red-500/30 text-red-500/50"}`}
                >
                  {opponentTurnLabel}
                </span>
              </h3>
              {!isMyTurn && !winnerId && (
                <span className="text-sm text-red-400 animate-pulse font-mono font-bold mt-1 drop-shadow-md">
                  ◀ BATTLE PHASE
                </span>
              )}
            </div>
            <div>
              <div className="flex gap-1">
                {[0, 1, 2].map((hpIndex) => (
                  <div
                    key={`opponent-hp-${hpIndex}`}
                    className={`w-3 h-3 md:w-4 md:h-4 transform rotate-45 border border-black ${
                      hpIndex < opponentHp
                        ? "bg-red-500 shadow-[0_0_10px_#ef4444]"
                        : "bg-red-900/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Opponent Field */}
          <div className="flex-1 flex flex-col items-center justify-end gap-2 w-1/2 ml-auto pr-8">
            {/* Bench */}
            <div className="flex gap-2 justify-center">
              {opponentBench.map((card) => (
                <div
                  key={card.id}
                  className="w-16 md:w-20 transform scale-75 origin-bottom transition-transform hover:scale-90"
                >
                  <BattleCard
                    card={adaptCard(card)}
                    variant="enemy"
                    className="opacity-90 shadow-lg"
                    isFaceDown={true}
                  />
                </div>
              ))}
            </div>
            {/* Active */}
            <div className="relative transform translate-y-6">
              {" "}
              {/* Push down to cross boundary */}
              {opponentActive ? (
                <div
                  className={`w-28 md:w-32 transition-transform duration-500 ${!isMyTurn ? "scale-110 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]" : ""}`}
                >
                  <BattleCard
                    card={adaptCard(opponentActive)}
                    variant="enemy"
                  />
                </div>
              ) : (
                <div className="w-28 md:w-32 aspect-[3/4] border-2 border-dashed border-red-500/30 flex items-center justify-center text-red-500/50 rounded bg-red-900/10 backdrop-blur-sm">
                  EMPTY
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Player Content Area (Bottom Half) */}
        <div className="h-[55%] relative w-full p-4 pointer-events-auto flex flex-col justify-end">
          {" "}
          {/* Use justify-end to align to bottom */}
          <div className="flex-1 flex flex-col items-center justify-start gap-4 w-1/2 pl-8 pt-12">
            {/* Active */}
            <div className="relative transform -translate-y-6">
              {" "}
              {/* Push up to cross boundary */}
              {myActive ? (
                <div
                  className={`w-28 md:w-32 transition-transform duration-500 ${isMyTurn ? "scale-110 drop-shadow-[0_0_20px_rgba(37,99,235,0.5)]" : ""}`}
                >
                  <BattleCard card={adaptCard(myActive)} variant="friend" />
                </div>
              ) : (
                <div className="w-28 md:w-32 aspect-[3/4] border-2 border-dashed border-blue-500/30 flex items-center justify-center text-blue-500/50 rounded bg-blue-900/10 backdrop-blur-sm">
                  EMPTY
                </div>
              )}
              {/* Attack Button */}
              {myActive && (
                <div className="absolute top-1/2 left-full ml-4 -translate-y-1/2 w-max">
                  <button
                    type="button"
                    onClick={onAttack}
                    disabled={!!winnerId || !myActive || !isMyTurn}
                    className={`
                        group relative overflow-hidden font-bold py-3 px-8 rounded clip-path-polygon
                        transition-all duration-300 transform
                        ${!isMyTurn || !!winnerId ? "opacity-0 pointer-events-none translate-x-10" : "opacity-100 translate-x-0"}
                      `}
                  >
                    <div className="absolute inset-0 bg-cyan-600 transform skew-x-[-20deg] group-hover:bg-cyan-500 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
                    <div className="relative z-10 text-white tracking-[0.2em] drop-shadow-md">
                      ATTACK
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Bench */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-[10px] text-cyan-400/70 uppercase tracking-widest drop-shadow-sm">
                Bench / Standby
              </p>
              <div className="flex gap-2 justify-center">
                {myBench.map((card, i) => (
                  <div
                    key={card.id}
                    className="w-16 md:w-20 cursor-pointer transition-transform hover:-translate-y-2 active:scale-95"
                  >
                    <BattleCard
                      card={adaptCard(card)}
                      variant="friend"
                      onClick={() => isMyTurn && !winnerId && onRetreat(i)}
                      className="hover:shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Player Footer */}
          <div className="flex justify-between items-end mt-2 pl-2 pr-8 pb-1">
            <div className="flex flex-col bg-slate-900/80 p-2 pr-6 rounded-tr-xl border-l-[3px] border-cyan-500 backdrop-blur-md">
              <h3 className="text-cyan-300 font-bold flex items-center gap-2 text-xl drop-shadow-md">
                {playerMe?.circleName || "You"}
                <span
                  className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${isMyTurn ? "border-cyan-500 text-cyan-100 bg-cyan-600" : "border-cyan-500/30 text-cyan-500/50"}`}
                >
                  {myTurnLabel}
                </span>
              </h3>
              {isMyTurn && !winnerId && (
                <span className="text-sm text-cyan-400 animate-pulse font-mono font-bold mt-1 drop-shadow-md">
                  ▶ YOUR TURN
                </span>
              )}
            </div>
            <div className="flex gap-2 items-center bg-slate-900/50 p-2 rounded-tl-xl backdrop-blur-md">
              {[0, 1, 2].map((hpIndex) => (
                <div
                  key={`player-hp-${hpIndex}`}
                  className={`w-4 h-4 md:w-5 md:h-5 transform rotate-45 border border-black transition-all duration-500 ${
                    hpIndex < myHp
                      ? "bg-cyan-500 shadow-[0_0_10px_#06b6d4] scale-100"
                      : "bg-slate-800 scale-75"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- Turn Indicator (Center) --- */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <div className="text-4xl font-black text-white/5 tracking-[0.2em] whitespace-nowrap blur-[1px]">
          TURN {currentTurn}
        </div>
      </div>

      {/* --- Log Area (Fixed Top-Right) --- */}
      {state.logs && state.logs.length > 0 && (
        <div
          className={`fixed top-16 right-4 z-50 w-64 font-mono text-xs rounded-lg border border-cyan-500/30 bg-black/90 shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-md transition-all duration-300 ${
            isLogMinimized ? "h-auto" : "max-h-48"
          }`}
        >
          {/* Header */}
          <div className="bg-cyan-950/80 border-b border-cyan-500/30 px-3 py-1.5 flex items-center justify-between">
            <span className="text-cyan-400 font-bold tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
              BATTLE LOG
            </span>
            <button
              type="button"
              onClick={() => setIsLogMinimized(!isLogMinimized)}
              className="text-cyan-500 hover:text-cyan-300 transition-colors pointer-events-auto"
            >
              {isLogMinimized ? "+" : "-"}
            </button>
          </div>
          {/* Content */}
          {!isLogMinimized && (
            <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(16rem-2.5rem)] scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
              {state.logs.map((log, i) => (
                <div
                  key={`${i}-${log}`}
                  className="pl-2 border-l-2 border-cyan-500/20 py-0.5 text-cyan-200/80"
                >
                  <span className="opacity-50 mr-1">{i + 1}.</span> {log}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- Winner Overlay --- */}
      {winnerId && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div
            className={`
              flex flex-col items-center gap-4 p-8 rounded-xl border-4 
              ${winnerId === playerMe?.playerId ? "border-cyan-500 bg-cyan-900/30 shadow-[0_0_50px_rgba(6,182,212,0.5)]" : "border-red-500 bg-red-900/30 shadow-[0_0_50px_rgba(239,68,68,0.5)]"}
           `}
          >
            <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
              {winnerId === playerMe?.playerId ? "VICTORY" : "DEFEAT"}
            </h2>
            <p className="text-xl md:text-2xl text-white font-mono tracking-widest">
              {winnerId === playerMe?.playerId ? "YOUR WIN!!" : "GAME OVER..."}
            </p>
            <button
              type="button"
              className="mt-8 px-8 py-3 bg-white text-black font-bold text-lg rounded hover:scale-105 transition-transform"
              onClick={onFinish}
            >
              RETURN HOME
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

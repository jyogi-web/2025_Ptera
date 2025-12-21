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
}

export default function BattleField({
  state,
  onAttack,
  onRetreat,
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

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto p-2 gap-4">
      {/* --- Opponent Area --- */}
      <div
        className={`bg-red-900/20 p-2 rounded-lg border transition-colors duration-300 ${
          !isMyTurn && !winnerId
            ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            : "border-red-500/30"
        }`}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex flex-col">
            <h3 className="text-red-300 font-bold flex items-center gap-2">
              {playerOpponent?.circleName || "Opponent"}
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-red-500/50 text-red-400 bg-red-900/50">
                {opponentTurnLabel}
              </span>
            </h3>
            {!isMyTurn && !winnerId && (
              <span className="text-xs text-red-400 animate-pulse font-mono mt-1">
                ◀ OPPONENT TURN
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((hpIndex) => (
              <div
                key={`opponent-hp-${hpIndex}`}
                className={`w-4 h-4 rounded-full ${
                  hpIndex < opponentHp ? "bg-red-500" : "bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bench */}
        <div className="flex gap-2 justify-center mb-4 min-h-[80px]">
          {opponentBench.map((card) => (
            <div key={card.id} className="w-16 transform scale-75 origin-top">
              <BattleCard
                card={adaptCard(card)}
                variant="enemy"
                className="opacity-80"
                isFaceDown={true}
              />
            </div>
          ))}
        </div>

        {/* Active */}
        <div className="flex justify-center">
          {opponentActive ? (
            <div
              className={`w-32 transition-transform duration-500 ${
                !isMyTurn ? "scale-110 z-10" : ""
              }`}
            >
              <BattleCard card={adaptCard(opponentActive)} variant="enemy" />
              {/* Removed separate HP text, handled in BattleCard */}
            </div>
          ) : (
            <div className="w-32 h-40 border-2 border-dashed border-red-500/30 flex items-center justify-center text-red-500/50">
              Empty
            </div>
          )}
        </div>
      </div>

      {/* --- Middle Info --- */}
      <div className="flex justify-center items-center gap-4">
        <div className="text-xs font-mono text-gray-500">
          TURN {currentTurn}
        </div>
      </div>

      {/* --- Log Area (Fixed Top-Right) --- */}
      {state.logs && state.logs.length > 0 && (
        <div
          className={`fixed top-16 right-4 z-40 w-64 font-mono text-xs rounded-lg border border-cyan-500/30 bg-black/80 shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-sm transition-all duration-300 ${
            isLogMinimized ? "h-auto" : "max-h-48"
          }`}
        >
          {/* Cyber Decorative Header */}
          <div className="sticky top-0 bg-cyan-900/40 border-b border-cyan-500/30 px-2 py-1 flex items-center justify-between">
            <span className="text-cyan-300 font-bold tracking-wider">
              BATTLE LOG
            </span>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500/50 animate-pulse" />
              {/* Yellow Button: Toggle Minimize */}
              <button
                type="button"
                onClick={() => setIsLogMinimized(!isLogMinimized)}
                className={`w-2 h-2 rounded-full cursor-pointer hover:bg-yellow-400 transition-colors ${
                  isLogMinimized
                    ? "bg-yellow-500 shadow-[0_0_5px_#eab308]"
                    : "bg-yellow-500/50"
                }`}
                aria-label={isLogMinimized ? "Expand Log" : "Minimize Log"}
              />
              <div className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse delay-150" />
            </div>
          </div>
          {/* Logs Content */}
          {!isLogMinimized && (
            <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(12rem-2rem)]">
              {state.logs.map((log, i) => (
                <div
                  key={`${i}-${log}`} // biome-ignore lint/suspicious/noArrayIndexKey: logs are simple strings
                  className="border-b border-cyan-500/10 pb-1 mb-1 last:border-0 last:mb-0"
                >
                  <div className="flex gap-2">
                    <span className="text-cyan-500 shrink-0">&gt;</span>
                    <span className="text-cyan-100/90 break-words leading-tight">
                      {log}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Cyber Corner Accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400" />
        </div>
      )}

      {/* --- Player Area --- */}
      <div
        className={`bg-blue-900/20 p-2 rounded-lg border transition-colors duration-300 ${
          isMyTurn && !winnerId
            ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            : "border-blue-500/30"
        }`}
      >
        {/* Active */}
        <div className="flex justify-center mb-4 relative">
          {myActive ? (
            <div
              className={`w-32 transition-transform duration-500 ${
                isMyTurn ? "scale-110 z-10" : ""
              }`}
            >
              <BattleCard card={adaptCard(myActive)} variant="friend" />
            </div>
          ) : (
            <div className="w-32 h-40 border-2 border-dashed border-blue-500/30 flex items-center justify-center text-blue-500/50">
              Empty
            </div>
          )}

          {/* Winner Overlay */}
          {winnerId && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/80 rounded backdrop-blur-sm">
              <div className="text-3xl font-black text-white transform -rotate-12 border-4 border-white p-4 shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                {winnerId === playerMe?.playerId ? "YOU WIN!!" : "LOSE..."}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            type="button"
            onClick={onAttack}
            disabled={!!winnerId || !myActive || !isMyTurn}
            className={`
              font-bold py-2 px-6 rounded-full shadow-lg transform transition-all
              ${
                !isMyTurn || !!winnerId || !myActive
                  ? "bg-gray-600 cursor-not-allowed opacity-50 grayscale"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-95 shadow-blue-500/30"
              }
              text-white
            `}
          >
            {isMyTurn ? "ATTACK" : "WAITING..."}
          </button>
        </div>

        {/* Bench */}
        <p className="text-xs text-blue-300 mb-1">Bench (Click to Retreat)</p>
        <div className="flex gap-2 justify-center min-h-[80px]">
          {myBench.map((card, i) => (
            <div key={card.id} className="w-16">
              <BattleCard
                card={adaptCard(card)}
                variant="friend"
                onClick={() => isMyTurn && !winnerId && onRetreat(i)}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-2">
          <div className="flex flex-col">
            <h3 className="text-blue-300 font-bold flex items-center gap-2">
              {playerMe?.circleName || "You"}
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-blue-500/50 text-blue-400 bg-blue-900/50">
                {myTurnLabel}
              </span>
            </h3>
            {isMyTurn && !winnerId && (
              <span className="text-xs text-blue-400 animate-pulse font-mono mt-1">
                ▶ YOUR TURN
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((hpIndex) => (
              <div
                key={`player-hp-${hpIndex}`}
                className={`w-4 h-4 rounded-full ${
                  hpIndex < myHp ? "bg-blue-500" : "bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

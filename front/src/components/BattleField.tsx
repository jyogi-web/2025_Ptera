import Card from "@/components/Card";
import type { BattleState } from "@/lib/battle";

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
  const { myDeck, opponentDeck, myHp, opponentHp, winner } = state;

  const myActive = myDeck[0];
  const myBench = myDeck.slice(1);
  const opponentActive = opponentDeck[0];
  const opponentBench = opponentDeck.slice(1);

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto p-2 gap-4">
      {/* --- Opponent Area --- */}
      <div className="bg-red-900/20 p-2 rounded-lg border border-red-500/30">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-red-300 font-bold">{state.opponentCircleName}</h3>
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
              <Card card={card} variant="battle" />
            </div>
          ))}
        </div>

        {/* Active */}
        <div className="flex justify-center">
          {opponentActive ? (
            <div className="w-32 animate-pulse-slow">
              <Card card={opponentActive} variant="battle" />
            </div>
          ) : (
            <div className="w-32 h-40 border-2 border-dashed border-red-500/30 flex items-center justify-center text-red-500/50">
              Empty
            </div>
          )}
        </div>
      </div>

      {/* --- Log / VS Area --- */}
      {/* <div className="flex-1 min-h-[100px] bg-black/50 overflow-y-auto p-2 rounded text-xs font-mono border border-gray-700">
                {logs.map((log, i) => (
                    <div key={i} className="mb-1 border-b border-gray-800 pb-1">
                        {i === 0 ? <span className="text-yellow-400">➤ </span> : ""}
                        {log}
                    </div>
                ))}
            </div> */}

      {/* --- Player Area --- */}
      <div className="bg-blue-900/20 p-2 rounded-lg border border-blue-500/30">
        {/* Active */}
        <div className="flex justify-center mb-4 relative">
          {myActive ? (
            <div className="w-32">
              <Card card={myActive} variant="battle" />
            </div>
          ) : (
            <div className="w-32 h-40 border-2 border-dashed border-blue-500/30 flex items-center justify-center text-blue-500/50">
              Empty
            </div>
          )}

          {/* Winner Overlay */}
          {winner && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/80 rounded">
              <div className="text-3xl font-black text-white transform -rotate-12 border-4 border-white p-4">
                {winner === "player" ? "YOU WIN!!" : "LOSE..."}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            type="button"
            onClick={onAttack}
            disabled={!!winner || !myActive}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-full shadow-lg transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ATTACK
          </button>
        </div>

        {/* Bench */}
        <p className="text-xs text-blue-300 mb-1">Bench (Click to Retreat)</p>
        <div className="flex gap-2 justify-center min-h-[80px]">
          {myBench.map((card, i) => (
            <button
              type="button"
              key={card.id}
              className="w-16 cursor-pointer transform hover:scale-105 transition-transform"
              onClick={() => !winner && onRetreat(i)}
            >
              <Card card={card} variant="battle" />
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mt-2">
          <h3 className="text-blue-300 font-bold">{state.myCircleName}</h3>
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

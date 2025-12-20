import Card from "@/components/Card";
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
  const { playerMe, playerOpponent, winnerId } = state;
  const myHp = playerMe?.hp || 0;
  const opponentHp = playerOpponent?.hp || 0;

  // Deck unpacking
  const myDeck = playerMe?.deck || [];
  const opponentDeck = playerOpponent?.deck || [];

  const myActive = myDeck.length > 0 ? myDeck[0] : null;
  const myBench = myDeck.slice(1);
  const opponentActive = opponentDeck.length > 0 ? opponentDeck[0] : null;
  const opponentBench = opponentDeck.slice(1);

  // We need to map Proto Card to Component Card
  // The `Card` component expects `import("@/types/app").Card` or compatible?
  // Our proto `Card` has `currentHp` etc.
  // The `Card` component `interface Card` has `maxHp`, `attack`.
  // Proto `Card` has `maxHp`, `attack`.
  // We need to ensure types match or cast.
  // The Proto Card `id` is string, App Card `id` is string.
  // Proto `grade` is number (int32).
  // It seems largely compatible, but `createdAt` in proto is Timestamp vs Date in App.

  // We'll create a helper to cast or simplistic render for now since `Card` component handles `variant="battle"`
  // which mainly looks at stats.

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
      <div className="bg-red-900/20 p-2 rounded-lg border border-red-500/30">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-red-300 font-bold">
            {playerOpponent?.circleName || "Opponent"}
          </h3>
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
              <Card card={adaptCard(card)} variant="battle" />
            </div>
          ))}
        </div>

        {/* Active */}
        <div className="flex justify-center">
          {opponentActive ? (
            <div className="w-32 animate-pulse-slow">
              <Card card={adaptCard(opponentActive)} variant="battle" />
              <div className="text-center text-xs text-red-300 mt-1">
                HP: {opponentActive.currentHp}/{opponentActive.maxHp}
              </div>
            </div>
          ) : (
            <div className="w-32 h-40 border-2 border-dashed border-red-500/30 flex items-center justify-center text-red-500/50">
              Empty
            </div>
          )}
        </div>
      </div>

      {/* --- Log Area (Optional) --- */}
      {state.logs && state.logs.length > 0 && (
        <div className="bg-black/40 p-2 rounded text-xs text-gray-300 h-24 overflow-y-auto font-mono">
          {state.logs.map((log) => (
            <div
              key={log}
              className="border-b border-gray-700/50 pb-0.5 mb-0.5"
            >
              {log}
            </div>
          ))}
        </div>
      )}

      {/* --- Player Area --- */}
      <div className="bg-blue-900/20 p-2 rounded-lg border border-blue-500/30">
        {/* Active */}
        <div className="flex justify-center mb-4 relative">
          {myActive ? (
            <div className="w-32">
              <Card card={adaptCard(myActive)} variant="battle" />
              <div className="text-center text-xs text-blue-300 mt-1">
                HP: {myActive.currentHp}/{myActive.maxHp}
              </div>
            </div>
          ) : (
            <div className="w-32 h-40 border-2 border-dashed border-blue-500/30 flex items-center justify-center text-blue-500/50">
              Empty
            </div>
          )}

          {/* Winner Overlay */}
          {winnerId && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/80 rounded">
              <div className="text-3xl font-black text-white transform -rotate-12 border-4 border-white p-4">
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
            disabled={!!winnerId || !myActive} // Add Turn check?
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-full shadow-lg transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ATTACK
          </button>
        </div>

        {/* Bench */}
        <p className="text-xs text-blue-300 mb-1">Bench (Click to Retreat)</p>
        <div className="flex gap-2 justify-center min-h-[80px]">
          {myBench.map((card, i) => (
            <div key={card.id} className="w-16">
              <Card
                card={adaptCard(card)}
                variant="battle"
                onClick={() => !winnerId && onRetreat(i)}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-2">
          <h3 className="text-blue-300 font-bold">
            {playerMe?.circleName || "You"}
          </h3>
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

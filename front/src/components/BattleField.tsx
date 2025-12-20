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
  const { playerMe, playerOpponent, winnerId, currentTurn, currentPlayerId } =
    state;
  const myHp = playerMe?.hp || 0;
  const opponentHp = playerOpponent?.hp || 0;

  // Deck unpacking
  const myDeck = playerMe?.deck || [];
  const opponentDeck = playerOpponent?.deck || [];

  const myActive = myDeck.length > 0 ? myDeck[0] : null;
  const myBench = myDeck.slice(1);
  const opponentActive = opponentDeck.length > 0 ? opponentDeck[0] : null;
  const opponentBench = opponentDeck.slice(1);

  // Turn Logic
  const isMyTurn = currentPlayerId === playerMe?.playerId;
  // 仮説: ターン1は先行プレイヤーから始まる。
  // 自分が先行の場合: Turn 1, 3, 5... が自分のターン
  // 自分が後攻の場合: Turn 2, 4, 6... が自分のターン
  // 現在が自分のターン(Odd) -> 先行プレイヤー
  // 現在が自分のターン(Even) -> 後攻プレイヤー
  // 現在が相手のターン(Odd) -> 自分は後攻プレイヤー
  // 現在が相手のターン(Even) -> 自分は先行プレイヤー
  // ...これは「現在のターン」が「誰のターンか」に依存せず、「自分が先行か後攻か」は固定であるべき。
  // しかし、ここには「Am I First Player?」というフラグはない。
  // Backend logic:
  // state.CurrentPlayerId starts as myCircleID (Challenger/Applicant usually? or Host?)
  // `createBattle` uses `req.MyCircleId` as `CurrentPlayerId` (Turn 1).
  // So whoever started the battle is Player 1 (First).
  // Can we infer it?
  // If (currentTurn % 2 !== 0 && isMyTurn) => I must be First.
  // If (currentTurn % 2 === 0 && !isMyTurn) => I must be First.
  // ... Wait. If currentTurn is 1 (Odd) and it IS my turn, I am First.
  // If currentTurn is 1 (Odd) and it is NOT my turn, I am Second.
  // This logic holds if checks are consistent throughout the game.
  // Let's rely on Turn 1 logic or simpler parity check.

  // 自分が「先行」である条件: (現在のターンが奇数 AND 自分のターン) OR (現在のターンが偶数 AND 相手のターン)
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
              <Card card={adaptCard(card)} variant="battle" />
            </div>
          ))}
        </div>

        {/* Active */}
        <div className="flex justify-center">
          {opponentActive ? (
            <div
              className={`w-32 transition-transform duration-500 ${
                !isMyTurn ? "scale-105" : ""
              }`}
            >
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

      {/* --- Middle Info --- */}
      <div className="flex justify-center items-center gap-4">
        <div className="text-xs font-mono text-gray-500">
          TURN {currentTurn}
        </div>
      </div>

      {/* --- Log Area (Optional) --- */}
      {state.logs && state.logs.length > 0 && (
        <div className="bg-black/40 p-2 rounded text-xs text-gray-300 h-24 overflow-y-auto font-mono border border-gray-800">
          {state.logs.map((log, i) => (
            <div
              key={`${i}-${log}`}
              className="border-b border-gray-700/50 pb-0.5 mb-0.5 last:border-0"
            >
              <span className="text-green-500 mr-2">&gt;</span>
              {log}
            </div>
          ))}
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
                isMyTurn ? "scale-105" : ""
              }`}
            >
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
              <Card
                card={adaptCard(card)}
                variant="battle"
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

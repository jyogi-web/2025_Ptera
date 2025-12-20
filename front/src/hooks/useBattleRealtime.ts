import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { BattleState } from "@/generated/ptera/v1/ptera_pb";
import { db } from "@/lib/firebase";

/**
 * Firestore Snapshotsを使用してバトル状態をリアルタイムで監視するフック
 *
 * @param battleId - 監視するバトルID (nullの場合は監視しない)
 * @param myCircleId - 自分のサークルID (視点の切り替えに使用)
 * @returns バトル状態とエラー情報
 */
export function useBattleRealtime(
  battleId: string | null,
  myCircleId?: string,
) {
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // battleIdがnullの場合は監視を開始しない
    if (!battleId) {
      setBattleState(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Firestoreのリアルタイムリスナーを設定
    const unsubscribe = onSnapshot(
      doc(db, "battles", battleId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as BattleState;

          // 視点の補正 (自分がPlayerOpponentの場合は入れ替える)
          if (myCircleId && data.playerOpponent?.circleId === myCircleId) {
            const swappedState = { ...data };
            swappedState.playerMe = data.playerOpponent;
            swappedState.playerOpponent = data.playerMe;
            setBattleState(new BattleState(swappedState));
          } else {
            setBattleState(new BattleState(data));
          }

          setLoading(false);
        } else {
          setError("バトルが見つかりませんでした");
          setBattleState(null);
          setLoading(false);
        }
      },
      (err) => {
        console.error("Firestore listener error:", err);
        setError("リアルタイム通信エラーが発生しました");
        setLoading(false);
      },
    );

    // クリーンアップ: コンポーネントのアンマウント時にリスナーを解除
    return () => {
      unsubscribe();
    };
  }, [battleId, myCircleId]);

  return { battleState, error, loading };
}

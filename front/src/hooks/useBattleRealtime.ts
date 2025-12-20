import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import type { BattleState } from "@/generated/ptera/v1/ptera_pb";
import { db } from "@/lib/firebase";

/**
 * Firestore Snapshotsを使用してバトル状態をリアルタイムで監視するフック
 *
 * @param battleId - 監視するバトルID (nullの場合は監視しない)
 * @returns バトル状態とエラー情報
 */
export function useBattleRealtime(battleId: string | null) {
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
          setBattleState(data);
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
  }, [battleId]);

  return { battleState, error, loading };
}

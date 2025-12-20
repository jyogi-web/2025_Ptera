import { useCallback, useState } from "react";
import {
  attackAction,
  retreatAction,
  startBattleAction,
} from "@/actions/battle";

/**
 * バトルアクションを実行するフック
 * リアルタイム対応: Server Actionで状態を更新し、Firestoreに保存する
 * 状態の監視はuseBattleRealtimeフックで行う
 */
export const useBattle = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // バトル開始
  const startBattle = useCallback(
    async (
      myCircleId: string,
      opponentCircleId: string,
    ): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await startBattleAction(myCircleId, opponentCircleId);
        // バトルIDを返す (呼び出し側でuseBattleRealtimeに渡す)
        return result.battleId;
      } catch (e) {
        console.error("Failed to start battle:", e);
        setError("バトルの開始に失敗しました");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // 攻撃アクション
  const attack = useCallback(async (battleId: string, playerId: string) => {
    setLoading(true);
    setError(null);
    try {
      await attackAction(battleId, playerId);
      // Firestoreが更新され、useBattleRealtimeが自動的に検知する
    } catch (e) {
      console.error("Attack failed:", e);
      setError("攻撃に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  // 交代アクション
  const retreat = useCallback(
    async (battleId: string, playerId: string, benchIndex: number) => {
      setLoading(true);
      setError(null);
      try {
        await retreatAction(battleId, playerId, benchIndex);
        // Firestoreが更新され、useBattleRealtimeが自動的に検知する
      } catch (e) {
        console.error("Retreat failed:", e);
        setError("交代に失敗しました");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    startBattle,
    attack,
    retreat,
    loading,
    error,
  };
};

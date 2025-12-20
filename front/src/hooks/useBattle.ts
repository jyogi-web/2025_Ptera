import { useCallback, useState } from "react";
import {
  acceptBattleRequestAction,
  attackAction,
  rejectBattleRequestAction,
  retreatAction,
  sendBattleRequestAction,
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

  // バトル申請送信
  const sendRequest = useCallback(
    async (fromCircleId: string, toCircleId: string) => {
      setLoading(true);
      setError(null);
      try {
        await sendBattleRequestAction(fromCircleId, toCircleId);
      } catch (e) {
        console.error("Failed to send request:", e);
        setError("申請の送信に失敗しました");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // バトル申請承認
  const acceptRequest = useCallback(async (requestId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await acceptBattleRequestAction(requestId);
      return result.battleId;
    } catch (e) {
      console.error("Failed to accept request:", e);
      setError("承認に失敗しました");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // バトル申請拒否
  const rejectRequest = useCallback(async (requestId: string) => {
    setLoading(true);
    setError(null);
    try {
      await rejectBattleRequestAction(requestId);
    } catch (e) {
      console.error("Failed to reject request:", e);
      setError("拒否に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    startBattle,
    attack,
    retreat,
    sendRequest,
    acceptRequest,
    rejectRequest,
    loading,
    error,
  };
};

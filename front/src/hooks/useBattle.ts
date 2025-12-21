import { useCallback, useRef, useState } from "react";
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
  const processingRef = useRef(false);

  // バトル開始
  const startBattle = useCallback(
    async (
      myCircleId: string,
      opponentCircleId: string,
    ): Promise<string | null> => {
      if (processingRef.current) return null;
      processingRef.current = true;
      setLoading(true);
      setError(null);
      try {
        const result = await startBattleAction(myCircleId, opponentCircleId);
        return result.battleId;
      } catch (e) {
        console.error("Failed to start battle:", e);
        setError("バトルの開始に失敗しました");
        return null;
      } finally {
        processingRef.current = false;
        setLoading(false);
      }
    },
    [],
  );

  // 攻撃アクション
  const attack = useCallback(async (battleId: string, playerId: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      await attackAction(battleId, playerId);
    } catch (e) {
      console.error("Attack failed:", e);
      setError("攻撃に失敗しました");
    } finally {
      processingRef.current = false;
      setLoading(false);
    }
  }, []);

  // 交代アクション
  const retreat = useCallback(
    async (battleId: string, playerId: string, benchIndex: number) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setLoading(true);
      setError(null);
      try {
        await retreatAction(battleId, playerId, benchIndex);
      } catch (e) {
        console.error("Retreat failed:", e);
        setError("交代に失敗しました");
      } finally {
        processingRef.current = false;
        setLoading(false);
      }
    },
    [],
  );

  // バトル申請送信
  const sendRequest = useCallback(
    async (fromCircleId: string, toCircleId: string) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setLoading(true);
      setError(null);
      try {
        await sendBattleRequestAction(fromCircleId, toCircleId);
      } catch (e) {
        console.error("Failed to send request:", e);
        setError("申請の送信に失敗しました");
      } finally {
        processingRef.current = false;
        setLoading(false);
      }
    },
    [],
  );

  // バトル申請承認
  const acceptRequest = useCallback(async (requestId: string) => {
    if (processingRef.current) return null;
    processingRef.current = true;
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
      processingRef.current = false;
      setLoading(false);
    }
  }, []);

  // バトル申請拒否
  const rejectRequest = useCallback(async (requestId: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      await rejectBattleRequestAction(requestId);
    } catch (e) {
      console.error("Failed to reject request:", e);
      setError("拒否に失敗しました");
    } finally {
      processingRef.current = false;
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

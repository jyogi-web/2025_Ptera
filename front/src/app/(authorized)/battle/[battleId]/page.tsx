"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import BattleField from "@/components/BattleField";
import { useAuth } from "@/context/AuthContext";
import { useBattle } from "@/hooks/useBattle";
import { useBattleRealtime } from "@/hooks/useBattleRealtime";
import { deleteBattle } from "@/lib/firestore";

interface BattlePageProps {
  params: Promise<{ battleId: string }>;
}

export default function BattlePage({ params }: BattlePageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { battleId } = use(params);

  const {
    attack,
    retreat,
    loading: actionLoading,
    error: actionError,
  } = useBattle();

  // リアルタイムでバトル状態を監視
  const {
    battleState,
    error: realtimeError,
    loading: realtimeLoading,
  } = useBattleRealtime(battleId, user?.circleId);

  // 攻撃ハンドラー
  const handleAttack = async () => {
    if (!battleId || !user?.circleId) return;
    await attack(battleId, user.circleId);
  };

  // 交代ハンドラー
  const handleRetreat = async (benchIndex: number) => {
    if (!battleId || !user?.circleId) return;
    await retreat(battleId, user.circleId, benchIndex);
  };

  // 終了ハンドラー
  const handleFinish = async () => {
    // 終了時は勝者・敗者に関わらずデータを削除を試みる
    // (既に削除されている場合は内部でハンドルされる)
    try {
      await deleteBattle(battleId);
    } catch (e) {
      console.error("Failed to delete battle:", e);
    }
    router.push("/circle");
  };

  // エラー表示
  if (actionError || realtimeError) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg">
          <p className="text-red-400">エラー: {actionError || realtimeError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded"
          >
            再読み込み
          </button>
          <button
            type="button"
            onClick={() => router.push("/circle")}
            className="mt-4 ml-4 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  if (realtimeLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        Loading Arena...
      </div>
    );
  }

  // バトル画面
  if (battleState) {
    return (
      <div className="flex flex-col h-screen w-full bg-gradient-to-b from-gray-900 via-gray-800 to-black overflow-hidden relative">
        <div className="absolute top-2 right-2 z-50">
          <button
            type="button"
            onClick={() => {
              router.push("/circle");
            }}
            className="text-xs text-gray-400 border border-gray-600 px-2 py-1 rounded hover:bg-gray-800 hover:text-white transition-colors"
          >
            Quit Fight
          </button>
        </div>
        <div className="flex-1 w-full relative">
          <BattleField
            state={battleState}
            onAttack={handleAttack}
            onRetreat={handleRetreat}
            onFinish={handleFinish}
            loading={actionLoading}
          />
        </div>
        {actionLoading && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            処理中...
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <p>バトルが見つかりません。ID: {battleId}</p>
    </div>
  );
}

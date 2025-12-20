"use client";

import { useEffect, useState } from "react";
import BattleField from "@/components/BattleField";
import { useAuth } from "@/context/AuthContext";
import { useBattle } from "@/hooks/useBattle";
import { useBattleRealtime } from "@/hooks/useBattleRealtime";
import { getCircles, getUser } from "@/lib/firestore";
import type { Circle } from "@/types/app";

export default function BattlePage() {
  const { user } = useAuth();
  const {
    startBattle,
    attack,
    retreat,
    loading: actionLoading,
    error: actionError,
  } = useBattle();

  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [myCircle, setMyCircle] = useState<Circle | null>(null);
  const [battleId, setBattleId] = useState<string | null>(null);

  // リアルタイムでバトル状態を監視
  const {
    battleState,
    error: realtimeError,
    loading: realtimeLoading,
  } = useBattleRealtime(battleId);

  // Load Opponents
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const [allCircles, userProfile] = await Promise.all([
          getCircles(),
          getUser(user.id),
        ]);

        const myCircleId = userProfile?.circleId;

        if (myCircleId) {
          const myProvCircle =
            allCircles.find((c) => c.id === myCircleId) || null;
          setMyCircle(myProvCircle);
          setCircles(allCircles.filter((c) => c.id !== myCircleId));
        } else {
          setCircles(allCircles);
        }
      } catch (error) {
        console.error("Failed to load circles:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleSelectOpponent = async (opponent: Circle) => {
    if (!user || !myCircle) {
      alert("サークルに所属していないとバトルできません!");
      return;
    }

    setLoading(true);
    try {
      const newBattleId = await startBattle(myCircle.id, opponent.id);
      if (newBattleId) {
        setBattleId(newBattleId); // リアルタイム監視を開始
      } else {
        alert("バトルの開始に失敗しました。");
      }
    } catch (error) {
      console.error("Failed to start battle:", error);
      alert("バトルの開始に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  // 攻撃ハンドラー
  const handleAttack = async () => {
    if (!battleId || !user) return;
    await attack(battleId, user.id);
  };

  // 交代ハンドラー
  const handleRetreat = async (benchIndex: number) => {
    if (!battleId || !user) return;
    await retreat(battleId, user.id, benchIndex);
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
        </div>
      </div>
    );
  }

  if (loading || realtimeLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        Loading Arena...
      </div>
    );
  }

  // バトル画面
  if (battleState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black pb-20 pt-4">
        <div className="absolute top-2 right-2 z-50">
          <button
            type="button"
            onClick={() => {
              setBattleId(null); // リアルタイム監視を停止
              window.location.reload();
            }}
            className="text-xs text-gray-400 border border-gray-600 px-2 py-1 rounded hover:bg-gray-800"
          >
            Quit Fight
          </button>
        </div>
        <BattleField
          state={battleState}
          onAttack={handleAttack}
          onRetreat={handleRetreat}
        />
        {actionLoading && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            処理中...
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20 bg-gray-950 text-white">
      <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-6 italic transform -skew-x-12">
        BATTLE ARENA
      </h1>

      {!myCircle ? (
        <div className="bg-yellow-900/20 border border-yellow-500/50 p-4 rounded-lg text-yellow-200">
          <p>バトルに参加するにはサークルへの所属が必要です。</p>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-gray-400 text-sm">
            対戦相手のサークルを選択してください（殴り込み）
          </p>
          <div className="grid gap-4">
            {circles.map((circle) => (
              <button
                type="button"
                key={circle.id}
                onClick={() => handleSelectOpponent(circle)}
                className="flex flex-col items-start p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-red-500 hover:bg-gray-800 transition-all group"
              >
                <div className="flex justify-between w-full items-center">
                  <span className="text-lg font-bold group-hover:text-red-400">
                    {circle.name}
                  </span>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">
                    {circle.memberIds.length} members
                  </span>
                </div>
                {circle.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {circle.description}
                  </p>
                )}
              </button>
            ))}
          </div>
          {circles.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              対戦相手がいません...平和です。
            </div>
          )}
        </div>
      )}
    </div>
  );
}

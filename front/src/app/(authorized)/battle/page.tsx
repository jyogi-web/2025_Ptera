"use client";

import { useEffect, useState } from "react";
import BattleField from "@/components/BattleField";
import { useAuth } from "@/context/AuthContext";
import { useBattle } from "@/hooks/useBattle";
import { getCards, getCircles, getUser } from "@/lib/firestore";
import type { Circle } from "@/types/app";

export default function BattlePage() {
  const { user } = useAuth();
  const { battleState, startBattle, attack, retreat } = useBattle();

  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [myCircle, setMyCircle] = useState<Circle | null>(null);

  // Load Opponents
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const [allCircles, userProfile] = await Promise.all([
          getCircles(),
          getUser(user.id), // Need to fetch FirestoreUser to get circleId securely if not in auth context
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
      alert("サークルに所属していないとバトルできません！");
      return;
    }

    setLoading(true);
    try {
      const [myCards, opponentCards] = await Promise.all([
        getCards(myCircle.id),
        getCards(opponent.id),
      ]);

      startBattle(myCircle.name, myCards, opponent.name, opponentCards);
    } catch (error) {
      console.error("Failed to start battle:", error);
      alert("バトルの開始に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        Loading Arena...
      </div>
    );
  }

  if (battleState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black pb-20 pt-4">
        <div className="absolute top-2 right-2 z-50">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-xs text-gray-400 border border-gray-600 px-2 py-1 rounded hover:bg-gray-800"
          >
            Quit Fight
          </button>
        </div>
        <BattleField
          state={battleState}
          onAttack={attack}
          onRetreat={retreat}
        />
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

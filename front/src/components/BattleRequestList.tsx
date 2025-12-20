"use client";

import { useRouter } from "next/navigation";
import { useBattle } from "@/hooks/useBattle";
import { useBattleRequests } from "@/hooks/useBattleRequests";

interface BattleRequestListProps {
  myCircleId: string;
}

export function BattleRequestList({ myCircleId }: BattleRequestListProps) {
  const {
    incomingRequests,
    outgoingRequests,
    loading: loadingReqs,
  } = useBattleRequests(myCircleId);
  const { acceptRequest, rejectRequest, loading: loadingAction } = useBattle();
  const router = useRouter();

  if (loadingReqs) {
    return <div className="text-center p-4">Loading requests...</div>;
  }

  if (incomingRequests.length === 0 && outgoingRequests.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        対戦リクエストはありません
      </div>
    );
  }

  const handleAccept = async (requestId: string) => {
    const battleId = await acceptRequest(requestId);
    if (battleId) {
      router.push(`/battle/${battleId}`);
    }
  };

  const handleReject = async (requestId: string) => {
    await rejectRequest(requestId);
  };

  return (
    <div className="space-y-6">
      {/* 受信box */}
      {incomingRequests.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-4 text-cyan-400">
            受信したリクエスト ({incomingRequests.length})
          </h3>
          <div className="space-y-4">
            {incomingRequests.map((req) => (
              <div
                key={req.requestId}
                className="flex flex-col md:flex-row justify-between items-center bg-gray-700/50 p-3 rounded border border-gray-600"
              >
                <div className="mb-2 md:mb-0">
                  <span className="text-white font-bold">
                    {req.fromCircleName || "Unknown Circle"}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">
                    から対戦の申し込みです
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    Status: {req.status}
                  </div>
                </div>
                {req.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAccept(req.requestId)}
                      disabled={loadingAction}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold transition-colors disabled:opacity-50"
                    >
                      承認
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(req.requestId)}
                      disabled={loadingAction}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-bold transition-colors disabled:opacity-50"
                    >
                      拒否
                    </button>
                  </div>
                )}
                {req.status === "accepted" && (
                  <div className="text-green-400 font-bold">承認済み</div>
                )}
                {req.status === "rejected" && (
                  <div className="text-red-400 font-bold">拒否済み</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 送信box */}
      {outgoingRequests.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-4 text-orange-400">
            送信したリクエスト ({outgoingRequests.length})
          </h3>
          <div className="space-y-4">
            {outgoingRequests.map((req) => (
              <div
                key={req.requestId}
                className="flex justify-between items-center bg-gray-700/50 p-3 rounded border border-gray-600"
              >
                <div>
                  <span className="text-white font-bold">
                    {req.toCircleName || "Unknown Circle"}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">へ申請中</span>
                  <div className="text-xs text-gray-500 mt-1">
                    Status: {req.status}
                  </div>
                </div>
                <div>
                  {req.status === "pending" && (
                    <span className="text-yellow-400">待機中...</span>
                  )}
                  {req.status === "accepted" && (
                    <button
                      type="button"
                      onClick={() =>
                        req.battleId && router.push(`/battle/${req.battleId}`)
                      }
                      className="text-green-400 hover:underline"
                    >
                      バトルへ移動
                    </button>
                  )}
                  {req.status === "rejected" && (
                    <span className="text-red-400">拒否されました</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { Animator } from "@arwes/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { createCircle, getCircles, joinCircle } from "@/lib/firestore";
import type { Circle } from "@/types/app";
import { styles } from "./_styles/page.styles";

export default function CirclePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCircleName, setNewCircleName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const fetchCircles = async () => {
      try {
        const fetchedCircles = await getCircles();
        setCircles(fetchedCircles);
      } catch (error) {
        console.error("Failed to fetch circles", error);
        toast.error("サークル一覧の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchCircles();
  }, []);

  const handleCreateCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCircleName.trim()) return;

    setIsCreating(true);
    try {
      await createCircle(newCircleName, user.id);
      toast.success(`サークル「${newCircleName}」を作成しました！`);
      window.location.reload();
    } catch (error) {
      console.error("Failed to create circle", error);
      toast.error("サークルの作成に失敗しました");
      setIsCreating(false);
    }
  };

  const handleJoinCircle = async (circleId: string, circleName: string) => {
    if (!user) return;
    if (!confirm(`サークル「${circleName}」に参加しますか？`)) return;

    setIsJoining(true);
    try {
      await joinCircle(user.id, circleId);
      toast.success(`サークル「${circleName}」に参加しました！`);
      window.location.reload();
    } catch (error) {
      console.error("Failed to join circle", error);
      toast.error("サークルへの参加に失敗しました");
      setIsJoining(false);
    }
  };

  // User already has a circle -> Dashboard View
  if (user?.circleId) {
    const myCircle = circles.find((c) => c.id === user.circleId);
    return (
      <div style={styles.container}>
        <div style={styles.dashboardContent}>
          <Animator active={true}>
            <div className="w-full max-w-4xl space-y-8 p-6 bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50 shadow-2xl">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                  {myCircle?.name || "My Circle"}
                </h1>
                <p className="text-gray-400">サークルダッシュボード</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  type="button"
                  className="bg-gray-700/30 p-6 rounded-lg border border-gray-600/30 backdrop-blur-sm hover:bg-gray-700/50 transition-colors cursor-pointer text-left"
                  onClick={() => router.push("/binder")}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        role="img"
                        aria-label="メンバーリストアイコン"
                      >
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold">メンバーを見る</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    所属メンバーのカード一覧を確認します。
                  </p>
                </button>

                <button
                  type="button"
                  className="bg-gray-700/30 p-6 rounded-lg border border-gray-600/30 backdrop-blur-sm hover:bg-gray-700/50 transition-colors cursor-pointer text-left"
                  onClick={() => router.push("/camera")}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-full text-purple-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        role="img"
                        aria-label="メンバー追加アイコン"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="3" />
                        <line x1="22" x2="18" y1="12" y2="12" />
                        <line x1="6" x2="2" y1="12" y2="12" />
                        <line x1="12" x2="12" y1="6" y2="2" />
                        <line x1="12" x2="12" y1="22" y2="18" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold">メンバーを追加</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    新しいメンバーのカードを作成します。
                  </p>
                </button>
              </div>
            </div>
          </Animator>
        </div>
      </div>
    );
  }

  // User has NO circle -> Onboarding View
  return (
    <div style={styles.container}>
      <div style={styles.backgroundAmbience}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      <div style={styles.onboardingContent}>
        <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Create New */}
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Create
              </span>
              Your Circle
            </h1>
            <p className="text-gray-400 text-lg">
              新しいサークルを作成して、
              <br />
              メンバーのカードを集めましょう。
            </p>

            <form onSubmit={handleCreateCircle} className="space-y-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-6 bg-gray-900 rounded-lg leading-none flex items-center">
                  <input
                    type="text"
                    value={newCircleName}
                    onChange={(e) => setNewCircleName(e.target.value)}
                    placeholder="サークル名を入力"
                    className="bg-transparent text-white placeholder-gray-500 focus:outline-none w-full text-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isCreating || !newCircleName.trim()}
                className="w-full py-4 px-6 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-[1.02] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "作成中..." : "サークルを作成する"}
              </button>
            </form>
          </div>

          {/* Right Column: Join Existing */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-200">Join Existing</h2>
            <div className="h-[400px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {loading ? (
                <div className="text-gray-500 text-center py-10">
                  Loading circles...
                </div>
              ) : circles.length === 0 ? (
                <div className="text-gray-500 text-center py-10">
                  サークルが見つかりません
                </div>
              ) : (
                circles.map((circle) => (
                  <button
                    key={circle.id}
                    type="button"
                    onClick={() => handleJoinCircle(circle.id, circle.name)}
                    className="group p-4 bg-gray-900/50 hover:bg-gray-800 border border-gray-800 hover:border-blue-500/50 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between text-left w-full"
                  >
                    <span className="font-semibold text-lg">{circle.name}</span>
                    <span className="text-gray-500 group-hover:text-blue-400 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        role="img"
                        aria-label="参加する"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                ))
              )}
            </div>
            {isJoining && (
              <div className="text-center text-blue-400 animate-pulse">
                Joining...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

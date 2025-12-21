"use client";

import { Animator } from "@arwes/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";

import { createCircle, getCircles, joinCircle } from "@/lib/firestore";
import type { Circle } from "@/types/app";
import Loading from "../loading";
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

  if (loading) {
    return <Loading />;
  }

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
            <div className="w-full max-w-4xl relative">
              <div className="relative p-8 md:p-12 space-y-10">
                {/* Header */}
                <div className="text-center space-y-2">
                  <p style={styles.panelTitle}>CURRENT AFFILIATION</p>
                  <h1
                    className="text-4xl md:text-5xl font-bold tracking-tight"
                    style={styles.headerGradient}
                  >
                    {myCircle?.name || "UNIDENTIFIED CIRCLE"}
                  </h1>
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs tracking-widest text-green-400">
                      SYSTEM ONLINE
                    </span>
                  </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Binder Button */}
                  <button
                    type="button"
                    className="group relative overflow-hidden"
                    onClick={() => router.push("/binder")}
                    style={styles.cyberButton}
                  >
                    <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-3 text-cyan-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <title>Member List Icon</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        <span style={styles.panelTitle}>ACCESS DATABASE</span>
                      </div>
                      <h3
                        className="text-xl font-bold mb-1"
                        style={styles.neonText}
                      >
                        MEMBER LIST
                      </h3>
                      <p className="text-sm text-gray-400">
                        View affiliation records and card data.
                      </p>
                    </div>
                  </button>

                  {/* Add Member Button */}
                  <button
                    type="button"
                    className="group relative overflow-hidden"
                    onClick={() => router.push("/camera")}
                    style={styles.cyberButton}
                  >
                    <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-3 text-purple-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <title>Add Member Icon</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <span
                          style={{ ...styles.panelTitle, color: "#d86bf5" }}
                        >
                          INITIALIZE SCAN
                        </span>
                      </div>
                      <h3
                        className="text-xl font-bold mb-1"
                        style={styles.neonTextSecondary}
                      >
                        ADD MEMBER
                      </h3>
                      <p className="text-sm text-gray-400">
                        Register new personnel via card scan.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Matching Navigation Button */}
            <div className="mt-6">
              <button
                type="button"
                className="group relative overflow-hidden w-full"
                onClick={() => router.push("/circle/matching")}
                style={{
                  ...styles.cyberButton,
                  borderColor: "rgba(249, 115, 22, 0.3)", // Orange tint
                  background: "rgba(249, 115, 22, 0.05)",
                }}
              >
                <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex flex-row items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-900/20 rounded border border-orange-500/30 text-orange-400">
                      <span className="text-2xl">⚔️</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          style={{ ...styles.panelTitle, color: "#fdba74" }}
                        >
                          TACTICAL
                        </span>
                      </div>
                      <h3
                        className="text-xl font-bold"
                        style={{
                          ...styles.neonText,
                          color: "#f97316",
                          textShadow: "0 0 10px rgba(249, 115, 22, 0.5)",
                        }}
                      >
                        BATTLE BULLETIN
                      </h3>
                      <p className="text-sm text-gray-400">
                        View requests and find opponents.
                      </p>
                    </div>
                  </div>
                  <div className="text-orange-500 opacity-50 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
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
                    >
                      <title>Arrow Right</title>
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-700/50"></div>
          </Animator>
        </div>
      </div>
    );
  }

  // User has NO circle -> Onboarding View
  return (
    <div style={styles.container}>
      <div style={styles.backgroundAmbience}>
        {/* Darker, more subtle ambience */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-900 to-transparent opacity-20" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-900 to-transparent opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-900/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-900/5 rounded-full blur-[120px]" />
      </div>

      <div style={styles.onboardingContent}>
        <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Column: Create New */}
          <div className="space-y-8">
            <div>
              <p style={{ ...styles.panelTitle, fontSize: "12px" }}>
                INITIATE NEW PROTOCOL
              </p>
              <h1 className="text-5xl font-extrabold tracking-tight mb-4">
                <span className="block text-white mb-2">CREATE</span>
                <span
                  className="block"
                  style={{
                    ...styles.headerGradient,
                    background: "linear-gradient(90deg, #f700ff, #00dac1)",
                  }}
                >
                  CIRCLE
                </span>
              </h1>
              <p className="text-gray-400 text-lg border-l-2 border-purple-500/50 pl-4">
                Start a new collection group.
                <br />
                Gather your team's data cards.
                <br />
                <span className="block mt-2 text-yellow-300 font-medium">
                  Note: Circle membership is required — please create a circle
                  or join an existing one to continue.
                </span>
              </p>
            </div>

            <form onSubmit={handleCreateCircle} className="space-y-6">
              <div style={styles.onboardingInputContainer}>
                <input
                  type="text"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  placeholder="ENTER CIRCLE DESIGNATION"
                  style={styles.onboardingInput}
                />
              </div>

              <button
                type="submit"
                disabled={isCreating || !newCircleName.trim()}
                className="w-full relative group overflow-hidden py-4 px-6 font-bold text-lg tracking-widest uppercase transition-all"
                style={{
                  ...styles.cyberButton,
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  background: isCreating
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(247, 0, 255, 0.1)",
                  borderColor: "#f700ff",
                }}
              >
                <div className="absolute inset-0 bg-fuchsia-600/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10">
                  {isCreating ? "PROCESSING..." : "INITIALIZE"}
                </span>
              </button>
            </form>
          </div>

          {/* Right Column: Join Existing */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-800 pb-2">
              <div className="w-2 h-2 bg-cyan-500 animate-ping" />
              <h2 className="text-lg font-bold text-cyan-500 tracking-widest uppercase">
                DETECTED SIGNALS
              </h2>
            </div>

            <div
              className="h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar"
              style={{
                scrollbarColor: "#334455 transparent",
                scrollbarWidth: "thin",
              }}
            >
              {loading ? (
                <div className="text-cyan-500/50 font-mono text-center py-10 animate-pulse">
                  SCANNING NETWORK...
                </div>
              ) : circles.length === 0 ? (
                <div className="text-gray-600 font-mono text-center py-10">
                  NO SIGNALS DETECTED
                </div>
              ) : (
                circles.map((circle) => (
                  <button
                    key={circle.id}
                    type="button"
                    disabled={isJoining}
                    onClick={() => handleJoinCircle(circle.id, circle.name)}
                    className={`group relative w-full text-left p-4 transition-all ${
                      isJoining ? "opacity-50 cursor-not-allowed" : "hover:pl-6"
                    }`}
                    style={{
                      borderBottom: "1px solid rgba(0, 218, 193, 0.1)",
                      background:
                        "linear-gradient(90deg, transparent, rgba(0, 218, 193, 0.02))",
                    }}
                  >
                    <div className="flex justify-between items-center group-hover:text-cyan-400 transition-colors">
                      <div>
                        <span className="block text-xs text-gray-500 font-mono mb-1">
                          ID: {circle.id.substring(0, 8)}...
                        </span>
                        <span className="font-bold text-lg font-mono">
                          {circle.name}
                        </span>
                      </div>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-500 font-mono">
                        [CONNECT]
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
            {isJoining && (
              <div className="text-center text-cyan-400 font-mono text-xs animate-pulse">
                ESTABLISHING CONNECTION...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

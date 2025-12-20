"use client";

import { useEffect } from "react";

export default function BinderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Binder page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-md px-4 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-wide">マイ・バインダー</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-red-400 text-center mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-label="エラーアイコン"
            >
              <title>エラーアイコン</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-lg font-semibold mb-2">エラーが発生しました</p>
            <p className="text-sm text-gray-400">
              {error.message || "カードの取得に失敗しました。"}
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    </div>
  );
}

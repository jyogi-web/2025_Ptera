"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Card } from "@/types/app";

interface Props {
  card: Card;
}

export default function CardDetails({ card }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  const isOwner = user?.id === card.creatorId;

  // Helper to get days elapsed
  const getDaysElapsed = (createdAt: Date): number => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 shadow-2xl relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-500/10 blur-3xl -z-10" />

        <button
          type="button"
          onClick={() => router.push("/binder")}
          className="mb-4 text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          ← バインダーに戻る
        </button>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Card Details
          </h1>
        </div>

        <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border border-gray-700 shadow-lg mb-6">
          {card.imageUrl ? (
            <Image
              src={card.imageUrl}
              alt={card.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
              No Image
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gray-900 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-xl font-bold text-white shadow-black drop-shadow-md">
              {card.name}
            </h2>
            <p className="text-cyan-400 text-sm font-mono">{card.position}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-800 pb-2">
            <span className="text-gray-400 text-sm">作成日</span>
            <span className="text-white font-mono text-sm">
              {card.createdAt.toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">学年</p>
              <p className="text-white font-bold">{card.grade}年</p>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">活動期間</p>
              <p className="text-white font-bold">
                {getDaysElapsed(card.createdAt)}日
              </p>
            </div>
          </div>

          <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
            <p className="text-xs text-fuchsia-400 mb-2 font-bold uppercase tracking-wider">
              Hobby
            </p>
            <p className="text-gray-200">{card.hobby || "未設定"}</p>
          </div>

          <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
            <p className="text-xs text-purple-400 mb-2 font-bold uppercase tracking-wider">
              Description
            </p>
            <p className="text-gray-200 text-sm whitespace-pre-wrap">
              {card.description || "未設定"}
            </p>
          </div>

          {isOwner && (
            <div className="pt-4">
              <Link
                href={`/binder/${card.id}/edit`}
                className="block w-full text-center bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-cyan-500/20 transform hover:-translate-y-0.5 transition-all"
              >
                編集する
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

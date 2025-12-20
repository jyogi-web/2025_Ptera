"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { deleteCardFirestore, updateCard } from "@/lib/firestore";
import { deleteImage } from "@/lib/storage";
import type { Card } from "@/types/app";

interface Props {
  card: Card;
}

export default function EditCardForm({ card }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: card.name,
    grade: card.grade,
    position: card.position,
    hobby: card.hobby,
    description: card.description,
  });

  // Client-side double check (optional but safe)
  const isOwner = user?.id === card.creatorId;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "grade" ? Number(value) : value,
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      alert("権限がありません。");
      return;
    }

    try {
      setIsUpdating(true);
      await updateCard(card.id, formData);
      router.push(`/binder/${card.id}`); // Redirect to details
      router.refresh();
    } catch (error) {
      console.error("Failed to update card:", error);
      alert("更新に失敗しました。");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    if (!confirm("本当にこのカードを削除しますか？\n（画像も削除されます）"))
      return;

    try {
      setIsUpdating(true);
      // Delete image if exists
      if (card.imageUrl) {
        await deleteImage(card.imageUrl);
      }

      await deleteCardFirestore(card.id);
      router.push("/binder");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete card:", error);
      alert("削除に失敗しました。");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOwner && user) {
    // If user is loaded but not owner, something is wrong with access
    return <div className="text-white text-center mt-20">Access Denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          ← キャンセル
        </button>

        <h1 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent">
          Edit Card
        </h1>

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Read-only Image Preview */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-700">
              {card.imageUrl ? (
                <Image
                  src={card.imageUrl}
                  alt={card.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-400">
                  No Img
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              className="block text-xs uppercase text-gray-500 font-bold mb-1 ml-1"
              htmlFor="name"
            >
              名前
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs uppercase text-gray-500 font-bold mb-1 ml-1"
                htmlFor="grade"
              >
                学年
              </label>
              <input
                id="grade"
                type="number"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                required
                min={1}
                max={6}
              />
            </div>
            <div>
              <label
                className="block text-xs uppercase text-gray-500 font-bold mb-1 ml-1"
                htmlFor="position"
              >
                役割
              </label>
              <input
                id="position"
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs uppercase text-gray-500 font-bold mb-1 ml-1"
              htmlFor="hobby"
            >
              趣味
            </label>
            <input
              id="hobby"
              type="text"
              name="hobby"
              value={formData.hobby}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-600"
            />
          </div>

          <div>
            <label
              className="block text-xs uppercase text-gray-500 font-bold mb-1 ml-1"
              htmlFor="description"
            >
              自己紹介
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-600 resize-none"
            />
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-cyan-500/20 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? "更新中..." : "変更を保存"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isUpdating}
              className="w-full bg-transparent border border-red-500/30 text-red-400 font-bold py-3 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              削除する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

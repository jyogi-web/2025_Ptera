"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { deleteCard, updateCard } from "@/lib/firestore";
import { deleteImage } from "@/lib/storage";
import type { Card } from "@/types/app";

interface Props {
  card: Card;
  // userId: string; // Removed in favor of client-side auth
}

export default function CardEditForm({ card }: Props) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: card.name,
    grade: card.grade,
    position: card.position,
    hobby: card.hobby,
    description: card.description,
  });

  // Determine ownership based on client-side auth
  // Ensure we don't assume ownership until loading is complete and user exists
  const isOwner = !loading && !!user && card.creatorId === user.id;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-cyan-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;
    setIsSubmitting(true);
    try {
      await updateCard(card.id, {
        name: formData.name,
        grade: Number(formData.grade),
        position: formData.position,
        hobby: formData.hobby,
        description: formData.description,
      });
      toast.success("カードを更新しました");
      router.push("/binder");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const extractStoragePathFromUrl = (url: string) => {
    try {
      if (!url.includes("/o/")) return null;
      const pathPart = url.split("/o/")[1].split("?")[0];
      return decodeURIComponent(pathPart);
    } catch (e) {
      console.error("Failed to parse storage URL", e);
      return null;
    }
  };

  const handleDelete = async () => {
    if (
      !confirm("本当に削除しますか？\n削除されたカードと画像は復元できません。")
    )
      return;
    setIsSubmitting(true);
    try {
      // Delete image first if exists
      if (card.imageUrl) {
        const imagePath = extractStoragePathFromUrl(card.imageUrl);
        if (imagePath) {
          try {
            await deleteImage(imagePath);
          } catch (e) {
            console.error("Image deletion failed", e);
            // Continue to delete card even if image deletion fails?
            // Usually yes to avoid orphaned data blocking flow, but warn.
            toast.error("画像の削除に失敗しましたが、カードを削除します");
          }
        }
      }

      await deleteCard(card.id);

      toast.success("カードを削除しました");
      router.push("/binder");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("削除に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };



  if (!isOwner) {
    return (
      <div className="text-slate-300 p-4 min-h-[50vh] flex flex-col items-center justify-center">
        <p className="mb-4">このカードを編集する権限がありません。</p>
        <button
          type="button"
          onClick={() => router.push("/binder")}
          className="text-cyan-400 hover:text-cyan-300 underline"
        >
          バインダーに戻る
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full mx-auto p-4 space-y-6 text-slate-100"
    >
      {/* Title */}
      <h2 className="text-xl font-bold text-center text-cyan-400 border-b border-cyan-500/30 pb-2">
        カード編集
      </h2>

      {/* Image Preview */}
      <div className="flex justify-center">
        {card.imageUrl ? (
          <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-slate-700 shadow-lg">
            <Image
              src={card.imageUrl}
              alt={card.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-40 h-40 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 border-2 border-slate-700">
            No Image
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium mb-1 text-cyan-200"
          >
            名前
          </label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            required
            placeholder="名前を入力"
          />
        </div>

        {/* Grade */}
        <div>
          <label
            htmlFor="grade"
            className="block text-sm font-medium mb-1 text-cyan-200"
          >
            学年 (1-4)
          </label>
          <input
            id="grade"
            type="number"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            required
            min="1"
            max="4"
          />
        </div>

        {/* Position */}
        <div>
          <label
            htmlFor="position"
            className="block text-sm font-medium mb-1 text-cyan-200"
          >
            役職
          </label>
          <input
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            required
            placeholder="役職を入力"
          />
        </div>

        {/* Hobby */}
        <div>
          <label
            htmlFor="hobby"
            className="block text-sm font-medium mb-1 text-cyan-200"
          >
            趣味
          </label>
          <input
            id="hobby"
            name="hobby"
            value={formData.hobby}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            placeholder="趣味を入力"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1 text-cyan-200"
          >
            説明 / コメント
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all h-32 resize-y"
            placeholder="説明文を入力"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed shadow transition-colors flex justify-center items-center"
        >
          {isSubmitting ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          ) : null}
          {isSubmitting ? "保存中..." : "変更を保存"}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isSubmitting}
          className="w-full bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-900/50 font-bold py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          カードを削除
        </button>
      </div>

      <div className="text-center mt-2">
        <button
          type="button"
          onClick={() => router.push("/binder")}
          className="text-slate-500 hover:text-cyan-400 text-sm transition-colors py-2"
        >
          キャンセルして戻る
        </button>
      </div>
    </form>
  );
}

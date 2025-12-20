"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { updateCard, deleteCardFirestore } from "@/lib/firestore";
import { deleteImage } from "@/lib/storage";
import type { Card } from "@/types/app";

interface Props {
    card: Card;
}

export default function CardEditContainer({ card }: Props) {
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
        if (!isOwner) return;

        try {
            setIsUpdating(true);
            await updateCard(card.id, formData);
            router.push("/binder");
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
        if (
            !confirm("本当にこのカードを削除しますか？\n（画像も削除されます）")
        )
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

    // Helper to get days elapsed (reused from Card component)
    const getDaysElapsed = (createdAt: Date): number => {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdAt.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    if (!isOwner) {
        // Read-Only View for Non-Owners
        return (
            <div className="min-h-screen bg-gray-950 text-white p-4 flex items-center justify-center">
                <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 shadow-2xl relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl -z-10" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-500/10 blur-3xl -z-10" />

                    <button
                        onClick={() => router.back()}
                        className="mb-4 text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        ← 戻る
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
                            <h2 className="text-xl font-bold text-white shadow-black drop-shadow-md">{card.name}</h2>
                            <p className="text-cyan-400 text-sm font-mono">{card.position}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                            <span className="text-gray-400 text-sm">作成日</span>
                            <span className="text-white font-mono text-sm">{card.createdAt.toLocaleDateString()}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                                <p className="text-xs text-gray-400 mb-1">学年</p>
                                <p className="text-white font-bold">{card.grade}年</p>
                            </div>
                            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                                <p className="text-xs text-gray-400 mb-1">活動期間</p>
                                <p className="text-white font-bold">{getDaysElapsed(card.createdAt)}日</p>
                            </div>
                        </div>

                        <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                            <p className="text-xs text-fuchsia-400 mb-2 font-bold uppercase tracking-wider">Hobby</p>
                            <p className="text-gray-200">{card.hobby || "未設定"}</p>
                        </div>

                        <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                            <p className="text-xs text-purple-400 mb-2 font-bold uppercase tracking-wider">Description</p>
                            <p className="text-gray-200 text-sm whitespace-pre-wrap">{card.description || "未設定"}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Edit Form for Owner
    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 flex items-center justify-center">
            <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 shadow-2xl relative">
                <button
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
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-400">No Img</div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-1 ml-1" htmlFor="name">
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
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-1 ml-1" htmlFor="grade">
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
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-1 ml-1" htmlFor="position">
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
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-1 ml-1" htmlFor="hobby">
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
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-1 ml-1" htmlFor="description">
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

"use client";

import Card from "@/components/Card";
import type { Card as CardType } from "@/types/app";

export default function BinderPage() {
  // モックデータ: Card型に準拠
  const cards: CardType[] = Array.from({ length: 12 }).map((_, i) => {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - (i + 1) * 10); // 作成日を過去に設定

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1450); // 有効期限を未来に設定

    return {
      id: `card-${i + 1}`,
      creatorId: `creator-${i + 1}`,
      name: `メンバー ${i + 1}`,
      grade: (i % 4) + 1,
      position: ["部長", "副部長", "会計", "広報"][i % 4],
      affiliatedGroup: "サンプルサークル",
      hobby: ["音楽鑑賞", "読書", "スポーツ", "映画鑑賞"][i % 4],
      description: `サンプルメンバー${i + 1}の説明文です。`,
      imageUrl: "", // 空の場合はプレースホルダー表示
      createdAt,
      expiryDate,
    };
  });

  // ラベル情報を別途管理（最初の3枚に"1st"ラベル）
  const getLabel = (index: number): string | undefined => {
    return index < 3 ? "1st" : undefined;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-md px-4 py-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-wide">マイ・バインダー</h1>
          <p className="text-sm text-gray-400">Total Cards: {cards.length}</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-3">
          {cards.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              label={getLabel(index)}
              onClick={(card) => {
                console.log("Card clicked:", card);
                // TODO: カード詳細ページへの遷移など
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

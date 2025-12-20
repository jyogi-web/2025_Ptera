import Link from "next/link";
import Card from "@/components/Card";
import { getCardsFromServer } from "@/lib/server";

export default async function BinderPage() {
  // サーバー側でデータをフェッチ
  const cards = await getCardsFromServer();

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

        {/* Empty State */}
        {cards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-gray-400 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-label="空のバインダーアイコン"
              >
                <title>空のバインダーアイコン</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-lg font-semibold mb-2">カードがありません</p>
              <p className="text-sm">
                カメラから新しいカードを作成してみましょう！
              </p>
            </div>
          </div>
        )}

        {/* Grid */}
        {cards.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {cards.map((card, index) => (
              <Link key={card.id} href={`/binder/${card.id}`}>
                <Card card={card} label={getLabel(index)} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
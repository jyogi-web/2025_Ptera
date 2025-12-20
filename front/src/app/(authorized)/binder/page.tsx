import { getCardsFromServer } from "@/lib/server";
import { BinderContent } from "./BinderContent";

export default async function BinderPage() {
  // サーバー側でデータをフェッチ
  const cards = await getCardsFromServer();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-md px-4 py-6">
        <BinderContent cards={cards} />
      </div>
    </div>
  );
}

import { getCardsFromServer } from "@/lib/server";
import { BinderContent } from "./_components/BinderContent";
import { styles } from "./_styles/page.styles";

export default async function BinderPage() {
  // サーバー側でデータをフェッチ
  const cards = await getCardsFromServer();

  return (
    <div style={styles.container}>
      <BinderContent cards={cards} />
    </div>
  );
}

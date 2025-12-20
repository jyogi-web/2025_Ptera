import {
  getCardsFromServer,
  getSession,
  getUserFromServer,
} from "@/lib/server";
import { BinderContent } from "./_components/BinderContent";
import { styles } from "./_styles/page.styles";

export default async function BinderPage() {
  const session = await getSession();
  let circleId: string | undefined;

  if (session?.uid) {
    const user = await getUserFromServer(session.uid);
    circleId = user?.circleId;
  }

  // サーバー側でデータをフェッチ
  const cards = await getCardsFromServer(circleId);

  return (
    <div style={styles.container}>
      <BinderContent cards={cards} />
    </div>
  );
}

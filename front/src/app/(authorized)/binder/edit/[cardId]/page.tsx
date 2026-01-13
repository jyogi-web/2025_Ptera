import { getCardFromServer } from "@/lib/server";
import { styles } from "../../_styles/page.styles";
import CardEditForm from "../_components/CardEditForm";

interface PageProps {
  params: Promise<{ cardId: string }>;
}

export default async function EditCardPage({ params }: PageProps) {
  const { cardId } = await params;
  const card = await getCardFromServer(cardId);

  if (!card) {
    return (
      <div style={styles.container}>
        <div className="flex items-center justify-center h-full text-slate-400">
          Card not found
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div
        style={styles.contentWrapper}
        className="w-full max-w-2xl mx-auto h-full"
      >
        <div
          style={{ ...styles.scrollableGrid, padding: "24px 16px 120px 16px" }}
        >
          <CardEditForm card={card} />
        </div>
      </div>
    </div>
  );
}

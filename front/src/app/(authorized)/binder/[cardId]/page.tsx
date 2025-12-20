import { notFound } from "next/navigation";
import CardDetails from "@/components/binder/CardDetails";
import { getCardFromServer } from "@/lib/server";

interface Props {
  params: Promise<{
    cardId: string;
  }>;
}

export default async function CardPage({ params }: Props) {
  const { cardId } = await params;
  const card = await getCardFromServer(cardId);

  if (!card) {
    notFound();
  }

  return <CardDetails card={card} />;
}

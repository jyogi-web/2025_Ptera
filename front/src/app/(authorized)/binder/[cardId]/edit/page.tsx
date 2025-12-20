import { notFound, redirect } from "next/navigation";
import EditCardForm from "@/components/binder/EditCardForm";
import { getCardFromServer, getSession } from "@/lib/server";

interface Props {
  params: Promise<{
    cardId: string;
  }>;
}

export default async function EditCardPage({ params }: Props) {
  const { cardId } = await params;
  const [card, sessionUser] = await Promise.all([
    getCardFromServer(cardId),
    getSession(),
  ]);

  if (!card) {
    notFound();
  }

  // Server-side Access Control
  // If not logged in or not creator, redirect to details page
  if (!sessionUser || sessionUser.uid !== card.creatorId) {
    redirect(`/binder/${cardId}`);
  }

  return <EditCardForm card={card} />;
}

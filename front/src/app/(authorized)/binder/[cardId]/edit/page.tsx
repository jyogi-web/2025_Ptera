import { notFound } from "next/navigation";
import { getCardFromServer } from "@/lib/server";
import CardEditContainer from "@/components/binder/CardEditContainer";

interface Props {
    params: Promise<{
        cardId: string;
    }>;
}

export default async function EditCardPage({ params }: Props) {
    const { cardId } = await params;
    const card = await getCardFromServer(cardId);

    if (!card) {
        notFound();
    }

    return <CardEditContainer card={card} />;
}

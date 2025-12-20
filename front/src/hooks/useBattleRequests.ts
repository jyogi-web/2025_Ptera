import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import type { BattleRequest } from "@/generated/ptera/v1/ptera_pb";
import { db } from "@/lib/firebase";

export function useBattleRequests(circleId: string | undefined) {
  const [incomingRequests, setIncomingRequests] = useState<BattleRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<BattleRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!circleId) {
      setIncomingRequests([]);
      setOutgoingRequests([]);
      return;
    }

    setLoading(true);

    // Incoming requests (Where I am "toCircleId")
    const qIncoming = query(
      collection(db, "battle_requests"),
      where("toCircleId", "==", circleId),
    );

    const unsubIncoming = onSnapshot(qIncoming, (snapshot) => {
      const reqs = snapshot.docs.map((doc) => doc.data() as BattleRequest);
      setIncomingRequests(reqs);
    });

    // Outgoing requests (Where I am "fromCircleId")
    const qOutgoing = query(
      collection(db, "battle_requests"),
      where("fromCircleId", "==", circleId),
    );

    const unsubOutgoing = onSnapshot(qOutgoing, (snapshot) => {
      const reqs = snapshot.docs.map((doc) => doc.data() as BattleRequest);
      setOutgoingRequests(reqs);
    });

    setLoading(false);

    return () => {
      unsubIncoming();
      unsubOutgoing();
    };
  }, [circleId]);

  return { incomingRequests, outgoingRequests, loading };
}

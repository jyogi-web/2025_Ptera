"use client";

import { useCallback, useEffect, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { addCard, getCards } from "@/lib/firestore";
import type { Card } from "@/types/app";

export default function FirestoreTestPage() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [formData, setFormData] = useState({
    name: "Test Name",
    grade: 1,
    position: "Member",
    hobby: "Coding",
    description: "This is a test card.",
    imageUrl: "https://placehold.co/600x400",
  });

  const [status, setStatus] = useState<string>("Idle");

  const fetchCards = useCallback(async () => {
    setStatus("Fetching...");
    setCards([]);
    try {
      const data = await getCards();
      setCards(data);
      setStatus(`Success! Loaded ${data.length} cards.`);
    } catch (e) {
      console.error("Fetch failed", e);
      setStatus("Error: Failed to fetch cards");
    }
  }, []);

  useEffect(() => {
    setProjectId(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "Not Set");
    fetchCards();
  }, [fetchCards]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first");
      return;
    }
    setLoading(true);
    try {
      await addCard({
        ...formData,
        creatorId: user.id,
      });
      alert("Added!");
      fetchCards();
    } catch (e) {
      console.error("Add failed", e);
      alert("Add failed. Check console and Firestore rules.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col items-center gap-8 p-8 bg-gray-50">
        <h1 className="text-2xl font-bold">Firestore Test</h1>
        <p className="text-sm text-gray-500">
          Connected to Project ID:{" "}
          <span className="font-mono font-bold text-black">{projectId}</span>
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-md flex-col gap-3 rounded bg-white p-6 shadow"
        >
          <h2 className="text-xl font-semibold">New Card</h2>
          <input
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded border p-2"
            required
          />
          <input
            type="number"
            placeholder="Grade"
            min="1"
            max="6"
            step="1"
            value={formData.grade}
            onChange={(e) => {
              const val = Math.floor(Number(e.target.value));
              const clamped = Math.max(1, Math.min(6, val));
              setFormData({ ...formData, grade: clamped });
            }}
            className="rounded border p-2"
            required
          />
          <input
            placeholder="Position"
            value={formData.position}
            onChange={(e) =>
              setFormData({ ...formData, position: e.target.value })
            }
            className="rounded border p-2"
            required
          />
          <input
            placeholder="Hobby"
            value={formData.hobby}
            onChange={(e) =>
              setFormData({ ...formData, hobby: e.target.value })
            }
            className="rounded border p-2"
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="rounded border p-2"
          />
          <input
            type="url"
            placeholder="Image URL"
            pattern="https?://.+"
            title="Must be a valid URL starting with http:// or https://"
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
            className="rounded border p-2"
            required
          />
          <button
            type="submit"
            disabled={loading || !user}
            className="rounded bg-green-500 py-2 text-white hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? "Adding..." : "Add Card"}
          </button>
        </form>

        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Cards</h2>
            <button
              type="button"
              onClick={fetchCards}
              className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              Force Refresh
            </button>
          </div>
          <p
            className={`text-sm mb-4 ${status.includes("Error") ? "text-red-500 font-bold" : "text-blue-600"}`}
          >
            Status: {status}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((card) => (
              <div
                key={card.id}
                className="rounded border bg-white p-4 shadow-sm"
              >
                <h3 className="font-bold">
                  {card.name} ({card.grade})
                </h3>
                <p className="text-sm text-gray-500">{card.position}</p>
                <p className="mt-2 text-sm">{card.description}</p>
                <p className="text-xs text-gray-400 mt-2">ID: {card.id}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

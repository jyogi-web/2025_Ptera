"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import exportElementToPng from "@/lib/exportImage";
import { useAuth } from "@/context/AuthContext";
import { addFavoriteCard, getFavoriteCards } from "@/lib/firestore";
import type { Card as CardType } from "@/types/app";
import { cyberToastStyle } from "../_styles/toast.styles";
import { BinderCard } from "./BinderCard";

interface BinderGridProps {
  cards: CardType[];
  isSelectingFavorite: boolean;
  onFavoriteSelected: () => void;
}

export function BinderGrid({
  cards,
  isSelectingFavorite,
  onFavoriteSelected,
}: BinderGridProps) {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [favoriteCardIds, setFavoriteCardIds] = useState<string[]>([]);
  const binderRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;

      try {
        const favorites = await getFavoriteCards(user.id);
        setFavoriteCardIds(favorites.map((card) => card.id));
      } catch (error) {
        console.error("Failed to load favorites:", error);
      }
    };

    loadFavorites();
  }, [user]);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

  const renderExpiry = () => {
    if (!selectedCard || !selectedCard.expiryDate) return null;
    const expiry = new Date(selectedCard.expiryDate);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return (
      <div className="mt-2 text-sm text-slate-300">
        卒業: {expiry.toLocaleDateString()}{" "}
        {daysLeft > 0 ? `（あと ${daysLeft}日）` : "（卒業済み）"}
      </div>
    );
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCard(null);
  }, []);

  const modalContentRef = useRef<HTMLDivElement | null>(null);

  const handleExport = async () => {
    if (!selectedCard) return;
    const safeName = selectedCard.name.replace(/[\\/\\\\:\\*\?"<>|]/g, "_");
    try {
      // Inject a temporary safe style to override modern color functions
      // (e.g. lab()) that html2canvas cannot parse. We add a class and a
      // <style> element, then remove them after export.
      const styleId = "export-safe-style";
      let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        styleEl.innerHTML = `
          .export-safe, .export-safe * { 
            color: #0f172a !important; 
            background: transparent !important; 
            background-color: transparent !important; 
            border-color: #0f172a !important; 
            box-shadow: none !important; 
            text-shadow: none !important; 
          }
          .export-safe img { background: transparent !important; }
        `;
        document.head.appendChild(styleEl);
      }

const el = modalContentRef.current;
await exportElementToPng(el, `${safeName}.png`);
toast.success("画像をダウンロードしました", { style: cyberToastStyle });
    } catch (e) {
      console.error("Export failed:", e);
      toast.error("画像の保存に失敗しました", { style: cyberToastStyle });
    }
  };

  const handleCardClick = async (card: CardType) => {
    if (!user || processing) return;

    if (isSelectingFavorite) {
      const isFavorite = favoriteCardIds.includes(card.id);

      if (isFavorite) {
        toast("既に推しメン登録済みです", {
          icon: "",
          duration: 2000,
          style: cyberToastStyle,
        });
        onFavoriteSelected();
        return;
      }

      try {
        setProcessing(true);
        await addFavoriteCard(user.id, card.id);
        setFavoriteCardIds([card.id]);
        toast.success(`${card.name}を推しメンに登録しました`, {
          icon: "",
          duration: 3000,
          style: {
            ...cyberToastStyle,
            border: "1px solid #facc15",
            color: "#fef08a",
            boxShadow: "0 0 15px rgba(250, 204, 21, 0.3)",
          },
        });
        onFavoriteSelected();
      } catch (error) {
        console.error("Failed to update favorite:", error);
        toast.error("操作に失敗しました", {
          style: {
            ...cyberToastStyle,
            border: "1px solid #ef4444",
            color: "#fecaca",
            boxShadow: "0 0 15px rgba(239, 68, 68, 0.3)",
          },
        });
        onFavoriteSelected();
      } finally {
        setProcessing(false);
      }
      return;
    }

    // open detail modal and record the clicked element for export
    setSelectedCard(card);
    setIsModalOpen(true);
    const el = binderRefs.current[card.id];
    if (el) {
      // store as data attribute so export can find it, or keep ref
      // we keep binderRefs and use it in export
    }
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`transition-all ${
              processing ? "opacity-50 pointer-events-none" : ""
            } ${
              isSelectingFavorite
                ? "ring-2 ring-yellow-400 ring-offset-2 scale-105"
                : ""
            }`}
          >
            <BinderCard
              ref={(el) => {
                binderRefs.current[card.id] = el;
              }}
              card={card}
              onClick={() => handleCardClick(card)}
              isFavorite={favoriteCardIds.includes(card.id)}
            />
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="カード詳細">
        {selectedCard ? (
          <div ref={modalContentRef}>
            {selectedCard.imageUrl ? (
              <div className="mb-4 relative w-full h-64 rounded-md overflow-hidden">
                <Image
                  src={selectedCard.imageUrl}
                  alt={selectedCard.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 640px"
                />
              </div>
            ) : (
              <div
                className="mb-4 w-full max-h-64 bg-slate-800 rounded-md"
                aria-hidden
              />
            )}

            <div className="mb-2 text-lg font-bold text-slate-100">
              {selectedCard.name}
            </div>
            <div className="mb-1 text-sm text-slate-300">
              {typeof selectedCard.grade === "number"
                ? `${selectedCard.grade}年`
                : selectedCard.grade}
            </div>
            {selectedCard.position && (
              <div className="mb-2 text-sm text-slate-300">
                役職: {selectedCard.position}
              </div>
            )}
            {selectedCard.faculty && (
              <div className="mb-2 text-sm text-slate-300">
                学部: {selectedCard.faculty}
              </div>
            )}
            {selectedCard.department && (
              <div className="mb-2 text-sm text-slate-300">
                学科: {selectedCard.department}
              </div>
            )}
            {/* memo field removed — using `description` for comments */}
            {selectedCard.description && (
              <div className="mt-3 text-sm whitespace-pre-wrap text-slate-200">
                <div className="text-xs text-slate-400 mb-1">作成コメント</div>
                <div>{selectedCard.description}</div>
              </div>
            )}
            {renderExpiry()}
            {selectedCard.createdAt && (
              <div className="mt-3 text-xs text-slate-400">
                作成: {new Date(selectedCard.createdAt).toLocaleString()}
              </div>
            )}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={async () => {
                  // Prefer exporting the binder-displayed card if available
                  try {
                    const binderEl = selectedCard && binderRefs.current[selectedCard.id];
                    if (binderEl) {
                      // Temporarily apply export-safe class to binder element as well
                      const styleId = "export-safe-style";
                      let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
                      if (!styleEl) {
                        styleEl = document.createElement("style");
                        styleEl.id = styleId;
                        styleEl.innerHTML = `\n                          .export-safe, .export-safe * { \n                            color: #0f172a !important; \n                            background: transparent !important; \n                            background-color: transparent !important; \n                            border-color: #0f172a !important; \n                            box-shadow: none !important; \n                            text-shadow: none !important; \n                          }\n                          .export-safe img { background: transparent !important; }\n                        `;
                        document.head.appendChild(styleEl);
                      }
                      binderEl.classList.add("export-safe");
                      try {
                        await exportElementToPng(binderEl, `${selectedCard.name.replace(/[\\/\\\\:\\*\?"<>|]/g, "_")}.png`);
                        toast.success("画像をダウンロードしました", { style: cyberToastStyle });
                      } finally {
                        binderEl.classList.remove("export-safe");
                      }
                      return;
                    }

                    // Fallback to modal content export
                    await handleExport();
                  } catch (e) {
                    console.error("Export failed:", e);
                    toast.error("画像の保存に失敗しました", { style: cyberToastStyle });
                  }
                }}
                className="px-3 py-1 rounded bg-cyan-700/40 hover:bg-cyan-700/60 text-slate-100"
              >
                画像を保存
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-100"
              >
                閉じる
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

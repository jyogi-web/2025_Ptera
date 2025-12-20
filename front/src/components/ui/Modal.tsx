"use client";

import { FrameCorners } from "@arwes/react";
import { useEffect } from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onMouseDown={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative max-w-2xl w-full mx-auto z-10"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <FrameCorners
            strokeWidth={1}
            cornerLength={16}
            style={{ color: "#00dac1", backgroundColor: "transparent" }}
          />

          <div className="relative bg-[rgba(3,15,25,0.92)] border border-cyan-600/20 shadow-[0_0_30px_rgba(34,211,238,0.06)] rounded-lg p-6 text-slate-200">
            <div className="absolute top-3 right-3">
              <button
                type="button"
                aria-label="閉じる"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <title>閉じる</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {title && (
              <div className="mb-4 text-lg font-semibold text-[#e6fdf9]">
                {title}
              </div>
            )}
            <div>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const target = typeof document !== "undefined" ? document.body : null;
  return target ? ReactDOM.createPortal(modal, target) : null;
}

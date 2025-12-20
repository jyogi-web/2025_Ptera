"use client";

import Image from "next/image";
import type { Card } from "@/types/app";
import { styles } from "../_styles/BinderCard.styles";

interface BinderCardProps {
  card: Card;
  onClick?: () => void;
  isFavorite?: boolean;
}

export const BinderCard = ({ card, onClick, isFavorite }: BinderCardProps) => {
  return (
    <button type="button" style={styles.container} onClick={onClick}>
      {/* Main Container Glow */}
      <div style={styles.mainGlow} />

      {/* Cyber Decorative Corners */}
      <div style={{ ...styles.cornerBase, ...styles.cornerTL }} />
      <div style={{ ...styles.cornerBase, ...styles.cornerTR }} />
      <div style={{ ...styles.cornerBase, ...styles.cornerBL }} />
      <div style={{ ...styles.cornerBase, ...styles.cornerBR }} />

      {/* Character Image Area */}
      <div style={styles.imageArea}>
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.name}
            fill
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div style={styles.noDataContainer}>
            <div className="text-2xl mb-1 animate-pulse">?</div>
          </div>
        )}

        {/* Scanline Overlay */}
        <div style={styles.scanline} />
      </div>

      {/* Grade Indicator (Top-Right) */}
      <div style={styles.gradeBadge}>
        <span style={styles.gradeText}>
          {typeof card.grade === "number" ? `${card.grade}年` : card.grade}
        </span>
      </div>

      {/* Favorite Indicator (Top-Left) */}
      {isFavorite && (
        <div style={styles.labelBadgeContent}>
          <span style={styles.labelText}>★</span>
        </div>
      )}

      {/* Info Panel */}
      <div style={styles.infoPanel}>
        {/* Partner Name Box */}
        <div style={styles.partnerNameBox}>
          <div style={{ ...styles.partnerNameMarker, left: "-2px" }} />
          <div style={{ ...styles.partnerNameMarker, right: "-2px" }} />
          <div style={styles.partnerNameContent}>
            <p style={styles.partnerNameText}>{card.name}</p>
          </div>
        </div>
        {/* Position Text (Below Name) */}
        {card.position && <p style={styles.positionText}>{card.position}</p>}
      </div>
    </button>
  );
};

"use client";

import { FrameCorners } from "@arwes/react";
import Link from "next/link";
import { useState } from "react";
import { styles } from "../_styles/GameCard.styles";

export const GameCard = ({
  title,
  description,
  href,
  color,
  disabled = false,
}: {
  title: string;
  description: string;
  href: string;
  color: string;
  disabled?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      style={{
        ...styles.cardLink,
        pointerEvents: disabled ? "none" : "auto",
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.card}>
        <FrameCorners
          style={{
            ...styles.frame,
            color: isHovered && !disabled ? color : "rgba(255, 255, 255, 0.1)",
          }}
          strokeWidth={2}
          cornerLength={20}
        />
        <div style={styles.cardContent}>
          <h2
            style={{
              ...styles.cardTitle,
              color: isHovered && !disabled ? color : "#ccc",
              textShadow: isHovered && !disabled ? `0 0 10px ${color}` : "none",
            }}
          >
            {title}
          </h2>
          <p style={styles.cardDesc}>{description}</p>
        </div>
      </div>
    </Link>
  );
};

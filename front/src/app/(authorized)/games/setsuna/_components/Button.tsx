"use client";

import type { CSSProperties, ReactNode } from "react";
import { useMemo, useState } from "react";
import { styles } from "../_styles/Button.styles";

interface ArwesButtonProps {
  children: ReactNode;
  onClick?: () => void;
  palette?: "primary" | "secondary" | "error";
  className?: string;
  style?: CSSProperties;
}

export const Button = ({
  children,
  onClick,
  palette = "primary",
  style,
}: ArwesButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const color = useMemo(() => {
    switch (palette) {
      case "error":
        return "#ff4444";
      case "secondary":
        return "#f7f";
      default:
        return "#00dac1";
    }
  }, [palette]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      type="button"
      style={{
        ...styles.button,
        opacity: isHovered ? 1 : 0.8,
        ...style,
      }}
    >
      <span
        style={{
          ...styles.content,
          color: color,
        }}
      >
        {children}
      </span>
    </button>
  );
};

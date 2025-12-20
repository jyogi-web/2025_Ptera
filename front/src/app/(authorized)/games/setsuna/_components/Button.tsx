"use client";

import { Animator, FrameCorners } from "@arwes/react";
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
      <Animator active={true}>
        <FrameCorners
          strokeWidth={2}
          cornerLength={10}
          style={{
            ...styles.frame,
            color: color,
          }}
        />
      </Animator>

      <span
        style={{
          ...styles.content,
          color: color,
          textShadow: `0 0 5px ${color}`,
        }}
      >
        {children}
      </span>
    </button>
  );
};

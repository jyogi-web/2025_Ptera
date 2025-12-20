"use client";

import { Animator, FrameCorners } from "@arwes/react";
import type { CSSProperties, ReactNode } from "react";
import { useMemo, useState } from "react";

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
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0",
        cursor: "pointer",
        userSelect: "none",
        transition: "opacity 0.2s",
        opacity: isHovered ? 1 : 0.8,
        background: "transparent",
        border: "none",
        outline: "none",
        color: "inherit",
        font: "inherit",
        ...style,
      }}
    >
      <Animator active={true}>
        <FrameCorners
          strokeWidth={2}
          cornerLength={10}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            color: color,
          }}
        />
      </Animator>

      <span
        style={{
          position: "relative",
          zIndex: 1,
          color: color,
          fontFamily: "monospace",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "2px",
          textShadow: `0 0 5px ${color}`,
        }}
      >
        {children}
      </span>
    </button>
  );
};

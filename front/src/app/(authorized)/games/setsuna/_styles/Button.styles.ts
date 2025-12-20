import type { CSSProperties } from "react";

export const styles: { [key: string]: CSSProperties } = {
  button: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
    cursor: "pointer",
    userSelect: "none",
    transition: "opacity 0.2s",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "inherit",
    font: "inherit",
  },
  frame: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    backgroundColor: "transparent",
  },
  content: {
    position: "relative",
    zIndex: 1,
    fontFamily: "monospace",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "2px",
  },
};

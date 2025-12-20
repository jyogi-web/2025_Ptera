import type { CSSProperties } from "react";

export const styles: { [key: string]: CSSProperties } = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100vw",
    height: "100dvh",
    overflowY: "auto",
    overscrollBehavior: "none",
    padding: "100px 20px 40px", // Clear header
    background: "#050b14", // Deep dark blue/black
    color: "#a4b5c9", // Slate blue text
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    boxSizing: "border-box",
  },
  header: {
    marginBottom: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(34, 211, 238, 0.3)",
    paddingBottom: "10px",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#22d3ee", // Cyan-400
    letterSpacing: "2px",
    textShadow: "0 0 10px rgba(34, 211, 238, 0.5)",
    textTransform: "uppercase",
  },
  // Cyber Frame for Camera and Form
  cyberFrame: {
    background: "rgba(15, 23, 42, 0.6)", // Slate-900 with opacity
    border: "1px solid rgba(34, 211, 238, 0.3)",
    borderRadius: "4px",
    boxShadow: "0 0 15px rgba(6, 182, 212, 0.1)",
    position: "relative",
    overflow: "hidden",
  },
  // Corner accents can be added as pseudo-elements or separate divs if needed,
  // but for simple object styles we might stick to borders/clip-paths.

  // Cyber Button
  cyberButton: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 24px",
    background:
      "linear-gradient(45deg, rgba(6, 182, 212, 0.1), rgba(6, 182, 212, 0.2))",
    border: "1px solid rgba(34, 211, 238, 0.5)",
    color: "#a5f3fc", // Cyan-200
    fontSize: "0.9rem",
    fontWeight: "bold",
    letterSpacing: "1px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    clipPath:
      "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
    textTransform: "uppercase",
  },
  cyberButtonActive: {
    background: "rgba(6, 182, 212, 0.3)",
    boxShadow: "0 0 15px rgba(6, 182, 212, 0.4)",
    borderColor: "#22d3ee",
    color: "#fff",
  },
  cyberButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    filter: "grayscale(100%)",
  },

  // Cyber Input
  cyberInput: {
    width: "100%",
    padding: "10px 16px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(148, 163, 184, 0.2)", // Slate-400
    borderRadius: "2px",
    color: "#e2e8f0", // Slate-200
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
    outline: "none",
  },
  cyberInputFocus: {
    borderColor: "#22d3ee",
    boxShadow: "0 0 8px rgba(34, 211, 238, 0.3)",
    background: "rgba(15, 23, 42, 1)",
  },

  // Shutter Button (Circular)
  shutterButton: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "transparent",
    border: "2px solid #22d3ee",
    boxShadow:
      "0 0 15px rgba(34, 211, 238, 0.5), inset 0 0 10px rgba(34, 211, 238, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  shutterButtonInner: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#22d3ee",
    boxShadow: "0 0 10px rgba(34, 211, 238, 0.8)",
    transition: "transform 0.1s ease",
  },
};

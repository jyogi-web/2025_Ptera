import type { CSSProperties } from "react";

export const styles: { [key: string]: CSSProperties } = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    width: "100vw",
    height: "100dvh",
    overflowX: "hidden", // Prevent scrolling on the body/container
    overflowY: "hidden",
    touchAction: "pan-y", // Allow vertical pan, prevent bounce scroll where supported/needed
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: "#e6fdf9",
    background: "#050b14",
    display: "flex",
    flexDirection: "column",
    paddingTop: "80px", // Header height compensation
  },
  contentWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden", // Ensure children handle scrolling
    overflowY: "hidden",
    width: "100%",
    // maxWidth: "480px", // Removed for responsive design - handled by consumers
    margin: "0 auto",
    padding: "24px 16px",
  },
  header: {
    flexShrink: 0,
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scrollableGrid: {
    flex: 1,
    overflowY: "auto",
    paddingBottom: "100px", // Extra padding for bottom
    scrollbarWidth: "thin",
    scrollbarColor: "#334455 transparent",
  },
  // Cyber Styled Total Cards
  totalCardsBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 16px",
    background: "rgba(5, 11, 20, 0.8)",
    border: "1px solid rgba(34, 211, 238, 0.3)", // Cyan border
    borderRadius: "4px",
    position: "relative",
    boxShadow: "0 0 10px rgba(6, 182, 212, 0.1)", // Subtle cyan glow
  },
  totalCardsLabel: {
    color: "#94a3b8", // slightly brighter slate
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontFamily: "monospace",
  },
  totalCardsValue: {
    color: "#7ef9f1", // brighter cyan for contrast
    fontSize: "1rem",
    fontWeight: "bold",
    fontFamily: "monospace",
    textShadow: "0 0 5px rgba(34, 211, 238, 0.5)",
  },
  // Cyber Styled Action Button
  actionButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "8px 20px",
    background:
      "linear-gradient(45deg, rgba(6, 182, 212, 0.1), rgba(6, 182, 212, 0.2))",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(34, 211, 238, 0.5)",
    borderRadius: "2px",
    color: "#a5f3fc", // cyan-200
    fontSize: "0.875rem",
    fontWeight: "bold",
    letterSpacing: "0.05em",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 0 10px rgba(6, 182, 212, 0.1)",
    // Clip path for angled corners (top-left, bottom-right)
    clipPath:
      "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
  },
  actionButtonText: {
    position: "relative",
    zIndex: 10,
    fontFamily: "monospace",
  },
  actionButtonActive: {
    background: "rgba(6, 182, 212, 0.3)",
    boxShadow: "0 0 15px rgba(6, 182, 212, 0.3)",
    borderColor: "#22d3ee",
    color: "#fff",
  },
};

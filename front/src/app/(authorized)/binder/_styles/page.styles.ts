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
    overflow: "hidden", // Prevent scrolling on the body/container
    touchAction: "none", // Prevent bounce scroll where supported/needed
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: "#a4b5c9",
    background: "#050b14",
    display: "flex",
    flexDirection: "column",
  },
  contentWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden", // Ensure children handle scrolling
    width: "100%",
    maxWidth: "480px", // Keep the max-w-md constraint roughly
    margin: "0 auto",
    padding: "24px 16px",
  },
  header: {
    flexShrink: 0,
    marginBottom: "16px",
  },
  scrollableGrid: {
    flex: 1,
    overflowY: "auto",
    paddingBottom: "20px", // Extra padding for bottom
    scrollbarWidth: "thin",
    scrollbarColor: "#334455 transparent",
  },
};

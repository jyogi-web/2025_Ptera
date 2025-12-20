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
    overflow: "auto", // Allow scrolling if content overflows
    touchAction: "manipulation",
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: "#fff",
    background: "#050b14", // Consistent deep dark background
    display: "flex", // Keep flex layout from original page
    flexDirection: "column",
    alignItems: "center",
  },
  contentWrapper: {
    width: "100%",
    maxWidth: "448px", // max-w-md
    padding: "0 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    zIndex: 10,
    paddingTop: "80px", // pt-20
    paddingBottom: "96px", // pb-24
  },
  backgroundAmbience: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: -1,
  },
};

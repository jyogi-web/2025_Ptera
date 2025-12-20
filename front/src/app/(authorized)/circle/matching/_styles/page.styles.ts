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
    overflowY: "hidden",
    overflowX: "hidden",
    touchAction: "manipulation",
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: "#a4b5c9", // soft cyber blue-grey
    background: "#050b14", // deep dark
  },
  dashboardContent: {
    height: "100%",
    width: "100%",
    padding: "60px 16px 20px 16px", // Reduced bottom padding
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  panelTitle: {
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "2px",
    color: "#5f7e97",
    marginBottom: "4px",
    display: "block",
  },
  headerGradient: {
    background: "linear-gradient(90deg, #00dac1, #0080ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: "bold",
    lineHeight: "1.2",
    paddingBottom: "10px",
  },
  frameCornersCommon: {
    zIndex: 0,
    position: "absolute",
    inset: 0,
  },
  frameCornersMain: {
    color: "#00dac1",
    backgroundColor: "rgba(3, 15, 25, 0.6)",
    backdropFilter: "blur(10px)",
  },
  frameCornersOpponent: {
    color: "#f97316", // Orange for battle/opponent
    backgroundColor: "rgba(249, 115, 22, 0.05)",
  },
  scanTitle: {
    textShadow: "0 0 10px rgba(249, 115, 22, 0.5)",
  },
  requestsScrollContainer: {
    scrollbarColor: "#7c2d12 transparent",
    scrollbarWidth: "thin",
  },
};

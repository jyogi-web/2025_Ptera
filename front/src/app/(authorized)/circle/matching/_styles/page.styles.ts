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
  // Enhanced Cyber Styles
  cyberListItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(15, 23, 42, 0.6)",
    padding: "16px",
    border: "1px solid rgba(249, 115, 22, 0.2)",
    borderLeft: "4px solid rgba(249, 115, 22, 0.4)",
    marginBottom: "12px",
    transition: "all 0.3s ease",
    clipPath:
      "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
  },
  cyberListItemHover: {
    background: "rgba(249, 115, 22, 0.1)",
    borderColor: "rgba(249, 115, 22, 0.6)",
    borderLeftColor: "#f97316",
    boxShadow: "0 0 20px rgba(249, 115, 22, 0.1)",
    transform: "translateX(4px)",
  },
  cyberButton: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 20px",
    background:
      "linear-gradient(45deg, rgba(249, 115, 22, 0.1), rgba(249, 115, 22, 0.2))",
    border: "1px solid rgba(249, 115, 22, 0.5)",
    color: "#fdba74", // Orange-200
    fontSize: "0.85rem",
    fontWeight: "bold",
    letterSpacing: "1px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    clipPath: "polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px)",
    textTransform: "uppercase",
  },
  cyberButtonHover: {
    background: "rgba(249, 115, 22, 0.3)",
    boxShadow: "0 0 15px rgba(249, 115, 22, 0.4)",
    borderColor: "#f97316",
    color: "#fff",
  },
  cyberButtonBack: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#22d3ee",
    fontFamily: "monospace",
    fontSize: "0.9rem",
    background: "transparent",
    border: "1px solid transparent",
    padding: "6px 12px",
    borderRadius: "4px",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  cyberButtonBackHover: {
    color: "#a5f3fc",
    background: "rgba(34, 211, 238, 0.1)",
    borderColor: "rgba(34, 211, 238, 0.3)",
    boxShadow: "0 0 10px rgba(34, 211, 238, 0.2)",
  },
  // Radar Animation Style (CSS to be handled in component or global CSS,
  // but we can define the container here)
  radarContainer: {
    position: "relative",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    border: "2px solid rgba(249, 115, 22, 0.3)",
    background:
      "radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, transparent 70%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow:
      "0 0 30px rgba(249, 115, 22, 0.2), inset 0 0 20px rgba(249, 115, 22, 0.1)",
  },
  radarLine: {
    position: "absolute",
    top: 0,
    left: "50%",
    width: "50%",
    height: "1px",
    background: "linear-gradient(90deg, transparent, #f97316)",
    transformOrigin: "0 0",
    animation: "radar-spin 2s linear infinite", // Requires keyframes in global CSS or Tailwind
  },
};

import type { CSSProperties } from "react";

export const styles: { [key: string]: CSSProperties } = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    width: "100%",
    height: "100%",
    overflowY: "hidden",
    overflowX: "hidden",
    touchAction: "manipulation",
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: "#a4b5c9", // soft cyber blue-grey
    background: "radial-gradient(circle at 50% 50%, #0a1120 0%, #050b14 100%)", // deep dark gradient
    backgroundImage: `
      radial-gradient(circle at 50% 50%, rgba(16, 26, 45, 0.8) 0%, #050b14 100%),
      linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
    `,
    backgroundSize: "100% 100%, 40px 40px, 40px 40px",
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
    textShadow: "0 0 5px rgba(95, 126, 151, 0.3)",
  },
  headerGradient: {
    background: "linear-gradient(90deg, #00dac1, #0080ff, #00dac1)",
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: "bold",
    lineHeight: "1.2",
    paddingBottom: "10px",
    animation: "gradient-flow 3s linear infinite", // Needs keyframes
  },
  frameCornersCommon: {
    zIndex: 0,
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },
  frameCornersMain: {
    color: "#00dac1",
    backgroundColor: "rgba(3, 15, 25, 0.7)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 0 30px rgba(0, 218, 193, 0.05)",
  },
  frameCornersOpponent: {
    color: "#f97316", // Orange for battle/opponent
    backgroundColor: "rgba(249, 115, 22, 0.03)",
    boxShadow: "inset 0 0 20px rgba(249, 115, 22, 0.05)",
  },
  scanTitle: {
    textShadow: "0 0 10px rgba(249, 115, 22, 0.5)",
    letterSpacing: "0.1em",
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
    background:
      "linear-gradient(90deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.4) 100%)",
    padding: "16px",
    border: "1px solid rgba(249, 115, 22, 0.2)",
    borderLeft: "4px solid rgba(249, 115, 22, 0.4)",
    marginBottom: "12px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    clipPath:
      "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
    position: "relative",
    overflow: "hidden",
  },
  cyberListItemHover: {
    background:
      "linear-gradient(90deg, rgba(249, 115, 22, 0.15) 0%, rgba(249, 115, 22, 0.05) 100%)",
    borderColor: "rgba(249, 115, 22, 0.6)",
    borderLeftColor: "#f97316",
    boxShadow: "0 0 20px rgba(249, 115, 22, 0.15)",
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
    background: "rgba(249, 115, 22, 0.8)",
    boxShadow: "0 0 20px rgba(249, 115, 22, 0.6)",
    borderColor: "#f97316",
    color: "#fff",
    textShadow: "0 0 5px rgba(255, 255, 255, 0.8)",
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
    textShadow: "0 0 5px rgba(34, 211, 238, 0.5)",
  },
  // Radar Animation Style
  radarContainer: {
    position: "relative",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    border: "1px solid rgba(249, 115, 22, 0.3)",
    background:
      "radial-gradient(circle, rgba(249, 115, 22, 0.05) 0%, transparent 60%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow:
      "0 0 30px rgba(249, 115, 22, 0.1), inset 0 0 20px rgba(249, 115, 22, 0.05)",
  },
  radarLine: {
    position: "absolute",
    top: 0,
    left: "50%",
    width: "50%",
    height: "2px",
    background:
      "linear-gradient(90deg, transparent 0%, rgba(249, 115, 22, 0.8) 100%)",
    transformOrigin: "0 0",
    boxShadow: "0 0 10px rgba(249, 115, 22, 0.8)",
  },
  radarCircle: {
    position: "absolute",
    inset: "20px",
    border: "1px dashed rgba(249, 115, 22, 0.2)",
    borderRadius: "50%",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
    paddingBottom: "8px",
    borderBottom: "1px solid rgba(249, 115, 22, 0.3)",
    boxShadow: "0 1px 0 rgba(249, 115, 22, 0.1)",
  },
};

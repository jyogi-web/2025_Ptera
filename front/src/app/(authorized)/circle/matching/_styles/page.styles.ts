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
    padding: "60px 16px 80px 16px", // Increased bottom padding for footer
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
  // Enhanced Cyber Styles
  // (Refactored to Tailwind classes in page.tsx)

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

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
    overflowY: "auto",
    overflowX: "hidden",
    touchAction: "manipulation",
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: "#a4b5c9", // soft cyber blue-grey
    background: "#050b14", // deep dark
  },
  // For the dashboard view centering
  dashboardContent: {
    minHeight: "100%",
    width: "100%",
    padding: "60px 16px 40px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  // For the onboarding view centering/layout
  onboardingContent: {
    minHeight: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    position: "relative",
  },
  // Replicating the background ambience safely
  backgroundAmbience: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: -1,
  },
  // Cyber Specifics
  cyberFrame: {
    position: "relative",
    padding: "30px",
    background: "rgba(5, 20, 35, 0.7)", // semi-transparent deep blue
    backdropFilter: "blur(10px)",
    // border is handled by FrameCorners
  },
  neonText: {
    color: "#00dac1",
    textShadow: "0 0 10px rgba(0, 218, 193, 0.5)",
    fontFamily: "'Orbitron', sans-serif", // if available, or just monospace feel
    letterSpacing: "0.05em",
  },
  neonTextSecondary: {
    color: "#f700ff",
    textShadow: "0 0 10px rgba(247, 0, 255, 0.5)",
  },
  cyberButton: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "20px",
    background: "rgba(0, 218, 193, 0.05)",
    border: "1px solid rgba(0, 218, 193, 0.2)",
    color: "#fff",
    cursor: "pointer",
    transition: "all 0.3s ease",
    width: "100%",
    textAlign: "left",
  },
  cyberButtonHover: {
    background: "rgba(0, 218, 193, 0.15)",
    boxShadow: "0 0 15px rgba(0, 218, 193, 0.3)",
    borderColor: "#00dac1",
  },
  panelTitle: {
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "2px",
    color: "#5f7e97",
    marginBottom: "4px",
    display: "block",
  },
  glitchEffect: {
    position: "relative",
    display: "inline-block",
  },
  headerGradient: {
    background: "linear-gradient(90deg, #00dac1, #0080ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: "bold",
    lineHeight: "1.2",
    paddingBottom: "10px",
  },
  onboardingInputContainer: {
    position: "relative",
    background: "rgba(5, 11, 20, 0.8)",
    padding: "4px",
    clipPath: "polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)", // cut corner
  },
  onboardingInput: {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #334455",
    color: "#00dac1",
    fontSize: "18px",
    padding: "12px",
    fontFamily: "monospace",
    outline: "none",
  },
};

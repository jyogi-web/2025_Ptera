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
    overflowY: "auto", // Allow vertical scrolling for content
    overflowX: "hidden",
    touchAction: "manipulation",
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: "#fff",
    background: "#030712", // gray-950
  },
  // For the dashboard view centering
  dashboardContent: {
    minHeight: "100%",
    width: "100%",
    padding: "80px 16px 24px 16px", // pt-20 + padding
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
    position: "relative", // context for absolute background
  },
  // Replicating the background ambience safely
  backgroundAmbience: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: -1,
  },
};

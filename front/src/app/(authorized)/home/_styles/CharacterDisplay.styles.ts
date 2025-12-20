import type { CSSProperties } from "react";

export const styles: { [key: string]: CSSProperties } = {
  container: {
    position: "relative",
    width: "100%",
    maxWidth: "320px", // max-w-xs
    aspectRatio: "3/4",
    margin: "16px auto",
  },
  mainGlow: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(22, 78, 99, 0.1)", // bg-cyan-900/10
    borderRadius: "0.75rem", // rounded-xl
    border: "1px solid rgba(6, 182, 212, 0.5)", // border-cyan-500/50
    boxShadow: "0 0 20px rgba(0, 218, 193, 0.2)",
    backdropFilter: "blur(12px)",
    zIndex: 0,
  },
  cornerBase: {
    position: "absolute",
    width: "16px",
    height: "16px",
    zIndex: 20,
    boxShadow: "0 0 10px rgba(0, 218, 193, 0.8)",
    borderColor: "#22d3ee", // border-cyan-400
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: "2px",
    borderLeftWidth: "2px",
    borderStyle: "solid",
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: "2px",
    borderRightWidth: "2px",
    borderStyle: "solid",
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: "2px",
    borderLeftWidth: "2px",
    borderStyle: "solid",
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: "2px",
    borderRightWidth: "2px",
    borderStyle: "solid",
  },
  imageArea: {
    position: "absolute",
    inset: "12px", // inset-3
    bottom: "80px", // bottom-20
    borderRadius: "2px",
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 10,
    border: "1px solid rgba(22, 78, 99, 0.5)",
  },
  noDataContainer: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(14, 116, 144, 0.5)", // text-cyan-700/50
    backgroundImage: "url('/grid.svg')",
    backgroundPosition: "center",
    backgroundSize: "cover",
    opacity: 0.8, // Adjusted for visibility
  },
  scanline: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(rgba(18,16,16,0) 50%,rgba(0,0,0,0.25) 50%), linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))",
    backgroundSize: "100% 2px, 3px 100%",
    zIndex: 10,
    pointerEvents: "none",
  },
  infoPanel: {
    position: "absolute",
    bottom: "16px",
    left: "12px",
    right: "12px",
    zIndex: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  labelBadgeContainer: {
    position: "relative",
  },
  labelBadgeGlow: {
    position: "absolute",
    inset: 0,
    backgroundColor: "#22d3ee",
    filter: "blur(8px)",
    opacity: 0.4,
  },
  labelBadgeContent: {
    position: "relative",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    border: "1px solid rgba(6, 182, 212, 0.8)",
    padding: "4px 24px",
    clipPath:
      "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
  },
  labelText: {
    color: "#67e8f9", // text-cyan-300
    fontWeight: "bold",
    fontSize: "0.875rem",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    fontFamily: "monospace",
    filter: "drop-shadow(0 0 5px rgba(0, 218, 193, 0.8))",
  },
  partnerNameBox: {
    width: "100%",
    position: "relative",
  },
  partnerNameMarker: {
    position: "absolute",
    top: "50%",
    width: "4px",
    height: "12px",
    backgroundColor: "rgba(6, 182, 212, 0.5)",
    marginTop: "-6px",
  },
  partnerNameContent: {
    background:
      "linear-gradient(to right, rgba(8, 51, 68, 0.8), rgba(0, 0, 0, 0.8), rgba(8, 51, 68, 0.8))",
    borderTop: "1px solid rgba(22, 78, 99, 0.5)",
    borderBottom: "1px solid rgba(22, 78, 99, 0.5)",
    padding: "8px 0",
    textAlign: "center",
  },
  partnerNameText: {
    color: "white",
    fontSize: "0.875rem",
    fontWeight: 500,
    letterSpacing: "0.05em",
    fontFamily: "monospace",
  },
};

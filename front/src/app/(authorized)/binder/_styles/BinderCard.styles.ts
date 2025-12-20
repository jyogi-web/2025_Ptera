import type { CSSProperties } from "react";

export const styles: { [key: string]: CSSProperties } = {
  container: {
    position: "relative",
    width: "100%",
    aspectRatio: "3/4",
    // Removed margin: "16px auto" to fit better in grid
    cursor: "pointer",
    padding: 0,
    border: "none",
    background: "transparent",
    textAlign: "left",
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
    width: "10px", // Slightly smaller for grid
    height: "10px",
    zIndex: 20,
    boxShadow: "0 0 5px rgba(0, 218, 193, 0.8)",
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
    inset: "6px", // Reduced padding
    bottom: "40px", // Adjusted for smaller card
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
    backgroundImage: "url('/assets/hex_grid.png')",
    backgroundPosition: "center",
    backgroundSize: "cover",
    opacity: 0.8,
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
    bottom: "8px",
    left: "6px",
    right: "6px",
    zIndex: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  // Favorite Badge (Moved to Top-Left)
  labelBadgeContent: {
    position: "absolute",
    top: "4px",
    left: "4px", // Changed from right to left
    zIndex: 30,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    border: "1px solid rgba(250, 204, 21, 0.8)", // Yellow for Favorite
    padding: "2px 6px",
    borderRadius: "4px",
  },
  labelText: {
    color: "#facc15", // yellow-400
    fontWeight: "bold",
    fontSize: "0.6rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    fontFamily: "monospace",
  },
  // Grade Badge (Top-Right)
  gradeBadge: {
    position: "absolute",
    top: "4px",
    right: "4px",
    zIndex: 30,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    border: "1px solid rgba(6, 182, 212, 0.8)", // Cyan border
    padding: "2px 6px",
    borderRadius: "4px",
  },
  gradeText: {
    color: "#22d3ee", // cyan-400
    fontWeight: "bold",
    fontSize: "0.7rem",
    fontFamily: "monospace",
  },
  // Position Text (Below Name)
  positionText: {
    color: "rgba(165, 243, 252, 0.7)", // cyan-200/70
    fontSize: "0.6rem",
    fontFamily: "monospace",
    marginTop: "2px",
    letterSpacing: "0.05em",
  },
  partnerNameBox: {
    width: "100%",
    position: "relative",
  },
  partnerNameMarker: {
    position: "absolute",
    top: "50%",
    width: "2px",
    height: "8px",
    backgroundColor: "rgba(6, 182, 212, 0.5)",
    marginTop: "-4px",
  },
  partnerNameContent: {
    background:
      "linear-gradient(to right, rgba(8, 51, 68, 0.8), rgba(0, 0, 0, 0.8), rgba(8, 51, 68, 0.8))",
    borderTop: "1px solid rgba(22, 78, 99, 0.5)",
    borderBottom: "1px solid rgba(22, 78, 99, 0.5)",
    padding: "4px 0",
    textAlign: "center",
  },
  partnerNameText: {
    color: "white",
    fontSize: "0.7rem", // Smaller font
    fontWeight: 500,
    letterSpacing: "0.05em",
    fontFamily: "monospace",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
    display: "block",
  },
};

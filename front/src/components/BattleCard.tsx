import Image from "next/image";
import type { CSSProperties } from "react";
import type { Card as ValidCard } from "@/types/app";

interface BattleCardProps {
  card: ValidCard;
  variant: "friend" | "enemy";
  onClick?: () => void;
  className?: string; // Add className prop for sizing/positioning
  isFaceDown?: boolean;
}

export default function BattleCard({
  card,
  variant,
  onClick,
  className,
  isFaceDown = false,
}: BattleCardProps) {
  // Theme configuration
  const theme =
    variant === "friend"
      ? {
          primary: "#22d3ee", // cyan-400
          border: "rgba(6, 182, 212, 0.5)", // cyan-500/50
          glow: "rgba(0, 218, 193, 0.2)",
          bg: "rgba(22, 78, 99, 0.1)", // cyan-900/10
          text: "#67e8f9", // cyan-300
          borderStrong: "rgba(6, 182, 212, 0.8)",
          bgStrong: "rgba(8, 51, 68, 0.8)",
        }
      : {
          primary: "#f87171", // red-400
          border: "rgba(239, 68, 68, 0.5)", // red-500/50
          glow: "rgba(239, 68, 68, 0.2)",
          bg: "rgba(127, 29, 29, 0.1)", // red-900/10
          text: "#fca5a5", // red-300
          borderStrong: "rgba(239, 68, 68, 0.8)",
          bgStrong: "rgba(69, 10, 10, 0.8)",
        };

  // Styles generator
  const getStyles = (): { [key: string]: CSSProperties } => ({
    container: {
      position: "relative",
      width: "100%",
      aspectRatio: "3/4",
      cursor: onClick ? "pointer" : "default",
    },
    mainGlow: {
      position: "absolute",
      inset: 0,
      backgroundColor: theme.bg,
      borderRadius: "0.5rem",
      border: `1px solid ${theme.border}`,
      boxShadow: `0 0 15px ${theme.glow}`,
      backdropFilter: "blur(4px)",
      zIndex: 0,
    },
    cornerBase: {
      position: "absolute",
      width: "8px",
      height: "8px",
      zIndex: 20,
      boxShadow: `0 0 5px ${theme.borderStrong}`,
      borderColor: theme.primary,
    },
    // Corner positions
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
      inset: "6px",
      bottom: isFaceDown ? "6px" : "50px", // Expand image area for face down
      borderRadius: "2px",
      overflow: "hidden",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      zIndex: 10,
      border: `1px solid ${theme.border}`,
    },
    noDataContainer: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: theme.border,
      backgroundImage: "url('/assets/hex_grid.png')",
      backgroundPosition: "center",
      backgroundSize: "cover",
      opacity: 0.8,
    },
    faceDownContainer: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundImage: "url('/assets/hex_grid.png')",
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundColor: theme.bg,
      opacity: 0.9,
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
    // Stats Badge (Replaces "OSHI-MEN" label)
    statsContainer: {
      display: "flex",
      justifyContent: "space-between",
      width: "100%",
      gap: "4px",
    },
    statBadge: {
      flex: 1,
      position: "relative",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      border: `1px solid ${theme.borderStrong}`,
      padding: "2px 0",
      clipPath:
        "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    statText: {
      color: theme.text,
      fontWeight: "bold",
      fontSize: "0.65rem", // Small text for battle cards
      letterSpacing: "0.05em",
      fontFamily: "monospace",
      filter: `drop-shadow(0 0 2px ${theme.borderStrong})`,
    },
    nameBox: {
      width: "100%",
      position: "relative",
    },
    nameMarker: {
      position: "absolute",
      top: "50%",
      width: "2px",
      height: "8px",
      backgroundColor: theme.border,
      marginTop: "-4px",
    },
    nameContent: {
      background: `linear-gradient(to right, ${theme.bgStrong}, rgba(0, 0, 0, 0.8), ${theme.bgStrong})`,
      borderTop: `1px solid ${theme.border}`,
      borderBottom: `1px solid ${theme.border}`,
      padding: "4px 0",
      textAlign: "center",
      whiteSpace: "nowrap",
      overflow: "hidden",
    },
    nameText: {
      color: "white",
      fontSize: "0.7rem",
      fontWeight: 500,
      letterSpacing: "0.05em",
      fontFamily: "monospace",
      display: "block",
      overflow: "hidden",
      textOverflow: "ellipsis",
      padding: "0 8px",
    },
  });

  const styles = getStyles();

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Interactive logic is conditional and manually handled with role/tabIndex
    <div
      style={styles.container}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`${className} transition-all duration-300 hover:brightness-110 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900`}
    >
      {/* Main Container Glow */}
      <div style={styles.mainGlow} />

      {/* Cyber Decorative Corners */}
      <div style={{ ...styles.cornerBase, ...styles.cornerTL }} />
      <div style={{ ...styles.cornerBase, ...styles.cornerTR }} />
      <div style={{ ...styles.cornerBase, ...styles.cornerBL }} />
      <div style={{ ...styles.cornerBase, ...styles.cornerBR }} />

      {/* Character Image Area (Or Face Down Pattern) */}
      <div style={styles.imageArea}>
        {isFaceDown ? (
          <div style={styles.faceDownContainer}>
            <div
              className="w-8 h-8 rounded-full border-2 border-dashed animate-spin-slow flex items-center justify-center opacity-60"
              style={{ borderColor: theme.border }}
            >
              <div className="w-4 h-4 rounded-full bg-current opacity-50 animate-pulse" />
            </div>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: "10px",
                letterSpacing: "0.1em",
                marginTop: "4px",
                color: theme.text,
                opacity: 0.7,
              }}
            >
              LOCKED
            </p>
          </div>
        ) : card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.name}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 33vw, 150px"
          />
        ) : (
          <div style={styles.noDataContainer}>
            <div className="text-2xl mb-1">?</div>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: "10px",
                letterSpacing: "0.1em",
              }}
            >
              NO DATA
            </p>
          </div>
        )}

        {/* Scanline Overlay */}
        <div style={styles.scanline} />
      </div>

      {/* Info Panel (Hidden if face down) */}
      {!isFaceDown && (
        <div style={styles.infoPanel}>
          {/* Stats Badges */}
          <div style={styles.statsContainer}>
            {/* ATK */}
            <div style={{ ...styles.statBadge, borderColor: "#fca5a5" }}>
              <span style={{ ...styles.statText, color: "#fca5a5" }}>
                ⚔ {card.attack}
              </span>
            </div>
            {/* HP */}
            <div style={{ ...styles.statBadge, borderColor: "#86efac" }}>
              <span style={{ ...styles.statText, color: "#86efac" }}>
                ♥ {card.maxHp}
              </span>
            </div>
          </div>

          {/* Name Box */}
          <div style={styles.nameBox}>
            <div style={{ ...styles.nameMarker, left: "-2px" }} />
            <div style={{ ...styles.nameMarker, right: "-2px" }} />
            <div style={styles.nameContent}>
              <span style={styles.nameText}>{card.name}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

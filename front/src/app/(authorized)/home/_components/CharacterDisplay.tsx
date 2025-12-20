import Image from "next/image";
import { styles } from "../_styles/CharacterDisplay.styles";

interface CharacterDisplayProps {
  name: string;
  partnerName: string;
  imageUrl?: string;
}

export const CharacterDisplay = ({
  name,
  partnerName,
  imageUrl,
}: CharacterDisplayProps) => {
  return (
    <div style={styles.container}>
      {/* Main Container Glow */}
      <div style={styles.mainGlow} />

      {/* Cyber Decorative Corners */}
      <div style={{ ...styles.cornerBase, ...styles.cornerTL }} />
      <div style={{ ...styles.cornerBase, ...styles.cornerTR }} />
      <div style={{ ...styles.cornerBase, ...styles.cornerBL }} />
      <div style={{ ...styles.cornerBase, ...styles.cornerBR }} />

      {/* Character Image Area */}
      <div style={styles.imageArea}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        ) : (
          <div style={styles.noDataContainer}>
            <div className="text-4xl mb-2 animate-pulse">?</div>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: "12px",
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

      {/* Info Panel */}
      <div style={styles.infoPanel}>
        {/* Label Badge */}
        <div style={styles.labelBadgeContainer}>
          <div style={styles.labelBadgeGlow} />
          <div style={styles.labelBadgeContent}>
            <span style={styles.labelText}>OSHI-MEN</span>
          </div>
        </div>

        {/* Partner Name Box */}
        <div style={styles.partnerNameBox}>
          <div style={{ ...styles.partnerNameMarker, left: "-4px" }} />
          <div style={{ ...styles.partnerNameMarker, right: "-4px" }} />
          <div style={styles.partnerNameContent}>
            <p style={styles.partnerNameText}>{partnerName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

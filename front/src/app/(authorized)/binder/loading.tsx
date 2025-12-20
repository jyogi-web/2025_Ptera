import { styles } from "./_styles/page.styles";

export default function Loading() {
  return (
    <div style={styles.container}>
      {/* Background Overlay (Optional if page.styles already has it, but ensuring hex grid) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/assets/hex_grid.png')",
          backgroundSize: "cover",
          opacity: 0.1,
          zIndex: -1,
        }}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
        }}
      >
        {/* Cyber Loader Animation */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-pulse" />
          <div className="absolute inset-0 border-t-4 border-cyan-400 rounded-full animate-spin" />
          <div className="absolute inset-4 border-b-2 border-cyan-200/50 rounded-full animate-spin-reverse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
          </div>
        </div>

        {/* Cyber Text */}
        <div className="text-center">
          <h2
            className="text-cyan-400 text-lg font-bold tracking-[0.2em] font-mono animate-pulse"
            style={{ textShadow: "0 0 10px rgba(34, 211, 238, 0.5)" }}
          >
            INITIALIZING BINDER SYSTEM
          </h2>
          <p className="text-cyan-600/70 text-xs font-mono mt-2 tracking-widest">
            ACCESSING ARCHIVE DATA...
          </p>
        </div>
      </div>
    </div>
  );
}

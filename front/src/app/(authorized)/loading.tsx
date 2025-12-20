export default function Loading() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50, // High z-index to cover content
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        touchAction: "none",
        fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        color: "#a4b5c9",
        background: "#050b14",
        display: "flex",
        flexDirection: "column",
        paddingTop: "80px", // Header height compensation
      }}
    >
      {/* Background Overlay */}
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
          <div
            className="absolute inset-4 border-b-2 border-cyan-200/50 rounded-full animate-spin"
            style={{ animationDirection: "reverse" }}
          />
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
            INITIALIZING SYSTEM
          </h2>
          <p className="text-cyan-600/70 text-xs font-mono mt-2 tracking-widest">
            ACCESSING DATA...
          </p>
        </div>
      </div>
    </div>
  );
}

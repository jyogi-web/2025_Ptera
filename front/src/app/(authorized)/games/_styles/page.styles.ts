import type { CSSProperties } from "react";

export const styles: { [key: string]: CSSProperties } = {
  container: {
    position: "relative",
  },
  overlay: {
    position: "absolute",
    zIndex: 10,
    top: 20,
    left: 20,
    right: 20,
  },
  controls: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
  },
  qrButton: {
    padding: "10px 20px",
    fontSize: "16px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  startButton: {
    padding: "10px 20px",
    fontSize: "18px",
    background: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  measuringBatch: {
    background: "red",
    color: "white",
    padding: "10px",
    borderRadius: "5px",
    fontWeight: "bold",
  },
  recordsContainer: {
    background: "rgba(255,255,255,0.9)",
    padding: "10px",
    borderRadius: "5px",
    maxHeight: "200px",
    overflow: "auto",
    border: "1px solid #ccc",
  },
  recordsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  historyTitle: {
    margin: 0,
    color: "#333",
  },
  resetButton: {
    padding: "5px 10px",
    fontSize: "12px",
    cursor: "pointer",
    background: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "3px",
  },
  recordItem: {
    borderBottom: "1px solid #ccc",
    padding: "5px 0",
    color: "#333",
  },
  scannerWrapper: {
    width: "100%",
    height: "calc(100vh - 80px)",
    background: "#000",
  },
};

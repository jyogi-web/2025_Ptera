import type { CSSProperties } from "react";

export const styles: { [key: string]: CSSProperties } = {
  container: {
    padding: "120px 20px 40px", // Clear header
    minHeight: "100dvh",
    background: "#050505",
    color: "#fff",
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    boxSizing: "border-box",
  },
  header: {
    marginBottom: "40px",
    textAlign: "center",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#00dac1",
    letterSpacing: "4px",
    textShadow: "0 0 20px rgba(0, 218, 193, 0.5)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "30px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
};

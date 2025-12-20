import type { CSSProperties } from "react";

export const styles: { [key: string]: CSSProperties } = {
  cardLink: {
    textDecoration: "none",
    display: "block",
    transform: "scale(1)",
    transition: "transform 0.2s",
  },
  card: {
    position: "relative",
    padding: "40px 30px",
    background: "rgba(255, 255, 255, 0.02)",
    minHeight: "200px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  frame: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    backgroundColor: "transparent",
    transition: "color 0.2s",
  },
  cardContent: {
    position: "relative",
    zIndex: 1,
  },
  cardTitle: {
    margin: "0 0 15px",
    fontSize: "1.8rem",
    fontWeight: "bold",
    letterSpacing: "2px",
    transition: "color 0.2s, text-shadow 0.2s",
  },
  cardDesc: {
    margin: 0,
    color: "#888",
    fontSize: "0.9rem",
    lineHeight: "1.6",
  },
};

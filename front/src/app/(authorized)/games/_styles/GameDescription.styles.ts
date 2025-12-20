import type { CSSProperties } from "react";

export const styles: { [key: string]: CSSProperties } = {
  container: {
    position: "relative",
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto 2rem",
    padding: "0",
    color: "#00dac1",
    fontFamily: "monospace",
  },
  frame: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    color: "rgba(0, 218, 193, 0.3)",
    backgroundColor: "transparent",
  },
  content: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start", // Left align content
    textAlign: "left",
  },
  buttonWrapper: {
    marginBottom: "20px",
  },
  text: {
    margin: "0",
    lineHeight: "1.6",
    fontSize: "0.9rem",
    textAlign: "left",
    width: "100%",
  },
  highlight: {
    color: "#fff",
    textShadow: "0 0 5px #00dac1",
  },
};

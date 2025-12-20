import type { CSSProperties } from "react";

export const styles: { [key: string]: CSSProperties } = {
  container: {
    width: "100%",
    height: "100%",
    position: "absolute", // Force fill
    top: 0,
    left: 0,
    overflow: "hidden",
  },
  video: {
    display: "none",
  },
  canvas: {
    display: "block", // Remove inline gap
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
};

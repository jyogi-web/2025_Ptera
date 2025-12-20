import type { CSSProperties } from "react";

export const styles: { [key: string]: CSSProperties } = {
  container: {
    width: "100%",
    height: "100vh",
    position: "relative",
    overflow: "hidden",
  },
  video: {
    display: "none",
  },
  canvas: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
};

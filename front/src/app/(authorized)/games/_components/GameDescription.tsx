"use client";

import { Animator, FrameCorners } from "@arwes/react";
import { Button } from "./Button";

interface GameDescriptionProps {
  onStart: () => void;
}

export const GameDescription = ({ onStart }: GameDescriptionProps) => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto 2rem",
        padding: "0",
        color: "#00dac1",
        fontFamily: "monospace",
      }}
    >
      <Animator active={true}>
        <FrameCorners
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            color: "rgba(0, 218, 193, 0.3)",
          }}
          strokeWidth={2}
          cornerLength={20}
        />
      </Animator>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start", // Left align content
          textAlign: "left",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <Button onClick={onStart} palette="secondary">
            刹那のメンコ
          </Button>
        </div>

        <p
          style={{
            margin: "0",
            lineHeight: "1.6",
            fontSize: "0.9rem",
            textAlign: "left",
            width: "100%",
          }}
        >
          QRコードを見失わないようにカメラを固定せよ。
          <br />
          シグナル{" "}
          <strong style={{ color: "#fff", textShadow: "0 0 5px #00dac1" }}>
            "!"
          </strong>{" "}
          が点灯した瞬間、
          <br />
          即座にQRコードを隠して反応速度を計測せよ。
        </p>
      </div>
    </div>
  );
};

"use client";

import { Animator, FrameCorners } from "@arwes/react";
import { styles } from "../_styles/GameDescription.styles";
import { Button } from "./Button";

interface GameDescriptionProps {
  onStart: () => void;
}

export const GameDescription = ({ onStart }: GameDescriptionProps) => {
  return (
    <div style={styles.container}>
      <Animator active={true}>
        <FrameCorners style={styles.frame} strokeWidth={2} cornerLength={20} />
      </Animator>

      <div style={styles.content}>
        <div style={styles.buttonWrapper}>
          <Button onClick={onStart} palette="secondary">
            刹那のメンコ
          </Button>
        </div>

        <p style={styles.text}>
          QRコードを見失わないようにカメラを固定せよ。
          <br />
          シグナル <strong style={styles.highlight}>"!"</strong>{" "}
          が点灯した瞬間、
          <br />
          即座にQRコードを隠して反応速度を計測せよ。
        </p>
      </div>
    </div>
  );
};

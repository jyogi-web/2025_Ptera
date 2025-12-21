"use client";

import { styles } from "../_styles/GameDescription.styles";
import { Button } from "./Button";

interface GameDescriptionProps {
  onStart: () => void;
}

export const GameDescription = ({ onStart }: GameDescriptionProps) => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <Button onClick={onStart}>刹那のメンコ</Button>

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

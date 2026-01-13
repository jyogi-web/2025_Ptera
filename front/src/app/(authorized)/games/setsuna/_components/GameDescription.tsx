"use client";

import { useEffect, useState } from "react";
import { type GameRecord, getGameRanking } from "@/lib/firestore";
import { styles } from "../_styles/GameDescription.styles";
import { Button } from "./Button";

interface GameDescriptionProps {
  onStart: () => void;
}

export const GameDescription = ({ onStart }: GameDescriptionProps) => {
  const [ranking, setRanking] = useState<GameRecord[]>([]);

  useEffect(() => {
    const fetchRanking = async () => {
      const records = await getGameRanking("setsuna");
      setRanking(records);
    };
    fetchRanking();
  }, []);

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

        {ranking.length > 0 && (
          <div style={{ marginTop: "2rem", width: "100%", maxWidth: "400px" }}>
            <h3
              style={{
                color: "#00dac1",
                textAlign: "center",
                marginBottom: "1rem",
                fontFamily: "monospace",
              }}
            >
              LEADERBOARD
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {ranking.map((record, index) => (
                <li
                  key={record.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.5rem 0",
                    borderBottom: "1px solid rgba(0, 218, 193, 0.2)",
                    color: "#e0f8ff",
                    fontFamily: "monospace",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        color: "#00dac1",
                        fontWeight: "bold",
                        width: "1.5rem",
                      }}
                    >
                      #{index + 1}
                    </span>
                    <span>{record.displayName}</span>
                  </span>
                  <span style={{ color: "#f7f" }}>
                    {(record.score / 1000).toFixed(3)} s
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

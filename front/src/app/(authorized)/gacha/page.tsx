"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const QRScanner = dynamic(() => import("@/components/QRScanner"), {
  ssr: false,
});

interface GameRecord {
  time: string;
  duration: string;
}

export default function Gacha() {
  const [isRunning, setIsRunning] = useState(false);
  const [records, setRecords] = useState<GameRecord[]>([]);

  useEffect(() => {
    // localStorageから記録を読み込み
    const saved = localStorage.getItem("game_records");
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse records", e);
      }
    }
  }, []);

  const handleStart = () => {
    setIsRunning(true);
    console.log("計測開始準備");
  };

  const handleQRLost = useCallback((duration: number) => {
    setIsRunning(false);
    const newRecord: GameRecord = {
      time: new Date().toLocaleString(),
      duration: (duration / 1000).toFixed(3), // 秒単位に変換
    };

    // localStorageへの保存
    setRecords((prev) => {
      const updatedRecords = [...prev, newRecord];
      localStorage.setItem("game_records", JSON.stringify(updatedRecords));
      return updatedRecords;
    });

    alert(`QR消失検知！ 経過時間: ${newRecord.duration} 秒`);
  }, []);

  const handleReset = () => {
    if (confirm("記録をすべて削除しますか？")) {
      setRecords([]);
      localStorage.removeItem("game_records");
    }
  };

  const handleTimeout = useCallback(() => {
    setIsRunning(false);
    alert("QRコードが見つかりませんでした。スタート画面に戻ります。");
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          zIndex: 10,
          top: 20,
          left: 20,
          right: 20,
        }}
      >
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <Link href="/generate-qr">
            <button
              type="button"
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                background: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              QRコード生成
            </button>
          </Link>
          {!isRunning ? (
            <button
              type="button"
              onClick={handleStart}
              style={{
                padding: "10px 20px",
                fontSize: "18px",
                background: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              スタート
            </button>
          ) : (
            <div
              style={{
                background: "red",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
                fontWeight: "bold",
              }}
            >
              計測中... QRコードを外してください
            </div>
          )}
        </div>

        {records.length > 0 && (
          <div
            style={{
              background: "rgba(255,255,255,0.9)",
              padding: "10px",
              borderRadius: "5px",
              maxHeight: "200px",
              overflow: "auto",
              border: "1px solid #ccc",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <h3 style={{ margin: 0, color: "#333" }}>記録履歴</h3>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: "5px 10px",
                  fontSize: "12px",
                  cursor: "pointer",
                  background: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                }}
              >
                リセット
              </button>
            </div>
            {records.map((record, index) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: Simple list, no stable ID available
                key={index}
                style={{
                  borderBottom: "1px solid #ccc",
                  padding: "5px 0",
                  color: "#333",
                }}
              >
                <span>{record.time}</span> -{" "}
                <strong>{record.duration}秒</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          width: "100%",
          height: "calc(100vh - 80px)",
          background: "#000",
        }}
      >
        {isRunning && (
          <QRScanner
            isRunning={isRunning}
            onQRLost={handleQRLost}
            onTimeout={handleTimeout}
          />
        )}
      </div>
    </div>
  );
}

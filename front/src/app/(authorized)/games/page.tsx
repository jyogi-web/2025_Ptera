"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./_components/Button";
import { GameDescription } from "./_components/GameDescription";
import { styles } from "./_styles/page.styles";

const QRScanner = dynamic(
  () => import("@/app/(authorized)/games/_components/QRScanner"),
  {
    ssr: false,
  },
);

interface GameRecord {
  time: string;
  duration: string;
}

export default function Games() {
  const [isRunning, setIsRunning] = useState(false);
  const [showSignal, setShowSignal] = useState(false);
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
    setShowSignal(false);
    console.log("計測開始準備");
  };

  const handleSignal = useCallback(() => {
    setShowSignal(true);
  }, []);

  const handleQRLost = useCallback((duration: number) => {
    setIsRunning(false);
    setShowSignal(false);
    const newRecord: GameRecord = {
      time: new Date().toLocaleString(),
      duration: (duration / 1000).toFixed(3),
    };

    // localStorageへの保存
    setRecords((prev) => {
      const updatedRecords = [...prev, newRecord];
      localStorage.setItem("game_records", JSON.stringify(updatedRecords));
      return updatedRecords;
    });

    alert(` 経過時間: ${newRecord.duration} 秒`);
  }, []);

  const handleReset = () => {
    if (confirm("記録をすべて削除しますか？")) {
      setRecords([]);
      localStorage.removeItem("game_records");
    }
  };

  const handleTimeout = useCallback(() => {
    setIsRunning(false);
    setShowSignal(false);
    alert("QRコードが見つかりませんでした。スタート画面に戻ります。");
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.overlay}>
        <div style={styles.controls}>
          {!isRunning ? <GameDescription onStart={handleStart} /> : null}

          {records.length > 0 && (
            <div style={styles.recordsContainer}>
              <div style={styles.recordsHeader}>
                <h3 style={styles.historyTitle}>記録履歴</h3>
                <Button onClick={handleReset} palette="error">
                  リセット
                </Button>
              </div>
              {records.map((record, index) => (
                <div key={`${record.time}-${index}`} style={styles.recordItem}>
                  <span style={styles.recordTime}>{record.time}</span>
                  <span style={styles.recordDuration}>{record.duration}秒</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {showSignal && <div style={styles.signalText}>!</div>}

        <div style={styles.scannerWrapper}>
          {isRunning && (
            <QRScanner
              isRunning={isRunning}
              onQRLost={handleQRLost}
              onTimeout={handleTimeout}
              onSignal={handleSignal}
            />
          )}
        </div>
      </div>
    </div>
  );
}

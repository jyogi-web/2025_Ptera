"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { GameDescription } from "./_components/GameDescription";
import { styles } from "./_styles/page.styles";

const QRScanner = dynamic(
  () => import("@/app/(authorized)/games/setsuna/_components/QRScanner"),
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

    alert(` 経過時間: ${newRecord.duration} 秒`);
  }, []);

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

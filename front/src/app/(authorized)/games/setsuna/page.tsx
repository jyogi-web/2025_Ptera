"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
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

    toast.custom(
      (t) => (
        <div
          style={{
            ...styles.toastBase,
            ...styles.toastSuccess,
            opacity: t.visible ? 1 : 0,
            transform: t.visible ? "translateY(0)" : "translateY(-20px)",
          }}
        >
          <span style={styles.toastIconSuccess}>◈</span>
          <span>
            経過時間:{" "}
            <span style={styles.toastTimeValue}>{newRecord.duration}</span> 秒
          </span>
        </div>
      ),
      { duration: 5000 },
    );
  }, []);

  const handleTimeout = useCallback(() => {
    setIsRunning(false);
    setShowSignal(false);
    toast.custom(
      (t) => (
        <div
          style={{
            ...styles.toastBase,
            ...styles.toastError,
            opacity: t.visible ? 1 : 0,
            transform: t.visible ? "translateY(0)" : "translateY(-20px)",
          }}
        >
          <span style={styles.toastIconError}>⚠</span>
          QRコードが見つかりませんでした。
        </div>
      ),
      { duration: 4000 },
    );
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

"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { styles } from "./_styles/page.styles";
const QRScanner = dynamic(() => import("@/app/(authorized)/games/_components/QRScanner"), {
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
            duration: (duration / 1000).toFixed(3),
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
        <div style={styles.container}>
            <div
                style={styles.overlay}
            >
                <div style={styles.controls}>
                    <Link href="/generate-qr">
                        <button
                            type="button"
                            style={styles.qrButton}
                        >
                            QRコード生成
                        </button>
                    </Link>
                    {!isRunning ? (
                        <button
                            type="button"
                            onClick={handleStart}
                            style={styles.startButton}
                        >
                            スタート
                        </button>
                    ) : (
                        <div
                            style={styles.measuringBatch}
                        >
                            計測中... QRコードを外してください
                        </div>
                    )}
                </div>

                {records.length > 0 && (
                    <div
                        style={styles.recordsContainer}
                    >
                        <div
                            style={styles.recordsHeader}
                        >
                            <h3 style={styles.historyTitle}>記録履歴</h3>
                            <button
                                type="button"
                                onClick={handleReset}
                                style={styles.resetButton}
                            >
                                リセット
                            </button>
                        </div>
                        {records.map((record, index) => (
                            <div
                                key={index}
                                style={styles.recordItem}
                            >
                                <span>{record.time}</span> -{" "}
                                <strong>{record.duration}秒</strong>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div
                style={styles.scannerWrapper}
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

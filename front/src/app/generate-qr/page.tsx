"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

export default function GenerateQR() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const printCanvasRef = useRef<HTMLCanvasElement>(null);
    const [qrData, setQrData] = useState("AR-GAME-MARKER-001");

    useEffect(() => {
        if (canvasRef.current && printCanvasRef.current) {
            // プレビュー用QRコード（400px）
            QRCode.toCanvas(
                canvasRef.current,
                qrData,
                {
                    width: 400,
                    margin: 2,
                    color: {
                        dark: "#000000",
                        light: "#FFFFFF",
                    },
                },
                (error) => {
                    if (error) console.error(error);
                },
            );

            // 印刷用QRコード生成（A4サイズに複数配置）
            generatePrintCanvas();
        }
    }, [qrData]);

    const generatePrintCanvas = async () => {
        const printCanvas = printCanvasRef.current;
        if (!printCanvas) return;

        // A4サイズ: 210mm x 297mm
        // 300dpi換算: 2480px x 3508px
        const dpi = 300;
        const a4WidthMM = 210;
        const a4HeightMM = 297;
        const a4WidthPx = Math.round((a4WidthMM / 25.4) * dpi);
        const a4HeightPx = Math.round((a4HeightMM / 25.4) * dpi);

        // QRコードサイズ: 4cm x 4cm
        const qrSizeMM = 40;
        const qrSizePx = Math.round((qrSizeMM / 25.4) * dpi);

        // 余白
        const marginMM = 10;
        const marginPx = Math.round((marginMM / 25.4) * dpi);

        // 配置可能な行数と列数を計算
        const cols = Math.floor((a4WidthPx - 2 * marginPx) / qrSizePx);
        const rows = Math.floor((a4HeightPx - 2 * marginPx) / qrSizePx);

        // キャンバスのサイズを設定
        printCanvas.width = a4WidthPx;
        printCanvas.height = a4HeightPx;

        const ctx = printCanvas.getContext("2d");
        if (!ctx) return;

        // 背景を白に
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, a4WidthPx, a4HeightPx);

        // 一時的なキャンバスでQRコードを生成
        const tempCanvas = document.createElement("canvas");
        await QRCode.toCanvas(tempCanvas, qrData, {
            width: qrSizePx,
            margin: 1,
            color: {
                dark: "#000000",
                light: "#FFFFFF",
            },
        });

        // QRコードを敷き詰める
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = marginPx + col * qrSizePx;
                const y = marginPx + row * qrSizePx;
                ctx.drawImage(tempCanvas, x, y, qrSizePx, qrSizePx);
            }
        }
    };

    const handleDownload = () => {
        const canvas = printCanvasRef.current;
        if (!canvas) return;
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = "qr-markers-a4.png";
        link.href = url;
        link.click();
    };

    const handlePrint = () => {
        const canvas = printCanvasRef.current;
        if (!canvas) return;

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const img = canvas.toDataURL("image/png");
        printWindow.document.write(`
      <html>
        <head>
          <title>QRコード印刷</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
            }
            img {
              width: 210mm;
              height: 297mm;
              display: block;
            }
          </style>
        </head>
        <body>
          <img src="${img}" />
        </body>
      </html>
    `);
        printWindow.document.close();

        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
        };
    };

    return (
        <div style={{ padding: "40px", textAlign: "center" }}>
            <h1>QRコード生成</h1>
            <div style={{ margin: "20px 0" }}>
                <input
                    type="text"
                    value={qrData}
                    onChange={(e) => setQrData(e.target.value)}
                    style={{ padding: "10px", width: "300px", fontSize: "16px" }}
                    placeholder="QRコードの内容"
                />
            </div>

            <div style={{ marginBottom: "30px" }}>
                <h3>プレビュー（1個）</h3>
                <canvas ref={canvasRef} style={{ border: "2px solid #333" }}></canvas>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <h3>印刷用（A4サイズ・4cm×4cm複数配置）</h3>
                <canvas
                    ref={printCanvasRef}
                    style={{
                        border: "2px solid #333",
                        maxWidth: "100%",
                        height: "auto",
                    }}
                ></canvas>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button
                    type="button"
                    onClick={handleDownload}
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
                    A4画像をダウンロード
                </button>
                <button
                    type="button"
                    onClick={handlePrint}
                    style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        background: "#2196F3",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    印刷プレビュー
                </button>
            </div>

            <p style={{ marginTop: "20px", color: "#666" }}>
                このQRコードをマット紙（艶消し）に印刷することを推奨します。
                <br />
                各QRコードは4cm×4cmで、A4用紙に複数配置されています。
            </p>
        </div>
    );
}
"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

export default function GenerateQR() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrData, setQrData] = useState("AR-GAME-MARKER-001");

  useEffect(() => {
    if (canvasRef.current) {
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
    }
  }, [qrData]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "qr-marker.png";
    link.href = url;
    link.click();
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
      <canvas ref={canvasRef} style={{ border: "2px solid #333" }}></canvas>
      <div style={{ marginTop: "20px" }}>
        <button
          type="button"
          onClick={handleDownload}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          QRコードをダウンロード
        </button>
      </div>
    </div>
  );
}

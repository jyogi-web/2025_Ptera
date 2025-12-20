"use client";

import jsQR from "jsqr";
import type React from "react";
import { useEffect, useRef } from "react";

interface QRScannerProps {
  onQRLost: (duration: number) => void;
  onTimeout?: () => void;
  isRunning: boolean;
  targetQRData?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({
  onQRLost,
  onTimeout,
  isRunning,
  targetQRData = "AR-GAME-MARKER-001",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(0);
  const qrDetectedRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const lostFrameCountRef = useRef<number>(0);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const zoomLevelRef = useRef<number>(1.0); // ズームレベル追加
  const LOST_THRESHOLD = 10;
  const INITIAL_TIMEOUT_MS = 10000;

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const canvasContext = canvas.getContext("2d", { willReadFrequently: true });
    if (!canvasContext) return;

    let ignore = false;

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })
      .then((stream) => {
        if (ignore) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          return;
        }

        const videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities() as MediaTrackCapabilities & {
          zoom?: {
            max: number;
            min: number;
            step: number;
          };
        };

        // ズーム機能をサポートしているか確認
        if (capabilities.zoom) {
          console.log('ズーム範囲:', capabilities.zoom);
        }

        video.srcObject = stream;
        video.setAttribute("playsinline", "true");
        video.play().catch((e) => {
          if (e.name !== "AbortError") {
            console.error("Error playing video:", e);
          }
        });

        if (onTimeout) {
          timeoutTimerRef.current = setTimeout(() => {
            if (!qrDetectedRef.current) {
              console.warn("QR code detection timed out");
              onTimeout();
            }
          }, INITIAL_TIMEOUT_MS);
        }

        animationFrameRef.current = requestAnimationFrame(tick);
      })
      .catch((err) => {
        if (!ignore) {
          console.error("カメラアクセスエラー:", err);
          alert("カメラへのアクセスが拒否されました。設定を確認してください。");
        }
      });

    function tick() {
      if (!video || !canvas || !canvasContext) return;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;

        // デジタルズームを適用（中央部分を拡大）
        const zoom = zoomLevelRef.current;
        const sx = (video.videoWidth * (1 - 1 / zoom)) / 2;
        const sy = (video.videoHeight * (1 - 1 / zoom)) / 2;
        const sWidth = video.videoWidth / zoom;
        const sHeight = video.videoHeight / zoom;

        canvasContext.drawImage(
          video,
          sx, sy, sWidth, sHeight,  // ソース領域（切り取り）
          0, 0, canvas.width, canvas.height  // 描画先
        );

        const imageData = canvasContext.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data === targetQRData) {
          lostFrameCountRef.current = 0;

          if (!qrDetectedRef.current) {
            console.log("QRコードを検出しました:", code.data);
            startTimeRef.current = performance.now();
            qrDetectedRef.current = true;
            if (timeoutTimerRef.current) {
              clearTimeout(timeoutTimerRef.current);
              timeoutTimerRef.current = null;
            }
          }

          if (code.location) {
            drawLine(
              canvasContext,
              code.location.topLeftCorner,
              code.location.topRightCorner,
              "#00FF00",
            );
            drawLine(
              canvasContext,
              code.location.topRightCorner,
              code.location.bottomRightCorner,
              "#00FF00",
            );
            drawLine(
              canvasContext,
              code.location.bottomRightCorner,
              code.location.bottomLeftCorner,
              "#00FF00",
            );
            drawLine(
              canvasContext,
              code.location.bottomLeftCorner,
              code.location.topLeftCorner,
              "#00FF00",
            );
          }
        } else {
          if (qrDetectedRef.current && isRunning) {
            lostFrameCountRef.current++;

            if (lostFrameCountRef.current >= LOST_THRESHOLD) {
              const endTime = performance.now();
              const duration = endTime - startTimeRef.current;
              onQRLost(duration);
              qrDetectedRef.current = false;
              lostFrameCountRef.current = 0;
            }
          }
        }
      }
      animationFrameRef.current = requestAnimationFrame(tick);
    }

    function drawLine(
      ctx: CanvasRenderingContext2D,
      begin: { x: number; y: number },
      end: { x: number; y: number },
      color: string,
    ) {
      ctx.beginPath();
      ctx.moveTo(begin.x, begin.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineWidth = 4;
      ctx.strokeStyle = color;
      ctx.stroke();
    }

    return () => {
      ignore = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
      }
      if (video?.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [onQRLost, isRunning, targetQRData, onTimeout]);



  // ズームコントロール用の関数
  const handleZoom = (newZoom: number) => {
    zoomLevelRef.current = Math.max(1.0, Math.min(3.0, newZoom));
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ズームコントロール */}
      <div style={{
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        display: "flex",
        gap: "10px",
        background: "rgba(0,0,0,0.5)",
        padding: "10px",
        borderRadius: "10px"
      }}>
        <button onClick={() => handleZoom(1.0)} style={{ padding: "10px 20px", background: "white" }}>
          1x
        </button>
        <button onClick={() => handleZoom(1.5)} style={{ padding: "10px 20px", background: "white" }}>
          1.5x
        </button>
        <button onClick={() => handleZoom(2.0)} style={{ padding: "10px 20px", background: "white" }}>
          2x
        </button>
      </div>

      <video
        ref={videoRef}
        style={{ display: "none" }}
        playsInline
      />
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
};

export default QRScanner;
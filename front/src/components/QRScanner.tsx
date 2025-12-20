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

        canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);

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

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
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
"use client";

import jsQR from "jsqr";
import type React from "react";
import { useEffect, useRef } from "react";
import { styles } from "../_styles/QRScanner.styles";

interface QRScannerProps {
  onQRLost: (duration: number) => void;
  onTimeout?: () => void;
  onSignal?: () => void;
  onFalseStart?: () => void;
  isRunning: boolean;
  targetQRData?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({
  onQRLost,
  onTimeout,
  onSignal,
  onFalseStart,
  isRunning,
  targetQRData = "AR-GAME-MARKER-001",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(0);
  const qrDetectedRef = useRef<boolean>(false);
  const waitingForSignalRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const lostFrameCountRef = useRef<number>(0);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const signalTimerRef = useRef<NodeJS.Timeout | null>(null);

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
            if (!qrDetectedRef.current && !waitingForSignalRef.current) {
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

          if (!qrDetectedRef.current && !waitingForSignalRef.current) {
            console.log("QRコードを検出しました。シグナル待機中...");
            waitingForSignalRef.current = true;

            if (timeoutTimerRef.current) {
              clearTimeout(timeoutTimerRef.current);
              timeoutTimerRef.current = null;
            }

            const randomDelay = Math.floor(Math.random() * 3000) + 2000;
            (waitingForSignalRef as any).currentExpectedTime =
              performance.now() + randomDelay;

            signalTimerRef.current = setTimeout(() => {
              console.log("シグナル発動！計測開始");
              onSignal?.();
              startTimeRef.current = performance.now();
              qrDetectedRef.current = true;
              waitingForSignalRef.current = false;
            }, randomDelay);
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
          // If we lost QR while waiting for signal
          if (waitingForSignalRef.current) {
            console.log("QR消失 (シグナル待機中)");
            waitingForSignalRef.current = false;

            if (signalTimerRef.current) {
              clearTimeout(signalTimerRef.current);
              signalTimerRef.current = null;
            }

            const expectedTime =
              (waitingForSignalRef as any).currentExpectedTime || 0;
            const timeUntilSignal = expectedTime - performance.now();

            if (timeUntilSignal <= 1000 && timeUntilSignal > 0) {
              console.log("お手つき判定！ 残り時間: ", timeUntilSignal);
              if (onFalseStart) onFalseStart();
            } else {
              console.log("セーフ（判定期間外の消失）- リセットします");
              // Just silent reset, meaning the user can try again immediately
              qrDetectedRef.current = false;
            }
          }

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
      if (signalTimerRef.current) {
        clearTimeout(signalTimerRef.current);
      }
      if (video?.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [onQRLost, isRunning, targetQRData, onTimeout, onSignal, onFalseStart]);

  return (
    <div style={styles.container}>
      {/* biome-ignore lint/a11y/useMediaCaption: Camera feed does not have captions */}
      <video ref={videoRef} style={styles.video} playsInline />
      <canvas ref={canvasRef} style={styles.canvas} />
    </div>
  );
};

export default QRScanner;

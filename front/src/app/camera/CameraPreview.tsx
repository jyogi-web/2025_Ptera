"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Webcam from "react-webcam";

interface CameraPreviewProps {
  onReady?: (stream: MediaStream) => void;
  onReadyChange?: (ready: boolean) => void;
}

export interface CameraPreviewHandle {
  capture: () => string | null;
}

const CameraPreview = forwardRef<CameraPreviewHandle, CameraPreviewProps>(
  ({ onReady, onReadyChange }, ref) => {
    const webcamRef = useRef<Webcam>(null);
    const [error, setError] = useState<string | null>(null);
    const [ready, setReady] = useState(false);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<
      string | undefined
    >(undefined);

    useEffect(() => {
      const getDevices = async () => {
        try {
          const deviceInfos = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = deviceInfos.filter(
            (device) => device.kind === "videoinput",
          );
          setDevices(videoDevices);

          // 背面カメラを優先的に選択
          const backCamera = videoDevices.find(
            (device) =>
              device.label.toLowerCase().includes("back") ||
              device.label.toLowerCase().includes("rear"),
          );
          if (backCamera) {
            setSelectedDeviceId(backCamera.deviceId);
          } else if (videoDevices.length > 0) {
            setSelectedDeviceId(videoDevices[0].deviceId);
          }
        } catch (err) {
          console.error("デバイス取得エラー:", err);
        }
      };

      getDevices();
    }, []);

    const videoConstraints: MediaTrackConstraints = {
      deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
      width: { ideal: 1080 },
      height: { ideal: 1440 },
    };

    useImperativeHandle(ref, () => ({
      capture: () => {
        if (!webcamRef.current) return null;
        return webcamRef.current.getScreenshot();
      },
    }));

    return (
      <div className="relative aspect-[3/4] bg-gray-700">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-red-400 text-sm">
              カメラにアクセスできません: {error}
            </p>
          </div>
        )}

        {/* カメラデバイス選択 */}
        {devices.length > 1 && (
          <div className="absolute top-4 left-4 right-4 z-10">
            <select
              value={selectedDeviceId}
              onChange={(e) => {
                setSelectedDeviceId(e.target.value);
                setReady(false);
                onReadyChange?.(false);
              }}
              className="w-full px-3 py-2 bg-gray-800/90 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 backdrop-blur-sm"
            >
              {devices.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `カメラ ${index + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <Webcam
          ref={webcamRef}
          audio={false}
          className="absolute inset-0 h-full w-full object-cover"
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          onUserMedia={(stream) => {
            setReady(true);
            onReady?.(stream);
            onReadyChange?.(true);
          }}
          onUserMediaError={(e) => setError(String(e))}
        />

        {/* ガイド用オーバーレイ（簡易フレーム） */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-3/4 border-2 border-cyan-400/70 rounded-lg" />
        </div>

        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-300 text-sm">カメラを初期化中...</p>
          </div>
        )}
      </div>
    );
  },
);

CameraPreview.displayName = "CameraPreview";

export default CameraPreview;

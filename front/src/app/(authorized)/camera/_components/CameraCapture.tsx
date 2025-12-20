import Image from "next/image";
import type { RefObject } from "react";
import { styles } from "../_styles/page.styles";
import CameraPreview, { type CameraPreviewHandle } from "./CameraPreview";

type Props = {
  cameraRef: RefObject<CameraPreviewHandle | null>;
  onReadyChange: (ready: boolean) => void;
  capturedImage: string | null;
  onRetake: () => void;
  onConfirm: () => void;
  isUploading: boolean;
  uploadedImageUrl: string | null;
  cameraReady: boolean;
  onCapture: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function CameraCapture({
  cameraRef,
  onReadyChange,
  capturedImage,
  onRetake,
  onConfirm,
  isUploading,
  uploadedImageUrl,
  cameraReady,
  onCapture,
  fileInputRef,
  onFileChange,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row gap-6 mb-6">
      {/* カメラプレビューエリア */}
      <div
        style={styles.cyberFrame}
        className="flex-1 min-h-[300px] md:min-h-[400px]"
      >
        {!capturedImage ? (
          <CameraPreview ref={cameraRef} onReadyChange={onReadyChange} />
        ) : (
          <div className="relative aspect-[3/4]">
            {/* プレビュー画像表示 */}
            <Image
              src={capturedImage}
              alt="撮影プレビュー"
              fill
              unoptimized
              className="object-cover"
            />
            {/* 再撮影・確定ボタン */}
            <div className="absolute inset-0 flex items-end justify-center gap-4 pb-4 bg-black/50">
              <button
                type="button"
                onClick={onRetake}
                style={styles.cyberButton}
                onMouseEnter={(e) => {
                  Object.assign(
                    e.currentTarget.style,
                    styles.cyberButtonActive,
                  );
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, styles.cyberButton);
                }}
              >
                RETAKE
              </button>
              <button
                type="button"
                style={{
                  ...styles.cyberButton,
                  ...(isUploading || !!uploadedImageUrl
                    ? styles.cyberButtonDisabled
                    : {}),
                }}
                onClick={onConfirm}
                disabled={isUploading || !!uploadedImageUrl}
                onMouseEnter={(e) => {
                  if (!isUploading && !uploadedImageUrl)
                    Object.assign(
                      e.currentTarget.style,
                      styles.cyberButtonActive,
                    );
                }}
                onMouseLeave={(e) => {
                  if (!isUploading && !uploadedImageUrl)
                    Object.assign(e.currentTarget.style, styles.cyberButton);
                }}
              >
                {isUploading
                  ? "SAVING..."
                  : uploadedImageUrl
                    ? "SAVED"
                    : "CONFIRM"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 右側：撮影ボタンと情報 */}
      <div className="flex-1 flex flex-col justify-start items-center pt-4 md:pt-10">
        {!capturedImage && (
          <div className="flex flex-col items-center gap-8">
            <button
              type="button"
              onClick={onCapture}
              disabled={!cameraReady}
              style={{
                ...styles.shutterButton,
                opacity: cameraReady ? 1 : 0.5,
                cursor: cameraReady ? "pointer" : "not-allowed",
              }}
              aria-label="撮影"
            >
              <div style={styles.shutterButtonInner} />
            </button>
            <p className="text-sm text-cyan-400 font-mono tracking-widest">
              SHUTTER
            </p>

            <div className="w-full border-t border-cyan-500/30 my-2"></div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-2 text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <div className="w-12 h-12 rounded bg-slate-800/50 flex items-center justify-center border border-slate-700 hover:border-cyan-500/50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <title>画像アイコン</title>
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
              <span className="text-xs font-mono">SELECT FILE</span>
            </button>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}

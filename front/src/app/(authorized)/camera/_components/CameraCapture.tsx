import Image from "next/image";
import type { RefObject } from "react";
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
    <div className="flex gap-6 mb-6">
      {/* カメラプレビューエリア */}
      <div className="bg-gray-800 rounded-lg overflow-hidden flex-1">
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
            <div className="absolute inset-0 flex items-end justify-center gap-4 pb-4 bg-black/30">
              <button
                type="button"
                onClick={onRetake}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
              >
                再撮影
              </button>
              <button
                type="button"
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onConfirm}
                disabled={isUploading || !!uploadedImageUrl}
              >
                {isUploading
                  ? "保存中..."
                  : uploadedImageUrl
                    ? "保存済み"
                    : "確定"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 右側：撮影ボタンと情報 */}
      <div className="flex-1 flex flex-col justify-start">
        {!capturedImage && (
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={onCapture}
              disabled={!cameraReady}
              className="w-24 h-24 rounded-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors shadow-lg flex items-center justify-center"
              aria-label="撮影"
            >
              <svg
                aria-hidden="true"
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="8" />
              </svg>
            </button>
            <p className="text-sm text-gray-400">撮影ボタン</p>

            <div className="w-full border-t border-gray-700 my-2"></div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
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
              <span className="text-xs">画像を選択</span>
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

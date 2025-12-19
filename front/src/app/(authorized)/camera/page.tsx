"use client";

import { Timestamp } from "firebase/firestore";
import Image from "next/image";
import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addCard } from "@/lib/firestore";
import { deleteImage, uploadImage } from "@/lib/storage";
import type { Card } from "@/types/app";
import CameraPreview, { type CameraPreviewHandle } from "./CameraPreview";

type Faculty =
  | "information-engineering"
  | "engineering"
  | "social-environment"
  | "";
type Department =
  | "情報工学科"
  | "情報通信工学科"
  | "情報システム工学科"
  | "情報マネジメント学科"
  | "電子情報工学科"
  | "生命環境化学科"
  | "知能機械工学科"
  | "電気工学科"
  | "社会環境学科"
  | "";

type CameraForm = {
  name: Card["name"];
  grade: Card["grade"] | null;
  position: Card["position"];
  hobby: Card["hobby"]; // 趣味
  description: Card["description"]; // UI 上のコメント
  faculty: Faculty;
  department: Department;
};

const DEPARTMENTS: Record<Exclude<Faculty, "">, Department[]> = {
  "information-engineering": [
    "情報工学科",
    "情報通信工学科",
    "情報システム工学科",
    "情報マネジメント学科",
  ],
  engineering: [
    "電子情報工学科",
    "生命環境化学科",
    "知能機械工学科",
    "電気工学科",
  ],
  "social-environment": ["社会環境学科"],
};

const dataURLtoFile = (dataurl: string, filename: string): File => {
  try {
    const arr = dataurl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
      throw new Error("Invalid data URL format");
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (e) {
    console.error("Error converting data URL to file:", e);
    throw new Error("画像の変換に失敗しました。");
  }
};

export default function CameraPage() {
  const cameraRef = useRef<CameraPreviewHandle>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const [form, setForm] = useState<CameraForm>({
    name: "",
    grade: null,
    position: "",
    hobby: "",
    description: "",
    faculty: "",
    department: "",
  });

  const handleFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFaculty = e.target.value as Faculty;
    setForm((prev) => ({ ...prev, faculty: newFaculty, department: "" }));
  };

  const handleCapture = () => {
    if (!cameraRef.current) {
      console.error("Camera is not ready or reference is missing.");
      setCaptureError("カメラの準備ができていません。もう一度お試しください。");
      return;
    }

    try {
      const imageSrc = cameraRef.current.capture();

      if (!imageSrc) {
        console.error(
          "Failed to capture image. getScreenshot returned null or undefined.",
        );
        setCapturedImage(null);
        setCaptureError("撮影に失敗しました。もう一度お試しください。");
        return;
      }

      setCapturedImage(imageSrc);
      setCaptureError(null);
    } catch (error) {
      console.error("Unexpected error during capture.", error);
      setCapturedImage(null);
      setCaptureError(
        "撮影中にエラーが発生しました。時間をおいてからもう一度お試しください。",
      );
    }
  };

  const handleConfirm = async () => {
    if (!capturedImage) {
      console.error("Image is not captured.");
      setCaptureError(
        "撮影が完了していません。撮影を完了してからもう一度お試しください。",
      );
      return;
    }

    setIsUploading(true);
    setCaptureError(null);

    try {
      if (!user) {
        throw new Error("ログインしていません。");
      }
      const timestamp = Date.now();
      const file = dataURLtoFile(capturedImage, `card-${timestamp}.png`);
      // Upload to user-specific path: users/{userId}/cards/{filename}
      const uploadPath = `users/${user.id}/cards/${timestamp}.png`;
      const url = await uploadImage(file, uploadPath);

      setUploadedImageUrl(url);
      setUploadedImagePath(uploadPath);
      console.log("Image uploaded:", url);
    } catch (e) {
      console.error("Failed to upload image:", e);
      setCaptureError(
        e instanceof Error
          ? e.message
          : "画像のアップロードに失敗しました。もう一度お試しください。",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleMakeCard = async () => {
    if (!uploadedImageUrl || !user) {
      setCaptureError(
        "画像のアップロードが完了していないか、ログインしていません。",
      );
      return;
    }

    if (
      !form.name ||
      !form.grade ||
      !form.position ||
      !form.faculty ||
      !form.department
    ) {
      setCaptureError("必須項目をすべて入力してください。");
      return;
    }

    setIsSaving(true);
    try {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 4);

      await addCard({
        name: form.name,
        grade: form.grade,
        position: form.position,
        hobby: form.hobby,
        description: form.description,
        imageUrl: uploadedImageUrl,
        creatorId: user.id,
        expiryDate: Timestamp.fromDate(expiryDate),
      });

      console.log("Card created successfully");
      // Reset form or navigate
      setCapturedImage(null);
      setUploadedImageUrl(null);
      setUploadedImagePath(null);
      setForm({
        name: "",
        grade: null,
        position: "",
        hobby: "",
        description: "",
        faculty: "",
        department: "",
      });
      alert("カードを作成しました！");
    } catch (e) {
      console.error("Failed to create card:", e);
      setCaptureError("カードの作成に失敗しました。");

      // クリーンアップ: アップロードした画像を削除
      if (uploadedImagePath) {
        try {
          await deleteImage(uploadedImagePath);
          console.log("Uploaded image deleted due to card creation failure");
        } catch (deleteError) {
          console.error("Failed to delete uploaded image:", deleteError);
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  // フォームバリデーション
  const isFormValid =
    form.name.trim() !== "" &&
    form.grade !== null &&
    form.position.trim() !== "" &&
    form.faculty !== "" &&
    form.department !== "";

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">部員をカード化</h1>

        <div className="max-w-4xl mx-auto">
          {/* カメラプレビューとボタンの横並びレイアウト */}
          <div className="flex gap-6 mb-6">
            {/* カメラプレビューエリア */}
            <div className="bg-gray-800 rounded-lg overflow-hidden flex-1">
              {!capturedImage ? (
                <CameraPreview ref={cameraRef} onReadyChange={setCameraReady} />
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
                      onClick={() => {
                        setCapturedImage(null);
                        setUploadedImageUrl(null);
                        setUploadedImagePath(null);
                        setCaptureError(null);
                      }}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                    >
                      再撮影
                    </button>
                    <button
                      type="button"
                      className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleConfirm}
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
                    onClick={handleCapture}
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
                  {captureError && (
                    <p className="mt-1 text-sm text-red-400 text-center">
                      {captureError}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 部員情報入力フォーム */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">部員情報</h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="member-name"
                  className="block text-sm font-medium mb-2"
                >
                  名前
                </label>
                <input
                  type="text"
                  id="member-name"
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="山田 太郎"
                />
              </div>

              <div>
                <label
                  htmlFor="member-faculty"
                  className="block text-sm font-medium mb-2"
                >
                  学部
                </label>
                <select
                  id="member-faculty"
                  value={form.faculty}
                  onChange={handleFacultyChange}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  <option value="information-engineering">情報工学部</option>
                  <option value="engineering">工学部</option>
                  <option value="social-environment">社会環境学部</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="member-department"
                  className="block text-sm font-medium mb-2"
                >
                  学科
                </label>
                <select
                  id="member-department"
                  value={form.department}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      department: e.target.value as Department,
                    }))
                  }
                  disabled={!form.faculty}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {form.faculty
                      ? "選択してください"
                      : "先に学部を選択してください"}
                  </option>
                  {form.faculty &&
                    DEPARTMENTS[form.faculty].map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="member-grade"
                  className="block text-sm font-medium mb-2"
                >
                  学年
                </label>
                <select
                  id="member-grade"
                  value={form.grade ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      grade: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  <option value="1">1年</option>
                  <option value="2">2年</option>
                  <option value="3">3年</option>
                  <option value="4">4年</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="member-position"
                  className="block text-sm font-medium mb-2"
                >
                  役職
                </label>
                <input
                  type="text"
                  id="member-position"
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.position}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, position: e.target.value }))
                  }
                  placeholder="例: 部長、副部長、会計"
                />
              </div>

              <div>
                <label
                  htmlFor="member-hobby"
                  className="block text-sm font-medium mb-2"
                >
                  趣味
                </label>
                <input
                  type="text"
                  id="member-hobby"
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.hobby}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, hobby: e.target.value }))
                  }
                  placeholder="例: カラオケ、麻雀、プログラミング"
                />
              </div>

              <div>
                <label
                  htmlFor="member-comment"
                  className="block text-sm font-medium mb-2"
                >
                  コメント
                </label>
                <textarea
                  id="member-comment"
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="部員の特徴や性格など（例: いつも遅刻する、ムードメーカー）"
                />
              </div>
            </div>
          </div>

          {/* アクションボタン（撮影後に表示） */}
          {capturedImage && (
            <>
              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                >
                  ギャラリーから選択
                </button>
              </div>

              {/* カード化ボタン */}
              <button
                type="button"
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleMakeCard}
                disabled={!uploadedImageUrl || isSaving || !isFormValid}
              >
                {isSaving ? "作成中..." : "カード化する"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

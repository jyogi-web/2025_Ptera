"use client";

import { Timestamp } from "firebase/firestore";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { addCard } from "@/lib/firestore";
import { deleteImage, uploadImage } from "@/lib/storage";
import type { Card } from "@/types/app";
import { completeCardAction } from "./actions";
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
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

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
      toast.error("カメラの準備ができていません。もう一度お試しください。");
      return;
    }

    try {
      const imageSrc = cameraRef.current.capture();

      if (!imageSrc) {
        console.error(
          "Failed to capture image. getScreenshot returned null or undefined.",
        );
        setCapturedImage(null);
        toast.error("撮影に失敗しました。もう一度お試しください。");
        return;
      }

      setCapturedImage(imageSrc);
    } catch (error) {
      console.error("Unexpected error during capture.", error);
      setCapturedImage(null);
      toast.error(
        "撮影中にエラーが発生しました。時間をおいてからもう一度お試しください。",
      );
    }
  };

  const handleConfirm = async () => {
    if (!capturedImage) {
      console.error("Image is not captured.");
      toast.error(
        "撮影が完了していません。撮影を完了してからもう一度お試しください。",
      );
      return;
    }

    setIsUploading(true);

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
      toast.error(
        e instanceof Error
          ? e.message
          : "画像のアップロードに失敗しました。もう一度お試しください。",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleAIComplete = () => {
    if (!uploadedImageUrl) return;

    startTransition(async () => {
      const result = await completeCardAction(uploadedImageUrl, {
        name: form.name,
        position: form.position,
        hobby: form.hobby,
        description: form.description,
        faculty: form.faculty,
        department: form.department,
        grade: form.grade ? form.grade.toString() : undefined,
      });

      if (result.success && result.data) {
        setForm((prev) => ({
          ...prev,
          name: result.data?.name || prev.name,
          faculty: (result.data?.faculty as Faculty) || prev.faculty,
          department:
            (result.data?.department as Department) || prev.department,
          grade: result.data?.grade ? Number(result.data.grade) : prev.grade,
          position: result.data?.position || prev.position,
          hobby: result.data?.hobby || prev.hobby,
          description: result.data?.description || prev.description,
        }));
        toast.success("AI補完が完了しました！");
      } else {
        toast.error(result.error || "AI補完に失敗しました。");
      }
    });
  };

  const handleMakeCard = async () => {
    if (!uploadedImageUrl || !user) {
      toast.error(
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
      toast.error("必須項目をすべて入力してください。");
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
      toast.success("カードを作成しました！");
    } catch (e) {
      console.error("Failed to create card:", e);
      toast.error("カードの作成に失敗しました。");

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
                </div>
              )}
            </div>
          </div>

          {/* 部員情報入力フォーム */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">部員情報</h2>
              <button
                type="button"
                onClick={handleAIComplete}
                disabled={!uploadedImageUrl || isPending}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <title>AI解析中</title>
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    AI解析中...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <title>AI補完</title>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                      <line x1="16" x2="22" y1="5" y2="5" />
                      <line x1="19" x2="19" y1="2" y2="8" />
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 16v.01" />
                    </svg>
                    AI補完
                  </>
                )}
              </button>
            </div>

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
                    DEPARTMENTS[form.faculty] &&
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

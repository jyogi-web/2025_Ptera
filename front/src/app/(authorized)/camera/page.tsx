"use client";

import { useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { calculateGraduationDate } from "@/helper/converter";
import { addCard } from "@/lib/firestore";
import { deleteImage, uploadImage } from "@/lib/storage";
import CameraCapture from "./_components/CameraCapture";
import type { CameraPreviewHandle } from "./_components/CameraPreview";
import MemberForm, { type CameraFormType } from "./_components/MemberForm";
import { completeCardAction } from "./actions";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<CameraFormType>({
    name: "",
    grade: null,
    position: "",
    hobby: "",
    description: "",
    faculty: "",
    department: "",
  });

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
      setSelectedFile(null); // Clear selected file when capturing new image
    } catch (error) {
      console.error("Unexpected error during capture.", error);
      setCapturedImage(null);
      toast.error(
        "撮影中にエラーが発生しました。時間をおいてからもう一度お試しください。",
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("画像ファイルを選択してください。");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setCapturedImage(event.target.result);
          setSelectedFile(file);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("画像の読み込みに失敗しました。");
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

      let file: File;
      if (selectedFile) {
        file = selectedFile;
      } else {
        file = dataURLtoFile(capturedImage, `card-${timestamp}.png`);
      }

      // Upload to user-specific path: users/{userId}/cards/{filename}
      const extension = selectedFile
        ? selectedFile.name.split(".").pop()
        : "png";
      const uploadPath = `users/${user.id}/cards/${timestamp}.${extension}`;

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
          faculty: result.data?.faculty || prev.faculty,
          department: result.data?.department || prev.department,
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
    if (!uploadedImageUrl || !user?.circleId) {
      toast.error(
        "画像のアップロードが完了していないか、ログインしていないか、サークルに所属していません。",
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
      if (form.grade === null) {
        toast.error("学年が選択されていません。");
        return;
      }

      let expiryDate: Date;
      try {
        expiryDate = calculateGraduationDate(form.grade);
      } catch (error) {
        console.error("Invalid grade for graduation calculation:", error);
        toast.error("学年の値が無効です。");
        return;
      }

      await addCard({
        name: form.name,
        grade: form.grade,
        position: form.position,
        hobby: form.hobby,
        description: form.description,
        imageUrl: uploadedImageUrl,
        creatorId: user.id,
        circleId: user.circleId, // Pass circleId
        expiryDate: expiryDate,
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
    form.faculty.trim() !== "" &&
    form.department.trim() !== "";

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">部員をカード化</h1>

        <div className="max-w-4xl mx-auto">
          {/* カメラプレビューとボタンの横並びレイアウト */}
          <CameraCapture
            cameraRef={cameraRef}
            onReadyChange={setCameraReady}
            capturedImage={capturedImage}
            onRetake={() => {
              setCapturedImage(null);
              setUploadedImageUrl(null);
              setUploadedImagePath(null);
            }}
            onConfirm={handleConfirm}
            isUploading={isUploading}
            uploadedImageUrl={uploadedImageUrl}
            cameraReady={cameraReady}
            onCapture={handleCapture}
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
          />

          {/* 部員情報入力フォーム */}
          <MemberForm
            form={form}
            setForm={setForm}
            onAIComplete={handleAIComplete}
            isAIPending={isPending}
            uploadedImageUrl={uploadedImageUrl}
            capturedImage={capturedImage}
            onMakeCard={handleMakeCard}
            isSaving={isSaving}
            isFormValid={isFormValid}
          />
        </div>
      </div>
    </div>
  );
}

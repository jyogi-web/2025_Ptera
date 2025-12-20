"use server";

import { CompleteCardRequest } from "@/generated/ptera/v1/ptera_pb";
import { pteraClient } from "@/lib/grpc";

/**
 * AI補完用のフォームデータ
 * @property name - 名前
 * @property faculty - 学部
 * @property department - 学科
 * @property grade - 学年
 * @property position - 職位
 * @property hobby - 趣味
 * @property description - 説明文
 */
interface CardFormData {
  name?: string;
  faculty?: string;
  department?: string;
  grade?: string;
  position?: string;
  hobby?: string;
  description?: string;
}

/**
 * AIを使用してカード情報を補完する
 * @param imageUrl - 名刺画像のURL
 * @param currentData - 現在のフォームデータ
 * @returns 補完結果 { success: boolean, data: CardFormData | null, error: string | null }
 */
export async function completeCardAction(
  imageUrl: string,
  currentData: CardFormData,
): Promise<{
  success: boolean;
  data: CardFormData | null;
  error: string | null;
}> {
  // 入力バリデーション
  if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
    return {
      success: false,
      data: null,
      error: "画像URLが無効です",
    };
  }

  try {
    try {
      const request = new CompleteCardRequest({
        imageUrl: imageUrl,
        name: currentData.name,
        faculty: currentData.faculty,
        department: currentData.department,
        grade: currentData.grade ? Number(currentData.grade) : undefined,
        position: currentData.position,
        hobby: currentData.hobby,
        description: currentData.description,
      });

      const response = await pteraClient.completeCard(request);

      // クライアントに返すためにレスポンスをプレーンなオブジェクトに変換
      return {
        success: true,
        data: {
          name: response.name,
          faculty: response.faculty,
          department: response.department,
          grade: response.grade.toString(),
          position: response.position,
          hobby: response.hobby,
          description: response.description,
        },
        error: null,
      };
    } catch (e) {
      const error = e as Error;
      console.error("AI Completion Failed:", error);
      return {
        success: false,
        data: null,
        error: error.message || "AI補完に失敗しました",
      };
    }
  } catch (e) {
    const error = e as Error;
    console.error("AI Completion Failed:", error);
    return {
      success: false,
      data: null,
      error: error.message || "AI補完に失敗しました",
    };
  }
}

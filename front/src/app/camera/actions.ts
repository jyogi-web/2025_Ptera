"use server";

import { create } from "@bufbuild/protobuf";
import { CompleteCardRequestSchema } from "@/generated/ptera/v1/ptera_pb";
import { pteraClient } from "@/lib/grpc-client";

// Define the shape of the form data we pass
interface CardFormData {
  name?: string;
  faculty?: string;
  department?: string;
  grade?: string;
  position?: string;
  hobby?: string;
  description?: string;
}

export async function completeCardAction(
  imageUrl: string,
  currentData: CardFormData,
) {
  try {
    const request = create(CompleteCardRequestSchema, {
      imageUrl: imageUrl,
      name: currentData.name,
      faculty: currentData.faculty,
      department: currentData.department,
      grade: currentData.grade,
      position: currentData.position,
      hobby: currentData.hobby,
      description: currentData.description,
    });

    const response = await pteraClient.completeCard(request);

    // Convert response to plain object to pass back to client (Protobuf objects might have methods)
    return {
      success: true,
      data: {
        name: response.name,
        faculty: response.faculty,
        department: response.department,
        grade: response.grade,
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
}

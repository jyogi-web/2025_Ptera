import {
  deleteObject,
  getDownloadURL,
  ref,
  type StorageReference,
  uploadBytes,
} from "firebase/storage";
import { storage } from "./firebase";

/**
 * ファイルをFirebase Storageにアップロードし、ダウンロードURLを返します。
 * @param file アップロードするファイル
 * @param path ストレージ内のパス (例: "images/filename.jpg")
 * @returns ダウンロードURLを解決するPromise
 */
export const uploadImage = async (
  file: File,
  path: string,
): Promise<string> => {
  // Strict MIME type whitelist (SVG is explicitly rejected)
  const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type: ${file.type}. Only JPEG, PNG, and WebP images are allowed.`,
    );
  }

  // Validate file size (e.g., 5MB limit)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error("File size exceeds 5MB limit");
  }

  // Sanitize path - remove path traversal attempts and leading slashes
  const sanitizedPath = path.replace(/\.\./g, "").replace(/^\/+/, "");

  const storageRef = ref(storage, sanitizedPath);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};

/**
 * Firebase Storageから画像を削除します。
 * @param path ストレージ内のパス (例: "users/userId/cards/filename.jpg")
 * @returns 削除完了を示すPromise
 */
export const deleteImage = async (path: string): Promise<void> => {
  let storageRef: StorageReference;
  if (path.startsWith("http") || path.startsWith("gs://")) {
    // If it's a full URL, use it directly
    storageRef = ref(storage, path);
  } else {
    // Sanitize path - remove path traversal attempts and leading slashes
    const sanitizedPath = path.replace(/\.\./g, "").replace(/^\/+/, "");
    storageRef = ref(storage, sanitizedPath);
  }
  await deleteObject(storageRef);
};

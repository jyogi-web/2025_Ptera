import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param file The file to upload
 * @param path The path in storage (e.g. "images/filename.jpg")
 * @returns Promise resolving to the download URL
 */
export const uploadImage = async (
  file: File,
  path: string,
): Promise<string> => {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
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

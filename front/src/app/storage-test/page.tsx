"use client";

import { useState } from "react";
import { uploadImage } from "@/lib/storage";

export default function StorageTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      // simple path strategy for testing
      const path = `test-images/${Date.now()}_${file.name}`;
      const downloadUrl = await uploadImage(file, path);
      setUrl(downloadUrl);
      console.log("Uploaded to:", downloadUrl);
    } catch (e) {
      console.error("Upload failed", e);
      alert("Upload failed. Check console and Firebase Storage rules.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold">Storage Upload Test</h1>

      <div className="flex flex-col gap-4 rounded border p-6 shadow-sm">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="rounded border p-2"
        />

        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || loading}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      {url && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-green-600">Upload Successful!</p>
          <div className="h-32 w-full flex items-center justify-center bg-gray-100 rounded">
            <span className="text-gray-400 text-sm">
              Image uploaded (Preview disabled for lint)
            </span>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 underline"
          >
            Open URL
          </a>
        </div>
      )}
    </div>
  );
}

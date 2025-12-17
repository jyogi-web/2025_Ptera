"use client";

import { useState } from "react";
import { Card } from "@/types/app";

type Faculty = "information-engineering" | "engineering" | "social-environment" | "";
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

export default function CameraPage() {
  const [form, setForm] = useState<CameraForm>({
    name: "",
    grade: null,
    position: "",
    description: "",
    faculty: "",
    department: "",
  });

  const handleFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFaculty = e.target.value as Faculty;
    setForm((prev) => ({ ...prev, faculty: newFaculty, department: "" }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">部員をカード化</h1>
        
        <div className="max-w-2xl mx-auto">
          {/* カメラプレビューエリア */}
          <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
            <div className="aspect-[3/4] flex items-center justify-center bg-gray-700">
              <div className="text-center">
                <svg
                  className="mx-auto h-24 w-24 text-gray-500 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-gray-400">カメラプレビュー</p>
              </div>
            </div>
          </div>

          {/* 部員情報入力フォーム */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">部員情報</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  名前
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="山田 太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  学部
                </label>
                <select
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
                <label className="block text-sm font-medium mb-2">
                  学科
                </label>
                <select
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
                    {form.faculty ? "選択してください" : "先に学部を選択してください"}
                  </option>
                  {form.faculty && (
                    DEPARTMENTS[form.faculty].map(
                      (dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      )
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  学年
                </label>
                <select
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
                <label className="block text-sm font-medium mb-2">
                  役職
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.position}
                  onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))}
                  placeholder="例: 部長、副部長、会計"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  コメント
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="部員の特徴や性格など（例: いつも遅刻する、ムードメーカー）"
                />
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-4">
            <button
              type="button"
              className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              撮影する
            </button>
            <button
              type="button"
              className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
            >
              ギャラリーから選択
            </button>
          </div>

          {/* カード化ボタン */}
          <button
            type="button"
            className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-bold text-lg transition-colors"
          >
            カード化する
          </button>
        </div>
      </div>
    </div>
  );
}

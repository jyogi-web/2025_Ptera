import type { Card } from "@/types/app";

export type CameraFormType = {
  name: Card["name"];
  grade: Card["grade"] | null;
  position: Card["position"];
  hobby: Card["hobby"]; // 趣味
  description: Card["description"]; // UI 上のコメント
  faculty: string;
  department: string;
};

type Props = {
  form: CameraFormType;
  setForm: React.Dispatch<React.SetStateAction<CameraFormType>>;
  onAIComplete: () => void;
  isAIPending: boolean;
  uploadedImageUrl: string | null;
  capturedImage: string | null;
  onMakeCard: () => void;
  isSaving: boolean;
  isFormValid: boolean;
};

export default function MemberForm({
  form,
  setForm,
  onAIComplete,
  isAIPending,
  uploadedImageUrl,
  capturedImage,
  onMakeCard,
  isSaving,
  isFormValid,
}: Props) {
  return (
    <>
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">部員情報</h2>
          <button
            type="button"
            onClick={onAIComplete}
            disabled={!uploadedImageUrl || isAIPending}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            {isAIPending ? (
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
            <input
              type="text"
              id="member-faculty"
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.faculty}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, faculty: e.target.value }))
              }
              placeholder="例: 情報工学部、工学部、社会環境学部"
            />
          </div>

          <div>
            <label
              htmlFor="member-department"
              className="block text-sm font-medium mb-2"
            >
              学科
            </label>
            <input
              type="text"
              id="member-department"
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.department}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, department: e.target.value }))
              }
              placeholder="例: 情報工学科、電子情報工学科"
            />
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
          {/* カード化ボタン */}
          <button
            type="button"
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onMakeCard}
            disabled={!uploadedImageUrl || isSaving || !isFormValid}
          >
            {isSaving ? "作成中..." : "カード化する"}
          </button>
        </>
      )}
    </>
  );
}

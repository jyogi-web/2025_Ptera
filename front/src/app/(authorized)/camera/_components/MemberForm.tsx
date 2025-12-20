import type { Card } from "@/types/app";
import { styles } from "../_styles/page.styles";

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
      <div style={styles.cyberFrame} className="p-6 mb-6">
        <div className="flex justify-between items-center mb-6 border-b border-cyan-500/20 pb-4">
          <h2 className="text-xl font-bold text-cyan-400 tracking-wider">
            MEMBER_INFO
          </h2>
          <button
            type="button"
            onClick={onAIComplete}
            disabled={!uploadedImageUrl || isAIPending}
            style={{
              ...styles.cyberButton,
              fontSize: "0.8rem",
              padding: "6px 16px",
              ...(!!uploadedImageUrl && !isAIPending
                ? {}
                : styles.cyberButtonDisabled),
            }}
            onMouseEnter={(e) => {
              if (!!uploadedImageUrl && !isAIPending)
                Object.assign(e.currentTarget.style, styles.cyberButtonActive);
            }}
            onMouseLeave={(e) => {
              if (!!uploadedImageUrl && !isAIPending)
                Object.assign(e.currentTarget.style, styles.cyberButton);
            }}
          >
            {isAIPending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⟳</span> ANALYZING...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>✦</span> AI_AUTO_FILL
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label
              htmlFor="member-name"
              className="block text-xs font-mono text-cyan-500/80 mb-2 uppercase"
            >
              Name / 名前
            </label>
            <input
              type="text"
              id="member-name"
              style={styles.cyberInput}
              onFocus={(e) =>
                Object.assign(e.currentTarget.style, styles.cyberInputFocus)
              }
              onBlur={(e) =>
                Object.assign(e.currentTarget.style, styles.cyberInput)
              }
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
              className="block text-xs font-mono text-cyan-500/80 mb-2 uppercase"
            >
              Faculty / 学部
            </label>
            <input
              type="text"
              id="member-faculty"
              style={styles.cyberInput}
              onFocus={(e) =>
                Object.assign(e.currentTarget.style, styles.cyberInputFocus)
              }
              onBlur={(e) =>
                Object.assign(e.currentTarget.style, styles.cyberInput)
              }
              value={form.faculty}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, faculty: e.target.value }))
              }
              placeholder="例: 情報工学部"
            />
          </div>

          <div>
            <label
              htmlFor="member-department"
              className="block text-xs font-mono text-cyan-500/80 mb-2 uppercase"
            >
              Department / 学科
            </label>
            <input
              type="text"
              id="member-department"
              style={styles.cyberInput}
              onFocus={(e) =>
                Object.assign(e.currentTarget.style, styles.cyberInputFocus)
              }
              onBlur={(e) =>
                Object.assign(e.currentTarget.style, styles.cyberInput)
              }
              value={form.department}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, department: e.target.value }))
              }
              placeholder="例: 情報工学科"
            />
          </div>

          <div>
            <label
              htmlFor="member-grade"
              className="block text-xs font-mono text-cyan-500/80 mb-2 uppercase"
            >
              Grade / 学年
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
              style={styles.cyberInput}
              onFocus={(e) =>
                Object.assign(e.currentTarget.style, styles.cyberInputFocus)
              }
              onBlur={(e) =>
                Object.assign(e.currentTarget.style, styles.cyberInput)
              }
            >
              <option value="" className="bg-slate-900">
                SELECT GRADE
              </option>
              <option value="1" className="bg-slate-900">
                1st Year
              </option>
              <option value="2" className="bg-slate-900">
                2nd Year
              </option>
              <option value="3" className="bg-slate-900">
                3rd Year
              </option>
              <option value="4" className="bg-slate-900">
                4th Year
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="member-position"
              className="block text-xs font-mono text-cyan-500/80 mb-2 uppercase"
            >
              Position / 役職
            </label>
            <input
              type="text"
              id="member-position"
              style={styles.cyberInput}
              onFocus={(e) =>
                Object.assign(e.currentTarget.style, styles.cyberInputFocus)
              }
              onBlur={(e) =>
                Object.assign(e.currentTarget.style, styles.cyberInput)
              }
              value={form.position}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, position: e.target.value }))
              }
              placeholder="例: 部長"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="member-hobby"
              className="block text-xs font-mono text-cyan-500/80 mb-2 uppercase"
            >
              Hobby / 趣味
            </label>
            <input
              type="text"
              id="member-hobby"
              style={styles.cyberInput}
              onFocus={(e) =>
                Object.assign(e.currentTarget.style, styles.cyberInputFocus)
              }
              onBlur={(e) =>
                Object.assign(e.currentTarget.style, styles.cyberInput)
              }
              value={form.hobby}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, hobby: e.target.value }))
              }
              placeholder="例: プログラミング"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="member-comment"
              className="block text-xs font-mono text-cyan-500/80 mb-2 uppercase"
            >
              Comment / コメント
            </label>
            <textarea
              id="member-comment"
              style={{ ...styles.cyberInput, resize: "none" }}
              onFocus={(e) =>
                Object.assign(e.currentTarget.style, styles.cyberInputFocus)
              }
              onBlur={(e) =>
                Object.assign(e.currentTarget.style, styles.cyberInput)
              }
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="部員の特徴など"
            />
          </div>
        </div>
      </div>

      {/* アクションボタン（撮影後に表示） */}
      {capturedImage && (
        <div className="mb-8">
          {/* カード化ボタン */}
          <button
            type="button"
            style={{
              ...styles.cyberButton,
              width: "100%",
              padding: "16px",
              fontSize: "1.1rem",
              ...(uploadedImageUrl && !isSaving && isFormValid
                ? {}
                : styles.cyberButtonDisabled),
            }}
            onClick={onMakeCard}
            disabled={!uploadedImageUrl || isSaving || !isFormValid}
            onMouseEnter={(e) => {
              if (uploadedImageUrl && !isSaving && isFormValid)
                Object.assign(e.currentTarget.style, styles.cyberButtonActive);
            }}
            onMouseLeave={(e) => {
              if (uploadedImageUrl && !isSaving && isFormValid)
                Object.assign(e.currentTarget.style, styles.cyberButton);
            }}
          >
            {isSaving ? "PROCESSING..." : "GENERATE CARD // execute"}
          </button>
        </div>
      )}
    </>
  );
}

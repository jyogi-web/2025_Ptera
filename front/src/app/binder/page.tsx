"use client";

export default function BinderPage() {
  const cards = Array.from({ length: 12 }).map((_, i) => ({
    id: `card-${i + 1}`,
    name: `メンバー ${i + 1}`,
    grade: (i % 4) + 1,
    label: i < 3 ? "1st" : undefined,
  }));

  const handleSettingsClick = () => {
    console.log("settings clicked");
  };

  const handleNavClick = (label: string) => {
    console.log(`nav clicked: ${label}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-md px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">マイ・バインダー</h1>
            <p className="text-sm text-gray-400">Total Cards: {cards.length}</p>
          </div>
          <button
            type="button"
            aria-label="設定"
            onClick={handleSettingsClick}
            className="h-9 w-9 rounded-md bg-gray-800/80 flex items-center justify-center hover:bg-gray-700"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35.53-.128 1.004-.402 1.366-.78.362-.378.605-.853.69-1.366.127-1.756 2.625-1.756 3.051 0 .085.513.328.988.69 1.366.362.378.836.652 1.366.78z"
              />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-3">
          {cards.map((c) => (
            <div
              key={c.id}
              className="relative rounded-xl bg-gradient-to-b from-cyan-500/20 via-fuchsia-500/10 to-transparent p-[2px]"
            >
              <div className="rounded-xl bg-gray-900/80 p-2">
                {/* Badge */}
                {c.label && (
                  <span className="absolute -top-1 -left-1 select-none rounded-md bg-cyan-500 px-1.5 py-0.5 text-[10px] font-bold text-black shadow">
                    {c.label}
                  </span>
                )}
                {/* Card content placeholder */}
                <div className="aspect-[3/4] rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 text-xs">
                  画像プレースホルダー
                </div>
                <div className="mt-2 px-1">
                  <p className="text-sm font-semibold truncate">{c.name}</p>
                  <p className="text-[11px] text-gray-400">残り: 1450日</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom nav placeholder */}
        <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-white/10 bg-gray-950/90 backdrop-blur px-4 py-2">
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              aria-label="ホーム"
              onClick={() => handleNavClick("home")}
              className="flex flex-col items-center gap-1 text-cyan-400"
            >
              <span>ホーム</span>
            </button>
            <button
              type="button"
              aria-label="サークル"
              onClick={() => handleNavClick("circle")}
              className="flex flex-col items-center gap-1 text-gray-400"
            >
              <span>サークル</span>
            </button>
            <button
              type="button"
              aria-label="ガチャ"
              onClick={() => handleNavClick("gacha")}
              className="flex flex-col items-center gap-1 text-gray-400"
            >
              <span>ガチャ</span>
            </button>
            <button
              type="button"
              aria-label="メニュー"
              onClick={() => handleNavClick("menu")}
              className="flex flex-col items-center gap-1 text-gray-400"
            >
              <span>メニュー</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

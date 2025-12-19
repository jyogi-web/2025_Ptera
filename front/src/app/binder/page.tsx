"use client";

export default function BinderPage() {
  const cards = Array.from({ length: 12 }).map((_, i) => ({
    id: `card-${i + 1}`,
    name: `メンバー ${i + 1}`,
    grade: (i % 4) + 1,
    label: i < 3 ? "1st" : undefined,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-md px-4 py-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-wide">マイ・バインダー</h1>
          <p className="text-sm text-gray-400">Total Cards: {cards.length}</p>
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
      </div>
    </div>
  );
}

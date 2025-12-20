export const classes = {
  listItem: `group/item relative flex items-center justify-between p-4 mb-3 overflow-hidden
    bg-gradient-to-r from-slate-900/80 to-slate-900/40
    border border-orange-500/20 border-l-4 border-l-orange-500/40
    transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
    hover:bg-gradient-to-r hover:from-orange-500/15 hover:to-orange-500/5
    hover:border-orange-500/60 hover:border-l-orange-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:translate-x-1
    focus-visible:bg-gradient-to-r focus-visible:from-orange-500/15 focus-visible:to-orange-500/5
    focus-visible:border-orange-500/60 focus-visible:border-l-orange-500 focus-visible:shadow-[0_0_20px_rgba(249,115,22,0.15)] focus-visible:translate-x-1
    outline-none`,
  challengeButton: `relative flex items-center gap-2 px-5 py-2
    bg-gradient-to-br from-orange-500/10 to-orange-500/20
    border border-orange-500/50 text-orange-200 text-sm font-bold tracking-widest uppercase cursor-pointer
    transition-all duration-200
    hover:bg-orange-500/80 hover:shadow-[0_0_20px_rgba(249,115,22,0.6)] hover:border-orange-500 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]
    focus-visible:bg-orange-500/80 focus-visible:shadow-[0_0_20px_rgba(249,115,22,0.6)] focus-visible:border-orange-500 focus-visible:text-white focus-visible:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]
    outline-none disabled:opacity-50 disabled:cursor-not-allowed`,
};

// 正典のタイポスケール（classNameの集合）。Tailwind設定は変えず、コンポーネントが
// これらの文字列を参照することで、200超のクラス文字列を一括置換せずに階層を統一する。
// 触れたファイルから順次採用していく（破壊的な全置換はしない）。
export const typeScale = {
  h1: "text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl",
  h2: "text-xl font-bold tracking-tight text-slate-950",
  h3: "text-base font-semibold text-slate-950",
  body: "text-sm leading-relaxed text-slate-600",
  caption: "text-xs leading-relaxed text-slate-500",
  // eyebrow は白地でAAを満たす staf-dark を使う（text-staf は4.07:1で不足。SectionHeading参照）。
  eyebrow: "text-xs font-bold uppercase tracking-wider text-staf-dark",
  // フォームのラベルは bold ではなく semibold（階層を保つ）。
  label: "text-sm font-semibold text-slate-900",
  statLg: "text-3xl font-bold tabular-nums md:text-4xl",
  statMd: "text-2xl font-bold tabular-nums",
  statSm: "text-xl font-bold tabular-nums"
} as const;

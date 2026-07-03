import { calloutToneClass } from "./Callout";
import { HelpHint } from "./HelpHint";
import { Stat, type StatSize } from "./Stat";
import { metricStatTone, metricSurfaceTone, type MetricTone } from "@/lib/ui/kit";

type MetricCardProps = {
  /** 指標名（例: リンクマージン）。 */
  label: string;
  /** フォーマット済みの主役数値（文字列）。tabular-nums で桁が揃う。 */
  value: string;
  /** 単位（dB / dBm など。value と分離して小さく表示）。 */
  unit?: string;
  /** 1行の補足。2行以上は入れない（情報過多の回避）。 */
  sub?: string;
  /** 意味トーン。判定を持つ値のみ neutral/primary 以外を指定する。 */
  tone?: MetricTone;
  size?: StatSize;
  /** 補助説明。常時表示せず HelpHint（ツールチップ）に格納する。 */
  hint?: string;
};

// 結果表示の統一部品（docs/ui-redesign-plan.md §2.1）。ラベル＋主役数値＋1行補足＋任意ヒント。
// 面のトーンは Callout の意味トークン、数値色は Stat のトーンに写像する（判断は @/lib/ui/kit）。
// 入力値のエコー（入力の再表示）をここに入れないこと。
export function MetricCard({ label, value, unit, sub, tone = "neutral", size = "md", hint }: MetricCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${calloutToneClass[metricSurfaceTone[tone]]}`}>
      <div className="flex items-center gap-1.5">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        {hint ? <HelpHint text={hint} /> : null}
      </div>
      <Stat value={value} unit={unit} tone={metricStatTone[tone]} size={size} className="mt-1" />
      {sub ? <p className="mt-1 text-xs leading-relaxed text-slate-500">{sub}</p> : null}
    </div>
  );
}

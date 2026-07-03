import { calloutToneClass, LEVEL_TO_TONE } from "./Callout";
import { Stat } from "./Stat";
import { judgementStatTone } from "@/lib/ui/kit";
import type { LinkJudgementLevel } from "@/lib/rf/judgement";

type ResultBarProps = {
  /** 主結果（フォーマット済み値）。右ペイン最上部に大きく出す。 */
  primary: { label: string; value: string; unit?: string };
  /** 判定を持つツールのみ指定。面色は LEVEL_TO_TONE、数値色は judgementStatTone に写像。 */
  judgement?: { label: string; level: LinkJudgementLevel };
  className?: string;
};

// 主結果の統一表示（docs/ui-redesign-plan.md §2.1b）。desktop 右ペインの最上部に置く。
// e2e のフォールド検証のため data-testid="primary-result" を付与する。
export function ResultBar({ primary, judgement, className = "" }: ResultBarProps) {
  const surface = judgement ? calloutToneClass[LEVEL_TO_TONE[judgement.level]] : "border-slate-200 bg-white";
  return (
    <div data-testid="primary-result" className={`rounded-lg border p-4 ${surface} ${className}`.trim()}>
      {judgement ? <p className="text-sm font-bold">{judgement.label}</p> : null}
      <div className={judgement ? "mt-2" : ""}>
        <p className="text-xs font-semibold text-slate-500">{primary.label}</p>
        <Stat
          value={primary.value}
          unit={primary.unit}
          size="lg"
          tone={judgement ? judgementStatTone[judgement.level] : "staf"}
          className="mt-1"
        />
      </div>
    </div>
  );
}

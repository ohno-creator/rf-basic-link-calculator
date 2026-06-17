"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatSigned } from "@/lib/rf/format";
import type { LinkJudgementLevel } from "@/lib/rf/judgement";
import type { LinkBudgetInput, LinkBudgetResult } from "@/lib/rf/linkBudget";
import { MiniWaterfall } from "./MiniWaterfall";

type StickyResultSummaryProps = {
  result: LinkBudgetResult;
  input: LinkBudgetInput;
  targetId: string;
};

const dotStyles: Record<LinkJudgementLevel, string> = {
  excellent: "bg-emerald-500",
  good: "bg-sky-500",
  caution: "bg-amber-500",
  poor: "bg-rose-500"
};

/**
 * 入力フォームが縦に長いため、編集中も現在の判定とリンクマージンを見失わないよう
 * 画面下部に固定表示する。結果カードが横に並ぶ大画面（lg以上）では非表示。
 * 結果カードが画面に入っている／通り過ぎたときは、内容と重複するため自動的に隠す。
 */
export function StickyResultSummary({ result, input, targetId }: StickyResultSummaryProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 結果がまだ画面より下にある（＝編集中で見えていない）ときだけ表示する。
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top > 0);
      },
      { threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  function scrollToResult() {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-4 transition duration-200 lg:hidden ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <button
        type="button"
        onClick={scrollToResult}
        tabIndex={visible ? 0 : -1}
        className="pointer-events-auto mx-auto block w-full max-w-xl rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-soft backdrop-blur transition hover:border-staf/40"
      >
        <span className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${dotStyles[result.judgement.level]}`} />
            <span className="text-sm font-semibold text-slate-900">{result.judgement.label}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-right">
              <span className="block text-[10px] leading-none text-slate-500">リンクマージン</span>
              <span className="text-lg font-bold text-staf">{formatSigned(result.linkMarginDb, "dB")}</span>
            </span>
            <ChevronDown aria-hidden="true" className="h-4 w-4 text-slate-400" />
          </span>
        </span>
        <MiniWaterfall result={result} input={input} />
      </button>
    </div>
  );
}

"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { judgementDotClass, shouldShowMobileResultBar } from "@/lib/ui/kit";
import type { LinkJudgementLevel } from "@/lib/rf/judgement";

type MobileResultBarProps = {
  /** 主結果（フォーマット済み値）。 */
  primary: { label: string; value: string; unit?: string };
  /** 判定を持つツールのみ指定（状態ドット＋ラベル）。 */
  judgement?: { label: string; level: LinkJudgementLevel };
  /** 観測対象の結果要素の id。画面に入ったら重複を避けて自動的に隠す。 */
  targetId: string;
  /** 追加表示（例: 旗艦の MiniWaterfall）。無くてよい。 */
  extra?: ReactNode;
};

// モバイルの結果追従バー（docs/ui-redesign-plan.md §2.1b）。入力フォームが長いツールで、
// 編集中も判定と主値を見失わないよう画面下部に固定。lg以上は非表示。結果カードが可視に
// なったら隠す（StickyResultSummary の汎用版）。
export function MobileResultBar({ primary, judgement, targetId, extra }: MobileResultBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(shouldShowMobileResultBar(entry.isIntersecting, entry.boundingClientRect.top));
      },
      { threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  const scrollToResult = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-4 transition duration-200 lg:hidden ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
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
            {judgement ? (
              <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${judgementDotClass[judgement.level]}`} />
            ) : null}
            <span className="text-sm font-semibold text-slate-900">{judgement?.label ?? primary.label}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-right">
              <span className="block text-[10px] leading-none text-slate-500">{primary.label}</span>
              <span className="text-lg font-bold text-staf-dark">
                {primary.value}
                {primary.unit ? <span className="ml-1 text-sm font-semibold">{primary.unit}</span> : null}
              </span>
            </span>
            <ChevronDown aria-hidden="true" className="h-4 w-4 text-slate-400" />
          </span>
        </span>
        {extra}
      </button>
    </div>
  );
}

"use client";

import { Clipboard, MessageSquareText } from "lucide-react";
import { useState } from "react";
import {
  buildConsultationText,
  type LinkBudgetInput,
  type LinkBudgetResult
} from "@/lib/rf/linkBudget";
import { CONTACT_URL } from "@/lib/rf/presets";

type ConsultationCtaProps = {
  input?: LinkBudgetInput;
  result?: LinkBudgetResult;
  title?: string;
  ctaLabel?: string;
  /**
   * 表示の格（design-base-v4 §1 v4-2）:
   * - "panel"（既定）: ページ末の最終CTA用。ブランド青の深色グラデ面＋白文字（1ページ1回）。
   * - "inline": 結果詳細など文中の判定連動CTA用。従来の staf-light 面（深色面の乱用を避ける）。
   */
  variant?: "panel" | "inline";
};

export function ConsultationCta({
  input,
  result,
  title = "アンテナ選定・実機評価でお困りの場合",
  ctaLabel,
  variant = "panel"
}: ConsultationCtaProps) {
  const [copied, setCopied] = useState(false);
  const copyLabel = copied ? "コピーしました" : "相談用テキストをコピー";

  async function handleCopy() {
    if (!input || !result) {
      return;
    }

    await navigator.clipboard.writeText(buildConsultationText(input, result));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const isPanel = variant === "panel";

  return (
    <section
      className={
        isPanel
          ? "relative overflow-hidden rounded-lg bg-gradient-to-br from-staf to-staf-dark p-5 shadow-card"
          : "rounded-lg border border-staf/20 bg-staf-light p-5 shadow-card"
      }
    >
      {isPanel ? (
        // 深色面の単調さを避けるradialハイライト（白14%・左上から）。装飾でなく面の質感（v4-2）。
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_20%_0%,rgba(255,255,255,0.14),transparent_60%)]"
        />
      ) : null}
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className={`text-base font-bold ${isPanel ? "text-white" : "text-slate-950"}`}>{title}</h3>
          <p
            className={`mt-2 max-w-3xl text-sm leading-relaxed ${isPanel ? "text-white/90" : "text-slate-600"}`}
          >
            リンクバジェット上は通信可能に見えても、実際のIoT機器では筐体、基板GND、金属部品、アンテナ配置、ケーブル、設置姿勢により通信性能が大きく変わります。スタッフ株式会社では、IoTアンテナの選定、内蔵アンテナの配置相談、実機評価に向けた技術相談を承っています。
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          {input && result ? (
            <button
              type="button"
              className={
                isPanel
                  ? "inline-flex items-center justify-center gap-2 rounded-md border border-white/40 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                  : "inline-flex items-center justify-center gap-2 rounded-md border border-staf bg-white px-4 py-3 text-sm font-semibold text-staf-dark transition hover:bg-white/70"
              }
              onClick={handleCopy}
            >
              <Clipboard aria-hidden="true" className="h-4 w-4" />
              {copyLabel}
            </button>
          ) : null}
          <a
            className={
              isPanel
                ? "inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-semibold text-staf-dark transition hover:bg-sky-50"
                : "inline-flex items-center justify-center gap-2 rounded-md bg-staf px-4 py-3 text-sm font-semibold text-white transition hover:bg-staf-dark"
            }
            href={CONTACT_URL}
          >
            <MessageSquareText aria-hidden="true" className="h-4 w-4" />
            {ctaLabel ?? "この条件でアンテナ選定を相談する"}
          </a>
        </div>
      </div>
    </section>
  );
}

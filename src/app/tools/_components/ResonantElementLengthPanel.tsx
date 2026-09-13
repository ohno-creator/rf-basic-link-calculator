"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { formatNumber } from "@/lib/rf/format";
import {
  elementFraction,
  resonantElementLength,
  type ElementType
} from "@/lib/rf/resonantElementLength";
import { FormulaExplanationCard } from "./FormulaExplanationCard";

const elementOptions: Array<{ id: ElementType; label: string; note: string }> = [
  { id: "monopole_quarter", label: "λ/4 モノポール", note: "GND上の1本（ホイップ・パターン）" },
  { id: "dipole_half", label: "λ/2 ダイポール", note: "左右2本（バランス給電）" },
  { id: "fullwave", label: "全波長 λ", note: "ループ等の全波素子" }
];

/** 長さ[m]を mm 主体で表記（1m以上は m 併記）。 */
function formatLength(m: number): string {
  if (!Number.isFinite(m)) {
    return "—";
  }
  const mm = m * 1000;
  if (m >= 1) {
    return `${formatNumber(mm, 0)} mm（${formatNumber(m, 3)} m）`;
  }
  return `${formatNumber(mm, 1)} mm`;
}

export function ResonantElementLengthPanel() {
  const [frequencyMHz, setFrequencyMHz] = useState(920);
  const [type, setType] = useState<ElementType>("monopole_quarter");
  const [shorteningFactor, setShorteningFactor] = useState(0.95);
  const [velocityFactor, setVelocityFactor] = useState(1);

  const result = useMemo(() => {
    try {
      return resonantElementLength({ frequencyMHz, type, shorteningFactor, velocityFactor });
    } catch {
      return null;
    }
  }, [frequencyMHz, type, shorteningFactor, velocityFactor]);

  const frequencyError =
    !Number.isFinite(frequencyMHz) || frequencyMHz <= 0
      ? "周波数は0より大きい値を入力してください。"
      : undefined;
  const kError =
    !Number.isFinite(shorteningFactor) || shorteningFactor <= 0 || shorteningFactor > 1
      ? "短縮率は0より大きく1以下で入力してください。"
      : undefined;
  const vfError =
    !Number.isFinite(velocityFactor) || velocityFactor <= 0 || velocityFactor > 1
      ? "波長短縮率は0より大きく1以下で入力してください。"
      : undefined;

  const primary = {
    label: type === "monopole_quarter" ? "エレメント長（1本）" : "エレメント全長",
    value: result ? formatNumber(result.physicalLengthM * 1000, result.physicalLengthM >= 1 ? 0 : 1) : "—",
    unit: "mm"
  };

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <div className="mt-4 space-y-4">
            <Field
              id="relFrequency"
              label="周波数"
              unit="MHz"
              value={frequencyMHz}
              min={1}
              step={1}
              emptyBehavior="preserve"
              onChange={setFrequencyMHz}
              help="アンテナを共振させたい中心周波数です。"
              example="920"
              error={frequencyError}
            />

            <div>
              <p className="text-sm font-semibold text-slate-900">素子タイプ</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {elementOptions.map((option) => {
                  const active = type === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={active}
                      data-testid={`rel-type-${option.id}`}
                      onClick={() => setType(option.id)}
                      className={`rounded-lg border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${
                        active ? "border-staf bg-staf-light/60" : "border-slate-200 bg-white hover:border-staf/40"
                      }`}
                    >
                      <span className="block text-sm font-bold text-slate-950">{option.label}</span>
                      <span className="mt-0.5 block text-xs text-slate-600">{option.note}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Field
              id="relShortening"
              label="短縮率 k（端部効果）"
              value={shorteningFactor}
              min={0.8}
              max={1}
              step={0.01}
              emptyBehavior="preserve"
              onChange={setShorteningFactor}
              help="実素子は端部効果で理想長より数%短くなります。細い線ほど1に近く、太い素子ほど小さめ（目安0.92〜0.98）。"
              example="0.95"
              error={kError}
            />
            <Field
              id="relVelocity"
              label="波長短縮率 VF（被覆線・巻線）"
              value={velocityFactor}
              min={0.5}
              max={1}
              step={0.01}
              emptyBehavior="preserve"
              onChange={setVelocityFactor}
              help="裸線は1.0。被覆線や巻線コイル状にすると波長が短縮し、より短い物理長で共振します。"
              example="1"
              error={vfError}
            />
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="rel-primary-result">
            <ResultBar primary={primary} />
          </div>
          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">内訳</h2>
            {result ? (
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">自由空間波長 λ</dt>
                  <dd className="font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatLength(result.wavelengthM)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">基準長（{elementFraction[type]}λ・短縮なし）</dt>
                  <dd className="font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatLength(result.idealLengthM)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-md bg-staf-light/50 px-2 py-1">
                  <dt className="font-semibold text-staf-dark">実用エレメント全長</dt>
                  <dd className="font-bold text-slate-950" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatLength(result.physicalLengthM)}
                  </dd>
                </div>
                {result.armLengthM !== null ? (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-600">片側（各アーム）</dt>
                    <dd className="font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatLength(result.armLengthM)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <p className="mt-3 text-sm text-slate-500">入力値を確認してください。</p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              あくまで初期値の目安です。実際は基板GND・給電・近接部品で共振がずれるため、量産前は実測での追い込みを推奨します。
            </p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <FormulaExplanationCard
          title="数式と考え方"
          formula="物理長 = 分数(λ/4・λ/2・λ) × λ × 短縮率k × 波長短縮VF、λ[m] = 300 / 周波数[MHz]"
          showColumnLink={false}
        >
          <p>
            共振長は波長の分数が基本です。λ/4モノポールはGND（グラウンド）を鏡として半波長ダイポールと等価に振る舞います。端部効果で実素子は理想長より数%短くなるため短縮率kを掛け、被覆線・巻線では波長短縮VFでさらに短くなります。
          </p>
        </FormulaExplanationCard>
      </div>

      <MobileResultBar primary={primary} targetId="rel-primary-result" />
    </>
  );
}

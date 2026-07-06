"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { calculateIfaDimensions } from "@/lib/rf/ifaDimensions";
import { formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { IfaDimensionsColumn } from "./IfaDimensionsColumn";

const presets = [
  { label: "LTE-M 800", frequencyMHz: 800 },
  { label: "LPWA 920", frequencyMHz: 920 },
  { label: "GNSS L1", frequencyMHz: 1575.42 },
  { label: "BLE 2.4G", frequencyMHz: 2400 }
] as const;

export function IfaDimensionsPanel() {
  const [frequencyMHz, setFrequencyMHz] = useState(920);
  const [relativePermittivity, setRelativePermittivity] = useState(4.4);
  const [substrateThicknessMm, setSubstrateThicknessMm] = useState(1);

  const result = useMemo(() => {
    try {
      return calculateIfaDimensions({ frequencyMHz, relativePermittivity, substrateThicknessMm });
    } catch {
      return null;
    }
  }, [frequencyMHz, relativePermittivity, substrateThicknessMm]);

  const primary = {
    label: "IFA全長の初期値",
    value: result ? formatNumber(result.initialLengthMm, 1) : "—",
    unit: "mm"
  };
  const radiatorEndX = result
    ? Math.min(560, Math.max(240, 160 + result.initialLengthMm * 7))
    : 520;
  const radiatorLabelX = (105 + radiatorEndX) / 2;

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:items-start">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            周波数プリセットを起点に、使用する基板の比誘電率を合わせます。
          </p>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="周波数プリセット">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setFrequencyMHz(preset.frequencyMHz)}
                className={`inline-flex min-h-11 items-center rounded-full border px-3 py-2 text-sm font-semibold transition ${
                  frequencyMHz === preset.frequencyMHz
                    ? "border-staf bg-staf text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              id="ifaFrequency"
              label="動作周波数"
              unit="MHz"
              value={frequencyMHz}
              min={100}
              max={6000}
              step={1}
              showSlider
              emptyBehavior="invalid"
              onChange={setFrequencyMHz}
              error={Number.isFinite(frequencyMHz) && frequencyMHz > 0 ? undefined : "0より大きい値を入力してください。"}
              help="アンテナを合わせたい中心周波数です。高いほど必要なパターン長は短くなります。"
            />
            <Field
              id="ifaPermittivity"
              label="基板の比誘電率 εr"
              value={relativePermittivity}
              min={1}
              max={12}
              step={0.1}
              showSlider
              emptyBehavior="invalid"
              onChange={setRelativePermittivity}
              error={Number.isFinite(relativePermittivity) && relativePermittivity >= 1 ? undefined : "1以上を入力してください。"}
              help="FR4は概ね4.4です。値が大きいほど基板上の波長が短くなります。"
            />
            <Field
              id="ifaThickness"
              label="基板厚"
              unit="mm"
              value={substrateThicknessMm}
              min={0.1}
              max={5}
              step={0.1}
              emptyBehavior="invalid"
              onChange={setSubstrateThicknessMm}
              error={Number.isFinite(substrateThicknessMm) && substrateThicknessMm > 0 ? undefined : "0より大きい値を入力してください。"}
              help="本簡易式の長さ補正には使いません。設計条件として記録し、EM解析・実測で評価します。"
            />
          </div>
        </Card>

        <div id="ifa-primary-result" className="space-y-4 lg:sticky lg:top-20">
          <ResultBar primary={primary} />
          {result ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard label="自由空間 λ/4" value={formatNumber(result.freeSpaceQuarterWavelengthMm, 1)} unit="mm" />
              <MetricCard label="短縮率" value={formatNumber(result.shorteningRatio * 100, 1)} unit="%" />
              <MetricCard label="給電間隔の下限 L/12" value={formatNumber(result.feedSpacingMinMm, 1)} unit="mm" />
              <MetricCard label="給電間隔の上限 L/8" value={formatNumber(result.feedSpacingMaxMm, 1)} unit="mm" />
            </div>
          ) : (
            <Callout tone="danger">入力値を確認してください。</Callout>
          )}
          <Callout tone="caution" title="初期寸法です">
            筐体・GND・部品配置で共振は±10〜20%程度ずれ得ます。最終寸法は実測またはEM解析で追い込んでください。
          </Callout>
        </div>
      </section>

      {result ? (
        <Card as="figure" padding="md" className="mt-6">
          <figcaption className="text-base font-bold text-slate-950">IFA上面図の読み方</figcaption>
          <svg role="img" aria-label="逆Fアンテナの全長と給電間隔" viewBox="0 0 640 230" className="mt-3 h-44 w-full">
            <rect x="32" y="45" width="576" height="145" rx="16" className="fill-slate-50 stroke-slate-300" />
            <path d={`M105 165 V82 H${radiatorEndX}`} fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" className="text-staf" />
            <line x1="105" y1="165" x2="105" y2="190" stroke="currentColor" strokeWidth="4" className="text-slate-600" />
            <line x1="160" y1="150" x2="160" y2="190" stroke="currentColor" strokeWidth="4" className="text-orange-500" />
            <text x={radiatorLabelX} y="70" textAnchor="middle" className="fill-slate-700 text-sm font-semibold">全長 約 {formatNumber(result.initialLengthMm, 1)}mm</text>
            <text x="105" y="215" textAnchor="middle" className="fill-slate-600 text-xs">短絡点</text>
            <text x="160" y="215" textAnchor="middle" className="fill-slate-600 text-xs">給電点</text>
            <text x="360" y="175" textAnchor="middle" className="fill-slate-500 text-xs">GNDプレーン（寸法・筐体で結果が変化）</text>
          </svg>
        </Card>
      ) : null}

      <div className="mt-6">
        <FormulaExplanationCard
          title="簡易モデルの式と適用条件"
          formula={"εeff = (εr + 1) / 2\nL[mm] ≈ λ0[mm] / (4√εeff)\n給電間隔 ≈ L/12〜L/8"}
          showColumnLink={false}
        >
          <p className="text-sm leading-relaxed text-slate-600">
            線幅を使わない簡易εeffモデルです。基板厚は記録しますが、この式の短縮率には含めません。
          </p>
        </FormulaExplanationCard>
      </div>
      <div className="mt-6">
        <IfaDimensionsColumn />
      </div>
      <MobileResultBar primary={primary} targetId="ifa-primary-result" />
    </>
  );
}

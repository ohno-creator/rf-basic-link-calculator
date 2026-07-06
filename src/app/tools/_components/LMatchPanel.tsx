"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { calculateLMatch, type LMatchSolution } from "@/lib/rf/lMatch";
import { formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";

const presets = [
  { label: "20−j10Ω", resistance: 20, reactance: -10 },
  { label: "100+j20Ω", resistance: 100, reactance: 20 },
  { label: "50+j15Ω", resistance: 50, reactance: 15 }
] as const;

function componentText(component: LMatchSolution["seriesComponent"] | null): string {
  if (!component || component.kind === "none" || component.unit === null) return "不要";
  return `${component.kind === "inductor" ? "L" : "C"} ${formatNumber(component.value, 2)} ${component.unit}`;
}

function solutionText(solution: LMatchSolution): string {
  const series = `直列 ${componentText(solution.seriesComponent)}`;
  if (solution.shuntComponent === null) return series;
  return `${series} ＋ 並列 ${componentText(solution.shuntComponent)}`;
}

function CircuitDiagram({ solution, index }: { solution: LMatchSolution; index: number }) {
  const shuntFirst = solution.topology === "shunt-then-series";
  return (
    <Card as="figure" padding="md" shadow={false}>
      <figcaption className="text-sm font-bold text-slate-950">解{index + 1}：{solutionText(solution)}</figcaption>
      <svg role="img" aria-label={`L型整合回路の解${index + 1}`} viewBox="0 0 520 150" className="mt-3 h-auto w-full">
        <line x1="35" y1="60" x2="485" y2="60" stroke="currentColor" strokeWidth="3" className="text-slate-600" />
        <rect x={shuntFirst ? 260 : 165} y="38" width="90" height="44" rx="8" className="fill-sky-50 stroke-staf" strokeWidth="2" />
        <text x={shuntFirst ? 305 : 210} y="65" textAnchor="middle" className="fill-slate-800 text-xs font-semibold">
          {componentText(solution.seriesComponent)}
        </text>
        {solution.shuntComponent ? (
          <>
            <line x1={shuntFirst ? 150 : 370} y1="60" x2={shuntFirst ? 150 : 370} y2="112" stroke="currentColor" strokeWidth="3" className="text-slate-600" />
            <rect x={shuntFirst ? 102 : 322} y="88" width="96" height="38" rx="8" className="fill-amber-50 stroke-amber-500" strokeWidth="2" />
            <text x={shuntFirst ? 150 : 370} y="112" textAnchor="middle" className="fill-slate-800 text-xs font-semibold">
              {componentText(solution.shuntComponent)}
            </text>
          </>
        ) : null}
        <text x="35" y="42" className="fill-slate-500 text-xs">Z0</text>
        <text x="455" y="42" className="fill-slate-500 text-xs">負荷</text>
      </svg>
    </Card>
  );
}

export function LMatchPanel() {
  const [loadResistanceOhm, setLoadResistanceOhm] = useState(20);
  const [loadReactanceOhm, setLoadReactanceOhm] = useState(-10);
  const [frequencyMHz, setFrequencyMHz] = useState(920);
  const [sourceResistanceOhm, setSourceResistanceOhm] = useState(50);

  const result = useMemo(() => {
    try {
      return calculateLMatch({ loadResistanceOhm, loadReactanceOhm, frequencyMHz, sourceResistanceOhm });
    } catch {
      return null;
    }
  }, [loadResistanceOhm, loadReactanceOhm, frequencyMHz, sourceResistanceOhm]);

  const firstSolution = result?.solutions[0];
  const primary = {
    label: result?.isResistanceMatched && !firstSolution ? "整合状態" : "整合回路 解1",
    value: firstSolution ? solutionText(firstSolution) : result ? "部品不要" : "—"
  };

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:items-start">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">VNAで測った負荷インピーダンス R+jX を入力します。</p>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="負荷プリセット">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setLoadResistanceOhm(preset.resistance);
                  setLoadReactanceOhm(preset.reactance);
                }}
                className="inline-flex min-h-11 items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-staf/40 hover:text-staf-dark"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field id="lmatchResistance" label="負荷抵抗 R" unit="Ω" value={loadResistanceOhm} min={0.01} step={0.1} emptyBehavior="invalid" onChange={setLoadResistanceOhm} help="負荷インピーダンスの実数成分です。0より大きい値を入力します。" />
            <Field id="lmatchReactance" label="負荷リアクタンス X" unit="Ω" value={loadReactanceOhm} step={0.1} emptyBehavior="invalid" onChange={setLoadReactanceOhm} help="負荷インピーダンスの虚数成分です。誘導性は正、容量性は負です。" />
            <Field id="lmatchFrequency" label="動作周波数" unit="MHz" value={frequencyMHz} min={0.01} step={1} emptyBehavior="invalid" onChange={setFrequencyMHz} help="L/Cの素子値を換算する周波数です。" />
            <Field id="lmatchSource" label="基準抵抗 Z0" unit="Ω" value={sourceResistanceOhm} min={0.01} step={1} emptyBehavior="invalid" onChange={setSourceResistanceOhm} help="通常のRF系は50Ωです。" />
          </div>
        </Card>

        <div id="lmatch-primary-result" className="space-y-4 lg:sticky lg:top-20">
          <ResultBar primary={primary} />
          {result ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard label="回路Q" value={formatNumber(result.q, 3)} />
              <MetricCard label="想定比帯域 ≈1/Q" value={result.fractionalBandwidth ? formatNumber(result.fractionalBandwidth * 100, 1) : "—"} unit="%" />
              <MetricCard label="抵抗差率" value={formatNumber(result.resistanceMismatchPercent, 3)} unit="%" hint="RとZ0の差率です。近傍判定の閾値は用途・部品公差に応じて決めます。" />
              <MetricCard label="解の数" value={String(result.solutions.length)} />
            </div>
          ) : (
            <Callout tone="danger">R・周波数・Z0は0より大きい有限値を入力してください。</Callout>
          )}
          <Callout tone="caution" title="実装後はVNAで再調整">
            部品Q、パッド、配線、筐体で値が変わります。計算値に最も近い標準値からスイープしてください。
          </Callout>
        </div>
      </section>

      {result?.solutions.length ? (
        <section className="mt-6 grid gap-4 lg:grid-cols-2" aria-label="L型整合回路の2解">
          {result.solutions.map((solution, index) => (
            <CircuitDiagram key={`${solution.topology}-${index}`} solution={solution} index={index} />
          ))}
        </section>
      ) : null}

      <div className="mt-6">
        <FormulaExplanationCard
          title="L型整合の閉形式"
          formula={"Q = √(max(R,Z0)/min(R,Z0) − 1)\nXL=ωL　XC=−1/(ωC)\nBC=ωC　BL=−1/(ωL)"}
          showColumnLink={false}
        >
          <p className="text-sm leading-relaxed text-slate-600">R&lt;Z0では直列リアクタンスから、R&gt;Z0ではアドミタンス側から2枝を解きます。</p>
        </FormulaExplanationCard>
      </div>
      <MobileResultBar primary={primary} targetId="lmatch-primary-result" />
    </>
  );
}

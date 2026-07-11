"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { DiagramDefs } from "@/components/diagrams/DiagramDefs";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { calculateLMatch, type LMatchComponent, type LMatchSolution } from "@/lib/rf/lMatch";
import { formatNumber } from "@/lib/rf/format";
import {
  DIAGRAM_DEF_IDS,
  diagramPalette,
  diagramRef,
  diagramStroke,
  diagramText
} from "@/lib/ui/diagramTheme";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { LMatchColumn } from "./LMatchColumn";

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

function HorizontalComponent({ component, x, y }: { component: LMatchComponent; x: number; y: number }) {
  const color = component.kind === "inductor" ? diagramPalette.staf : diagramPalette.warnDeep;
  if (component.kind === "none") {
    return <line x1={x - 44} x2={x + 44} y1={y} y2={y} stroke={diagramPalette.inkSoft} strokeWidth={diagramStroke.main} />;
  }
  if (component.kind === "capacitor") {
    return (
      <g stroke={color} strokeWidth={diagramStroke.emphasis} fill="none">
        <line x1={x - 44} x2={x - 7} y1={y} y2={y} />
        <line x1={x - 7} x2={x - 7} y1={y - 15} y2={y + 15} />
        <line x1={x + 7} x2={x + 7} y1={y - 15} y2={y + 15} />
        <line x1={x + 7} x2={x + 44} y1={y} y2={y} />
      </g>
    );
  }
  return (
    <path
      d={`M ${x - 44} ${y} H ${x - 28} c 0 -12 12 -12 12 0 c 0 -12 12 -12 12 0 c 0 -12 12 -12 12 0 c 0 -12 12 -12 12 0 H ${x + 44}`}
      fill="none"
      stroke={color}
      strokeWidth={diagramStroke.emphasis}
      strokeLinecap="round"
    />
  );
}

function ShuntComponent({ component, x, topY }: { component: LMatchComponent; x: number; topY: number }) {
  const color = component.kind === "inductor" ? diagramPalette.staf : diagramPalette.warnDeep;
  if (component.kind === "none") return null;
  return (
    <g>
      {component.kind === "capacitor" ? (
        <g stroke={color} strokeWidth={diagramStroke.emphasis} fill="none">
          <line x1={x} x2={x} y1={topY} y2={topY + 25} />
          <line x1={x - 14} x2={x + 14} y1={topY + 25} y2={topY + 25} />
          <line x1={x - 14} x2={x + 14} y1={topY + 36} y2={topY + 36} />
          <line x1={x} x2={x} y1={topY + 36} y2={topY + 66} />
        </g>
      ) : (
        <path
          d={`M ${x} ${topY} V ${topY + 11} c 12 0 12 10 0 10 c 12 0 12 10 0 10 c 12 0 12 10 0 10 c 12 0 12 10 0 10 V ${topY + 66}`}
          fill="none"
          stroke={color}
          strokeWidth={diagramStroke.emphasis}
          strokeLinecap="round"
        />
      )}
      <line x1={x} x2={x} y1={topY + 66} y2={topY + 74} stroke={diagramPalette.inkSoft} strokeWidth={diagramStroke.main} />
      <line x1={x - 16} x2={x + 16} y1={topY + 74} y2={topY + 74} stroke={diagramPalette.inkSoft} strokeWidth={diagramStroke.main} />
      <line x1={x - 10} x2={x + 10} y1={topY + 80} y2={topY + 80} stroke={diagramPalette.inkSoft} strokeWidth={diagramStroke.main} />
      <line x1={x - 4} x2={x + 4} y1={topY + 86} y2={topY + 86} stroke={diagramPalette.inkSoft} strokeWidth={diagramStroke.main} />
    </g>
  );
}

function CircuitDiagram({ solution, index }: { solution: LMatchSolution; index: number }) {
  const shuntFirst = solution.topology === "shunt-then-series";
  const seriesX = shuntFirst ? 315 : 205;
  const shuntX = shuntFirst ? 145 : 375;
  const wireY = 76;
  return (
    <Card as="figure" padding="md" shadow={false}>
      <figcaption className="text-sm font-bold text-slate-950">解{index + 1}：{solutionText(solution)}</figcaption>
      <svg
        data-testid={`l-match-diagram-${index}`}
        data-topology={solution.topology}
        data-series-x={seriesX}
        data-shunt-x={shuntX}
        role="img"
        aria-label={`L型整合回路の解${index + 1}。${solutionText(solution)}。並列素子は接地へ接続`}
        viewBox="0 0 520 205"
        className="mt-3 h-auto w-full"
      >
        <DiagramDefs />
        <rect x="8" y="8" width="504" height="188" rx="10" fill={diagramPalette.canvas} stroke={diagramPalette.line} strokeWidth={diagramStroke.support} />
        <line x1="34" x2={seriesX - 44} y1={wireY} y2={wireY} stroke={diagramPalette.inkSoft} strokeWidth={diagramStroke.main} />
        <HorizontalComponent component={solution.seriesComponent} x={seriesX} y={wireY} />
        <line x1={seriesX + 44} x2="486" y1={wireY} y2={wireY} stroke={diagramPalette.inkSoft} strokeWidth={diagramStroke.main} />
        <circle cx={shuntX} cy={wireY} r="4" fill={diagramPalette.inkSoft} />
        <text
          x={seriesX}
          y="43"
          textAnchor="middle"
          fill={solution.seriesComponent.kind === "inductor" ? diagramPalette.stafDark : diagramPalette.warnDeep}
          fontSize={diagramText.value.fontSize}
          fontWeight={diagramText.value.fontWeight}
          style={{ fontVariantNumeric: diagramText.value.fontVariantNumeric }}
        >
          直列 {componentText(solution.seriesComponent)}
        </text>
        {solution.shuntComponent ? (
          <>
            <ShuntComponent component={solution.shuntComponent} x={shuntX} topY={wireY} />
            <text
              x={shuntX + 22}
              y="123"
              textAnchor="start"
              fill={solution.shuntComponent.kind === "inductor" ? diagramPalette.stafDark : diagramPalette.warnDeep}
              fontSize={diagramText.value.fontSize}
              fontWeight={diagramText.value.fontWeight}
              style={{ fontVariantNumeric: diagramText.value.fontVariantNumeric }}
            >
              並列 {componentText(solution.shuntComponent)}
            </text>
          </>
        ) : null}
        <text x="34" y="62" textAnchor="start" {...diagramText.label}>Z0</text>
        <text x="486" y="62" textAnchor="end" {...diagramText.label}>負荷 R+jX</text>
        <line x1="42" x2="478" y1="180" y2="180" stroke={diagramPalette.faint} strokeWidth={diagramStroke.support} markerEnd={diagramRef(DIAGRAM_DEF_IDS.arrowHeadMuted)} />
        <text x="260" y="195" textAnchor="middle" {...diagramText.caption}>信号源 → 負荷</text>
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

      <div className="mt-6">
        <LMatchColumn />
      </div>

      <MobileResultBar primary={primary} targetId="lmatch-primary-result" />
    </>
  );
}

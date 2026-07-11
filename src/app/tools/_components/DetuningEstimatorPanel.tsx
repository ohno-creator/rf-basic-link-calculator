"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { estimateDetuning, type DetuningEstimate } from "@/lib/rf/detuning";
import { formatNumber } from "@/lib/rf/format";
import { CONTACT_URL } from "@/lib/rf/presets";
import type { LinkJudgementLevel } from "@/lib/rf/judgement";
import {
  DETUNING_SCENARIOS,
  DETUNING_SOURCES,
  type DetuningScenarioId
} from "@/data/detuningScenarios";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { DetuningEstimatorColumn } from "./DetuningEstimatorColumn";

// VSWR≤2帯域幅が不明なときの比帯域プリセット（BW = f0 × 比帯域）。
// 2%: 狭帯域チップアンテナ級 / 5%: 一般的な内蔵アンテナ級 / 10%: 広帯域素子級の目安。
const FRACTIONAL_BW_PRESETS = [2, 5, 10] as const;

// 判定→表示の写像。バッジ文言は e2e が参照するため短い固定語にする。
const JUDGEMENT_BY_BAND: Record<
  DetuningEstimate["staysInBand"],
  { level: LinkJudgementLevel; badge: string; label: string }
> = {
  yes: { level: "excellent", badge: "収まる", label: "最小〜最大シフトとも元のVSWR≤2帯域内" },
  partial: { level: "caution", badge: "一部外れ", label: "最大シフト側で元の帯域を逸脱" },
  no: { level: "poor", badge: "外れる", label: "最小シフトでも元の帯域を逸脱" }
};

// ---- 帯域とシフト後中心周波数の重ね描き図（入力連動の動的SVG） --------------------------
// 周波数軸上に「元のVSWR≤2帯域（帯）」と「シフト後の中心周波数レンジ（矢印帯）」を
// 同じスケールで描く。レンジが帯の左端からはみ出す＝離調で帯域外に落ちることが視覚で伝わる。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目: v4 R4方式）。

function tickStepMHz(span: number): number {
  const candidates = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000];
  const target = span / 5;
  return candidates.find((step) => step >= target) ?? 5000;
}

function DetuningBandDiagram({
  centerMHz,
  bandwidthMHz,
  shiftMinMHz,
  shiftMaxMHz,
  staysInBand
}: {
  centerMHz: number;
  bandwidthMHz: number;
  shiftMinMHz: number;
  shiftMaxMHz: number;
  staysInBand: DetuningEstimate["staysInBand"];
}) {
  const chart = { width: 640, height: 250, top: 24, bottom: 44, left: 20, right: 20 };
  const bandLow = centerMHz - bandwidthMHz / 2;
  const bandHigh = centerMHz + bandwidthMHz / 2;
  const shiftedNear = centerMHz + shiftMinMHz; // 絶対値が小さい側（右）
  const shiftedFar = centerMHz + shiftMaxMHz; // 絶対値が大きい側（左）

  const rawMin = Math.min(bandLow, shiftedFar);
  const pad = Math.max((bandHigh - rawMin) * 0.08, 1);
  const domainMin = rawMin - pad;
  const domainMax = bandHigh + pad;
  const span = domainMax - domainMin;
  const plotWidth = chart.width - chart.left - chart.right;
  const x = (f: number) => chart.left + ((f - domainMin) / span) * plotWidth;

  const axisY = chart.height - chart.bottom; // 206
  const bandTop = 46;
  const bandBottom = 118;
  const shiftTop = 140;
  const shiftBottom = 162;
  const shiftMidY = (shiftTop + shiftBottom) / 2;

  const tone =
    staysInBand === "yes"
      ? { fill: diagramPalette.success, stroke: diagramPalette.successDeep }
      : staysInBand === "partial"
        ? { fill: diagramPalette.amberSoft, stroke: diagramPalette.amberDeep }
        : { fill: diagramPalette.loss, stroke: diagramPalette.dangerDeep };

  const step = tickStepMHz(span);
  const firstTick = Math.ceil(domainMin / step) * step;
  const ticks: number[] = [];
  for (let t = firstTick; t <= domainMax; t += step) {
    ticks.push(t);
  }

  const arrowTipX = x(shiftedNear) + 2;

  return (
    <svg
      role="img"
      aria-label={`元のVSWR≤2帯域 ${formatNumber(bandLow, 1)}〜${formatNumber(bandHigh, 1)}MHz と、シフト後の中心周波数レンジ ${formatNumber(shiftedFar, 1)}〜${formatNumber(shiftedNear, 1)}MHz の位置関係`}
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />

      {/* 周波数軸 */}
      <line x1={chart.left} x2={chart.width - chart.right} y1={axisY} y2={axisY} stroke={diagramPalette.faint} />
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={x(tick)} x2={x(tick)} y1={axisY} y2={axisY + 5} stroke={diagramPalette.faint} />
          <text
            x={x(tick)}
            y={axisY + 18}
            textAnchor="middle"
            fill={diagramPalette.muted}
            fontSize={10}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {tick}
          </text>
        </g>
      ))}
      <text
        x={chart.width - chart.right}
        y={axisY - 8}
        textAnchor="end"
        fill={diagramPalette.muted}
        fontSize={11}
        fontWeight={600}
      >
        周波数 [MHz]
      </text>

      {/* 元のVSWR≤2帯域（帯） */}
      <text x={x(bandHigh)} y={40} textAnchor="end" fill={diagramPalette.stafDark} fontSize={11} fontWeight={600}>
        元のVSWR≤2帯域（f₀ ± BW/2）
      </text>
      <rect
        x={x(bandLow)}
        y={bandTop}
        width={Math.max(2, x(bandHigh) - x(bandLow))}
        height={bandBottom - bandTop}
        rx={6}
        fill={diagramPalette.skyFill}
        opacity={0.55}
        stroke={diagramPalette.skyStroke}
        strokeWidth={1.5}
      />
      <text
        x={x(bandLow)}
        y={132}
        textAnchor="middle"
        fill={diagramPalette.muted}
        fontSize={10}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatNumber(bandLow, 1)}
      </text>
      <text
        x={x(bandHigh)}
        y={132}
        textAnchor="middle"
        fill={diagramPalette.muted}
        fontSize={10}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatNumber(bandHigh, 1)}
      </text>

      {/* 元の中心周波数 f₀ */}
      <line
        x1={x(centerMHz)}
        x2={x(centerMHz)}
        y1={bandTop - 4}
        y2={shiftBottom}
        stroke={diagramPalette.stafDark}
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />
      <text
        x={x(centerMHz) + 5}
        y={bandTop + 14}
        fill={diagramPalette.stafDark}
        fontSize={11}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        f₀ {formatNumber(centerMHz, 1)}
      </text>

      {/* シフト後の中心周波数レンジ（矢印帯）。低周波側へだけ動く */}
      <rect
        x={x(shiftedFar)}
        y={shiftTop}
        width={Math.max(2, x(shiftedNear) - x(shiftedFar))}
        height={shiftBottom - shiftTop}
        rx={4}
        fill={tone.fill}
        opacity={0.85}
        stroke={tone.stroke}
        strokeWidth={1.5}
      />
      <line x1={x(centerMHz)} x2={arrowTipX + 8} y1={shiftMidY} y2={shiftMidY} stroke={tone.stroke} strokeWidth={1.5} />
      <polygon
        points={`${arrowTipX},${shiftMidY} ${arrowTipX + 8},${shiftMidY - 4.5} ${arrowTipX + 8},${shiftMidY + 4.5}`}
        fill={tone.stroke}
      />
      <text
        x={x(shiftedFar)}
        y={176}
        textAnchor="middle"
        fill={tone.stroke}
        fontSize={10}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatNumber(shiftedFar, 1)}
      </text>
      <text
        x={x(shiftedNear)}
        y={176}
        textAnchor="middle"
        fill={tone.stroke}
        fontSize={10}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatNumber(shiftedNear, 1)}
      </text>
      <text x={x(shiftedFar)} y={192} fill={tone.stroke} fontSize={10} fontWeight={600}>
        シフト後の中心周波数レンジ（低周波側へ移動）
      </text>
    </svg>
  );
}

export function DetuningEstimatorPanel() {
  // 既定は 920MHz・BW46MHz（比帯域5%）・樹脂カバー3mm: 「離して収める」成功例を最初に見せる。
  const [centerFrequencyMHz, setCenterFrequencyMHz] = useState(920);
  const [bandwidthMHz, setBandwidthMHz] = useState(46);
  const [scenarioId, setScenarioId] = useState<DetuningScenarioId>("resin-cover-3mm");

  const result = useMemo(() => {
    try {
      return estimateDetuning({
        centerFrequencyMHz,
        vswr2BandwidthMHz: bandwidthMHz,
        scenario: scenarioId
      });
    } catch {
      return null;
    }
  }, [centerFrequencyMHz, bandwidthMHz, scenarioId]);

  const currentScenario = DETUNING_SCENARIOS.find((scenario) => scenario.id === scenarioId);

  const centerError =
    !Number.isFinite(centerFrequencyMHz) || centerFrequencyMHz <= 0
      ? "中心周波数は0より大きい値を入力してください。"
      : undefined;
  const bandwidthError =
    !Number.isFinite(bandwidthMHz) || bandwidthMHz <= 0
      ? "帯域幅は0より大きい値を入力してください。"
      : undefined;

  const judgement = result ? JUDGEMENT_BY_BAND[result.staysInBand] : null;
  const primary = {
    label: "帯域内判定",
    value: judgement ? judgement.badge : "—"
  };

  const applyFractionalPreset = (percent: number) => {
    if (Number.isFinite(centerFrequencyMHz) && centerFrequencyMHz > 0) {
      setBandwidthMHz(Math.round(((centerFrequencyMHz * percent) / 100) * 10) / 10);
    }
  };

  const isFractionalActive = (percent: number) =>
    Number.isFinite(centerFrequencyMHz) &&
    centerFrequencyMHz > 0 &&
    Math.abs(bandwidthMHz - (centerFrequencyMHz * percent) / 100) < 0.05;

  const chipClass = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${
      active
        ? "border-staf bg-staf text-white"
        : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
    }`;

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            アンテナ単体（自由空間）で調整した中心周波数とVSWR≤2帯域幅を入れ、筐体・近接物の
            シナリオを選ぶと、共振の低周波側シフトで帯域から外れるかを判定します。
          </p>

          <div className="mt-5 space-y-4">
            <Field
              id="detuningCenterFrequency"
              label="中心周波数 f₀"
              unit="MHz"
              value={centerFrequencyMHz}
              min={1}
              step={1}
              emptyBehavior="preserve"
              onChange={setCenterFrequencyMHz}
              help="アンテナ単体で合わせ込んだ共振の中心です。離調のシフト量は周波数に比例するため、高い周波数ほど同じ率でも大きくずれます。"
              example="920"
              error={centerError}
            />
            <Field
              id="detuningBandwidth"
              label="VSWR≤2帯域幅 BW"
              unit="MHz"
              value={bandwidthMHz}
              min={0.1}
              step={1}
              emptyBehavior="preserve"
              onChange={setBandwidthMHz}
              help="整合が実用範囲（VSWR≤2）に収まる周波数の幅です。広いほど離調への「防御力」が高く、ずれても帯域内に残れます。"
              example="46"
              error={bandwidthError}
            />
            <div>
              <p className="text-xs font-semibold text-slate-500">
                帯域幅が不明な場合の比帯域プリセット（BW = f₀ × 比帯域）
              </p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="比帯域プリセット">
                {FRACTIONAL_BW_PRESETS.map((percent) => (
                  <button
                    key={percent}
                    type="button"
                    className={chipClass(isFractionalActive(percent))}
                    onClick={() => applyFractionalPreset(percent)}
                  >
                    比帯域{percent}%
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">
                近接物シナリオ（シフト率・VSWRは公開資料の典型レンジ）
              </p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="近接物シナリオ">
                {DETUNING_SCENARIOS.map((scenario) => (
                  <button
                    key={scenario.id}
                    type="button"
                    className={chipClass(scenarioId === scenario.id)}
                    onClick={() => setScenarioId(scenario.id)}
                  >
                    {scenario.label}
                  </button>
                ))}
              </div>
              {currentScenario ? (
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{currentScenario.note}</p>
              ) : null}
            </div>
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="detuning-primary-result">
            <ResultBar
              primary={primary}
              judgement={judgement && result ? { label: judgement.label, level: judgement.level } : undefined}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="想定シフト"
              value={
                result
                  ? `${formatNumber(result.shiftMinMHz, 1)}〜${formatNumber(result.shiftMaxMHz, 1)}`
                  : "—"
              }
              unit="MHz"
              sub="負値=低周波側への移動。誘電体・人体・金属は共振を必ず下げます。"
            />
            <MetricCard
              label="劣化後VSWR"
              value={
                result
                  ? `${formatNumber(result.vswrRange[0], 1)}〜${formatNumber(result.vswrRange[1], 1)}`
                  : "—"
              }
              sub="帯域内に残っても整合は劣化します。VSWR2で反射損失約0.5dB。"
            />
          </div>

          <Callout
            tone="caution"
            icon={<AlertTriangle aria-hidden="true" className="h-5 w-5 text-amber-700" />}
            title="この表の値は目安（実測前提）です"
          >
            <p>
              シフト率・VSWRレンジは公開資料の典型値の転記で、実際の離調は筐体材質・厚み・離隔・
              GND寸法・部品配置で大きく変わります。量産判断は必ず筐体込みの実測で行ってください。
              スタッフ株式会社では
              <a
                href={CONTACT_URL}
                className="mx-1 font-semibold text-staf-dark underline decoration-amber-300 underline-offset-2 transition hover:text-staf"
              >
                筐体込み評価のご相談
              </a>
              を承っています。
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
              {DETUNING_SOURCES.map((source) => (
                <li key={source.label}>
                  {source.href ? (
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline decoration-amber-300 underline-offset-2 hover:text-amber-800"
                    >
                      {source.label}
                    </a>
                  ) : (
                    <span className="font-semibold">{source.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </Callout>

          <Card as="section" padding="lg">
            <p className="text-sm leading-relaxed text-slate-600">
              金属面が近い実装では、離調に加えて放射そのものも変わります。
              <Link
                href="/tools/metal-plane-effect"
                className="mx-1 inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                金属面近接の利得変化
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
              で離隔と利得の関係も併せて確認できます。
            </p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="帯域図"
          title="元のVSWR≤2帯域とシフト後の中心周波数レンジ"
          description="上の帯が元のVSWR≤2帯域、下の矢印帯がシナリオによる中心周波数のシフトレンジです。矢印帯が上の帯の左端からはみ出すと、離調で帯域から外れます。入力に連動して動きます。"
          exportName="detuning-band"
          caption={
            result
              ? `条件: f₀=${formatNumber(centerFrequencyMHz, 1)}MHz / BW=${formatNumber(bandwidthMHz, 1)}MHz / ${currentScenario?.label ?? ""} ─ シフト ${formatNumber(result.shiftMinMHz, 1)}〜${formatNumber(result.shiftMaxMHz, 1)}MHz・判定「${judgement?.badge ?? ""}」。シフト率の出典は下記の公開資料（目安値・実測前提）。`
              : "入力値を確認してください。"
          }
        >
          {result ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <DetuningBandDiagram
                centerMHz={centerFrequencyMHz}
                bandwidthMHz={bandwidthMHz}
                shiftMinMHz={result.shiftMinMHz}
                shiftMaxMHz={result.shiftMaxMHz}
                staysInBand={result.staysInBand}
              />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              入力値を確認すると帯域図が表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜ筐体に入れると周波数が下へずれるのか"
          formula="シフト量[MHz] = f₀[MHz] × シフト率[%] / 100（負値=低周波側）　判定: |シフト量| ≤ BW/2 なら帯域内"
          showColumnLink={false}
        >
          <p>
            <strong>① 誘電体が近づくと共振は必ず下がります。</strong>
            アンテナは素子の長さと周囲の空間で共振周波数が決まります。樹脂や人体のような誘電体が
            近傍に来ると、電気力線の一部が誘電率の高い材料の中を通り、材料中では波長が縮む
            （波長短縮）ため、同じ素子が「電気的により長い」アンテナになります。長いアンテナは
            低い周波数で共振する——だからシフトは常に低周波側（負値）です。
          </p>
          <p>
            <strong>② ずれる量は周波数に比例します。</strong>
            離調は「何MHz」ではなく「何%」で起きる現象です。同じ樹脂カバー密着（-3〜-5%）でも、
            920MHzなら-27.6〜-46.0MHz、2.4GHz帯なら-73.5〜-122.5MHzずれます。
            高い周波数ほど、同じ筐体条件でも絶対量として大きく外れます。
          </p>
          <p>
            <strong>③ 帯域幅が「防御力」です。</strong>
            シフト後の中心周波数が元のVSWR≤2帯域（f₀ ± BW/2）に残っていれば、劣化はしても
            通信は成り立ちやすい。つまり |シフト量| ≤ BW/2 が判定式です。帯域の広いアンテナを
            選ぶ・カバーとの空隙を3mm以上確保する・あるいは筐体込みで再整合する、の3つが
            実務の対策です。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <DetuningEstimatorColumn />
      </div>

      <MobileResultBar
        primary={primary}
        judgement={judgement && result ? { label: judgement.label, level: judgement.level } : undefined}
        targetId="detuning-primary-result"
      />
    </>
  );
}

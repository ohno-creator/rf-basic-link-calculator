"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { SegmentedControl } from "@/components/SegmentedControl";
import { ToolColumnCard } from "@/components/ToolColumnCard";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import {
  buildReliabilityMarginTable,
  SHADOW_FADING_STD_PRESETS_DB,
  shadowingMarginDbByPercent,
  type ShadowFadingEnvironment
} from "@/lib/rf/shadowingMargin";
import { areaCoverageFraction, buildAreaCoverageTable, standardNormalCdf } from "@/lib/rf/areaCoverage";
import { inverseStandardNormalCdf } from "@/lib/rf/shadowingMargin";
import { formatNumber } from "@/lib/rf/format";
import { areaCoverageColumn } from "@/data/columns/areaCoverage";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { ShadowingMarginColumn } from "./ShadowingMarginColumn";

// σプリセット（lib SHADOW_FADING_STD_PRESETS_DB 準拠）。
// 出典: 開放4dB/郊外6dB は 3GPP TR 38.901 の σ_SF（LOS / UMa-NLOS）に対応、都市8dBは慣用値
// （Rappaport 教科書の市街地実測例 8dB 前後）。lib コメントを正とする。
const SIGMA_PRESETS: Array<{ env: ShadowFadingEnvironment; label: string }> = [
  { env: "urban", label: "都市 8dB" },
  { env: "suburban", label: "郊外 6dB" },
  { env: "open", label: "開放地 4dB" }
];

// 目標信頼率チップ（libの代表信頼率と同一）。
const RELIABILITY_CHOICES = [50, 80, 90, 95, 99] as const;

// ---- 対数正規シャドウイングの釣鐘曲線（入力連動の動的SVG） ---------------------------
// 横軸=受信レベルの中央値からのずれ[dB]（右ほど深い落ち込み）。シャドウイングは dB で
// 正規分布（=線形では対数正規）に従うため、σ で曲線の幅が変わり、信頼率で塗り面積
// （境界=必要マージン）が変わる。曲線は60分割のpolyline。高さは見やすさのため
// ピークを正規化した相対確率密度（面積の読みには影響しない旨をcaptionに明記）。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目: v4 R4方式）。

function ShadowingBellCurve({
  sigmaDb,
  reliabilityPercent,
  marginDb
}: {
  sigmaDb: number;
  reliabilityPercent: number;
  marginDb: number;
}) {
  const chart = { width: 640, height: 320, top: 48, right: 24, bottom: 56, left: 24 };
  const X_MAX = 30; // σ=12dB・99%でもマージン27.9dBで枠内に収まる固定レンジ
  const plotW = chart.width - chart.left - chart.right;
  const plotH = chart.height - chart.top - chart.bottom;
  const baselineY = chart.height - chart.bottom;
  const x = (v: number) => chart.left + ((v + X_MAX) / (2 * X_MAX)) * plotW;
  const y = (g: number) => baselineY - g * plotH * 0.92;
  const gauss = (v: number) => Math.exp(-(v * v) / (2 * sigmaDb * sigmaDb));

  const POINTS = 60;
  const curve: Array<[number, number]> = Array.from({ length: POINTS + 1 }, (_, i) => {
    const v = -X_MAX + (i * 2 * X_MAX) / POINTS;
    return [v, gauss(v)];
  });
  const curvePoints = curve.map(([v, g]) => `${x(v).toFixed(1)},${y(g).toFixed(1)}`).join(" ");

  const boundary = Math.min(marginDb, X_MAX);
  const boundaryX = x(boundary);
  const areaPath = [
    `M ${x(-X_MAX).toFixed(1)} ${baselineY.toFixed(1)}`,
    ...curve.filter(([v]) => v < boundary).map(([v, g]) => `L ${x(v).toFixed(1)} ${y(g).toFixed(1)}`),
    `L ${boundaryX.toFixed(1)} ${y(gauss(boundary)).toFixed(1)}`,
    `L ${boundaryX.toFixed(1)} ${baselineY.toFixed(1)}`,
    "Z"
  ].join(" ");
  const tailPath = [
    `M ${boundaryX.toFixed(1)} ${baselineY.toFixed(1)}`,
    `L ${boundaryX.toFixed(1)} ${y(gauss(boundary)).toFixed(1)}`,
    ...curve.filter(([v]) => v > boundary).map(([v, g]) => `L ${x(v).toFixed(1)} ${y(g).toFixed(1)}`),
    `L ${x(X_MAX).toFixed(1)} ${baselineY.toFixed(1)}`,
    "Z"
  ].join(" ");

  const ticks = [-30, -20, -10, 0, 10, 20, 30];
  const dimY = 34;
  const dimWidth = boundaryX - x(0);
  const marginLabel = `マージン ${formatNumber(marginDb, 1)}dB`;

  return (
    <svg
      role="img"
      aria-label={`シャドウイングの分布（dBで正規分布）。σ${formatNumber(sigmaDb, 1)}dB・信頼率${reliabilityPercent}%で必要マージン${formatNumber(marginDb, 1)}dB`}
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />

      {/* 縦グリッドと目盛り */}
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={x(tick)} x2={x(tick)} y1={chart.top} y2={baselineY} stroke={chartTheme.grid.primary} />
          <text
            x={x(tick)}
            y={baselineY + 16}
            textAnchor="middle"
            fill={diagramPalette.muted}
            fontSize={11}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {tick > 0 ? `+${tick}` : tick}
          </text>
        </g>
      ))}
      <line x1={chart.left} x2={chart.width - chart.right} y1={baselineY} y2={baselineY} stroke={diagramPalette.faint} />

      {/* 塗り＝信頼率（マージン内に収まる割合）／右の淡い赤＝不足分 */}
      <path d={areaPath} fill={chartTheme.series.source} opacity={0.3} />
      <path d={tailPath} fill={chartTheme.series.loss} opacity={0.25} />

      {/* 釣鐘曲線（dBで正規分布） */}
      <polyline
        points={curvePoints}
        fill="none"
        stroke={chartTheme.series.source}
        strokeWidth={chartTheme.stroke.series}
      />

      {/* 中央値（ずれ0dB）の基準線 */}
      <line
        x1={x(0)}
        x2={x(0)}
        y1={38}
        y2={baselineY}
        stroke={chartTheme.reference.baseline}
        strokeDasharray={chartTheme.reference.baselineDash}
      />
      <text x={x(0) - 6} y={46} textAnchor="end" fill={diagramPalette.muted} fontSize={11}>
        中央値
      </text>

      {/* マージン境界の垂直線＋寸法ラベル（v4-6 直接ラベリング） */}
      <line x1={boundaryX} x2={boundaryX} y1={38} y2={baselineY} stroke={chartTheme.seriesText.source} strokeWidth={2} />
      {dimWidth >= 4 ? (
        <g>
          <line x1={x(0)} x2={boundaryX} y1={dimY} y2={dimY} stroke={chartTheme.seriesText.source} strokeWidth={1.5} />
          <line x1={x(0)} x2={x(0)} y1={dimY - 4} y2={dimY + 4} stroke={chartTheme.seriesText.source} strokeWidth={1.5} />
          <line x1={boundaryX} x2={boundaryX} y1={dimY - 4} y2={dimY + 4} stroke={chartTheme.seriesText.source} strokeWidth={1.5} />
        </g>
      ) : null}
      {dimWidth >= 76 ? (
        <text
          x={(x(0) + boundaryX) / 2}
          y={26}
          textAnchor="middle"
          fill={chartTheme.seriesText.source}
          fontSize={12}
          fontWeight={700}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {marginLabel}
        </text>
      ) : (
        <text
          x={boundaryX + 8}
          y={26}
          textAnchor="start"
          fill={chartTheme.seriesText.source}
          fontSize={12}
          fontWeight={700}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {marginLabel}
        </text>
      )}

      {/* σバッジ（曲線の幅を決める入力値） */}
      <text
        x={chart.width - chart.right}
        y={26}
        textAnchor="end"
        fill={diagramPalette.ink}
        fontSize={12}
        fontWeight={600}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        σ={formatNumber(sigmaDb, 1)}dB
      </text>

      {/* 面積の直接ラベル */}
      <text
        x={x(-sigmaDb * 0.6)}
        y={baselineY - plotH * 0.3}
        textAnchor="middle"
        fill={chartTheme.seriesText.source}
        fontSize={12}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        成立 {reliabilityPercent}%
      </text>
      <text
        x={chart.width - chart.right}
        y={baselineY - 10}
        textAnchor="end"
        fill={chartTheme.seriesText.loss}
        fontSize={11}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        不足 {100 - reliabilityPercent}%
      </text>

      {/* 横軸の意味（左右の向き） */}
      <text x={chart.left} y={baselineY + 34} textAnchor="start" fill={diagramPalette.faint} fontSize={10}>
        ← 中央値より強い
      </text>
      <text
        x={chart.width / 2}
        y={baselineY + 36}
        textAnchor="middle"
        fill={diagramPalette.muted}
        fontSize={12}
        fontWeight={600}
      >
        受信レベルの中央値からのずれ [dB]
      </text>
      <text x={chart.width - chart.right} y={baselineY + 34} textAnchor="end" fill={diagramPalette.faint} fontSize={10}>
        中央値より弱い →
      </text>
    </svg>
  );
}

function AreaCoverageDisk({ edgeReliability, sigmaDb, pathLossExponent }: { edgeReliability: number; sigmaDb: number; pathLossExponent: number }) {
  const a = inverseStandardNormalCdf(edgeReliability);
  const b = (10 * pathLossExponent) / (sigmaDb * Math.LN10);
  const rings = Array.from({ length: 16 }, (_, index) => {
    const outer = 150 * (1 - index / 16);
    const t = Math.max(1 / 32, (outer - 150 / 32) / 150);
    return { radius: outer, reliability: standardNormalCdf(a - b * Math.log(t)) };
  });
  const areaPercent = areaCoverageFraction(edgeReliability, sigmaDb, pathLossExponent) * 100;
  return <svg role="img" viewBox="0 0 420 380" className="mx-auto h-auto w-full max-w-xl" data-testid="area-coverage-disk" data-area-coverage={areaPercent.toFixed(2)}>
    <rect width="420" height="380" fill={chartTheme.surface.canvas} />
    {rings.map((ring, index) => <circle key={index} cx="210" cy="175" r={ring.radius} fill={chartTheme.series.source} opacity={0.12 + ring.reliability * 0.78} />)}
    <circle cx="210" cy="175" r="150" fill="none" stroke={diagramPalette.inkSoft} strokeWidth="2" />
    <circle cx="210" cy="175" r="4" fill={diagramPalette.ink} />
    <text x="210" y="350" textAnchor="middle" fill={diagramPalette.ink} fontSize="16" fontWeight="700">面積被覆率 {formatNumber(areaPercent, 2)}%</text>
    <text x="210" y="32" textAnchor="middle" fill={diagramPalette.inkSoft} fontSize="12">中心≈100% ／ セル端 {formatNumber(edgeReliability * 100, 0)}%</text>
  </svg>;
}

export function ShadowingMarginPanel() {
  const [mode, setMode] = useState<"standard" | "expert">("standard");
  // 既定は 都市σ=8dB・信頼率90%（マージン ≈ 10.3dB）: セル設計の代表的な出発点。
  const [sigmaDb, setSigmaDb] = useState(SHADOW_FADING_STD_PRESETS_DB.urban);
  const [reliabilityPercent, setReliabilityPercent] = useState<number>(90);
  const [pathLossExponent, setPathLossExponent] = useState(3);

  const marginDb = useMemo(() => {
    try {
      return shadowingMarginDbByPercent(sigmaDb, reliabilityPercent);
    } catch {
      return null;
    }
  }, [sigmaDb, reliabilityPercent]);

  // 信頼率50/80/90/95/99%の一覧表（現在のσで計算）。
  const marginTable = useMemo(() => {
    try {
      return buildReliabilityMarginTable(sigmaDb);
    } catch {
      return null;
    }
  }, [sigmaDb]);
  const areaTable = useMemo(() => {
    try { return buildAreaCoverageTable(sigmaDb, pathLossExponent); } catch { return null; }
  }, [sigmaDb, pathLossExponent]);

  const sigmaError =
    !Number.isFinite(sigmaDb) || sigmaDb < 0
      ? "σは0以上の値をdBで入力してください。"
      : undefined;

  const primary = {
    label: "必要マージン",
    value: marginDb === null ? "—" : formatNumber(marginDb, 1),
    unit: "dB"
  };

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
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3"><h2 className="text-base font-bold text-slate-950">入力条件</h2><SegmentedControl options={[{id:"standard",label:"標準"},{id:"expert",label:"エキスパート"}]} value={mode} onChange={setMode} ariaLabel="シャドウイング計算モード" /></div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            必要マージンは2つだけで決まります。①受信レベルが場所ごとにどれだけばらつくか（σ）
            ②そのばらつきの中で何%の地点・時間まで通信を成立させたいか（目標信頼率）。
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">
              環境からσを選ぶ（開放地4dB/郊外6dBは3GPP TR 38.901のσ_SF、都市8dBは慣用値）
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="σプリセット">
              {SIGMA_PRESETS.map(({ env, label }) => (
                <button
                  key={env}
                  type="button"
                  className={chipClass(Math.abs(sigmaDb - SHADOW_FADING_STD_PRESETS_DB[env]) < 0.01)}
                  onClick={() => setSigmaDb(SHADOW_FADING_STD_PRESETS_DB[env])}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <Field
              id="shadowSigma"
              label="シャドウイング標準偏差 σ"
              unit="dB"
              value={sigmaDb}
              min={2}
              max={12}
              step={0.5}
              showSlider
              emptyBehavior="preserve"
              onChange={setSigmaDb}
              help="同じ距離でも建物・地形・人・駐車車両などの遮蔽で受信レベルは場所ごとにばらつきます。そのばらつきの大きさ（dBで測った標準偏差）がσです。遮蔽物が多い環境ほど大きくなります。"
              example="8"
              error={sigmaError}
            />
          </div>
          {mode === "expert" ? <div className="mt-5"><p className="text-xs font-semibold text-slate-500">伝搬指数 n</p><div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="伝搬指数">{[2,3,3.5,4].map((value)=><button key={value} type="button" onClick={()=>setPathLossExponent(value)} className={chipClass(pathLossExponent===value)}>{value}</button>)}</div><p className="mt-2 text-xs text-slate-500">中央値パスロスが距離のn乗で増える円形セル近似に使います。</p></div> : null}

          <div className="mt-5">
            <p className="text-xs font-semibold text-slate-500">
              目標信頼率（何%の地点・時間で通信を成立させたいか）
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="目標信頼率">
              {RELIABILITY_CHOICES.map((percent) => (
                <button
                  key={percent}
                  type="button"
                  className={chipClass(reliabilityPercent === percent)}
                  onClick={() => setReliabilityPercent(percent)}
                >
                  {percent}%
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              50%はマージン0dB（中央値ちょうど）。高い信頼率ほど必要マージンは急に増えます（90%で約1.28σ、99%で約2.33σ）。
            </p>
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="shadowing-margin-primary-result">
            <ResultBar primary={primary} />
          </div>

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">信頼率別の必要マージン（現在のσ）</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              必要マージン = σ×Φ⁻¹(信頼率)。信頼率を上げるほど係数zが伸び、マージンが積み上がります。
            </p>
            <div className="mt-3 space-y-1.5">
              {mode === "expert" ? <div className="grid grid-cols-[52px_1fr_88px_92px] gap-3 px-2 text-xs font-semibold text-slate-500"><span>端信頼率</span><span>z</span><span>マージン</span><span>面積被覆</span></div> : null}
              <div data-testid={mode === "expert" ? "area-coverage-table" : undefined} className="space-y-1.5">{(marginTable ?? []).map((row) => {
                const isCurrent = row.reliabilityPercent === reliabilityPercent;
                const area = areaTable?.find((item) => item.reliabilityPercent === row.reliabilityPercent);
                return (
                  <div
                    key={row.reliabilityPercent}
                    className={`grid ${mode === "expert" ? "grid-cols-[52px_1fr_88px_92px]" : "grid-cols-[52px_1fr_88px]"} items-center gap-3 rounded-lg px-2 py-1 text-sm ${
                      isCurrent ? "bg-staf-light ring-1 ring-staf/40" : ""
                    }`}
                  >
                    <span className={isCurrent ? "font-semibold text-staf-dark" : "text-slate-600"}>
                      {row.reliabilityPercent}%
                    </span>
                    <span className="text-xs tabular-nums text-slate-500">
                      z = {formatNumber(row.z, 2)}
                    </span>
                    <span className="text-right font-semibold tabular-nums text-slate-900">
                      {formatNumber(row.marginDb, 1)}dB
                    </span>
                    {mode === "expert" ? <span className="text-right font-semibold tabular-nums text-staf-dark">{area ? formatNumber(area.areaCoveragePercent, 2) : "—"}%</span> : null}
                  </div>
                );
              })}</div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              求めたマージンは、
              <Link
                href="/tools/rf-basic-link-calculator"
                className="mx-1 inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                リンクバジェット診断
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
              のリンク余裕がこの値以上あるかの判断基準に使えます。
            </p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="分布図"
          title="シャドウイングの釣鐘曲線と必要マージン"
          description="横軸は受信レベルが中央値からどれだけずれるか（右ほど深い落ち込み）。ばらつきはdBで正規分布（対数正規）に従い、σを変えると曲線の幅が、信頼率を変えると塗り面積（境界＝必要マージン）が動きます。"
          exportName="shadowing-margin-bell"
          caption={
            marginDb !== null && sigmaDb > 0
              ? `条件: σ=${formatNumber(sigmaDb, 1)}dB / 信頼率${reliabilityPercent}% ─ 必要マージン ${formatNumber(marginDb, 1)}dB。青い塗り面積が「マージン内に収まって成立する割合」に対応します。縦方向は見やすさのためピークを正規化した相対確率密度です。`
              : "入力値を確認してください。"
          }
        >
          {marginDb !== null && sigmaDb > 0 ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <ShadowingBellCurve
                sigmaDb={sigmaDb}
                reliabilityPercent={reliabilityPercent}
                marginDb={marginDb}
              />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              入力値を確認すると分布図が表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      {mode === "expert" && sigmaDb > 0 ? <div className="mt-6"><ChartFrame eyebrow="エリアカバレッジ" title="セル中心から端までの局所信頼率" description="円形セル内で、中心ほど余裕が大きく、端で指定した信頼率になる様子です。面積は半径の二乗で効くため、端50%でも全体の被覆率は50%を上回ります。" exportName="shadowing-area-coverage"><AreaCoverageDisk edgeReliability={reliabilityPercent/100} sigmaDb={sigmaDb} pathLossExponent={pathLossExponent}/></ChartFrame></div> : null}

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜσと信頼率だけでマージンが決まるのか"
          formula="必要マージン[dB] = σ[dB] × Φ⁻¹(信頼率)　（90%→約1.28σ / 95%→約1.64σ / 99%→約2.33σ）"
          showColumnLink={false}
        >
          <p>
            <strong>① 同じ場所でも、受信レベルは一定ではありません。</strong>
            送信も距離も同じなのに、日や置き方で受信レベルは変わります。周囲の建物、人、駐車車両などの
            遮蔽物が電波の通り道を変えるためで、この中央値まわりのばらつきを<strong>シャドウイング</strong>
            と呼びます。距離で決まる平均的な減衰（伝搬損失）とは別物です。
          </p>
          <p>
            <strong>② ばらつきはdBで測ると正規分布（＝対数正規）に従い、σがその大きさです。</strong>
            経路上のたくさんの遮蔽の影響は、線形では掛け算、dBでは足し算になります。多数の独立な足し算は
            釣鐘型の正規分布に近づく（中心極限定理）ため、シャドウイングはdBの目盛りで正規分布になります。
            その標準偏差σは、都市部で8dB前後、開けた土地で4dB前後が目安です。
          </p>
          <p>
            <strong>③ 「何%で成立させたいか」を決めると、マージンは自動的に決まります。</strong>
            マージンは電波の<strong>保険料</strong>のようなものです。σはその土地の事故率（リスクの大きさ）、
            信頼率は補償したい範囲で、リスクが高い土地ほど・広い補償を望むほど保険料（マージン）は上がります。
            数式では、正規分布の面積が信頼率に達する位置 Φ⁻¹(信頼率) にσを掛けるだけです。
            ※このたとえには破れがあります。保険は事故が起きたときにお金が戻りますが、マージンは戻りません
            ——送信電力の増強や距離の短縮という設計コストとして、通信するたびに払い続ける前払いの余裕です。
          </p>
          <p>
            結論: 必要マージン = σ×Φ⁻¹(信頼率)。90%なら約1.28σ、99%なら約2.33σ。信頼率を欲張るほど
            マージンは急激に高くつくため、「どこまで守るか」を先に宣言するのがリンク設計の作法です。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <ShadowingMarginColumn />
      </div>
      {mode === "expert" ? <div className="mt-6"><ToolColumnCard column={areaCoverageColumn} live={{ areaCoverage: `${formatNumber(areaCoverageFraction(reliabilityPercent/100,sigmaDb,pathLossExponent)*100,2)}%` }} /></div> : null}

      <MobileResultBar primary={primary} targetId="shadowing-margin-primary-result" />
    </>
  );
}

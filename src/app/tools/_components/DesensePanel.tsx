"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { Stat } from "@/components/Stat";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import {
  combineNoisePowersDbm,
  desenseDb,
  rangeRatioFromDesenseDb,
  rangeReductionPercentFromDesenseDb
} from "@/lib/rf/desense";
import { formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { ToolColumnCard } from "@/components/ToolColumnCard";
import { desenseColumn } from "@/data/columns/desense";

// 経路損失指数 n の代表値（出典: T. Rappaport, "Wireless Communications: Principles and
// Practice," 2nd ed., Table 4.2。自由空間 n=2、市街地セルラー n≈2.7–3.5、建物内 n≈3–5）。
// チップは代表整数のみを固い値として提示する（連続値はスライダーではなく式で扱う）。
const PATH_LOSS_PRESETS = [
  { n: 2, label: "n=2 自由空間" },
  { n: 3, label: "n=3 市街地" },
  { n: 4, label: "n=4 屋内・多重" }
] as const;

// 干渉レベルを「フロアからの相対」で置くクイックプリセット。値は電力加算の定理から一意に決まる
// （同レベル→+3.01dB、−10dB→+0.41dB、−20dB→+0.04dB）。デセンスの非線形さを一撃で見せるための導線。
const INTERFERENCE_OFFSETS = [
  { offset: 0, label: "フロアと同じ（+3.0dB）" },
  { offset: -10, label: "フロア−10dB（+0.4dB）" },
  { offset: -20, label: "フロア−20dB（+0.04dB）" }
] as const;

// ---- 水面上昇ダイアグラム（入力連動の動的SVG） -------------------------------------
// 左: 元のノイズフロア（雑音の水面）、中: 干渉レベル、右: 電力加算で持ち上がった合成フロア。
// 右バーには元フロア線からの上昇分 Δ を寸法ブラケットで直接ラベリングする。テキストは属性直指定で、
// 書き出したSVG単体でも画面と同じ見た目になるようにする（v4 R4方式）。

function WaterRiseDiagram({
  noiseFloorDbm,
  interferenceDbm,
  combinedDbm,
  desense
}: {
  noiseFloorDbm: number;
  interferenceDbm: number;
  combinedDbm: number;
  desense: number;
}) {
  const chart = { width: 660, height: 340, top: 30, right: 116, bottom: 54, left: 52, barWidth: 66 };
  const values = [noiseFloorDbm, interferenceDbm, combinedDbm];
  const axisMax = Math.ceil((Math.max(...values) + 8) / 5) * 5;
  const axisMin = Math.floor((Math.min(...values) - 8) / 5) * 5;
  const span = Math.max(1, axisMax - axisMin);
  const plotHeight = chart.height - chart.top - chart.bottom;
  const plotWidth = chart.width - chart.left - chart.right;
  const slotWidth = plotWidth / 3;
  const y = (v: number) => chart.top + ((axisMax - v) / span) * plotHeight;
  const centerX = (i: number) => chart.left + slotWidth * (i + 0.5);
  const barX = (i: number) => centerX(i) - chart.barWidth / 2;
  const baseY = y(axisMin);
  const floorY = y(noiseFloorDbm);
  const combinedY = y(combinedDbm);
  const ticks = Array.from({ length: Math.floor(span / 5) + 1 }, (_, i) => axisMax - i * 5);

  const bars = [
    {
      value: noiseFloorDbm,
      label: "元フロア N",
      fill: chartTheme.series.source,
      stroke: chartTheme.seriesText.source
    },
    {
      value: interferenceDbm,
      label: "干渉 I",
      fill: chartTheme.series.loss,
      stroke: chartTheme.seriesText.loss
    },
    {
      value: combinedDbm,
      label: "合成フロア N′",
      fill: chartTheme.series.total,
      stroke: chartTheme.seriesText.total
    }
  ];

  // Δ寸法ブラケットは右バー（合成フロア）の右脇に置く。
  const bracketX = barX(2) + chart.barWidth + 12;

  return (
    <svg
      role="img"
      aria-label={`水面上昇図。元フロア${formatNumber(noiseFloorDbm, 1)}dBm、干渉${formatNumber(interferenceDbm, 1)}dBm、合成フロア${formatNumber(combinedDbm, 1)}dBm、デセンス+${formatNumber(desense, 1)}dB`}
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={chart.left}
            x2={chart.width - chart.right}
            y1={y(tick)}
            y2={y(tick)}
            stroke={chartTheme.grid.primary}
          />
          <text
            x={chart.left - 8}
            y={y(tick) + 4}
            textAnchor="end"
            fill={diagramPalette.muted}
            fontSize={11}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {tick}
          </text>
        </g>
      ))}
      <text x={chart.left} y={chart.top - 12} fill={diagramPalette.muted} fontSize={12} fontWeight={600}>
        dBm
      </text>

      {/* 元フロアの水平基準線（比較の起点。合成フロアはこの線から Δ だけ持ち上がる） */}
      <line
        x1={chart.left}
        x2={chart.width - chart.right}
        y1={floorY}
        y2={floorY}
        stroke={chartTheme.reference.baseline}
        strokeDasharray={chartTheme.reference.baselineDash}
      />

      {bars.map((bar, index) => {
        const top = y(bar.value);
        const height = Math.max(3, baseY - top);
        return (
          <g key={bar.label}>
            {/* 水柱: 下端（軸最小）から水面（値）まで塗る */}
            <rect
              x={barX(index)}
              y={top}
              width={chart.barWidth}
              height={height}
              rx={5}
              fill={bar.fill}
              stroke={bar.stroke}
              strokeWidth={1.5}
              opacity={0.9}
            />
            {/* 水面ライン（濃色で強調） */}
            <line
              x1={barX(index)}
              x2={barX(index) + chart.barWidth}
              y1={top}
              y2={top}
              stroke={bar.stroke}
              strokeWidth={2}
            />
            <text
              x={centerX(index)}
              y={top - 8}
              textAnchor="middle"
              fill={bar.stroke}
              fontSize={12}
              fontWeight={700}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatNumber(bar.value, 1)}
            </text>
            <text
              x={centerX(index)}
              y={chart.height - 30}
              textAnchor="middle"
              fill={diagramPalette.inkSoft}
              fontSize={12}
              fontWeight={600}
            >
              {bar.label}
            </text>
          </g>
        );
      })}

      {/* Δ寸法ブラケット（元フロア線 → 合成フロア水面） */}
      <g>
        <line x1={bracketX} x2={bracketX} y1={combinedY} y2={floorY} stroke={chartTheme.seriesText.total} strokeWidth={1.5} />
        <line x1={bracketX - 5} x2={bracketX + 5} y1={floorY} y2={floorY} stroke={chartTheme.seriesText.total} strokeWidth={1.5} />
        <line x1={bracketX - 5} x2={bracketX + 5} y1={combinedY} y2={combinedY} stroke={chartTheme.seriesText.total} strokeWidth={1.5} />
        <text
          x={bracketX + 10}
          y={(floorY + combinedY) / 2 - 4}
          fill={chartTheme.seriesText.loss}
          fontSize={13}
          fontWeight={700}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          Δ +{formatNumber(desense, 1)}
        </text>
        <text x={bracketX + 10} y={(floorY + combinedY) / 2 + 12} fill={diagramPalette.muted} fontSize={11} fontWeight={600}>
          dB 上昇
        </text>
      </g>
    </svg>
  );
}

// ---- デセンス非線形カーブ（干渉とフロアの差 → Δ）polyline 50点 -----------------------
// Δ は絶対値でなく「干渉 − フロア」の差 d だけで決まる: Δ = 10log₁₀(1 + 10^(d/10))。
// 同レベル(d=0)で+3dB、10dB下(d=-10)で+0.4dBという非線形の急坂を1枚で見せ、現在点を打つ。

function DesenseCurve({ deltaDb }: { deltaDb: number }) {
  const chart = { width: 620, height: 300, top: 26, right: 24, bottom: 46, left: 48 };
  const dMin = -25;
  const dMax = 15;
  const yMax = 12;
  const yMin = 0;
  const plotW = chart.width - chart.left - chart.right;
  const plotH = chart.height - chart.top - chart.bottom;
  const xPix = (d: number) => chart.left + ((d - dMin) / (dMax - dMin)) * plotW;
  const yPix = (v: number) => chart.top + ((yMax - v) / (yMax - yMin)) * plotH;

  const points = Array.from({ length: 50 }, (_, i) => {
    const d = dMin + ((dMax - dMin) * i) / 49;
    // Δ = combineNoisePowersDbm(0, d) = 10log₁₀(1 + 10^(d/10))（lib再利用で生の指数演算を避ける）
    const delta = combineNoisePowersDbm(0, d);
    return `${xPix(d).toFixed(1)},${yPix(delta).toFixed(1)}`;
  }).join(" ");

  // 現在の d（干渉−フロア）を Δ から復元して現在点を打つ:
  // Δ=10log₁₀(1+10^(d/10)) ⇒ 10^(d/10)=10^(Δ/10)−1 ⇒ d=10log₁₀(10^(Δ/10)−1)。
  const ratio = 10 ** (deltaDb / 10) - 1;
  const dNow = ratio > 0 ? 10 * Math.log10(ratio) : dMin;
  const markerD = Math.max(dMin, Math.min(dMax, dNow));
  const xTicks = [-20, -10, 0, 10];
  const yTicks = [0, 3, 6, 9, 12];

  return (
    <svg
      role="img"
      aria-label={`干渉とフロアの差に対するデセンス量のカーブ。現在のデセンスは+${formatNumber(deltaDb, 1)}dB`}
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />
      {yTicks.map((t) => (
        <g key={`y${t}`}>
          <line x1={chart.left} x2={chart.width - chart.right} y1={yPix(t)} y2={yPix(t)} stroke={chartTheme.grid.primary} />
          <text x={chart.left - 8} y={yPix(t) + 4} textAnchor="end" fill={diagramPalette.muted} fontSize={11} style={{ fontVariantNumeric: "tabular-nums" }}>
            {t}
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <g key={`x${t}`}>
          <line x1={xPix(t)} x2={xPix(t)} y1={chart.top} y2={chart.height - chart.bottom} stroke={chartTheme.grid.primary} />
          <text x={xPix(t)} y={chart.height - chart.bottom + 18} textAnchor="middle" fill={diagramPalette.muted} fontSize={11} style={{ fontVariantNumeric: "tabular-nums" }}>
            {t > 0 ? `+${t}` : t}
          </text>
        </g>
      ))}
      <text x={chart.left} y={chart.top - 10} fill={diagramPalette.muted} fontSize={12} fontWeight={600}>
        デセンス Δ [dB]
      </text>
      <text x={chart.width - chart.right} y={chart.height - 8} textAnchor="end" fill={diagramPalette.muted} fontSize={11} fontWeight={600}>
        干渉 − フロア [dB]
      </text>

      <polyline points={points} fill="none" stroke={chartTheme.series.total} strokeWidth={chartTheme.stroke.series} />

      {/* 現在点マーカー（白ハロー付き） */}
      <circle cx={xPix(markerD)} cy={yPix(Math.min(yMax, deltaDb))} r={5} fill={chartTheme.series.loss} stroke={chartTheme.surface.plain} strokeWidth={2} />
      <text
        x={xPix(markerD) + 8}
        y={yPix(Math.min(yMax, deltaDb)) - 8}
        fill={chartTheme.seriesText.loss}
        fontSize={12}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        +{formatNumber(deltaDb, 1)}dB
      </text>
    </svg>
  );
}

export function DesensePanel() {
  // 既定は N=-120dBm・I=-120dBm（同レベル干渉）: デセンス+3dBという電力加算の基本を最初に見せる。
  const [noiseFloorDbm, setNoiseFloorDbm] = useState(-120);
  const [interferenceDbm, setInterferenceDbm] = useState(-120);
  const [pathLossExponent, setPathLossExponent] = useState(2);

  const result = useMemo(() => {
    try {
      const combined = combineNoisePowersDbm(noiseFloorDbm, interferenceDbm);
      const delta = desenseDb(noiseFloorDbm, interferenceDbm);
      const remainRatio = rangeRatioFromDesenseDb(delta, pathLossExponent);
      const reductionPercent = rangeReductionPercentFromDesenseDb(delta, pathLossExponent);
      return { combined, delta, remainRatio, reductionPercent };
    } catch {
      return null;
    }
  }, [noiseFloorDbm, interferenceDbm, pathLossExponent]);

  const floorError = !Number.isFinite(noiseFloorDbm)
    ? "元のノイズフロアを入力してください。"
    : undefined;
  const interferenceError = !Number.isFinite(interferenceDbm)
    ? "干渉レベルを入力してください。"
    : undefined;

  const primary = {
    label: "デセンス量（感度劣化）",
    value: result === null ? "—" : `+${formatNumber(result.delta, 1)}`,
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
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            雑音と干渉は<strong>dBのままでは足せません</strong>。いったら電力（mW）に戻して足し、dBmに戻します。
            その持ち上がった分が「デセンス量」＝受信感度の劣化です。干渉がフロアと同じ強さなら+3dB、
            10dB下なら+0.4dBしか上がらない——この非線形が勘所です。
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">
              干渉レベルのクイック設定（フロアからの相対・値は電力加算で一意）
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="干渉レベルのプリセット">
              {INTERFERENCE_OFFSETS.map(({ offset, label }) => (
                <button
                  key={offset}
                  type="button"
                  className={chipClass(
                    Number.isFinite(noiseFloorDbm) && Math.abs(interferenceDbm - (noiseFloorDbm + offset)) < 0.01
                  )}
                  onClick={() => {
                    if (Number.isFinite(noiseFloorDbm)) setInterferenceDbm(noiseFloorDbm + offset);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs font-semibold text-slate-500">経路損失指数 n（距離換算の前提）</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="経路損失指数プリセット">
              {PATH_LOSS_PRESETS.map(({ n, label }) => (
                <button
                  key={n}
                  type="button"
                  className={chipClass(pathLossExponent === n)}
                  onClick={() => setPathLossExponent(n)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Field
              id="desenseNoiseFloor"
              label="元のノイズフロア N"
              unit="dBm"
              value={noiseFloorDbm}
              min={-160}
              max={-40}
              step={1}
              emptyBehavior="preserve"
              onChange={setNoiseFloorDbm}
              help="干渉がないときの受信機の雑音の水面です。帯域幅とNFで決まります（-174+10log₁₀BW+NF）。分からなければ既定の-120dBm前後で構いません。"
              example="-120"
              error={floorError}
            />
            <Field
              id="desenseInterference"
              label="干渉レベル I"
              unit="dBm"
              value={interferenceDbm}
              min={-160}
              max={-40}
              step={1}
              showSlider
              emptyBehavior="preserve"
              onChange={setInterferenceDbm}
              help="受信帯域内に入り込む妨害波の電力です。基板のDC/DCノイズやクロック高調波、隣接無線の漏れなど。スライダーでフロアに近づけるほど急にデセンスが増えます。"
              example="-120"
              error={interferenceError}
            />
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="desense-primary-result">
            <ResultBar primary={primary} />
          </div>

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">合成フロアと距離への影響</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              感度が Δ 劣化すると、同じ送信電力で届く距離は 10^(−Δ/(10n)) 倍に縮みます（n は経路損失指数）。
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Stat
                label="合成ノイズフロア N′"
                value={result === null ? "—" : formatNumber(result.combined, 1)}
                unit="dBm"
                size="md"
                tone="rose"
              />
              <Stat
                label={`到達距離（元比・n=${pathLossExponent}）`}
                value={result === null ? "—" : formatNumber(result.remainRatio * 100, 1)}
                unit="%"
                size="md"
                tone="amber"
                note={result === null ? undefined : `−${formatNumber(result.reductionPercent, 1)}% 縮む`}
              />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              合成フロアを
              <Link
                href="/tools/noise-floor"
                className="mx-1 inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                ノイズフロア・受信感度
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
              の所要SNRと合わせると、劣化後の実効感度が求まります。
            </p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="水面上昇図"
          title="干渉が加わってノイズの水面が持ち上がる"
          description="左が元のフロア（雑音の水面）、中が干渉、右が電力で足し合わせた合成フロアです。右バーの Δ が感度の劣化そのもの。入力に連動して動きます。"
          exportName="desense-water-rise"
          caption={
            result
              ? `条件: 元フロア ${formatNumber(noiseFloorDbm, 1)}dBm / 干渉 ${formatNumber(interferenceDbm, 1)}dBm ─ 合成フロア ${formatNumber(result.combined, 1)}dBm・デセンス +${formatNumber(result.delta, 1)}dB`
              : "入力値を確認してください。"
          }
        >
          {result ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <WaterRiseDiagram
                noiseFloorDbm={noiseFloorDbm}
                interferenceDbm={interferenceDbm}
                combinedDbm={result.combined}
                desense={result.delta}
              />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              入力値を確認すると図が表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <ChartFrame
          eyebrow="非線形カーブ"
          title="干渉とフロアの差が10dBあれば、被害はほぼ無い"
          description="デセンス量は「干渉 − フロア」の差だけで決まります。差0（同レベル）で+3dB、差−10dBで+0.4dB。急坂の裾では干渉をあと数dB下げるだけで劇的に効きます。"
          exportName="desense-nonlinear-curve"
          caption={
            result
              ? `現在の差 = ${formatNumber(interferenceDbm - noiseFloorDbm, 1)}dB、デセンス +${formatNumber(result.delta, 1)}dB。曲線 Δ=10log₁₀(1+10^(差/10))`
              : "入力値を確認してください。"
          }
        >
          {result ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <DesenseCurve deltaDb={result.delta} />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              入力値を確認するとカーブが表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜ雑音と干渉はdBで足せないのか"
          formula={"合成フロア N′[dBm] = 10log10( 10^(N/10) + 10^(I/10) )\nデセンス Δ[dB] = N′ − N\n到達距離比 = 10^(−Δ/(10n))"}
          showColumnLink={false}
        >
          <p>
            <strong>① dBは対数なので、そのままでは足せません。</strong>
            -120dBmの雑音に-120dBmの干渉を足しても-240dBmにはなりません。dBは比率を対数にした「ものさし」で、
            電力の足し算にはいったん線形のmWに戻す必要があります。-120dBm = 10⁻¹² mW。これを2つ足すと
            2×10⁻¹² mW、dBmに戻すと-117dBm。つまり<strong>同じ強さの干渉が加わると水面はきっかり+3dB上がります</strong>
            （電力が2倍だから）。
          </p>
          <p>
            <strong>② 干渉が弱いと、上昇はごくわずかになります。</strong>
            干渉がフロアより10dB下（1/10の電力）なら、合計は 1+0.1=1.1倍。10log₁₀(1.1)=+0.4dBしか上がりません。
            20dB下なら+0.04dB——ほぼ無害です。だから対策は「干渉を消す」より
            <strong>「フロアより十分下（目安10dB以上）に落とす」で足りる</strong>ことが多いのです。
          </p>
          <p>
            <strong>③ 実務では、敵は自分の基板の中にいます。</strong>
            DC/DCコンバータのスイッチングノイズ、水晶やクロックの高調波、高速デジタル配線からの放射が
            受信帯域に落ちて、自分の受信機を自分で殺す——これが<strong>自家中毒（self-desense）</strong>です。
            静かなカフェのざわめき（フロア）に、隣の席の話し声（干渉）が加わると聞き取りにくくなるのに似ています。
            ※ただしこのたとえは直感用で、実際の劣化量は干渉が雑音状か狭帯域CWか、復調器の特性によって変わり、
            単純な電力加算はリンクバジェット上の一次近似です。
          </p>
          <p>
            結論: 感度劣化 Δ は合成フロアと元フロアの差。干渉を測ったら、まずフロアとの差が何dBかを見る。
            差が10dB以上あれば、あなたの受信機はほとんど傷ついていません。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <ToolColumnCard
          column={desenseColumn}
          live={result ? { desense: `+${formatNumber(result.delta, 2)}dB` } : undefined}
        />
      </div>

      <MobileResultBar primary={primary} targetId="desense-primary-result" />
    </>
  );
}

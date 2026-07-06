"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import {
  LEE_SAMPLES_PER_WINDOW,
  LEE_WINDOW_WAVELENGTHS,
  leeSampleSpacingM,
  leeWindowLengthM,
  requiredSampleCount,
  requiredSampleCountExact,
  zForTwoSidedConfidence
} from "@/lib/rf/measurementSampling";
import { formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { MeasurementSamplingColumn } from "./MeasurementSamplingColumn";

// 信頼水準チップ（両側 z 値のプリセット。z = Φ⁻¹((1+c)/2)）。
// 90/95/99% は電測・世論調査で標準的に用いられる代表水準。
const CONFIDENCE_PRESETS = [
  { percent: 90, fraction: 0.9 },
  { percent: 95, fraction: 0.95 },
  { percent: 99, fraction: 0.99 }
] as const;

// 周波数プリセット（Lee 窓の実寸表示用）。値は各無線バンドの代表周波数（事実値）。
const FREQUENCY_PRESETS = [
  { label: "VHF業務 150MHz", mhz: 150 }, // 業務用移動通信 VHF帯
  { label: "LPWA 920MHz", mhz: 920 }, // 日本の Sub-GHz（ARIB STD-T108 920MHz帯）
  { label: "Wi-Fi/BLE 2.4GHz", mhz: 2400 } // 2.4GHz ISM帯
] as const;

// σ の相場（シャドウイング標準偏差の環境別プリセット。3GPP TR 38.901 の σ_SF 等に対応）。
// SHADOW_FADING_STD_PRESETS_DB と同値（開放4/郊外6/都市8）。
const SIGMA_PRESETS = [
  { label: "開放 σ4", sigma: 4 },
  { label: "郊外 σ6", sigma: 6 },
  { label: "都市 σ8", sigma: 8 }
] as const;

// ---- 電測サンプリング設計の動的SVG（入力連動） -----------------------------------------
// 上段: 測定ルートの帯に Lee 窓（40λ）をハイライトし、0.8λ間隔の測定点50点を並べる。
//       周波数連動で 40λ・0.8λ の実寸[m]がラベルで変わる。
// 下段: 必要サンプル数 n =(zσ/E)² の許容誤差 E に対する曲線（polyline 50点）。
//       現在点と、E を半分にした点（n が4倍になる）を結んで感度を可視化する。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目）。

function SamplingDiagram({
  frequencyMHz,
  windowLengthM,
  spacingM,
  sigmaDb,
  toleranceDb,
  z,
  sampleCount
}: {
  frequencyMHz: number;
  windowLengthM: number;
  spacingM: number;
  sigmaDb: number;
  toleranceDb: number;
  z: number;
  sampleCount: number;
}) {
  const width = 660;
  const height = 500;

  // --- 上段: 測定ルート図 ---
  const bandLeft = 70;
  const bandRight = 590;
  const bandW = bandRight - bandLeft;
  const bandTop = 92;
  const bandH = 40;
  const bandBottom = bandTop + bandH;
  const dotY = bandTop + bandH / 2;
  const dotCount = LEE_SAMPLES_PER_WINDOW;
  const dotStep = bandW / dotCount;
  const dots = Array.from({ length: dotCount }, (_, i) => bandLeft + (i + 0.5) * dotStep);
  const braceY = bandTop - 20; // 0.8λ ブレース
  const dimY = bandBottom + 22; // 40λ 寸法線

  // --- 下段: n =(zσ/E)² 曲線 ---
  const eMin = 0.5;
  const eMax = 3;
  const plotLeft = 72;
  const plotRight = 612;
  const plotTop = 250;
  const plotBottom = 430;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  const nExact = (e: number) => {
    const ratio = (z * sigmaDb) / e;
    return ratio * ratio;
  };
  const rawMax = nExact(eMin);
  const niceMax = Math.max(1, Math.ceil(rawMax / 50) * 50);

  const xE = (e: number) => plotLeft + ((e - eMin) / (eMax - eMin)) * plotW;
  const yN = (n: number) => plotBottom - (Math.min(n, niceMax) / niceMax) * plotH;

  const steps = 49;
  const curvePoints = Array.from({ length: steps + 1 }, (_, i) => {
    const e = eMin + ((eMax - eMin) * i) / steps;
    return `${xE(e).toFixed(2)},${yN(nExact(e)).toFixed(2)}`;
  }).join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f));
  const xTicks = [0.5, 1, 1.5, 2, 2.5, 3];

  // 現在点（E を [eMin,eMax] にクランプして曲線上に置く）
  const eCur = Math.min(eMax, Math.max(eMin, toleranceDb));
  const nCur = nExact(eCur);
  const curX = xE(eCur);
  const curY = yN(nCur);

  // E を半分にした点（n は4倍。窓内に収まる範囲で描画）
  const eHalf = eCur / 2;
  const showHalf = eHalf >= eMin;
  const halfX = xE(eHalf);
  const halfY = yN(nExact(eHalf));

  return (
    <svg
      role="img"
      aria-label={`測定ルートのLee窓40λ=${formatNumber(windowLengthM, 2)}m・0.8λ間隔=${formatNumber(spacingM, 2)}mに50点。必要サンプル数nは許容誤差Eの2乗に反比例`}
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
    >
      <rect width={width} height={height} fill={chartTheme.surface.canvas} />

      {/* ===== 上段: 測定ルート ===== */}
      <text x={bandLeft} y={40} fill={diagramPalette.inkSoft} fontSize={13} fontWeight={700}>
        測定ルート ─ Lee窓の中に 0.8λ 間隔で 50 点
      </text>
      <text
        x={bandLeft}
        y={58}
        fill={diagramPalette.muted}
        fontSize={11}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        f = {formatNumber(frequencyMHz, 0)} MHz の実寸
      </text>

      {/* ルート帯（＝40λのLee窓） */}
      <rect
        x={bandLeft}
        y={bandTop}
        width={bandW}
        height={bandH}
        rx={8}
        fill={diagramPalette.skyPale}
        stroke={diagramPalette.staf}
        strokeWidth={1.5}
      />
      {/* 進行方向の中心線＋矢印 */}
      <line
        x1={bandLeft + 4}
        x2={bandRight - 14}
        y1={dotY}
        y2={dotY}
        stroke={diagramPalette.skySoft}
        strokeWidth={1}
        strokeDasharray="5 5"
      />
      <path
        d={`M ${bandRight - 16} ${dotY - 5} L ${bandRight - 6} ${dotY} L ${bandRight - 16} ${dotY + 5}`}
        fill="none"
        stroke={diagramPalette.staf}
        strokeWidth={1.5}
      />

      {/* 0.8λ 間隔の測定点 50 点 */}
      {dots.map((cx, i) => (
        <circle key={i} cx={cx} cy={dotY} r={3.1} fill={diagramPalette.staf} />
      ))}

      {/* 0.8λ ブレース（先頭の1間隔） */}
      <path
        d={`M ${dots[0]} ${braceY + 8} L ${dots[0]} ${braceY} L ${dots[1]} ${braceY} L ${dots[1]} ${braceY + 8}`}
        fill="none"
        stroke={diagramPalette.faint}
        strokeWidth={1}
      />
      <text
        x={dots[1] + 6}
        y={braceY + 4}
        fill={diagramPalette.inkSoft}
        fontSize={11}
        fontWeight={600}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        0.8λ = {formatNumber(spacingM, 2)} m（間隔）
      </text>

      {/* 40λ 全長の寸法線 */}
      <line x1={bandLeft} x2={bandLeft} y1={dimY - 6} y2={dimY + 6} stroke={diagramPalette.muted} strokeWidth={1} />
      <line x1={bandRight} x2={bandRight} y1={dimY - 6} y2={dimY + 6} stroke={diagramPalette.muted} strokeWidth={1} />
      <line x1={bandLeft} x2={bandRight} y1={dimY} y2={dimY} stroke={diagramPalette.muted} strokeWidth={1} />
      <text
        x={(bandLeft + bandRight) / 2}
        y={dimY + 20}
        textAnchor="middle"
        fill={diagramPalette.ink}
        fontSize={12}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        Lee窓 = {LEE_WINDOW_WAVELENGTHS}λ = {formatNumber(windowLengthM, 2)} m（窓内 {dotCount} 点）
      </text>

      {/* ===== 下段: n =(zσ/E)² 曲線 ===== */}
      <text x={plotLeft - 2} y={214} fill={diagramPalette.inkSoft} fontSize={13} fontWeight={700}>
        許容誤差 E と必要サンプル数 n の関係（n =(zσ/E)²）
      </text>

      {/* y グリッド＋目盛り */}
      {yTicks.map((tick) => (
        <g key={tick}>
          <line x1={plotLeft} x2={plotRight} y1={yN(tick)} y2={yN(tick)} stroke={chartTheme.grid.primary} />
          <text
            x={plotLeft - 8}
            y={yN(tick) + 4}
            textAnchor="end"
            fill={diagramPalette.muted}
            fontSize={11}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {tick}
          </text>
        </g>
      ))}
      {/* x 目盛り */}
      {xTicks.map((tick) => (
        <text
          key={tick}
          x={xE(tick)}
          y={plotBottom + 18}
          textAnchor="middle"
          fill={diagramPalette.muted}
          fontSize={11}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formatNumber(tick, 1)}
        </text>
      ))}
      <text x={(plotLeft + plotRight) / 2} y={plotBottom + 40} textAnchor="middle" fill={diagramPalette.muted} fontSize={12} fontWeight={600}>
        許容誤差 E [dB]
      </text>
      <text
        x={22}
        y={(plotTop + plotBottom) / 2}
        textAnchor="middle"
        fill={diagramPalette.muted}
        fontSize={12}
        fontWeight={600}
        transform={`rotate(-90 22 ${(plotTop + plotBottom) / 2})`}
      >
        必要サンプル数 n
      </text>

      {/* 曲線 */}
      <polyline points={curvePoints} fill="none" stroke={chartTheme.series.source} strokeWidth={chartTheme.stroke.series} />

      {/* E半減 → n4倍 の可視化（破線コネクタ＋×4点） */}
      {showHalf ? (
        <g>
          <line x1={curX} x2={curX} y1={curY} y2={plotBottom} stroke={diagramPalette.faint} strokeDasharray="4 4" />
          <line x1={halfX} x2={halfX} y1={halfY} y2={plotBottom} stroke={diagramPalette.loss} strokeDasharray="4 4" />
          <line x1={halfX} x2={curX} y1={halfY} y2={halfY} stroke={diagramPalette.loss} strokeDasharray="4 4" />
          <circle cx={halfX} cy={halfY} r={5} fill={diagramPalette.loss} stroke={diagramPalette.white} strokeWidth={2} />
          <text
            x={halfX + 8}
            y={halfY + 4}
            fill={chartTheme.seriesText.loss}
            fontSize={11}
            fontWeight={700}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            E半分で n≈{Math.round(nExact(eHalf))}（×4）
          </text>
        </g>
      ) : null}

      {/* 現在点 */}
      <circle cx={curX} cy={curY} r={5.5} fill={chartTheme.series.source} stroke={diagramPalette.white} strokeWidth={2} />
      <text
        x={curX + 10}
        y={curY - 8}
        fill={chartTheme.seriesText.source}
        fontSize={12}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        現在 E={formatNumber(eCur, 1)}dB → n={sampleCount}
      </text>

      {/* 感度注記 */}
      <text x={plotRight} y={plotTop - 6} textAnchor="end" fill={diagramPalette.inkSoft} fontSize={11} fontWeight={600}>
        n ∝ 1/E² ─ 精度を上げるほど点数は急増する
      </text>
    </svg>
  );
}

export function MeasurementSamplingPanel() {
  // 既定: 信頼水準95%・σ8dB（都市）・許容誤差1dB → n=(1.96×8)²≈246。周波数920MHz（LPWA）。
  const [confidence, setConfidence] = useState(0.95);
  const [sigmaDb, setSigmaDb] = useState(8);
  const [toleranceDb, setToleranceDb] = useState(1);
  const [frequencyMHz, setFrequencyMHz] = useState(920);

  const sigmaError =
    !Number.isFinite(sigmaDb) || sigmaDb < 0 ? "σ は0以上の値を入力してください。" : undefined;
  const toleranceError =
    !Number.isFinite(toleranceDb) || toleranceDb <= 0
      ? "許容誤差 E は0より大きい値を入力してください。"
      : undefined;
  const frequencyError =
    !Number.isFinite(frequencyMHz) || frequencyMHz <= 0
      ? "周波数は0より大きい値を入力してください。"
      : undefined;

  const z = useMemo(() => {
    try {
      return zForTwoSidedConfidence(confidence);
    } catch {
      return Number.NaN;
    }
  }, [confidence]);

  const result = useMemo(() => {
    try {
      const n = requiredSampleCount(sigmaDb, toleranceDb, confidence);
      const nExact = requiredSampleCountExact(sigmaDb, toleranceDb, confidence);
      return { n, nExact };
    } catch {
      return null;
    }
  }, [sigmaDb, toleranceDb, confidence]);

  const leeGeometry = useMemo(() => {
    try {
      return {
        windowLengthM: leeWindowLengthM(frequencyMHz),
        spacingM: leeSampleSpacingM(frequencyMHz)
      };
    } catch {
      return null;
    }
  }, [frequencyMHz]);

  const primary = {
    label: "必要サンプル数 n",
    value: result === null ? "—" : String(result.n),
    unit: "点"
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
            電波はゆらぐので、平均受信レベルは1点では決まりません。「±E dB のずれを c% の確からしさで
            言い切りたい」と決めると、必要な測定点数 n が決まります。周波数は Lee 窓の実寸表示に使います。
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">信頼水準 c（両側 z 値）</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="信頼水準プリセット">
              {CONFIDENCE_PRESETS.map((preset) => (
                <button
                  key={preset.percent}
                  type="button"
                  className={chipClass(Math.abs(confidence - preset.fraction) < 1e-9)}
                  onClick={() => setConfidence(preset.fraction)}
                >
                  {preset.percent}%
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs font-semibold text-slate-500">σ の相場（環境別・3GPP TR 38.901 系）</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="σプリセット">
              {SIGMA_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className={chipClass(sigmaDb === preset.sigma)}
                  onClick={() => setSigmaDb(preset.sigma)}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs font-semibold text-slate-500">周波数（Lee 窓の実寸表示用・代表バンド）</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="周波数プリセット">
              {FREQUENCY_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className={chipClass(frequencyMHz === preset.mhz)}
                  onClick={() => setFrequencyMHz(preset.mhz)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Field
              id="samplingSigma"
              label="ばらつき σ"
              unit="dB"
              value={sigmaDb}
              min={2}
              max={12}
              step={0.5}
              showSlider
              emptyBehavior="preserve"
              onChange={setSigmaDb}
              help="受信レベルの標準偏差（シャドウイングの散らばり）です。障害物が多いほど大きく、開放4・郊外6・都市8dB が相場です。散らばりが大きいほど多く測る必要があります。"
              example="8"
              error={sigmaError}
            />
            <Field
              id="samplingTolerance"
              label="許容誤差 E"
              unit="dB"
              value={toleranceDb}
              min={0.5}
              max={3}
              step={0.1}
              showSlider
              emptyBehavior="preserve"
              onChange={setToleranceDb}
              help="推定した平均が真値から±何dBまでずれてよいか、です。n は E の2乗に反比例するので、E を半分にすると必要点数は4倍になります。"
              example="1"
              error={toleranceError}
            />
            <Field
              id="samplingFrequency"
              label="周波数 f"
              unit="MHz"
              value={frequencyMHz}
              min={1}
              step={10}
              emptyBehavior="preserve"
              onChange={setFrequencyMHz}
              help="Lee 窓の実寸（40λ）と測定間隔（0.8λ）の長さ[m]を出すために使います。周波数が高いほど窓は短くなります。"
              example="920"
              error={frequencyError}
            />
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="measurement-sampling-primary-result">
            <ResultBar primary={primary} />
          </div>

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">Lee 基準の測定窓（現在の周波数）</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              局所平均を求める1区間の作法。窓長40λを50点（0.8λ間隔）で走査します。実寸は周波数で変わります。
            </p>
            <div className="mt-3 space-y-1.5">
              <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg bg-slate-50 px-2 py-1.5 text-sm">
                <span className="text-slate-600">Lee 窓長（40λ）</span>
                <span className="text-right font-semibold tabular-nums text-slate-900">
                  {leeGeometry ? `${formatNumber(leeGeometry.windowLengthM, 2)} m` : "—"}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg px-2 py-1.5 text-sm">
                <span className="text-slate-600">推奨間隔（0.8λ）</span>
                <span className="text-right font-semibold tabular-nums text-slate-900">
                  {leeGeometry ? `${formatNumber(leeGeometry.spacingM, 2)} m` : "—"}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg bg-slate-50 px-2 py-1.5 text-sm">
                <span className="text-slate-600">窓内サンプル数</span>
                <span className="text-right font-semibold tabular-nums text-slate-900">
                  {LEE_SAMPLES_PER_WINDOW} 点
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg px-2 py-1.5 text-sm">
                <span className="text-slate-600">両側 z 値（c={formatNumber(confidence * 100, 0)}%）</span>
                <span className="text-right font-semibold tabular-nums text-slate-900">
                  {Number.isFinite(z) ? formatNumber(z, 3) : "—"}
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              窓（作法）は電波の速いゆらぎを平均する幾何、n（統計）は許容誤差とσで決まる点数です。
              両者は別物なので、密に測っても相関があると独立サンプルは増えません。
            </p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="サンプリング設計"
          title="Lee 窓の測定点と、必要サンプル数の感度"
          description="上は測定ルートに置くLee窓（40λ・50点）の実寸、下は許容誤差Eに対する必要サンプル数n=(zσ/E)²の曲線です。入力に連動して動きます。"
          exportName="measurement-sampling-design"
          caption={
            result && leeGeometry
              ? `条件: c=${formatNumber(confidence * 100, 0)}% (z=${formatNumber(z, 3)}) / σ=${formatNumber(sigmaDb, 1)}dB / E=${formatNumber(toleranceDb, 1)}dB / f=${formatNumber(frequencyMHz, 0)}MHz ─ 必要サンプル数 n=${result.n}点（連続値 ${formatNumber(result.nExact, 1)}）・Lee窓 ${formatNumber(leeGeometry.windowLengthM, 2)}m・間隔 ${formatNumber(leeGeometry.spacingM, 2)}m`
              : "入力値を確認してください。"
          }
        >
          {result && leeGeometry ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <SamplingDiagram
                frequencyMHz={frequencyMHz}
                windowLengthM={leeGeometry.windowLengthM}
                spacingM={leeGeometry.spacingM}
                sigmaDb={sigmaDb}
                toleranceDb={toleranceDb}
                z={z}
                sampleCount={result.n}
              />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              入力値を確認するとサンプリング設計図が表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜ「点数」と「窓」で測り方が決まるのか"
          formula="n = ( z·σ / E )²    z = Φ⁻¹((1+c)/2)    Lee窓 = 40λ・窓内50点（0.8λ間隔）"
          showColumnLink={false}
        >
          <p>
            <strong>① 電波はゆらぐので、1点測定は当てになりません。</strong>
            直接波と反射波が干渉して、電波には半波長ごとに山と谷ができます（定在波）。
            同じ場所でも数十cmずれれば受信レベルは10dBも跳ねる。1点の値は、その模様のどこを
            踏んだかで決まる「くじ引き」です。だから複数点で測って平均を取ります。
          </p>
          <p>
            <strong>② 「±E dB を c% の確からしさで」と決めると点数 n が決まります。</strong>
            世論調査で「支持率を±3%で言い切るには何人に聞けばよいか」を決めるのと同じ理屈です。
            ばらつき σ が大きいほど、また許容誤差 E を小さくするほど、必要な人数（点数）は増える——
            n = (z·σ/E)²。z は「c% で言い切る」ための係数で、95% なら z≈1.96 です。
            ※世論調査のたとえは直感用で、実際は各サンプルが独立（相関距離以上に離れている）である
            ことが前提です。密に測っても値が似ていれば「実質1票」にしかならず、n は過小評価になります。
          </p>
          <p>
            <strong>③ Lee 基準は「速いゆらぎは平均し、遅い変化は残す」窓です。</strong>
            マルチパスによる速いフェージングを平均でならすには、40波長ぶんの区間があれば十分——
            これが Lee の窓長 <strong>40λ</strong> です。その中を <strong>50点</strong>（＝0.8λ間隔）で走査すると、
            隣どうしが無相関に近い独立した標本になります。建物の陰による遅い変化は窓をまたいで残るので、
            エリアの傾向も見える。歩測でも車載測定でも、この窓をそのまま設計にあてはめられます。
          </p>
          <p>
            結論: 必要点数 n は統計（σ と許容誤差）が決め、測る間隔と窓長は電波の幾何（波長）が決めます。
            精度を1段上げたい（E を半分に）なら、覚悟すべきは点数4倍。これがフィールド測定の費用対効果の
            分かれ目です。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <MeasurementSamplingColumn />
      </div>

      <MobileResultBar primary={primary} targetId="measurement-sampling-primary-result" />
    </>
  );
}

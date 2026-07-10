"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { chartTheme, seriesColor } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import {
  gaseousSpecificAttenuationDbPerKm,
  rainSpecificAttenuationDbPerKm,
  type RainPolarization
} from "@/lib/rf/rainAttenuation";
import { formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { RainAttenuationColumn } from "./RainAttenuationColumn";

// 周波数プリセット（出典が固い代表周波数のみ。曖昧な値は置かない）。
// - 2.4GHz: ISM帯（Wi-Fi/Bluetooth）
// - 5.8GHz: ISM帯（無線LAN/DSRC）
// - 22.2GHz: 水蒸気吸収線 22.235GHz（ITU-R P.676-13 Annex 1 Table 2 の f0）
// - 28GHz: 5Gミリ波帯（3GPP FR2 n257: 26.5〜29.5GHz。日本のローカル5Gもこの帯）
// - 60GHz: 酸素吸収帯の中心（ITU-R P.676-13 の 50〜70GHz 酸素線群）＝IEEE 802.11ad/WiGig帯
const FREQUENCY_PRESETS = [
  { label: "2.4GHz Wi-Fi", valueGHz: 2.4 },
  { label: "5.8GHz ISM", valueGHz: 5.8 },
  { label: "22.2GHz 水蒸気の山", valueGHz: 22.2 },
  { label: "28GHz 5Gミリ波", valueGHz: 28 },
  { label: "60GHz 酸素の山", valueGHz: 60 }
] as const;

// 降雨強度の代表点（ITU-R P.838 系の降雨減衰検討で慣用される値）。
// 強さのラベルは気象庁「雨の強さと降り方」の区分に対応する目安
// （10〜20mm/h=やや強い雨、20〜30mm/h=強い雨、50mm/h以上=非常に激しい雨）。
const RAIN_PRESETS = [
  { label: "小雨 1mm/h", valueMmPerH: 1 },
  { label: "並雨 12.5mm/h", valueMmPerH: 12.5 },
  { label: "強雨 25mm/h", valueMmPerH: 25 },
  { label: "豪雨 50mm/h", valueMmPerH: 50 }
] as const;

const POLARIZATIONS: Array<{ value: RainPolarization; label: string }> = [
  { value: "horizontal", label: "水平偏波" },
  { value: "vertical", label: "垂直偏波" }
];

// UI上の周波数範囲（図の横軸と一致）。lib自体は P.838-3/P.676-13 とも 1〜1000GHz に適用可。
const MIN_FREQ_GHZ = 1;
const MAX_FREQ_GHZ = 100;

/** 比減衰[dB/km]の表示。図の下端 0.001dB/km 未満は「無視できる小ささ」として丸めずに明示する。 */
function formatGamma(value: number): string {
  if (!Number.isFinite(value)) return "-";
  if (value < 0.001) return "0.001未満";
  return formatNumber(value, value < 0.1 ? 3 : 2);
}

// ---- 周波数スペクトル図（入力連動の動的SVG） ---------------------------------------
// 横軸1〜100GHz・縦軸0.001〜100dB/km の両対数。現在の降雨強度での降雨減衰カーブと、
// 大気ガス（酸素＋水蒸気）吸収カーブを重ね、60GHzの酸素の山・22GHzの水蒸気の山が
// 一目で分かるようにする。現在周波数には垂直マーカー＋値ラベル。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目: v4 R4方式）。

const GAMMA_FLOOR = 1e-3; // 縦軸下端[dB/km]。これ未満は下端に張り付く＝実質無視できる領域。
const GAMMA_CEIL = 1e2;

// チャート寸法と座標変換（モジュールスコープの純関数。useMemoの依存を入力値だけに保つ）。
const chart = { width: 640, height: 340, top: 30, right: 24, bottom: 50, left: 60 } as const;
const plotW = chart.width - chart.left - chart.right;
const plotH = chart.height - chart.top - chart.bottom;

/** 横軸: 1〜100GHz を log10 で 0〜2 に写像。 */
function x(frequencyGHz: number): number {
  return chart.left + (Math.log10(frequencyGHz) / 2) * plotW;
}

/** 縦軸: 0.001〜100dB/km（5桁）を log10 で写像。範囲外は端にクランプ。 */
function y(gammaDbPerKm: number): number {
  const clamped = Math.min(GAMMA_CEIL, Math.max(GAMMA_FLOOR, gammaDbPerKm));
  return chart.top + ((2 - Math.log10(clamped)) / 5) * plotH;
}

function AttenuationSpectrumChart({
  frequencyGHz,
  rainRateMmPerH,
  polarization,
  rainDbPerKm,
  gasDbPerKm
}: {
  frequencyGHz: number;
  rainRateMmPerH: number;
  polarization: RainPolarization;
  rainDbPerKm: number;
  gasDbPerKm: number;
}) {
  // サンプル周波数: 対数等間隔40点＋見どころ（22.235GHz水蒸気線・60GHz酸素線群）の補点。
  const { rainPoints, gasPoints } = useMemo(() => {
    const base = Array.from({ length: 40 }, (_, i) => 10 ** ((i / 39) * 2));
    const extras = [22.235, 24, 55, 57, 58.5, 60, 61.15, 62.5, 64, 66, 68];
    const freqs = [...base, ...extras].sort((a, b) => a - b);
    const rain = freqs.map(
      (f) => `${x(f).toFixed(1)},${y(rainSpecificAttenuationDbPerKm(rainRateMmPerH, f, { polarization })).toFixed(1)}`
    );
    const gas = freqs.map(
      (f) => `${x(f).toFixed(1)},${y(gaseousSpecificAttenuationDbPerKm(f)).toFixed(1)}`
    );
    return { rainPoints: rain.join(" "), gasPoints: gas.join(" ") };
  }, [rainRateMmPerH, polarization]);

  const xTicks = [1, 2, 5, 10, 20, 50, 100];
  const yTicks = [100, 10, 1, 0.1, 0.01, 0.001];

  const rainColor = seriesColor(0); // 青（降雨）
  const gasColor = seriesColor(3); // 朱（大気ガス）
  const rainTextColor = chartTheme.seriesText.source;
  const gasTextColor = diagramPalette.warnDeep;

  const markerX = x(frequencyGHz);
  const rainY = y(rainDbPerKm);
  const gasY = y(gasDbPerKm);
  // マーカーの値ラベルは右端で見切れないよう、38GHz超では左側に出す。
  const flip = frequencyGHz > 38;
  const labelAnchor = flip ? "end" : "start";
  const labelDx = flip ? -10 : 10;
  // 2つの値ラベルが重ならないよう、近接時は上下へ引き離す。
  const rainLabelY = Math.abs(rainY - gasY) < 26 ? Math.min(rainY, gasY) - 10 : rainY - 10;
  const gasLabelY = Math.abs(rainY - gasY) < 26 ? Math.max(rainY, gasY) + 18 : gasY + 18;

  // 見どころ注記の座標（大気ガスカーブは入力に依らず固定）。
  const oxygenPeakY = y(gaseousSpecificAttenuationDbPerKm(60));
  const waterPeakY = y(gaseousSpecificAttenuationDbPerKm(22.235));

  return (
    <svg
      role="img"
      aria-label={`降雨${formatNumber(rainRateMmPerH, 1)}mm/h時の比減衰スペクトル。${formatNumber(frequencyGHz, 1)}GHzで降雨${formatGamma(rainDbPerKm)}dB/km、大気ガス${formatGamma(gasDbPerKm)}dB/km`}
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />

      {/* 縦軸（対数）: 10倍ごとのグリッド */}
      {yTicks.map((tick) => (
        <g key={`y-${tick}`}>
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
            {tick >= 1 ? tick : tick.toFixed(tick < 0.01 ? 3 : tick < 0.1 ? 2 : 1)}
          </text>
        </g>
      ))}

      {/* 横軸（対数）: 目盛と数値 */}
      {xTicks.map((tick) => (
        <g key={`x-${tick}`}>
          <line
            x1={x(tick)}
            x2={x(tick)}
            y1={chart.top}
            y2={chart.height - chart.bottom}
            stroke={chartTheme.grid.primary}
          />
          <text
            x={x(tick)}
            y={chart.height - chart.bottom + 18}
            textAnchor="middle"
            fill={diagramPalette.muted}
            fontSize={11}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {tick}
          </text>
        </g>
      ))}
      <text
        x={chart.left + plotW / 2}
        y={chart.height - 10}
        textAnchor="middle"
        fill={diagramPalette.muted}
        fontSize={12}
        fontWeight={600}
      >
        周波数 [GHz]（対数目盛）
      </text>
      <text x={chart.left} y={chart.top - 12} fill={diagramPalette.muted} fontSize={12} fontWeight={600}>
        比減衰 [dB/km]（対数目盛）
      </text>

      {/* カーブ本体 */}
      <polyline
        points={rainPoints}
        fill="none"
        stroke={rainColor}
        strokeWidth={chartTheme.stroke.series}
        strokeLinejoin="round"
      />
      <polyline
        points={gasPoints}
        fill="none"
        stroke={gasColor}
        strokeWidth={chartTheme.stroke.series}
        strokeLinejoin="round"
      />

      {/* 凡例（プロット左上。カーブは左下から立ち上がるため重ならない） */}
      <g>
        <line x1={chart.left + 12} x2={chart.left + 36} y1={chart.top + 14} y2={chart.top + 14} stroke={rainColor} strokeWidth={chartTheme.stroke.series} />
        <text x={chart.left + 42} y={chart.top + 18} fill={rainTextColor} fontSize={11} fontWeight={700}>
          降雨 {formatNumber(rainRateMmPerH, 1)}mm/h（{polarization === "horizontal" ? "水平" : "垂直"}偏波）
        </text>
        <line x1={chart.left + 12} x2={chart.left + 36} y1={chart.top + 32} y2={chart.top + 32} stroke={gasColor} strokeWidth={chartTheme.stroke.series} />
        <text x={chart.left + 42} y={chart.top + 36} fill={gasTextColor} fontSize={11} fontWeight={700}>
          大気ガス（酸素＋水蒸気・晴雨によらず常時）
        </text>
      </g>

      {/* 見どころ注記: 酸素60GHzの山・水蒸気22GHzの山 */}
      <text x={x(60)} y={oxygenPeakY - 10} textAnchor="middle" fill={gasTextColor} fontSize={10} fontWeight={700}>
        酸素の山 60GHz
      </text>
      <text x={x(22.235)} y={waterPeakY - 10} textAnchor="middle" fill={gasTextColor} fontSize={10} fontWeight={700}>
        水蒸気の山 22GHz
      </text>

      {/* 現在周波数の垂直マーカー＋値ラベル */}
      <line
        x1={markerX}
        x2={markerX}
        y1={chart.top}
        y2={chart.height - chart.bottom}
        stroke={chartTheme.reference.baseline}
        strokeDasharray={chartTheme.reference.baselineDash}
        strokeWidth={1.5}
      />
      <text
        x={markerX}
        y={chart.top - 2}
        textAnchor="middle"
        fill={diagramPalette.ink}
        fontSize={11}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatNumber(frequencyGHz, 1)}GHz
      </text>
      <circle cx={markerX} cy={rainY} r={4.5} fill={rainColor} stroke={chartTheme.surface.plain} strokeWidth={1.5} />
      <circle cx={markerX} cy={gasY} r={4.5} fill={gasColor} stroke={chartTheme.surface.plain} strokeWidth={1.5} />
      <text
        x={markerX + labelDx}
        y={rainLabelY}
        textAnchor={labelAnchor}
        fill={rainTextColor}
        fontSize={11}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        降雨 {formatGamma(rainDbPerKm)} dB/km
      </text>
      <text
        x={markerX + labelDx}
        y={gasLabelY}
        textAnchor={labelAnchor}
        fill={gasTextColor}
        fontSize={11}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        大気 {formatGamma(gasDbPerKm)} dB/km
      </text>
    </svg>
  );
}

export function RainAttenuationPanel() {
  // 既定は 28GHz・強雨25mm/h・水平偏波・1km: ミリ波5Gの「雨が設計の主役になる」条件を最初に見せる。
  const [frequencyGHz, setFrequencyGHz] = useState(28);
  const [rainRateMmPerH, setRainRateMmPerH] = useState(25);
  const [distanceKm, setDistanceKm] = useState(1);
  const [polarization, setPolarization] = useState<RainPolarization>("horizontal");

  const frequencyError =
    !Number.isFinite(frequencyGHz) || frequencyGHz < MIN_FREQ_GHZ || frequencyGHz > MAX_FREQ_GHZ
      ? "周波数は1〜100GHzの範囲で入力してください。"
      : undefined;
  const distanceError =
    !Number.isFinite(distanceKm) || distanceKm < 0.1 || distanceKm > 10
      ? "距離は0.1〜10kmの範囲で入力してください。"
      : undefined;

  const result = useMemo(() => {
    if (frequencyError || distanceError) return null;
    try {
      const rainDbPerKm = rainSpecificAttenuationDbPerKm(rainRateMmPerH, frequencyGHz, {
        polarization
      });
      const gasDbPerKm = gaseousSpecificAttenuationDbPerKm(frequencyGHz);
      // 内訳の分離: 酸素側は水蒸気密度0（乾燥空気=酸素の共鳴＋乾燥空気連続吸収）で計算し、
      // 水蒸気側は全体との差分とする（P.676-13 の γ = γo + γw の項分けに対応する近似分離）。
      const oxygenDbPerKm = gaseousSpecificAttenuationDbPerKm(frequencyGHz, 0);
      const waterDbPerKm = gasDbPerKm - oxygenDbPerKm;
      return {
        rainDbPerKm,
        gasDbPerKm,
        oxygenDbPerKm,
        waterDbPerKm,
        rainDb: rainDbPerKm * distanceKm,
        oxygenDb: oxygenDbPerKm * distanceKm,
        waterDb: waterDbPerKm * distanceKm,
        totalDb: (rainDbPerKm + gasDbPerKm) * distanceKm
      };
    } catch {
      return null;
    }
  }, [frequencyGHz, rainRateMmPerH, distanceKm, polarization, frequencyError, distanceError]);

  const primary = {
    label: "合計減衰（降雨＋大気ガス）",
    value: result === null ? "—" : formatNumber(result.totalDb, 2),
    unit: "dB"
  };

  const chipClass = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${
      active
        ? "border-staf bg-staf text-white"
        : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
    }`;

  // 対数目盛の周波数スライダー: 位置=log10(f)（0〜2）。低い帯域が潰れないようにする。
  const freqSliderPos = Math.log10(
    Math.min(MAX_FREQ_GHZ, Math.max(MIN_FREQ_GHZ, Number.isFinite(frequencyGHz) ? frequencyGHz : MIN_FREQ_GHZ))
  );
  const handleFreqSlider = (pos: number) => {
    const f = 10 ** pos;
    setFrequencyGHz(f < 10 ? Math.round(f * 10) / 10 : Math.round(f));
  };

  const breakdownRows: Array<{ key: string; label: string; gammaDbPerKm: number; pathDb: number }> =
    result === null
      ? []
      : [
          {
            key: "rain",
            label: "降雨（P.838-3）",
            gammaDbPerKm: result.rainDbPerKm,
            pathDb: result.rainDb
          },
          {
            key: "oxygen",
            label: "酸素・乾燥空気（P.676-13）",
            gammaDbPerKm: result.oxygenDbPerKm,
            pathDb: result.oxygenDb
          },
          {
            key: "water",
            label: "水蒸気（P.676-13）",
            gammaDbPerKm: result.waterDbPerKm,
            pathDb: result.waterDb
          }
        ];

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            雨と空気による減衰は「どの周波数か」でほぼ決まります。①周波数 ②雨の強さ ③経路の距離
            ④偏波（雨滴は落下中につぶれて平たくなるため、水平偏波の方がやや大きく減衰します）。
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">周波数プリセット（代表バンドと吸収の見どころ）</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="周波数プリセット">
              {FREQUENCY_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className={chipClass(Math.abs(frequencyGHz - preset.valueGHz) < 0.01)}
                  onClick={() => setFrequencyGHz(preset.valueGHz)}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs font-semibold text-slate-500">
              降雨強度（ラベルは気象庁「雨の強さと降り方」に対応する目安）
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="降雨強度プリセット">
              {RAIN_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className={chipClass(rainRateMmPerH === preset.valueMmPerH)}
                  onClick={() => setRainRateMmPerH(preset.valueMmPerH)}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs font-semibold text-slate-500">偏波</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="偏波の選択">
              {POLARIZATIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={chipClass(polarization === option.value)}
                  onClick={() => setPolarization(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <Field
                id="rainFrequency"
                label="周波数 f"
                unit="GHz"
                value={frequencyGHz}
                min={MIN_FREQ_GHZ}
                max={MAX_FREQ_GHZ}
                step={0.1}
                emptyBehavior="preserve"
                onChange={setFrequencyGHz}
                help="高い周波数ほど波長が雨粒のサイズ（数mm）に近づき、吸収・散乱が急激に強くなります。1GHz付近では雨はほぼ無視できます。"
                example="28"
                error={frequencyError}
              />
              <input
                type="range"
                min={0}
                max={2}
                step={0.01}
                value={freqSliderPos}
                onChange={(event) => handleFreqSlider(Number(event.target.value))}
                aria-label="周波数のスライダー（対数目盛・1〜100GHz）"
                className="mt-2 w-full"
              />
            </div>
            <Field
              id="rainDistance"
              label="距離 d"
              unit="km"
              value={distanceKm}
              min={0.1}
              max={10}
              step={0.1}
              showSlider
              emptyBehavior="preserve"
              onChange={setDistanceKm}
              help="電波が雨の中を通る経路長です。比減衰[dB/km]×距離[km]が経路全体の減衰になります（雨域が経路全体を覆う想定）。"
              example="1"
              error={distanceError}
            />
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="rain-attenuation-primary-result">
            <ResultBar primary={primary} />
          </div>

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">内訳（比減衰と経路減衰）</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              降雨は ITU-R P.838-3（k・R^α）、大気ガスは ITU-R P.676-13（標準大気・水蒸気密度7.5g/m³）で計算。
            </p>
            <div className="mt-3 space-y-1.5">
              {breakdownRows.map((row) => (
                <div
                  key={row.key}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg px-2 py-1 text-sm"
                >
                  <span className="text-slate-600">{row.label}</span>
                  <span className="text-xs tabular-nums text-slate-500">
                    {formatGamma(row.gammaDbPerKm)} dB/km
                  </span>
                  <span className="min-w-20 text-right font-semibold tabular-nums text-slate-900">
                    {formatGamma(row.pathDb)} dB
                  </span>
                </div>
              ))}
              {result === null ? (
                <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center text-xs text-slate-500">
                  入力値を確認すると内訳が表示されます。
                </p>
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              この合計減衰を
              <Link
                href="/tools/rf-basic-link-calculator"
                className="mx-1 inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                リンクバジェット診断の追加損失
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
              に入れると、雨天時でも通信が成立するか（雨マージン）を判定できます。
            </p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="スペクトル図"
          title="雨と空気は、どの周波数から電波を食い始めるか"
          description="横軸・縦軸とも対数です。降雨カーブ（青）は周波数とともに単調に立ち上がり、大気ガスカーブ（朱）には22GHzの水蒸気の山と60GHzの酸素の山が現れます。下端（0.001dB/km）に張り付いた領域は実質無視できる小ささです。"
          exportName="rain-attenuation-spectrum"
          caption={
            result
              ? `条件: f=${formatNumber(frequencyGHz, 1)}GHz / 降雨${formatNumber(rainRateMmPerH, 1)}mm/h / ${polarization === "horizontal" ? "水平" : "垂直"}偏波 ─ 降雨 ${formatGamma(result.rainDbPerKm)}dB/km・大気ガス ${formatGamma(result.gasDbPerKm)}dB/km。d=${formatNumber(distanceKm, 1)}kmで合計 ${formatNumber(result.totalDb, 2)}dB。出典: ITU-R P.838-3 / P.676-13（標準大気）。`
              : "入力値を確認してください。"
          }
        >
          {result ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <AttenuationSpectrumChart
                frequencyGHz={frequencyGHz}
                rainRateMmPerH={rainRateMmPerH}
                polarization={polarization}
                rainDbPerKm={result.rainDbPerKm}
                gasDbPerKm={result.gasDbPerKm}
              />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              入力値を確認するとスペクトル図が表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜ高い周波数ほど雨に弱いのか"
          formula={
            "合計減衰[dB] = ( γ_rain + γ_gas ) × d[km]\n" +
            "  降雨:     γ_rain[dB/km] = k · R^α   （R: 降雨強度[mm/h]、k・α: ITU-R P.838-3）\n" +
            "  大気ガス: γ_gas[dB/km] = γ_酸素 + γ_水蒸気   （ITU-R P.676-13）"
          }
          showColumnLink={false}
        >
          <p>
            <strong>① 雨粒は電波を吸収し、散乱させます。</strong>
            雨粒の直径はおよそ0.5〜5mm。電波の波長がこのサイズに近づくほど、雨粒は電波にとって
            「よく当たる障害物」になります。1GHz（波長30cm）では雨粒は小さすぎてほぼ素通りですが、
            30GHz（波長1cm）では波長と雨粒が同じ桁になり、吸収・散乱が急激に強まります。
            これを雨の強さRのべき乗則 k・R^α で近似したのが ITU-R P.838-3 です。
          </p>
          <p>
            <strong>② 空気そのものも、特定の周波数だけを吸収します。</strong>
            酸素分子は磁石の性質（磁気双極子）を持つ珍しい分子で、60GHz付近のエネルギーを共鳴的に
            吸収します——海面高度で約15dB/km、1kmで電力が約1/30になる「酸素の壁」です。
            水蒸気にも22.235GHzに吸収線があります。これらは晴れでも雨でも常に効く減衰です。
          </p>
          <p>
            <strong>③ 実務では周波数帯で扱いがまったく違います。</strong>
            Sub-GHzのIoT（LoRa/シグフォックス等）では降雨減衰は0.001dB/km未満で完全に無視できます。
            一方ミリ波5G（28GHz）では豪雨で9dB/km超、衛星のKa帯でも雨マージンが設計の主役です。
            「雨の日に切れるかも」を心配すべきかは、まず周波数で判断してください。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <RainAttenuationColumn />
      </div>

      <MobileResultBar primary={primary} targetId="rain-attenuation-primary-result" />
    </>
  );
}

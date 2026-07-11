"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { chartTheme } from "@/lib/chartTheme";
import { diagramMaterial, diagramPalette } from "@/lib/ui/diagramTheme";
import {
  calculateMetalPlaneEffect,
  metalPlaneGainChangeDb,
  METAL_PLANE_GAIN_DISPLAY_FLOOR_DB,
  METAL_PLANE_OPTIMAL_GAIN_DB
} from "@/lib/rf/metalPlaneEffect";
import { calculateWavelengthFromMHz } from "@/lib/rf/frequency";
import { formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { MetalPlaneEffectColumn } from "./MetalPlaneEffectColumn";

// 周波数プリセット（出典が固い ISM/法規帯のみ）。
// 920: 日本のsub-GHz帯（ARIB STD-T108, 920MHz帯・LPWA/RFID）。
// 2400: 2.4GHz ISM帯（Wi-Fi/Bluetooth）。5000: 5GHz帯（Wi-Fi 5GHz）。
const FREQUENCY_PRESETS = [
  { label: "920MHz", mhz: 920 },
  { label: "2.4GHz", mhz: 2400 },
  { label: "5GHz", mhz: 5000 }
] as const;

// 早見表の代表離隔（純粋にイメージ理論の幾何から決まる無次元比 d/λ）。
// 値はすべて lib（metalPlaneGainChangeDb）から導出し、表示と計算の食い違いを防ぐ。
const REFERENCE_FRACTIONS = [
  { key: "contact", fraction: 0, label: "d=0（密着）" },
  { key: "eighth", fraction: 1 / 8, label: "d=λ/8" },
  { key: "quarter", fraction: 1 / 4, label: "d=λ/4（最適）" },
  { key: "three8", fraction: 3 / 8, label: "d=3λ/8" },
  { key: "half", fraction: 1 / 2, label: "d=λ/2（ヌル）" }
] as const;

const FLOOR = METAL_PLANE_GAIN_DISPLAY_FLOOR_DB;

/** 利得変化ΔGの表示文字列。ヌル（−∞）と表示床以下は「≤ -40」に丸める。 */
function formatGainValue(gainDb: number): string {
  if (!Number.isFinite(gainDb) || gainDb <= FLOOR) {
    return `≤ ${FLOOR}`;
  }
  return `${gainDb >= 0 ? "+" : ""}${formatNumber(gainDb, 1)}`;
}

// ---- 幾何ミニ図＋ΔGカーブ（入力連動の動的SVG） -------------------------------------
// 上段: 「アンテナ｜←d→｜金属板｜鏡像（逆相）」の幾何。金属板は diagramMaterial.metal。
// 下段: 横軸 d/λ(0〜1) の ΔG カーブ（40〜60点の polyline）と現在点マーカー。
// λ/4=+6dBピークと d→0・λ/2 の深いヌルを直接ラベリングする。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目: v4 R4方式）。

function MetalPlaneDiagram({
  distanceLambda,
  distanceMm,
  gainChangeDb
}: {
  distanceLambda: number;
  distanceMm: number;
  gainChangeDb: number;
}) {
  const width = 640;
  const height = 440;

  // ── 上段: 幾何ミニ図 ──
  const plateX = 340; // 板の前面（鏡像面）
  const plateW = 22;
  const yc = 96;
  const dipoleHalf = 32;
  const maxOffset = 150; // 表示上の d の最大振れ幅（実寸ではなく直感用）
  const dVis = Math.min(1, Math.max(0, distanceLambda));
  const offset = 20 + dVis * maxOffset;
  const antX = plateX - offset;
  const imageX = plateX + offset; // 鏡像面 plateX に対して対称

  // ── 下段: ΔGカーブ ──
  const plot = { left: 58, right: 606, top: 226, bottom: 400 };
  const gMax = 8; // +6dB ピークの上に少し余白
  const gMin = FLOOR; // -40dB（表示床）
  const xOf = (t: number) => plot.left + Math.min(1, Math.max(0, t)) * (plot.right - plot.left);
  const yOf = (g: number) =>
    plot.top + ((gMax - Math.min(gMax, Math.max(gMin, g))) / (gMax - gMin)) * (plot.bottom - plot.top);

  // 51点の polyline（両端・λ/2 の −∞ は床でクランプして描く）。
  const curvePoints: string[] = [];
  for (let i = 0; i <= 50; i += 1) {
    const t = i / 50;
    const g = metalPlaneGainChangeDb(t);
    const gClamped = Number.isFinite(g) ? Math.max(gMin, g) : gMin;
    curvePoints.push(`${xOf(t).toFixed(1)},${yOf(gClamped).toFixed(1)}`);
  }

  const yTicks = [6, 0, -10, -20, -30, -40];
  const xTicks = [
    { t: 0, label: "0" },
    { t: 0.25, label: "0.25" },
    { t: 0.5, label: "0.5" },
    { t: 0.75, label: "0.75" },
    { t: 1, label: "1.0" }
  ];

  // 現在点（d/λ を 0..1 にクランプ、ΔG は床でクランプ）。
  const markerT = Math.min(1, Math.max(0, distanceLambda));
  const markerGraw = Number.isFinite(gainChangeDb) ? gainChangeDb : gMin;
  const markerX = xOf(markerT);
  const markerY = yOf(markerGraw);
  const markerAnchor: "start" | "end" = markerT > 0.7 ? "end" : "start";
  const overRange = distanceLambda > 1;

  return (
    <svg
      role="img"
      aria-label={`金属板から d/λ=${formatNumber(distanceLambda, 3)} に置いたアンテナの利得変化 ${formatGainValue(gainChangeDb)}dB。λ/4で+6dBピーク、密着とλ/2で深いヌル`}
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
    >
      <rect width={width} height={height} fill={chartTheme.surface.canvas} />

      {/* ── 上段: 幾何ミニ図 ── */}
      <text x={20} y={26} fill={diagramPalette.inkSoft} fontSize={12} fontWeight={700}>
        イメージ理論: 金属板は鏡＝板の奥に逆相の鏡像アンテナができる
      </text>

      {/* 金属板 */}
      <rect x={plateX} y={40} width={plateW} height={112} rx={2} fill={diagramMaterial.metal} />
      <line x1={plateX + 5} y1={44} x2={plateX + 5} y2={148} stroke={diagramPalette.white} strokeWidth={1.5} opacity={0.4} />
      <line x1={plateX + plateW - 4} y1={44} x2={plateX + plateW - 4} y2={148} stroke={diagramPalette.ink} strokeWidth={1} opacity={0.3} />
      <text x={plateX + plateW / 2} y={168} textAnchor="middle" fill={diagramPalette.inkSoft} fontSize={12} fontWeight={600}>
        金属板
      </text>

      {/* 本物のアンテナ（面に平行な直線素子） */}
      <line
        x1={antX}
        y1={yc - dipoleHalf}
        x2={antX}
        y2={yc + dipoleHalf}
        stroke={diagramPalette.staf}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <circle cx={antX} cy={yc} r={4} fill={diagramPalette.staf} />
      <text x={antX} y={yc - dipoleHalf - 8} textAnchor="middle" fill={diagramPalette.stafDark} fontSize={12} fontWeight={600}>
        アンテナ
      </text>

      {/* 鏡像アンテナ（板の奥・逆相を破線＋逆向き矢じりで示す） */}
      <line
        x1={imageX}
        y1={yc - dipoleHalf}
        x2={imageX}
        y2={yc + dipoleHalf}
        stroke={diagramPalette.faint}
        strokeWidth={3}
        strokeDasharray="5 4"
        strokeLinecap="round"
      />
      <circle cx={imageX} cy={yc} r={3.5} fill="none" stroke={diagramPalette.faint} strokeWidth={1.5} />
      <text x={imageX} y={yc - dipoleHalf - 8} textAnchor="middle" fill={diagramPalette.muted} fontSize={11} fontWeight={600}>
        鏡像（逆相）
      </text>

      {/* 距離 d の寸法線 */}
      <line x1={antX} y1={yc + dipoleHalf + 14} x2={plateX} y2={yc + dipoleHalf + 14} stroke={diagramPalette.inkMuted} strokeWidth={1.25} />
      <polygon
        points={`${antX},${yc + dipoleHalf + 14} ${antX + 9},${yc + dipoleHalf + 10} ${antX + 9},${yc + dipoleHalf + 18}`}
        fill={diagramPalette.inkMuted}
      />
      <polygon
        points={`${plateX},${yc + dipoleHalf + 14} ${plateX - 9},${yc + dipoleHalf + 10} ${plateX - 9},${yc + dipoleHalf + 18}`}
        fill={diagramPalette.inkMuted}
      />
      <text
        x={(antX + plateX) / 2}
        y={yc + dipoleHalf + 34}
        textAnchor="middle"
        fill={diagramPalette.ink}
        fontSize={12}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        d = {formatNumber(distanceMm, 1)}mm（d/λ = {formatNumber(distanceLambda, 3)}）
      </text>

      {/* ── 下段: ΔGカーブ ── */}
      <text x={plot.left - 2} y={210} fill={diagramPalette.inkSoft} fontSize={12} fontWeight={700}>
        利得変化 ΔG = 20·log₁₀(2·|sin2πx|)（横軸 x = d/λ）
      </text>

      {/* y目盛り・グリッド */}
      {yTicks.map((tick) => (
        <g key={tick}>
          <line x1={plot.left} x2={plot.right} y1={yOf(tick)} y2={yOf(tick)} stroke={chartTheme.grid.primary} />
          <text
            x={plot.left - 8}
            y={yOf(tick) + 4}
            textAnchor="end"
            fill={diagramPalette.muted}
            fontSize={11}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {tick > 0 ? `+${tick}` : tick}
          </text>
        </g>
      ))}
      <text x={plot.left - 8} y={plot.top - 8} textAnchor="end" fill={diagramPalette.muted} fontSize={11}>
        dB
      </text>

      {/* 0dB（自由空間基準）線 */}
      <line
        x1={plot.left}
        x2={plot.right}
        y1={yOf(0)}
        y2={yOf(0)}
        stroke={chartTheme.reference.baseline}
        strokeDasharray={chartTheme.reference.baselineDash}
      />
      <text x={plot.right - 4} y={yOf(0) - 5} textAnchor="end" fill={diagramPalette.muted} fontSize={10}>
        0dB（自由空間）
      </text>

      {/* x目盛り */}
      {xTicks.map((tick) => (
        <text
          key={tick.label}
          x={xOf(tick.t)}
          y={plot.bottom + 18}
          textAnchor="middle"
          fill={diagramPalette.muted}
          fontSize={11}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {tick.label}
        </text>
      ))}
      <text x={plot.right} y={plot.bottom + 34} textAnchor="end" fill={diagramPalette.muted} fontSize={11}>
        d/λ
      </text>

      {/* λ/2 の深いヌル（漸近線＋直接ラベル） */}
      <line
        x1={xOf(0.5)}
        x2={xOf(0.5)}
        y1={plot.top}
        y2={plot.bottom}
        stroke={diagramPalette.danger}
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      <text x={xOf(0.5)} y={plot.bottom - 6} textAnchor="middle" fill={diagramPalette.dangerDeep} fontSize={10} fontWeight={700}>
        λ/2 ヌル（−∞）
      </text>
      {/* d→0（密着）の深いヌル */}
      <text x={plot.left + 6} y={plot.bottom - 6} fill={diagramPalette.dangerDeep} fontSize={10} fontWeight={700}>
        密着 d→0 で消える
      </text>

      {/* ΔGカーブ */}
      <polyline points={curvePoints.join(" ")} fill="none" stroke={diagramPalette.staf} strokeWidth={2.5} />

      {/* λ/4=+6dB ピークの直接ラベル */}
      <circle cx={xOf(0.25)} cy={yOf(METAL_PLANE_OPTIMAL_GAIN_DB)} r={4} fill={diagramPalette.successDeep} />
      <text
        x={xOf(0.25)}
        y={yOf(METAL_PLANE_OPTIMAL_GAIN_DB) - 10}
        textAnchor="middle"
        fill={diagramPalette.successDeep}
        fontSize={11}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        λ/4 → +6.0dB
      </text>

      {/* 現在点マーカー */}
      <circle cx={markerX} cy={markerY} r={6} fill={diagramPalette.danger} stroke={diagramPalette.white} strokeWidth={2} />
      <text
        x={markerAnchor === "start" ? markerX + 10 : markerX - 10}
        y={markerY - 10}
        textAnchor={markerAnchor}
        fill={diagramPalette.dangerDeep}
        fontSize={12}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        現在 {formatGainValue(gainChangeDb)}dB
      </text>
      {overRange ? (
        <text x={plot.right - 4} y={plot.top + 12} textAnchor="end" fill={diagramPalette.muted} fontSize={10}>
          d/λ&gt;1（グラフ右端に固定表示）
        </text>
      ) : null}
    </svg>
  );
}

export function MetalPlaneEffectPanel() {
  // 既定は 920MHz・d=λ/4相当(≈81.5mm)＝最適離隔: 「金属面はλ/4離せば +6dB の味方」を最初に見せる。
  const [frequencyMHz, setFrequencyMHz] = useState(920);
  const [distanceMm, setDistanceMm] = useState(81.5);

  const result = useMemo(() => {
    try {
      return calculateMetalPlaneEffect(frequencyMHz, distanceMm);
    } catch {
      return null;
    }
  }, [frequencyMHz, distanceMm]);

  // 早見表（現在の周波数で各代表離隔のΔGを lib から算出）。
  const referenceRows = useMemo(() => {
    return REFERENCE_FRACTIONS.map((row) => ({
      ...row,
      gainDb: metalPlaneGainChangeDb(row.fraction)
    }));
  }, []);

  const frequencyError =
    !Number.isFinite(frequencyMHz) || frequencyMHz <= 0
      ? "周波数は0より大きい値をMHzで入力してください。"
      : undefined;
  const distanceError =
    !Number.isFinite(distanceMm) || distanceMm < 0
      ? "距離は0以上の値をmmで入力してください。"
      : undefined;

  const wavelengthMm = result ? result.wavelengthM * 1000 : Number.NaN;
  // スライダー上限は 1波長ぶん（d/λ を 0〜1 でなぞれる）。周波数で自動追従する。
  const sliderMaxMm = Number.isFinite(wavelengthMm) ? Math.max(1, Math.round(wavelengthMm)) : 100;

  const primary = {
    label: "利得変化 ΔG",
    value: result === null ? "—" : formatGainValue(result.gainChangeDb),
    unit: "dB"
  };

  // 周波数プリセット: 選択時に最適離隔 λ/4 へ距離も合わせ、常にピークから見せ始める。
  const applyFrequency = (mhz: number) => {
    setFrequencyMHz(mhz);
    const quarterMm = (calculateWavelengthFromMHz(mhz) * 1000) / 4;
    setDistanceMm(Number(quarterMm.toFixed(1)));
  };

  const chipClass = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${
      active
        ? "border-staf bg-staf text-white"
        : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
    }`;

  const quarterMm = Number.isFinite(wavelengthMm) ? wavelengthMm / 4 : Number.NaN;

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,4.5fr)_minmax(0,5.5fr)] lg:items-start">
        {/* 左カラム：入力条件と結果・早見表 */}
        <div className="space-y-4">
          <div id="metal-plane-effect-primary-result">
            <ResultBar primary={primary} />
          </div>

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">入力条件</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              金属面の手前に置いたアンテナは、面の奥に「逆相の鏡像アンテナ」ができたのと等価になります。
              本物と鏡像の電波が干渉し、離隔 d によって強め合ったり打ち消し合ったりします。
              周波数と、金属面までの距離を入れてください。
            </p>

            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500">
                周波数プリセット（クリックで最適離隔 λ/4 にも自動セット）
              </p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="周波数プリセット">
                {FREQUENCY_PRESETS.map((preset) => (
                  <button
                    key={preset.mhz}
                    type="button"
                    className={chipClass(frequencyMHz === preset.mhz)}
                    onClick={() => applyFrequency(preset.mhz)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <Field
                id="metalFrequency"
                label="周波数"
                unit="MHz"
                value={frequencyMHz}
                min={1}
                step={10}
                emptyBehavior="preserve"
                onChange={setFrequencyMHz}
                help="波長 λ を決めます。金属面の効果は距離そのものではなく、波長に対する比 d/λ で決まるため、周波数が変わると最適離隔（λ/4）も変わります。"
                example="920"
                error={frequencyError}
              />
              <Field
                id="metalDistance"
                label="金属面までの距離 d"
                unit="mm"
                value={distanceMm}
                min={0}
                max={sliderMaxMm}
                step={0.5}
                showSlider
                emptyBehavior="preserve"
                onChange={setDistanceMm}
                help="アンテナの導体面から金属板までの離隔です。スライダーは1波長ぶん（d/λ=0〜1）を動きます。λ/4で+6dBのピーク、密着（0）とλ/2で深く落ち込みます。"
                example={Number.isFinite(quarterMm) ? formatNumber(quarterMm, 1) : "81.5"}
                error={distanceError}
              />
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              前提: 面はアンテナに平行な波長オーダー以上の完全導体平板、正面（板側ブロードサイド）方向の
              理想値です。有限板ではエッジ回折で深いヌルは −15〜−25dB 程度に埋まり、ピークもやや下がります。
            </p>
          </Card>

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">離隔ごとの利得変化（早見表）</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              λ={Number.isFinite(wavelengthMm) ? `${formatNumber(wavelengthMm, 1)}mm` : "—"} ／ 最適離隔 λ/4=
              {Number.isFinite(quarterMm) ? `${formatNumber(quarterMm, 1)}mm` : "—"} ／ 現在 d/λ=
              <span className="font-semibold tabular-nums text-slate-900">
                {result ? formatNumber(result.distanceLambda, 3) : "—"}
              </span>
              （電界係数 F={result ? formatNumber(result.fieldFactor, 3) : "—"}）
            </p>
            <div className="mt-3 space-y-1.5">
              {referenceRows.map((row) => {
                const isCurrent =
                  result !== null && Math.abs(result.distanceLambda - row.fraction) < 0.01;
                return (
                  <div
                    key={row.key}
                    className={`grid grid-cols-[1fr_92px] items-center gap-3 rounded-lg px-2 py-1 text-sm ${
                      isCurrent ? "bg-staf-light ring-1 ring-staf/40" : ""
                    }`}
                  >
                    <span className={isCurrent ? "font-semibold text-staf-dark" : "text-slate-600"}>
                      {row.label}
                    </span>
                    <span className="text-right font-semibold tabular-nums text-slate-900">
                      {formatGainValue(row.gainDb)}dB
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              この利得変化を
              <Link
                href="/tools/rf-basic-link-calculator"
                className="mx-1 inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                リンクバジェット診断のアンテナ利得
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
              に反映すると、金属筐体への実装込みで通信余裕を見積もれます。
            </p>
          </Card>
        </div>

        {/* 右カラム：幾何ミニ図と利得カーブ（スクロール追従） */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <ChartFrame
            eyebrow="幾何ミニ図＋ΔGカーブ"
            title="金属面までの距離と利得変化"
            description="上段は「アンテナ｜←d→｜金属板｜鏡像（逆相）」の幾何、下段は横軸 d/λ の利得変化カーブです。入力に連動し、λ/4=+6dBのピークと、密着・λ/2の深いヌルを現在点マーカーで確認できます。"
            exportName="metal-plane-effect-diagram"
            caption={
              result
                ? `条件: ${formatNumber(frequencyMHz)}MHz（λ=${formatNumber(wavelengthMm, 1)}mm）／ d=${formatNumber(distanceMm, 1)}mm（d/λ=${formatNumber(result.distanceLambda, 3)}）─ 利得変化 ${formatGainValue(result.gainChangeDb)}dB。ヌル（d=0・λ/2）は理論上 −∞、表示は ≤${FLOOR}dB。実機は有限板・エッジ回折で −15〜−25dB 程度に底打ちします。`
                : "入力値を確認してください。"
            }
          >
            {result ? (
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <MetalPlaneDiagram
                  distanceLambda={result.distanceLambda}
                  distanceMm={distanceMm}
                  gainChangeDb={result.gainChangeDb}
                />
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                入力値を確認すると幾何図とΔGカーブが表示されます。
              </p>
            )}
          </ChartFrame>
        </div>
      </section>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜ金属面で利得が±するのか"
          formula="F(x) = 2·|sin(2πx)|（x = d/λ）　ΔG[dB] = 20·log10(F)　d=λ/4で+6.02dB・d=n·λ/2で−∞"
          showColumnLink={false}
        >
          <p>
            <strong>① 金属板は「鏡」で、逆相の鏡像アンテナができます。</strong>
            完全な金属面は電波にとって鏡です。面に平行なアンテナを面の手前 d に置くと、鏡の中に
            映るように、面の奥 d に<strong>位相が反転した（逆相の）鏡像アンテナ</strong>が現れたのと
            同じ状態になります。空間には本物の電波と、鏡像の電波の二つが生まれます。
            ※「鏡」はたとえで、実際は完全導体面で電界の接線成分がゼロになる境界条件を満たすために
            逆相の鏡像源を置く、という数学（鏡像法）です。
          </p>
          <p>
            <strong>② 直接波と鏡像波の干渉で、強め合い／打ち消しが起きます。</strong>
            正面方向では、本物の波と鏡像の波が重なります。鏡像は逆相ですが、往復で
            距離のぶんだけ位相が回ります。二つの波の合成は電界係数
            <strong> F = 2·|sin(2πx)|</strong>（x=d/λ）で表せ、これを dB にしたのが
            利得変化 ΔG = 20·log₁₀F です（電界比なので 20log、電力比なら 10log）。
          </p>
          <p>
            <strong>③ λ/4で+6dB、密着でほぼ消えます。</strong>
            d=λ/4 のとき往復 λ/2 の遅れが逆相をちょうど打ち消して同相にそろい、F=2＝
            <strong>ΔG=+6.02dB</strong> のピーク。逆に d→0（板にベタ付け）や d=λ/2 では逆相の二波が
            相殺して F=0＝ΔG=−∞、電波はほとんど前へ出ません。これが
            <strong>「金属筐体にアンテナをベタ付けすると飛ばない」</strong>の理由です。
            ※現実の板は無限でも完全な鏡でもなく、有限板ではエッジで電波が回り込む（エッジ回折）ため、
            理論上の −∞ ヌルは −15〜−25dB 程度で底を打ち、+6dB ピークも板が小さいと目減りします。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <MetalPlaneEffectColumn />
      </div>

      <MobileResultBar primary={primary} targetId="metal-plane-effect-primary-result" />
    </>
  );
}

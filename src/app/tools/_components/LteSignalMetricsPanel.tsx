"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Callout, type CalloutTone } from "@/components/Callout";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import {
  CE_COVERAGE_NOTE,
  CELLULAR_SIGNAL_BAND_SOURCES,
  CELLULAR_SIGNAL_BANDS,
  CELLULAR_SIGNAL_LEVEL_LABELS,
  type CellularMetricThresholds,
  type CellularMode,
  type CellularSignalLevel
} from "@/data/cellularSignalBands";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import {
  LTE_RESOURCE_BLOCKS,
  SUBCARRIERS_PER_RESOURCE_BLOCK,
  fullLoadCorrectionDb,
  judgeCellularSignal,
  resourceBlocksForLteBandwidthMhz,
  rsrpFromRssi,
  rsrqFromMeasurements,
  rssiFromRsrp
} from "@/lib/rf/signalMetrics";
import { formatNumber } from "@/lib/rf/format";
import { CONTACT_URL } from "@/lib/rf/presets";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { LteSignalMetricsColumn } from "./LteSignalMetricsColumn";

type Direction = "rssiToRsrp" | "rsrpToRssi";

// 換算方向のメタ（入力・出力どちらがRSSI/RSRPか）。ラベル・例・軸色をここに集約する。
const DIRECTIONS: Record<
  Direction,
  { chip: string; inputLabel: string; outputLabel: string; example: string }
> = {
  rssiToRsrp: {
    chip: "RSSI → RSRP",
    inputLabel: "RSSI（帯域全体の受信電力）",
    outputLabel: "RSRP",
    example: "-70"
  },
  rsrpToRssi: {
    chip: "RSRP → RSSI",
    inputLabel: "RSRP（基準信号1本分）",
    outputLabel: "RSSI",
    example: "-98"
  }
};

// LTEチャネル帯域幅チップ（RB数は 3GPP TS 36.101 の表＝lib LTE_RESOURCE_BLOCKS を正とする）。
const BANDWIDTH_CHIPS = LTE_RESOURCE_BLOCKS;

// ---- 良否判定（G15判定強化） --------------------------------------------------------------
// 判定レベル→Calloutトーンの写像（excellent=success／good=info／fair=caution／poor=danger）。
const JUDGE_TONE: Record<CellularSignalLevel, CalloutTone> = {
  excellent: "success",
  good: "info",
  fair: "caution",
  poor: "danger"
};

const JUDGE_MODES: readonly CellularMode[] = ["lte-m", "nb-iot"];

const JUDGE_LEVELS: readonly CellularSignalLevel[] = ["excellent", "good", "fair", "poor"];

// しきい値表の帯を表示文字列にする（境界は「下限以上（≥）」で上位の段に入る）。
function thresholdRangeText(
  thresholds: CellularMetricThresholds,
  level: CellularSignalLevel
): string {
  switch (level) {
    case "excellent":
      return `${thresholds.excellentMin}${thresholds.unit} 以上`;
    case "good":
      return `${thresholds.goodMin} 〜 ${thresholds.excellentMin}${thresholds.unit}`;
    case "fair":
      return `${thresholds.fairMin} 〜 ${thresholds.goodMin}${thresholds.unit}`;
    case "poor":
      return `${thresholds.fairMin}${thresholds.unit} 未満`;
  }
}

// ---- 帯域占有図＋電力ラダー（入力連動の動的SVG） -------------------------------------
// 上段: 帯域を N_RB セルの帯で描き「RSSI=帯域全部(12×N_RB本)の合計／RSRP=基準信号1本分」を
//       面積（本数）で見せる。帯の長さは帯域幅(RB数)に連動。
// 下段: dBm軸の上に RSSI と RSRP を打ち、その差＝補正(10log10(12·N_RB))を寸法線で直接ラベリング。
//       「帯域が広いほど本数が増え、差が開く」ことが1枚で伝わる。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目）。

function LteBandDiagram({
  bandwidthMhz,
  rssiDbm,
  rsrpDbm,
  correctionDb,
  resourceBlocks
}: {
  bandwidthMhz: number;
  rssiDbm: number;
  rsrpDbm: number;
  correctionDb: number;
  resourceBlocks: number;
}) {
  const chart = { width: 640, height: 340 };
  const subTotal = SUBCARRIERS_PER_RESOURCE_BLOCK * resourceBlocks;
  const maxRb = LTE_RESOURCE_BLOCKS[LTE_RESOURCE_BLOCKS.length - 1].resourceBlocks;

  // 上段: 帯域占有バー（長さは RB数 / 最大RB数 に比例）。
  const bandX = 60;
  const bandY = 66;
  const bandH = 40;
  const bandMaxW = 500;
  const bandW = Math.max(24, (bandMaxW * resourceBlocks) / maxRb);
  const cellW = bandW / resourceBlocks;
  const reW = Math.max(4, cellW / SUBCARRIERS_PER_RESOURCE_BLOCK); // 表示上の下限幅（1本の目印）

  // 下段: dBm 軸（RSRP=弱い＝左、RSSI=強い＝右）。
  const axisY = 258;
  const axisLeft = 60;
  const axisRight = chart.width - 40;
  const lo = Math.floor((Math.min(rssiDbm, rsrpDbm) - 8) / 5) * 5;
  const hi = Math.ceil((Math.max(rssiDbm, rsrpDbm) + 8) / 5) * 5;
  const span = Math.max(1, hi - lo);
  const xFor = (dbm: number) => axisLeft + ((dbm - lo) / span) * (axisRight - axisLeft);
  const ticks = Array.from({ length: Math.floor(span / 10) + 1 }, (_, i) => lo + i * 10).filter(
    (t) => t <= hi
  );
  const rssiX = xFor(rssiDbm);
  const rsrpX = xFor(rsrpDbm);
  const dimY = axisY - 44;

  return (
    <svg
      role="img"
      aria-label={`帯域幅 RB=${resourceBlocks}（サブキャリア${subTotal}本）。RSSI ${formatNumber(rssiDbm, 1)}dBm、RSRP ${formatNumber(rsrpDbm, 1)}dBm、補正 ${formatNumber(correctionDb, 1)}dB`}
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />

      {/* ── 上段: 帯域占有（面積＝本数） ────────────────────────── */}
      <text x={bandX} y={34} fill={diagramPalette.ink} fontSize={13} fontWeight={700}>
        帯域幅 {bandwidthMhz}MHz ＝ {resourceBlocks} リソースブロック
      </text>

      {/* 全体スパン括弧（RSSI = 帯域全部の合計） */}
      <line x1={bandX} x2={bandX + bandW} y1={bandY - 12} y2={bandY - 12} stroke={chartTheme.seriesText.source} strokeWidth={1.5} />
      <line x1={bandX} x2={bandX} y1={bandY - 16} y2={bandY - 8} stroke={chartTheme.seriesText.source} strokeWidth={1.5} />
      <line x1={bandX + bandW} x2={bandX + bandW} y1={bandY - 16} y2={bandY - 8} stroke={chartTheme.seriesText.source} strokeWidth={1.5} />
      <text
        x={bandX + bandW + 10}
        y={bandY - 8}
        fill={chartTheme.seriesText.source}
        fontSize={12}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        RSSI ＝ 12×{resourceBlocks} ＝ {subTotal}本の和
      </text>

      {/* 帯域バー本体（薄青） */}
      <rect x={bandX} y={bandY} width={bandW} height={bandH} rx={4} fill={diagramPalette.skyPale} stroke={chartTheme.seriesText.source} strokeWidth={1.5} />
      {/* RBセルの区切り（淡線） */}
      {Array.from({ length: Math.max(0, resourceBlocks - 1) }, (_, i) => {
        const gx = bandX + cellW * (i + 1);
        return <line key={i} x1={gx} x2={gx} y1={bandY} y2={bandY + bandH} stroke={diagramPalette.faint} strokeWidth={0.5} />;
      })}
      {/* RSRP = 基準信号1本分（最左の1本を強調） */}
      <rect x={bandX} y={bandY} width={reW} height={bandH} fill={chartTheme.series.gain} stroke={chartTheme.seriesText.gain} strokeWidth={1} />
      {/* 1本 → ラベルへの引き出し線 */}
      <line x1={bandX + reW / 2} x2={bandX + reW / 2} y1={bandY + bandH} y2={bandY + bandH + 16} stroke={chartTheme.seriesText.gain} strokeWidth={1.2} />
      <text
        x={bandX + reW / 2 - 2}
        y={bandY + bandH + 30}
        fill={chartTheme.seriesText.gain}
        fontSize={12}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        RSRP ＝ 基準信号1本分（全体の 1/{subTotal}）
      </text>

      {/* ── 下段: dBm ラダー（差＝補正dB） ────────────────────── */}
      <line x1={axisLeft} x2={axisRight} y1={axisY} y2={axisY} stroke={chartTheme.grid.secondary} strokeWidth={1.5} />
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={xFor(tick)} x2={xFor(tick)} y1={axisY} y2={axisY + 5} stroke={diagramPalette.faint} />
          <text
            x={xFor(tick)}
            y={axisY + 20}
            textAnchor="middle"
            fill={diagramPalette.muted}
            fontSize={11}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {tick}
          </text>
        </g>
      ))}
      <text x={axisRight} y={axisY + 20} textAnchor="end" fill={diagramPalette.muted} fontSize={11} fontWeight={600}>
        dBm
      </text>

      {/* RSRP マーカー（弱・emerald） */}
      <line x1={rsrpX} x2={rsrpX} y1={dimY} y2={axisY} stroke={chartTheme.seriesText.gain} strokeWidth={1.5} />
      <circle cx={rsrpX} cy={axisY} r={4} fill={chartTheme.series.gain} stroke={chartTheme.surface.plain} strokeWidth={1.5} />
      <text x={rsrpX} y={dimY - 8} textAnchor="middle" fill={chartTheme.seriesText.gain} fontSize={12} fontWeight={700} style={{ fontVariantNumeric: "tabular-nums" }}>
        RSRP {formatNumber(rsrpDbm, 1)}
      </text>

      {/* RSSI マーカー（強・青） */}
      <line x1={rssiX} x2={rssiX} y1={dimY} y2={axisY} stroke={chartTheme.seriesText.source} strokeWidth={1.5} />
      <circle cx={rssiX} cy={axisY} r={4} fill={chartTheme.series.source} stroke={chartTheme.surface.plain} strokeWidth={1.5} />
      <text x={rssiX} y={dimY - 8} textAnchor="middle" fill={chartTheme.seriesText.source} fontSize={12} fontWeight={700} style={{ fontVariantNumeric: "tabular-nums" }}>
        RSSI {formatNumber(rssiDbm, 1)}
      </text>

      {/* 差＝補正dB の寸法線 */}
      <line x1={rsrpX} x2={rssiX} y1={dimY} y2={dimY} stroke={diagramPalette.inkSoft} strokeWidth={1.2} />
      <line x1={rsrpX} x2={rsrpX + 6} y1={dimY} y2={dimY - 4} stroke={diagramPalette.inkSoft} strokeWidth={1.2} />
      <line x1={rsrpX} x2={rsrpX + 6} y1={dimY} y2={dimY + 4} stroke={diagramPalette.inkSoft} strokeWidth={1.2} />
      <line x1={rssiX} x2={rssiX - 6} y1={dimY} y2={dimY - 4} stroke={diagramPalette.inkSoft} strokeWidth={1.2} />
      <line x1={rssiX} x2={rssiX - 6} y1={dimY} y2={dimY + 4} stroke={diagramPalette.inkSoft} strokeWidth={1.2} />
      <text
        x={(rsrpX + rssiX) / 2}
        y={dimY - 10}
        textAnchor="middle"
        fill={diagramPalette.ink}
        fontSize={12}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        補正 {formatNumber(correctionDb, 1)}dB ＝ 10log₁₀({subTotal})
      </text>
    </svg>
  );
}

export function LteSignalMetricsPanel() {
  // 既定: RSSI=-70dBm・10MHz(50RB) → RSRP=-97.8dBm（スマホの棒表示＝RSRPの世界を最初に見せる）。
  const [direction, setDirection] = useState<Direction>("rssiToRsrp");
  const [inputDbm, setInputDbm] = useState(-70);
  const [bandwidthMhz, setBandwidthMhz] = useState(10);
  // 良否判定のモード（LTE-M / NB-IoT でしきい値表が異なる）。
  const [judgeMode, setJudgeMode] = useState<CellularMode>("lte-m");

  const meta = DIRECTIONS[direction];

  const result = useMemo(() => {
    try {
      const resourceBlocks = resourceBlocksForLteBandwidthMhz(bandwidthMhz);
      const correctionDb = fullLoadCorrectionDb(resourceBlocks);
      const rssiDbm =
        direction === "rssiToRsrp" ? inputDbm : rssiFromRsrp(inputDbm, resourceBlocks);
      const rsrpDbm =
        direction === "rssiToRsrp" ? rsrpFromRssi(inputDbm, resourceBlocks) : inputDbm;
      const convertedDbm = direction === "rssiToRsrp" ? rsrpDbm : rssiDbm;
      // フルロード時の RSRQ 理論上限（負荷100%）。定義式から算出（結果は帯域幅に依らず約-10.8dB）。
      const rsrqDb = rsrqFromMeasurements(rsrpDbm, rssiDbm, resourceBlocks);
      return { resourceBlocks, correctionDb, rssiDbm, rsrpDbm, convertedDbm, rsrqDb };
    } catch {
      return null;
    }
  }, [direction, inputDbm, bandwidthMhz]);

  // RSRP（換算結果または入力そのもの）を安定運用の推奨帯で判定する。
  const judgement = useMemo(() => {
    if (result === null) {
      return null;
    }
    try {
      return judgeCellularSignal({ mode: judgeMode, rsrpDbm: result.rsrpDbm });
    } catch {
      return null;
    }
  }, [result, judgeMode]);

  const judgeBand = CELLULAR_SIGNAL_BANDS[judgeMode];
  const judgeRsrpThresholds = judgeBand.metrics.find((row) => row.metric === "rsrp");

  const inputError = !Number.isFinite(inputDbm)
    ? `${meta.outputLabel === "RSRP" ? "RSSI" : "RSRP"}の値をdBmで入力してください。`
    : undefined;

  const primary = {
    label: `換算結果（${meta.outputLabel}）`,
    value: result === null ? "—" : formatNumber(result.convertedDbm, 1),
    unit: "dBm"
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
            スマホのアンテナ棒が指しているのは<strong>RSRP</strong>（基準信号1本分の電力）です。一方、電測アプリの
            <strong>RSSI</strong>は帯域全体の合計電力。両者は「帯域が何本ぶんか」だけずれます。方向と帯域幅を選ぶと、
            フルロード仮定で相互換算します。
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">換算方向</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="換算方向">
              {(Object.keys(DIRECTIONS) as Direction[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={chipClass(direction === key)}
                  onClick={() => setDirection(key)}
                >
                  {DIRECTIONS[key].chip}
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs font-semibold text-slate-500">
              LTEチャネル帯域幅（RB数は 3GPP TS 36.101）
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="LTE帯域幅">
              {BANDWIDTH_CHIPS.map((entry) => (
                <button
                  key={entry.bandwidthMhz}
                  type="button"
                  className={chipClass(bandwidthMhz === entry.bandwidthMhz)}
                  onClick={() => setBandwidthMhz(entry.bandwidthMhz)}
                >
                  {entry.bandwidthMhz}MHz
                  <span className="ml-1 text-xs font-normal opacity-80">{entry.resourceBlocks}RB</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Field
              id="lteInputDbm"
              label={`入力: ${meta.inputLabel}`}
              unit="dBm"
              value={inputDbm}
              min={-140}
              max={0}
              step={0.5}
              emptyBehavior="preserve"
              onChange={setInputDbm}
              help="電測アプリやモデムのAT+CSQ/サービスメニューで読める値です。RSSIは帯域全体の合計、RSRPは基準信号1本分——同じ画面でも意味が違います。"
              example={meta.example}
              error={inputError}
            />
          </div>

          <div className="slate">
            <p className="text-xs font-semibold text-slate-500">この帯域幅での内訳</p>
            <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">リソースブロック</p>
                <p className="font-semibold tabular-nums text-slate-900">
                  {result ? `${result.resourceBlocks} RB` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">補正量</p>
                <p className="font-semibold tabular-nums text-slate-900">
                  {result ? `${formatNumber(result.correctionDb, 1)} dB` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">RSRQ（フルロード上限）</p>
                <p className="font-semibold tabular-nums text-slate-900">
                  {result ? `${formatNumber(result.rsrqDb, 1)} dB` : "—"}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              RSRQ = 10log₁₀(N_RB) + RSRP − RSSI。全RBでデータ送信（フルロード）のときは帯域幅に依らず
              約 −10.8dB が上限で、負荷が下がるほど（RSSIが下がるため）RSRQは改善します。
            </p>
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="lte-signal-metrics-primary-result">
            <ResultBar primary={primary} />
          </div>

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">RSRPの良否判定（セルラーIoT）</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              換算したRSRPを、LTE-M / NB-IoT の安定運用推奨帯で4段階判定します。
            </p>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="判定モード">
              {JUDGE_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={chipClass(judgeMode === mode)}
                  onClick={() => setJudgeMode(mode)}
                >
                  {CELLULAR_SIGNAL_BANDS[mode].label}
                </button>
              ))}
            </div>

            <div className="mt-3">
              {judgement && result ? (
                <Callout
                  tone={JUDGE_TONE[judgement.level]}
                  title={
                    <span data-testid="cellular-judge-level">
                      判定: {CELLULAR_SIGNAL_LEVEL_LABELS[judgement.level].ja}（
                      {CELLULAR_SIGNAL_LEVEL_LABELS[judgement.level].en}）
                    </span>
                  }
                >
                  RSRP {formatNumber(result.rsrpDbm, 1)} dBm は {judgeBand.label} の
                  {CELLULAR_SIGNAL_LEVEL_LABELS[judgement.level].ja}帯
                  {judgeRsrpThresholds
                    ? `（${thresholdRangeText(judgeRsrpThresholds, judgement.level)}）`
                    : ""}
                  に入ります。
                </Callout>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500">
                  入力値を確認すると判定が表示されます。
                </p>
              )}
            </div>

            <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
              <summary className="cursor-pointer text-xs font-semibold text-slate-600">
                判定しきい値表（{judgeBand.label}・出典つき）
              </summary>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[420px] border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="py-1.5 pr-2 font-semibold">指標</th>
                      {JUDGE_LEVELS.map((level) => (
                        <th key={level} className="py-1.5 pr-2 font-semibold">
                          {CELLULAR_SIGNAL_LEVEL_LABELS[level].ja}（
                          {CELLULAR_SIGNAL_LEVEL_LABELS[level].en}）
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {judgeBand.metrics.map((row) => (
                      <tr key={row.metric} className="border-b border-slate-100">
                        <td className="py-1.5 pr-2 font-semibold text-slate-700">
                          {row.label}
                          <span className="ml-1 font-normal text-slate-400">[{row.unit}]</span>
                        </td>
                        {JUDGE_LEVELS.map((level) => (
                          <td key={level} className="py-1.5 pr-2 tabular-nums text-slate-600">
                            {thresholdRangeText(row, level)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                境界値は上位側の段に入ります（例: LTE-M の RSRP −100dBm は Fair の下端）。総合判定は
                判明している指標（本ツールではRSRP）の最悪値です。
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-500">
                {CELLULAR_SIGNAL_BAND_SOURCES.map((source) => (
                  <li key={source.label}>
                    出典:{" "}
                    {source.href ? (
                      <a
                        className="font-semibold underline"
                        href={source.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {source.label}
                      </a>
                    ) : (
                      <span className="font-semibold">{source.label}</span>
                    )}
                    {source.note ? ` ― ${source.note}` : ""}
                  </li>
                ))}
              </ul>
            </details>

            <div className="mt-3">
              <Callout tone="caution" size="sm" title="目安値・実測前提">
                {CE_COVERAGE_NOTE}
                アンテナ実装や筐体・設置環境でRSRPは実測で大きく変わるため、最終判断は現場実測を前提にしてください。建物・筐体込みの実測評価は
                <a
                  href={CONTACT_URL}
                  className="mx-1 font-semibold text-staf-dark underline decoration-staf/40 underline-offset-2 hover:text-staf"
                >
                  技術相談窓口
                </a>
                へどうぞ。
              </Callout>
            </div>
          </Card>

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">帯域幅ごとの RSSI−RSRP 差（補正量）</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              補正量 = 10log₁₀(12×N_RB)。帯域が広い＝合計する本数が多いほど、RSSIとRSRPの差は開きます。
            </p>
            <div className="mt-3 space-y-1.5">
              {LTE_RESOURCE_BLOCKS.map((entry) => {
                const isCurrent = entry.bandwidthMhz === bandwidthMhz;
                const corr = fullLoadCorrectionDb(entry.resourceBlocks);
                return (
                  <div
                    key={entry.bandwidthMhz}
                    className={`grid grid-cols-[72px_1fr_72px] items-center gap-3 rounded-lg px-2 py-1 text-sm ${
                      isCurrent ? "bg-staf-light ring-1 ring-staf/40" : ""
                    }`}
                  >
                    <span className={isCurrent ? "font-semibold text-staf-dark" : "text-slate-600"}>
                      {entry.bandwidthMhz}MHz
                    </span>
                    <span className="text-xs tabular-nums text-slate-500">
                      {entry.resourceBlocks}RB ／ {SUBCARRIERS_PER_RESOURCE_BLOCK * entry.resourceBlocks}本
                    </span>
                    <span className="text-right font-semibold tabular-nums text-slate-900">
                      {formatNumber(corr, 1)}dB
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              換算した RSRP を
              <Link
                href="/tools/noise-floor"
                className="mx-1 inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                ノイズフロア・受信感度
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
              の感度と比べると、圏外ギリギリまでの余裕が物理限界と結びつきます。
            </p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="帯域占有図"
          title="RSSIは帯域全部の和、RSRPは基準信号1本分"
          description="上の帯は帯域幅（リソースブロック数）に連動します。帯域全体の合計がRSSI、そのうち基準信号1本分がRSRP。下のdBm軸で、両者の差＝補正量を直接読めます。"
          exportName="lte-signal-metrics-band"
          caption={
            result
              ? `条件: ${meta.chip} / 帯域 ${bandwidthMhz}MHz(${result.resourceBlocks}RB) ─ RSSI ${formatNumber(result.rssiDbm, 1)}dBm・RSRP ${formatNumber(result.rsrpDbm, 1)}dBm・補正 ${formatNumber(result.correctionDb, 1)}dB（フルロード仮定・3GPP TS 36.214）`
              : "入力値を確認してください。"
          }
        >
          {result ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <LteBandDiagram
                bandwidthMhz={bandwidthMhz}
                rssiDbm={result.rssiDbm}
                rsrpDbm={result.rsrpDbm}
                correctionDb={result.correctionDb}
                resourceBlocks={result.resourceBlocks}
              />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              入力値を確認すると帯域占有図が表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜRSSIとRSRPは同じ電波で値が違うのか"
          formula="RSRP[dBm] = RSSI[dBm] − 10log10(12 × N_RB)　（フルロード仮定・3GPP TS 36.214）"
          showColumnLink={false}
        >
          <p>
            <strong>① スマホの「アンテナ棒」の中身はRSRPです。</strong>
            LTEの基地局は、位置合わせのための<strong>基準信号（リファレンス信号）</strong>を帯域のあちこちに
            一定電力で撒いています。端末はその1本あたりの電力を測る——これがRSRP（Reference Signal
            Received Power）。棒の本数も画面の「-XX dBm」も、正体はこのRSRPです。
          </p>
          <p>
            <strong>② RSSIは帯域全部の合計、RSRPは1本分。</strong>
            RSSI（Received Signal Strength Indicator）は、その帯域幅で受け取った<strong>全サブキャリアの
            電力を足し合わせた</strong>値です。1リソースブロックは12本、10MHz帯なら50RB=600本。だから
            RSSIとRSRPの差は 10log₁₀(12×N_RB)——<strong>帯域が広いほど「合計する本数」が増え、差が開きます</strong>。
            教室で例えるなら、RSSIは<strong>全員が一斉に話す声の総量</strong>、RSRPは<strong>先生1人の声</strong>。
            人数（帯域）が多いほど、総量と1人分の差は大きくなります。
            ※この足し算は「全RBでデータを送っている（フルロード）」前提です。実際は負荷で本数が変わり、
            空いているRBが多いほどRSSIは下がる——たとえの教室が半分空席なら総量も減る、というのが破れです。
          </p>
          <p>
            <strong>③ 実務: 指標を混ぜると圏内判定を誤ります。</strong>
            電測アプリはRSSI・RSRP・RSRQ・SINRを並べて表示しますが、閾値はそれぞれ別物です。
            「RSSIが-70dBmもあるのに繋がらない」——10MHz帯ならRSRPは約-98dBmで、判定に使うべきはこちら。
            RSSIの数字でRSRPの閾値を測ると、27.8dBぶん楽観してしまいます。
          </p>
          <p>
            結論: RSSIとRSRPは別のものさし。棒表示＝RSRPを基準に読み、帯域幅ぶんの補正
            10log₁₀(12×N_RB) を意識すれば、両者は1本の式でつながります。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <LteSignalMetricsColumn />
      </div>

      <MobileResultBar primary={primary} targetId="lte-signal-metrics-primary-result" />
    </>
  );
}

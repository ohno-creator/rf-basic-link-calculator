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
import { diagramPalette } from "@/lib/ui/diagramTheme";
import {
  calculatePolarizationMismatchLossDb,
  circularCircularMismatchLossDb,
  LINEAR_CIRCULAR_MISMATCH_LOSS_DB,
  linearLinearMismatchLossDb,
  POLARIZATION_LOSS_DISPLAY_CAP_DB,
  type CircularSense
} from "@/lib/rf/polarizationMismatch";
import { formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { PolarizationLossColumn } from "./PolarizationLossColumn";

type PolarizationMode = "linear-linear" | "linear-circular" | "circular-circular";

const MODE_OPTIONS: Array<{ value: PolarizationMode; label: string }> = [
  { value: "linear-linear", label: "直線 ↔ 直線" },
  { value: "linear-circular", label: "直線 ↔ 円" },
  { value: "circular-circular", label: "円 ↔ 円" }
];

const SENSE_OPTIONS: Array<{ value: CircularSense; label: string }> = [
  { value: "co", label: "同旋（右旋↔右旋 など）" },
  { value: "cross", label: "逆旋（右旋↔左旋）" }
];

// 傾き角のクイック設定。純粋に幾何学的な基準角のみ（0°=一致、90°=直交は定義そのもの。
// 45°は向きが不定な端末の慣用的な設計想定角で、損失3dBは -20log10(cos45°) の数学的帰結）。
const ANGLE_CHIPS = [0, 15, 30, 45, 60, 75, 90] as const;

// 早見表の行（値はすべて lib の関数・定数から導出し、表示と計算の食い違いを防ぐ）。
type ReferenceKey = "lin0" | "lin45" | "lin90" | "lincirc" | "co" | "cross";
const REFERENCE_ROWS: Array<{ key: ReferenceKey; label: string; lossDb: number }> = [
  { key: "lin0", label: "直線↔直線 θ=0°（整合）", lossDb: linearLinearMismatchLossDb(0) },
  { key: "lin45", label: "直線↔直線 θ=45°", lossDb: linearLinearMismatchLossDb(45) },
  { key: "lin90", label: "直線↔直線 θ=90°（直交）", lossDb: linearLinearMismatchLossDb(90) },
  { key: "lincirc", label: "直線↔円（角度に依らず）", lossDb: LINEAR_CIRCULAR_MISMATCH_LOSS_DB },
  { key: "co", label: "円↔円 同旋", lossDb: circularCircularMismatchLossDb("co") },
  { key: "cross", label: "円↔円 逆旋", lossDb: circularCircularMismatchLossDb("cross") }
];

// ---- 偏波の向き図＋損失カーブ（入力連動の動的SVG） -----------------------------------
// 左=送信アンテナの偏波（縦の両矢印=垂直直線偏波、または回転向き付きの円=円偏波）、
// 右=受信アンテナの偏波（直線はθに応じてSVG transform rotateで回転、円は旋回向きを反転表示）。
// 直線-直線時は下段に -20log10|cosθ| のカーブと現在点を描く。θ=90°の理論∞は
// lib の表示クランプ提案値（POLARIZATION_LOSS_DISPLAY_CAP_DB=40dB）で頭打ちにして見せる。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目: v4 R4方式）。

/** 直線偏波の両矢印（偏波面の向き）。angleDeg だけ中心回転する。 */
function LinearPolArrow({
  cx,
  cy,
  angleDeg,
  color
}: {
  cx: number;
  cy: number;
  angleDeg: number;
  color: string;
}) {
  const half = 55;
  return (
    <g transform={`rotate(${angleDeg} ${cx} ${cy})`}>
      <line
        x1={cx}
        y1={cy - half + 12}
        x2={cx}
        y2={cy + half - 12}
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <polygon points={`${cx},${cy - half} ${cx - 7},${cy - half + 14} ${cx + 7},${cy - half + 14}`} fill={color} />
      <polygon points={`${cx},${cy + half} ${cx - 7},${cy + half - 14} ${cx + 7},${cy + half - 14}`} fill={color} />
    </g>
  );
}

/** 円偏波の輪（回転向きの矢じり付き）。clockwise=false で旋回を反転して描く。 */
function CircularPolRing({
  cx,
  cy,
  clockwise,
  color
}: {
  cx: number;
  cy: number;
  clockwise: boolean;
  color: string;
}) {
  const r = 42;
  const tipY = cy - r;
  const head = clockwise
    ? `${cx + 13},${tipY} ${cx - 2},${tipY - 7} ${cx - 2},${tipY + 7}`
    : `${cx - 13},${tipY} ${cx + 2},${tipY - 7} ${cx + 2},${tipY + 7}`;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={4} />
      <polygon points={head} fill={color} />
      <circle cx={cx} cy={cy} r={3.5} fill={color} />
    </g>
  );
}

function PolarizationDiagram({
  mode,
  angleDeg,
  sense,
  lossDb
}: {
  mode: PolarizationMode;
  angleDeg: number;
  sense: CircularSense;
  lossDb: number;
}) {
  const isLinLin = mode === "linear-linear";
  const width = 640;
  const height = isLinLin ? 400 : 212;
  const tx = { x: 150, y: 110 };
  const rx = { x: 490, y: 110 };
  const cap = POLARIZATION_LOSS_DISPLAY_CAP_DB;

  const lossText = Number.isFinite(lossDb)
    ? `偏波損失 ${formatNumber(lossDb, 1)}dB`
    : `偏波損失 理論上∞（表示は ≥${cap}dB）`;
  const lossColor =
    !Number.isFinite(lossDb) || lossDb >= 10
      ? diagramPalette.dangerDeep
      : lossDb >= 1
        ? diagramPalette.warnDeep
        : diagramPalette.successDeep;

  // 下段カーブ（直線-直線時のみ）: θ 0〜90° を x、損失 0〜40dB を y に取る。
  const plot = { left: 56, right: 616, top: 244, bottom: 366 };
  const xOf = (deg: number) => plot.left + (deg / 90) * (plot.right - plot.left);
  const yOf = (loss: number) => plot.bottom - (Math.min(loss, cap) / cap) * (plot.bottom - plot.top);
  const curvePoints: string[] = [];
  if (isLinLin) {
    for (let t = 0; t <= 90; t += 0.5) {
      // lib の式そのもの（θ=90°は∞）をクランプして描く。
      const lossAt = Math.min(cap, linearLinearMismatchLossDb(t));
      curvePoints.push(`${xOf(t).toFixed(1)},${yOf(lossAt).toFixed(1)}`);
    }
  }
  const markerLoss = Math.min(cap, lossDb);
  const markerX = xOf(angleDeg);
  const markerY = yOf(markerLoss);
  const markerLabel = Number.isFinite(lossDb) ? `${formatNumber(lossDb, 1)}dB` : `∞（≥${cap}dB）`;
  const markerAnchor: "start" | "end" = angleDeg > 55 ? "end" : "start";

  const rxLabel = isLinLin
    ? `受信（直線・θ=${formatNumber(angleDeg, 0)}°）`
    : mode === "linear-circular"
      ? "受信（円偏波）"
      : sense === "co"
        ? "受信（右旋・同旋）"
        : "受信（左旋・逆旋）";
  const txLabel =
    mode === "circular-circular" ? "送信（右旋円偏波）" : "送信（直線・垂直偏波 基準）";

  const arcR = 65;
  const arcEndX = rx.x + arcR * Math.sin((angleDeg * Math.PI) / 180);
  const arcEndY = rx.y - arcR * Math.cos((angleDeg * Math.PI) / 180);

  return (
    <svg
      role="img"
      aria-label={`送受信アンテナの偏波の向きと不整合損失。${lossText}`}
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
    >
      <rect width={width} height={height} fill={chartTheme.surface.canvas} />

      {/* 現在の損失（中央上） */}
      <text
        x={(tx.x + rx.x) / 2}
        y={44}
        textAnchor="middle"
        fill={lossColor}
        fontSize={15}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {lossText}
      </text>
      {mode === "circular-circular" && sense === "cross" ? (
        <text
          x={(tx.x + rx.x) / 2}
          y={62}
          textAnchor="middle"
          fill={diagramPalette.muted}
          fontSize={10}
        >
          実機は交差偏波識別度（XPD）で決まり、20dB超程度が目安
        </text>
      ) : null}
      {mode === "linear-circular" ? (
        <text
          x={(tx.x + rx.x) / 2}
          y={62}
          textAnchor="middle"
          fill={diagramPalette.muted}
          fontSize={10}
        >
          旋回方向・角度に依らず常に 3dB（電力が半分）
        </text>
      ) : null}

      {/* 伝搬線（送信→受信） */}
      <line
        x1={tx.x + 50}
        x2={rx.x - 62}
        y1={tx.y}
        y2={rx.y}
        stroke={diagramPalette.path}
        strokeWidth={2}
        strokeDasharray="6 5"
      />
      <polygon
        points={`${rx.x - 50},${rx.y} ${rx.x - 62},${rx.y - 6} ${rx.x - 62},${rx.y + 6}`}
        fill={diagramPalette.path}
      />
      <text x={(tx.x + rx.x) / 2} y={rx.y - 10} textAnchor="middle" fill={diagramPalette.muted} fontSize={11}>
        伝搬方向
      </text>

      {/* 送信側の偏波 */}
      {mode === "circular-circular" ? (
        <CircularPolRing cx={tx.x} cy={tx.y} clockwise color={diagramPalette.staf} />
      ) : (
        <LinearPolArrow cx={tx.x} cy={tx.y} angleDeg={0} color={diagramPalette.staf} />
      )}
      <text x={tx.x} y={196} textAnchor="middle" fill={diagramPalette.stafDark} fontSize={12} fontWeight={600}>
        {txLabel}
      </text>

      {/* 受信側の偏波 */}
      {isLinLin ? (
        <g>
          {/* 垂直基準線と傾き角θの弧 */}
          <line
            x1={rx.x}
            y1={rx.y - 72}
            x2={rx.x}
            y2={rx.y + 72}
            stroke={diagramPalette.faint}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          {angleDeg > 0.5 ? (
            <path
              d={`M ${rx.x} ${rx.y - arcR} A ${arcR} ${arcR} 0 0 1 ${arcEndX.toFixed(1)} ${arcEndY.toFixed(1)}`}
              fill="none"
              stroke={diagramPalette.successDeep}
              strokeWidth={1.5}
            />
          ) : null}
          <text
            x={rx.x + 80 * Math.sin(((angleDeg / 2) * Math.PI) / 180) + 8}
            y={rx.y - 80 * Math.cos(((angleDeg / 2) * Math.PI) / 180)}
            fill={diagramPalette.successDeep}
            fontSize={12}
            fontWeight={700}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            θ={formatNumber(angleDeg, 0)}°
          </text>
          <LinearPolArrow cx={rx.x} cy={rx.y} angleDeg={angleDeg} color={diagramPalette.success} />
        </g>
      ) : mode === "linear-circular" ? (
        <CircularPolRing cx={rx.x} cy={rx.y} clockwise color={diagramPalette.success} />
      ) : (
        <CircularPolRing cx={rx.x} cy={rx.y} clockwise={sense === "co"} color={diagramPalette.success} />
      )}
      <text x={rx.x} y={196} textAnchor="middle" fill={diagramPalette.successDeep} fontSize={12} fontWeight={600}>
        {rxLabel}
      </text>

      {/* 下段: 直線-直線の損失カーブ −20log10|cosθ| と現在点 */}
      {isLinLin ? (
        <g>
          <text x={plot.left} y={228} fill={diagramPalette.inkSoft} fontSize={12} fontWeight={700}>
            損失カーブ −20log₁₀|cosθ|（電力は cos²θ に減る）
          </text>
          {[0, 10, 20, 30, 40].map((loss) => (
            <g key={loss}>
              <line
                x1={plot.left}
                x2={plot.right}
                y1={yOf(loss)}
                y2={yOf(loss)}
                stroke={chartTheme.grid.primary}
              />
              <text
                x={plot.left - 8}
                y={yOf(loss) + 4}
                textAnchor="end"
                fill={diagramPalette.muted}
                fontSize={11}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {loss}
              </text>
            </g>
          ))}
          <text x={plot.left - 8} y={plot.top - 12} textAnchor="end" fill={diagramPalette.muted} fontSize={11}>
            dB
          </text>
          {[0, 15, 30, 45, 60, 75, 90].map((deg) => (
            <text
              key={deg}
              x={xOf(deg)}
              y={plot.bottom + 18}
              textAnchor="middle"
              fill={diagramPalette.muted}
              fontSize={11}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {deg}°
            </text>
          ))}
          {/* θ=90°は理論∞: 表示クランプの注記と漸近線 */}
          <line
            x1={xOf(90)}
            x2={xOf(90)}
            y1={plot.top}
            y2={plot.bottom}
            stroke={diagramPalette.danger}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <text
            x={plot.right - 6}
            y={plot.top + 14}
            textAnchor="end"
            fill={diagramPalette.dangerDeep}
            fontSize={10}
          >
            θ=90°で∞（表示は{cap}dBでクランプ）
          </text>
          <polyline
            points={curvePoints.join(" ")}
            fill="none"
            stroke={diagramPalette.staf}
            strokeWidth={2.5}
          />
          <circle
            cx={markerX}
            cy={markerY}
            r={6}
            fill={diagramPalette.danger}
            stroke={diagramPalette.white}
            strokeWidth={2}
          />
          <text
            x={markerAnchor === "start" ? markerX + 10 : markerX - 10}
            y={markerY - 10}
            textAnchor={markerAnchor}
            fill={diagramPalette.dangerDeep}
            fontSize={12}
            fontWeight={700}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            θ={formatNumber(angleDeg, 0)}° → {markerLabel}
          </text>
        </g>
      ) : null}
    </svg>
  );
}

export function PolarizationLossPanel() {
  // 既定は直線-直線 θ=45°: 「向きが不定な端末は45°想定で3dB計上」という実務の定石を最初に見せる。
  const [mode, setMode] = useState<PolarizationMode>("linear-linear");
  const [angleDeg, setAngleDeg] = useState(45);
  const [sense, setSense] = useState<CircularSense>("co");

  const lossDb = useMemo(() => {
    try {
      if (mode === "linear-linear") {
        return calculatePolarizationMismatchLossDb({ tx: "linear", rx: "linear", angleDeg });
      }
      if (mode === "linear-circular") {
        return calculatePolarizationMismatchLossDb({ tx: "linear", rx: "circular" });
      }
      return calculatePolarizationMismatchLossDb({ tx: "circular", rx: "circular", sense });
    } catch {
      return null;
    }
  }, [mode, angleDeg, sense]);

  const angleError =
    mode === "linear-linear" && (!Number.isFinite(angleDeg) || angleDeg < 0 || angleDeg > 90)
      ? "傾き角θは0〜90°の範囲で入力してください。"
      : undefined;

  // 偏波損失係数 PLF（線形 0..1）= 10^(-損失dB/10)。受け取れる電力の割合として表示する。
  const plfPercent =
    lossDb === null ? null : Number.isFinite(lossDb) ? 10 ** (-lossDb / 10) * 100 : 0;

  const primary = {
    label: "偏波不整合損失",
    value:
      lossDb === null
        ? "—"
        : Number.isFinite(lossDb)
          ? formatNumber(lossDb, 1)
          : `≥${POLARIZATION_LOSS_DISPLAY_CAP_DB}`,
    unit: "dB"
  };

  const currentReferenceKey: ReferenceKey | null =
    mode === "linear-linear"
      ? angleDeg === 0
        ? "lin0"
        : angleDeg === 45
          ? "lin45"
          : angleDeg === 90
            ? "lin90"
            : null
      : mode === "linear-circular"
        ? "lincirc"
        : sense === "co"
          ? "co"
          : "cross";

  const chipClass = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${
      active
        ? "border-staf bg-staf text-white"
        : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
    }`;

  const modeCaption =
    mode === "linear-linear"
      ? `条件: 直線↔直線 / 傾き角θ=${formatNumber(angleDeg, 0)}°`
      : mode === "linear-circular"
        ? "条件: 直線↔円（角度に依らず一定）"
        : `条件: 円↔円 / ${sense === "co" ? "同旋" : "逆旋"}`;

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            電波は「振動の向き」（偏波）を持ちます。送信と受信で向きが揃わないと、
            揃っていない分の電力を受け取れません。偏波の組み合わせを選んでください。
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">偏波の組み合わせ</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="偏波の組み合わせ">
              {MODE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={chipClass(mode === option.value)}
                  onClick={() => setMode(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {mode === "linear-linear" ? (
            <div className="mt-5 space-y-4">
              <Field
                id="polarizationAngle"
                label="偏波の傾き角 θ"
                unit="°"
                value={angleDeg}
                min={0}
                max={90}
                step={1}
                showSlider
                emptyBehavior="preserve"
                onChange={setAngleDeg}
                help="送信偏波に対して、受信アンテナの偏波面が何度傾いているかです。0°で完全に一致、90°で直交（原理的に受信不可）になります。"
                example="45"
                error={angleError}
              />
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  基準角のクイック設定（45°は向き不定端末の設計想定によく使う角）
                </p>
                <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="傾き角プリセット">
                  {ANGLE_CHIPS.map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      className={chipClass(angleDeg === deg)}
                      onClick={() => setAngleDeg(deg)}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {mode === "circular-circular" ? (
            <div className="mt-5">
              <p className="text-xs font-semibold text-slate-500">旋回の組み合わせ</p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="旋回の組み合わせ">
                {SENSE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={chipClass(sense === option.value)}
                    onClick={() => setSense(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                逆旋の「∞」は理想円偏波の理論値です。実機の分離は交差偏波識別度（XPD）で決まり、
                20dB超程度が目安です。
              </p>
            </div>
          ) : null}

          {mode === "linear-circular" ? (
            <p className="mt-5 text-sm leading-relaxed text-slate-600">
              直線偏波と円偏波の組み合わせは、<strong>向きや旋回方向に関係なく常に3dB</strong>
              （電力が半分）です。円偏波の電界は直交2成分に分けられ、直線アンテナはその片方しか
              受け取れないためです。入力する値はありません。
            </p>
          ) : null}
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="polarization-loss-primary-result">
            <ResultBar primary={primary} />
          </div>

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">偏波の組み合わせ早見表</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              受け取れる電力の割合（PLF）:{" "}
              <span className="font-semibold tabular-nums text-slate-900">
                {plfPercent === null ? "—" : `${formatNumber(plfPercent, 1)}%`}
              </span>
              （損失dBを線形に戻した値）
            </p>
            <div className="mt-3 space-y-1.5">
              {REFERENCE_ROWS.map((row) => {
                const isCurrent = row.key === currentReferenceKey;
                return (
                  <div
                    key={row.key}
                    className={`grid grid-cols-[1fr_110px] items-center gap-3 rounded-lg px-2 py-1 text-sm ${
                      isCurrent ? "bg-staf-light ring-1 ring-staf/40" : ""
                    }`}
                  >
                    <span className={isCurrent ? "font-semibold text-staf-dark" : "text-slate-600"}>
                      {row.label}
                    </span>
                    <span className="text-right font-semibold tabular-nums text-slate-900">
                      {Number.isFinite(row.lossDb) ? `${formatNumber(row.lossDb, 1)}dB` : "∞（XPD次第）"}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              この損失は
              <Link
                href="/tools/rf-basic-link-calculator"
                className="mx-1 inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                リンクバジェット診断の追加損失
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
              に計上すると、向きずれ込みの通信余裕を見積もれます。
            </p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="偏波の向き図"
          title="送受信アンテナの偏波と不整合損失"
          description="左が送信、右が受信の偏波です。直線どうしは傾き角θに連動して受信側の矢印が回転し、下のカーブで損失が急増する様子（θ=90°で理論∞）を確認できます。"
          exportName="polarization-loss-diagram"
          caption={
            lossDb === null
              ? "入力値を確認してください。"
              : `${modeCaption} ─ 偏波損失 ${
                  Number.isFinite(lossDb)
                    ? `${formatNumber(lossDb, 1)}dB`
                    : `理論∞（表示は≥${POLARIZATION_LOSS_DISPLAY_CAP_DB}dB。実機はXPD次第で20dB超程度）`
                }。円偏波の旋回向きはIEEE定義（伝搬方向に見た回転）を平面図として簡略表示しています。`
          }
        >
          {lossDb !== null ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <PolarizationDiagram mode={mode} angleDeg={angleDeg} sense={sense} lossDb={lossDb} />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              入力値を確認すると偏波の向き図が表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜ向きがずれると受け取れないのか"
          formula="直線↔直線: 損失[dB] = -20log10|cosθ|　／　直線↔円: 3dB（一定）　／　円↔円: 同旋0dB・逆旋は理論∞"
          showColumnLink={false}
        >
          <p>
            <strong>① 電波には「振動の向き」（偏波）があります。</strong>
            長い縄跳びの縄を上下に振ると縦の波が、左右に振ると横の波が進みます。電波も同じで、
            電界が振動する向きが決まっています——これが偏波です。縦の波は縦のスリットしか通れません。
            ※この縄のたとえは直感用で、電波は縄のような媒質なしに進む電磁界の振動であり、
            「スリット」にあたる偏波の選別も実際は導体に誘起される電流で決まります。
          </p>
          <p>
            <strong>② 受信アンテナは、自分の向きに沿った成分しか拾えません。</strong>
            送信の偏波が受信アンテナに対してθ傾いていると、アンテナに沿う電界成分は cosθ 倍に
            なります。電力は電圧の2乗なので <strong>cos²θ</strong>。dBで書くと
            -20log10|cosθ| です。θ=45°で電力半分（3dB）、60°で1/4（6dB）、90°では成分ゼロ＝
            理論上は無限大の損失です（実際のアンテナは偏波が完全ではないため、有限の漏れが残ります）。
          </p>
          <p>
            <strong>③ 実務では「向きが決められない」ことが前提になります。</strong>
            ポケットの中のIoT端末やパレットに貼ったRFIDタグの向きは制御できません。定石は2つ。
            (1) 直線どうしなら<strong>45°を想定して3dBをリンクバジェットに計上</strong>する。
            (2) 片側を<strong>円偏波にして、どの向きでも一定の3dBで受ける</strong>——UHF帯RFIDの
            リーダアンテナに円偏波が多いのはこのためです。3dBは「向き不定への保険料」です。
            ※保険料はたとえで、物理的には円偏波の直交2成分のうち片方（電力の半分）を
            受け取れていない、という意味です。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <PolarizationLossColumn />
      </div>

      <MobileResultBar primary={primary} targetId="polarization-loss-primary-result" />
    </>
  );
}

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
  absoluteBandwidthMHz,
  fractionalBandwidthPercentFromQ,
  qFromFractionalBandwidthPercent,
  VSWR_LIMIT_PRESETS
} from "@/lib/rf/vswrBandwidthQ";
import { formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { VswrBandwidthQColumn } from "./VswrBandwidthQColumn";

type Direction = "q-to-fbw" | "fbw-to-q";

const DIRECTION_OPTIONS: Array<{ value: Direction; label: string }> = [
  { value: "q-to-fbw", label: "Q → 帯域幅" },
  { value: "fbw-to-q", label: "帯域幅 → Q" }
];

// 表示上のVSWR上限（縦軸のクランプ）。上限プリセットは1.5/2/3で、いずれも5以下に収まる。
const VSWR_DISPLAY_CAP = 5;

// ---- 共振カーブ（VSWR vs 正規化周波数）: 単一共振（直列RLC）近似の入力連動SVG -------------
// 整合済み（f0でVSWR=1）の単共振アンテナを、直列RLCとしてモデル化する。
//   Zin = Z0 + jX,  X = Z0·Q·(f/f0 − f0/f)   → q ≡ X/Z0 = Q·(x − 1/x)   （x = f/f0）
//   |Γ| = |q| / √(4 + q²),  VSWR = (1+|Γ|)/(1−|Γ|)
// VSWR≤s を満たす帯域端は q = ±(s−1)/√s で、その幅（x_u − x_l）は厳密に (s−1)/(Q·√s) = 比帯域FBW。
// Qを上げるほど谷（VSWR=1のくぼみ）が鋭くなり、上限線 s との交点間＝帯域が狭くなる様子が見える。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目: v4 R4方式）。

function vswrAt(x: number, q: number): number {
  const reactance = q * (x - 1 / x);
  const gamma = Math.abs(reactance) / Math.sqrt(4 + reactance * reactance);
  return (1 + gamma) / (1 - gamma);
}

function ResonanceCurve({
  qEff,
  vswrLimit,
  fbwPercent,
  centerFrequencyMHz
}: {
  qEff: number;
  vswrLimit: number;
  fbwPercent: number;
  centerFrequencyMHz: number | null;
}) {
  const chart = { width: 640, height: 360, top: 30, right: 26, bottom: 54, left: 52 };
  const xMin = 0.9;
  const xMax = 1.1;
  const vMin = 1;
  const vMax = VSWR_DISPLAY_CAP;
  const plotW = chart.width - chart.left - chart.right;
  const plotH = chart.height - chart.top - chart.bottom;
  const xPix = (x: number) => chart.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const yPix = (v: number) =>
    chart.top + ((vMax - Math.min(Math.max(v, vMin), vMax)) / (vMax - vMin)) * plotH;

  // 曲線点（対称に中心 x=1 を含めるため 61 点）。
  const samples = 61;
  const points: string[] = [];
  for (let i = 0; i < samples; i += 1) {
    const x = xMin + ((xMax - xMin) * i) / (samples - 1);
    points.push(`${xPix(x).toFixed(1)},${yPix(vswrAt(x, qEff)).toFixed(1)}`);
  }

  // VSWR≤s の帯域端（厳密解）。x_u − x_l = (s−1)/(Q√s) = FBW。
  const c = (vswrLimit - 1) / (qEff * Math.sqrt(vswrLimit));
  const rootTerm = Math.sqrt(c * c + 4);
  const xUpper = (c + rootTerm) / 2;
  const xLower = (-c + rootTerm) / 2;
  const edgesInView = xLower >= xMin && xUpper <= xMax;

  const limitY = yPix(vswrLimit);
  const bracketY = limitY - 16;
  const absLabel =
    centerFrequencyMHz !== null
      ? `・絶対 ${formatNumber((centerFrequencyMHz * fbwPercent) / 100, 2)}MHz`
      : "";

  const vTicks = [1, 2, 3, 4, 5];
  const xTicks = [0.9, 0.95, 1.0, 1.05, 1.1];

  return (
    <svg
      role="img"
      aria-label={`Q=${formatNumber(qEff, 0)}の単共振アンテナのVSWR共振カーブ。VSWR≤${formatNumber(
        vswrLimit,
        1
      )}を満たす比帯域は${formatNumber(fbwPercent, 2)}%`}
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />

      {/* 横グリッド＋VSWR目盛り */}
      {vTicks.map((tick) => (
        <g key={`v-${tick}`}>
          <line
            x1={chart.left}
            x2={chart.width - chart.right}
            y1={yPix(tick)}
            y2={yPix(tick)}
            stroke={chartTheme.grid.primary}
          />
          <text
            x={chart.left - 8}
            y={yPix(tick) + 4}
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
        VSWR
      </text>

      {/* 縦目盛り（f/f0） */}
      {xTicks.map((tick) => (
        <text
          key={`x-${tick}`}
          x={xPix(tick)}
          y={chart.height - chart.bottom + 20}
          textAnchor="middle"
          fill={diagramPalette.muted}
          fontSize={11}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {tick.toFixed(2)}
        </text>
      ))}
      <text
        x={chart.width - chart.right}
        y={chart.height - 8}
        textAnchor="end"
        fill={diagramPalette.muted}
        fontSize={11}
      >
        正規化周波数 f/f₀
      </text>

      {/* 中心周波数の縦線（f/f0 = 1） */}
      <line
        x1={xPix(1)}
        x2={xPix(1)}
        y1={chart.top}
        y2={chart.height - chart.bottom}
        stroke={diagramPalette.faint}
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      <text
        x={xPix(1)}
        y={chart.top + 12}
        textAnchor="middle"
        fill={diagramPalette.stafDark}
        fontSize={10}
        fontWeight={600}
      >
        {centerFrequencyMHz !== null ? `f₀=${formatNumber(centerFrequencyMHz, 0)}MHz` : "f₀"}
      </text>

      {/* VSWR上限の水平線 */}
      <line
        x1={chart.left}
        x2={chart.width - chart.right}
        y1={limitY}
        y2={limitY}
        stroke={chartTheme.reference.sensitivity}
        strokeDasharray={chartTheme.reference.sensitivityDash}
      />
      <text
        x={chart.width - chart.right - 4}
        y={limitY - 6}
        textAnchor="end"
        fill={diagramPalette.dangerDeep}
        fontSize={11}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        VSWR上限 {formatNumber(vswrLimit, 1)}
      </text>

      {/* 共振カーブ */}
      <polyline points={points.join(" ")} fill="none" stroke={diagramPalette.staf} strokeWidth={2.5} />

      {/* 帯域端と比帯域ブラケット */}
      {edgesInView ? (
        <g>
          {[xLower, xUpper].map((edge) => (
            <g key={`edge-${edge.toFixed(4)}`}>
              <line
                x1={xPix(edge)}
                x2={xPix(edge)}
                y1={limitY}
                y2={chart.height - chart.bottom}
                stroke={diagramPalette.successDeep}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <circle
                cx={xPix(edge)}
                cy={limitY}
                r={4.5}
                fill={diagramPalette.success}
                stroke={diagramPalette.white}
                strokeWidth={1.5}
              />
            </g>
          ))}
          {/* ブラケット（帯域幅を直接ラベリング） */}
          <line
            x1={xPix(xLower)}
            x2={xPix(xUpper)}
            y1={bracketY}
            y2={bracketY}
            stroke={diagramPalette.successDeep}
            strokeWidth={1.5}
          />
          <line x1={xPix(xLower)} x2={xPix(xLower)} y1={bracketY} y2={bracketY + 6} stroke={diagramPalette.successDeep} strokeWidth={1.5} />
          <line x1={xPix(xUpper)} x2={xPix(xUpper)} y1={bracketY} y2={bracketY + 6} stroke={diagramPalette.successDeep} strokeWidth={1.5} />
          <text
            x={xPix((xLower + xUpper) / 2)}
            y={bracketY - 6}
            textAnchor="middle"
            fill={diagramPalette.successDeep}
            fontSize={12}
            fontWeight={700}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            比帯域 {formatNumber(fbwPercent, 2)}%{absLabel}
          </text>
        </g>
      ) : (
        <text
          x={xPix(1)}
          y={bracketY - 6}
          textAnchor="middle"
          fill={diagramPalette.warnDeep}
          fontSize={11}
          fontWeight={700}
        >
          帯域が表示範囲より広い（Qが低い）— 比帯域 {formatNumber(fbwPercent, 2)}%
        </text>
      )}
    </svg>
  );
}

export function VswrBandwidthQPanel() {
  // 既定は Q→帯域幅・Q=50・VSWR≤2: 「Q50で比帯域は約1.4%しかない」小型アンテナの厳しさを最初に見せる。
  const [direction, setDirection] = useState<Direction>("q-to-fbw");
  const [qFactor, setQFactor] = useState(50);
  const [fbwPercentInput, setFbwPercentInput] = useState(2);
  const [vswrLimit, setVswrLimit] = useState(2);
  // 中心周波数は任意入力。空欄（NaN）や0以下は「未入力」として絶対帯域幅の表示だけを省く。
  const [centerFrequencyMHz, setCenterFrequencyMHz] = useState(920);
  const hasCenter = Number.isFinite(centerFrequencyMHz) && centerFrequencyMHz > 0;

  const result = useMemo(() => {
    try {
      if (direction === "q-to-fbw") {
        const fbwPercent = fractionalBandwidthPercentFromQ(qFactor, vswrLimit);
        return { qEff: qFactor, fbwPercent };
      }
      const qEff = qFromFractionalBandwidthPercent(fbwPercentInput, vswrLimit);
      return { qEff, fbwPercent: fbwPercentInput };
    } catch {
      return null;
    }
  }, [direction, qFactor, fbwPercentInput, vswrLimit]);

  const absolute = useMemo(() => {
    if (result === null || !hasCenter) return null;
    try {
      return absoluteBandwidthMHz(centerFrequencyMHz, result.fbwPercent / 100);
    } catch {
      return null;
    }
  }, [result, hasCenter, centerFrequencyMHz]);

  // 現在Qでの、VSWR上限別の比帯域早見表（すべて lib 関数から導出し、表示と計算の食い違いを防ぐ）。
  const referenceRows = useMemo(() => {
    if (result === null) return [];
    return VSWR_LIMIT_PRESETS.map((s) => {
      try {
        return { vswrLimit: s, fbwPercent: fractionalBandwidthPercentFromQ(result.qEff, s) };
      } catch {
        return { vswrLimit: s, fbwPercent: Number.NaN };
      }
    });
  }, [result]);

  const qError =
    direction === "q-to-fbw" && (!Number.isFinite(qFactor) || qFactor < 1 || qFactor > 200)
      ? "Qは1〜200の範囲で入力してください。"
      : undefined;
  const fbwError =
    direction === "fbw-to-q" && (!Number.isFinite(fbwPercentInput) || fbwPercentInput <= 0 || fbwPercentInput >= 200)
      ? "比帯域は0より大きく200%未満で入力してください。"
      : undefined;

  const primary =
    direction === "q-to-fbw"
      ? {
          label: `比帯域（VSWR≤${formatNumber(vswrLimit, 1)}）`,
          value: result === null ? "—" : formatNumber(result.fbwPercent, 1),
          unit: "%"
        }
      : {
          label: "Q値（無次元）",
          value: result === null ? "—" : formatNumber(result.qEff, 1),
          unit: undefined
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
            アンテナの<strong>Q（共振の鋭さ）</strong>と、<strong>VSWR≤上限を満たす比帯域</strong>は表裏一体です。
            Qが高いほど整合の合う周波数幅は狭くなります。どちら向きに換算するかを選んでください。
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">変換方向</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="変換方向">
              {DIRECTION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={chipClass(direction === option.value)}
                  onClick={() => setDirection(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {direction === "q-to-fbw" ? (
              <Field
                id="vswrQFactor"
                label="Q（アンテナの共振Q）"
                value={qFactor}
                min={1}
                max={200}
                step={1}
                showSlider
                emptyBehavior="preserve"
                onChange={setQFactor}
                help="共振の鋭さ＝溜め込むエネルギーと放射するエネルギーの比です。小型アンテナほどQが上がり、帯域が狭くなります。整合回路のない放射Q（アンテナ単体）を想定します。"
                example="50"
                error={qError}
              />
            ) : (
              <Field
                id="vswrFbwPercent"
                label="比帯域 FBW"
                unit="%"
                value={fbwPercentInput}
                min={0.1}
                max={100}
                step={0.1}
                emptyBehavior="preserve"
                onChange={setFbwPercentInput}
                help="中心周波数に対する帯域幅の割合です。例: 中心920MHzで帯域13MHzなら約1.4%。これを満たすのに必要なQを逆算します。"
                example="2"
                error={fbwError}
              />
            )}

            <div>
              <p className="text-xs font-semibold text-slate-500">
                VSWR上限（帯域を測る判定しきい値）
              </p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="VSWR上限プリセット">
                {VSWR_LIMIT_PRESETS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={chipClass(vswrLimit === s)}
                    onClick={() => setVswrLimit(s)}
                  >
                    VSWR≤{formatNumber(s, 1)}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                同じQでも「どのVSWRまでを帯域と呼ぶか」で比帯域は変わります。緩い上限（VSWR≤3）ほど帯域は広く出ます。
              </p>
            </div>

            <Field
              id="vswrCenterFrequency"
              label="中心周波数 f₀（任意・絶対帯域幅の表示用）"
              unit="MHz"
              value={centerFrequencyMHz}
              min={0.1}
              step={1}
              emptyBehavior="preserve"
              onChange={setCenterFrequencyMHz}
              help="比帯域[%]を実際の帯域幅[MHz]に換算するために使います。空欄でも比帯域・Qの計算はできます。"
              example="920"
            />
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="vswr-bandwidth-q-primary-result">
            <ResultBar primary={primary} />
          </div>

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">
              現在Q={result ? formatNumber(result.qEff, 1) : "—"} での比帯域早見表
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              同じQでも判定しきい値（VSWR上限）で比帯域は変わります。中心周波数を入れると絶対帯域幅も出ます。
            </p>
            <div className="mt-3 space-y-1.5">
              {referenceRows.map((row) => {
                const isCurrent = Math.abs(row.vswrLimit - vswrLimit) < 1e-9;
                const absMHz =
                  hasCenter && Number.isFinite(row.fbwPercent)
                    ? (centerFrequencyMHz * row.fbwPercent) / 100
                    : Number.NaN;
                return (
                  <div
                    key={row.vswrLimit}
                    className={`grid grid-cols-[88px_1fr_92px] items-center gap-3 rounded-lg px-2 py-1 text-sm ${
                      isCurrent ? "bg-staf-light ring-1 ring-staf/40" : ""
                    }`}
                  >
                    <span className={isCurrent ? "font-semibold text-staf-dark" : "text-slate-600"}>
                      VSWR≤{formatNumber(row.vswrLimit, 1)}
                    </span>
                    <span className="text-xs tabular-nums text-slate-500">
                      {Number.isFinite(row.fbwPercent) ? `${formatNumber(row.fbwPercent, 2)}%` : "—"}
                    </span>
                    <span className="text-right font-semibold tabular-nums text-slate-900">
                      {Number.isFinite(absMHz) ? `${formatNumber(absMHz, 2)}MHz` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>

            {absolute ? (
              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
                現在の条件（VSWR≤{formatNumber(vswrLimit, 1)}）の絶対帯域幅:{" "}
                <span className="font-semibold tabular-nums text-slate-900">
                  {formatNumber(absolute.bandwidthMHz, 2)}MHz
                </span>
                （{formatNumber(absolute.lowerMHz, 1)}〜{formatNumber(absolute.upperMHz, 1)}MHz）
              </p>
            ) : null}

            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              その筐体サイズでこのQ（帯域）が物理的に可能かは
              <Link
                href="/tools/small-antenna-limit"
                className="mx-1 inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                小型アンテナ限界（Chu限界）
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
              で確認できます。
            </p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="共振カーブ"
          title="Qで決まる帯域の鋭さ"
          description="整合点（f/f₀=1）でVSWR=1のくぼみができ、Qを上げるほど谷が鋭く＝VSWR上限線との交点間（帯域）が狭くなります。緑の点が帯域端、ブラケットが比帯域です。入力に連動して動きます。"
          exportName="vswr-bandwidth-q-curve"
          caption={
            result
              ? `条件: Q=${formatNumber(result.qEff, 1)} / VSWR上限=${formatNumber(vswrLimit, 1)} ─ 比帯域 ${formatNumber(
                  result.fbwPercent,
                  2
                )}%${absolute ? `・絶対帯域幅 ${formatNumber(absolute.bandwidthMHz, 2)}MHz` : ""}。単一共振（直列RLC）近似で、狭帯域ほど精度良好。`
              : "入力値を確認してください。"
          }
        >
          {result ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <ResonanceCurve
                qEff={result.qEff}
                vswrLimit={vswrLimit}
                fbwPercent={result.fbwPercent}
                centerFrequencyMHz={hasCenter ? centerFrequencyMHz : null}
              />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              入力値を確認すると共振カーブが表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜQが高いと帯域が狭いのか"
          formula="FBW(VSWR≤s) = (s − 1) / (Q·√s)　　Q = (s − 1) / (FBW·√s)"
          showColumnLink={false}
        >
          <p>
            <strong>① Qは共振の鋭さ＝エネルギーを溜め込む度合いです。</strong>
            Qは「1周期あたり放射する（外へ出す）エネルギー」に対して「アンテナの近くに蓄えている
            エネルギー」が何倍あるかを表します。Qが高い＝周りに大量のエネルギーを溜め込みながら、
            少しずつしか放射しない、という状態です。
          </p>
          <p>
            <strong>② 鋭いほど、整合が合う周波数の幅が狭くなります。</strong>
            ブランコを思い浮かべてください。重いブランコ（高Q）は、ぴったりの周期で押したときだけ
            大きく揺れ、少しでもタイミングがずれると途端に揺れなくなります。軽いブランコ（低Q）は
            多少タイミングがずれても、そこそこ揺れます。アンテナも同じで、高Qほど「ぴったりの周波数」
            から少し外れただけでVSWRが跳ね上がる＝帯域が狭い。だから帯域は 1/Q に比例して
            <strong> FBW=(s−1)/(Q√s) </strong>となります。
            ※ブランコのたとえは直感用で、実際のQは電圧・電流として蓄えた電磁界エネルギーと放射電力の比であり、
            機械的な重さがあるわけではありません。
          </p>
          <p>
            <strong>③ 実務: 小型アンテナはQが上がり、帯域が狭くなります。</strong>
            アンテナを波長に対して小さくすると、放射しきれないエネルギーが近傍界（アンテナのすぐ周り）に
            溜まり、Qが急上昇します。結果として「小さくて広帯域」という要求は物理と喧嘩します——
            サイズを削るほど帯域の天井は下がる。この天井そのものを与えるのが、次のコラムの
            <strong>Chu限界</strong>です。
          </p>
          <p>
            結論: 比帯域とQは (s−1)/(√s) を挟んで反比例します。VSWR上限を緩めれば帯域は広く出ますが、
            Qが決まっている以上、根本的にはアンテナのサイズ（＝許されるQの下限）が帯域の上限を握っています。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <VswrBandwidthQColumn />
      </div>

      <MobileResultBar primary={primary} targetId="vswr-bandwidth-q-primary-result" />
    </>
  );
}

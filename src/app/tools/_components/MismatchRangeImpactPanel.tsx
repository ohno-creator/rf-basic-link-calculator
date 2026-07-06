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
import { mismatchRangeImpact } from "@/lib/rf/mismatchRangeImpact";
import { formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { MismatchRangeImpactColumn } from "./MismatchRangeImpactColumn";

// VSWR プリセット（現場で口にする定番の数値のみ）。
// 出典: いずれも整合の代表点として広く使われる値。
//  1.5 … 「良好」の目安（RL ≈ 14dB）。多くの機器メーカのアンテナ規格の合格ライン。
//  2.0 … 実務の許容上限としてよく引かれる値（RL ≈ 9.5dB。ML ≈ 0.5dB）。
//  3.0 … 「そろそろ見直し」の境界（RL ≈ 6dB）。
//  5.0 … 明らかな不整合（RL ≈ 3.5dB）。ケーブル断線・コネクタ不良を疑う水準。
const VSWR_PRESETS = [1.5, 2, 3, 5] as const;

const VSWR_MIN = 1;
const VSWR_MAX = 10;

// ---- 距離維持率カーブ（入力連動の動的SVG） ---------------------------------------------
// 横軸 VSWR(1〜10)、縦軸「自由空間での距離維持率[%]」= 100×10^(−ML/20)。
// 自由空間では受信電力が距離の2乗で効くため、ML[dB]の"半分"だけが距離のdBに化ける。
// 現在のVSWRを点で示し、その注釈にML[dB]を添える（第二軸は増やさず注釈で表現）。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目）。

function DistanceRetentionCurve({ vswr }: { vswr: number }) {
  const chart = { width: 640, height: 340, top: 28, right: 104, bottom: 52, left: 58 };
  const plotWidth = chart.width - chart.left - chart.right;
  const plotHeight = chart.height - chart.top - chart.bottom;

  // 縦軸レンジ: VSWR=10 で約57.5% まで落ちるので 55〜100% を描画域にする。
  const yMax = 100;
  const yMin = 55;

  const x = (v: number) => chart.left + ((v - VSWR_MIN) / (VSWR_MAX - VSWR_MIN)) * plotWidth;
  const y = (retentionPercent: number) =>
    chart.top + ((yMax - retentionPercent) / (yMax - yMin)) * plotHeight;

  // 50点で距離維持率カーブを描く（lib と同じ導出でドリフトさせない）。
  const SAMPLES = 50;
  const points = Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const v = VSWR_MIN + (i / SAMPLES) * (VSWR_MAX - VSWR_MIN);
    const retentionPercent = mismatchRangeImpact(v).distanceRatio * 100;
    return `${x(v).toFixed(2)},${y(retentionPercent).toFixed(2)}`;
  }).join(" ");

  const xTicks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const yTicks = [60, 70, 80, 90, 100];

  // 要所の直接ラベル（VSWR=2 で -5.7% など、現場の相場観を図に固定）。
  const labeled = [1.5, 2, 3, 5].map((v) => {
    const r = mismatchRangeImpact(v);
    return { v, retentionPercent: r.distanceRatio * 100, impactPercent: r.distanceImpactPercent };
  });

  const current = mismatchRangeImpact(vswr);
  const currentRetention = current.distanceRatio * 100;
  const cx = x(vswr);
  const cy = y(currentRetention);

  return (
    <svg
      role="img"
      aria-label={`VSWRと自由空間での距離維持率の関係。現在VSWR${formatNumber(vswr, 2)}で距離維持率${formatNumber(currentRetention, 1)}パーセント、ミスマッチ損失${formatNumber(current.mismatchLossDb, 2)}dB`}
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />

      {/* Y軸グリッドと目盛り（距離維持率 %） */}
      {yTicks.map((tick) => (
        <g key={`y${tick}`}>
          <line
            x1={chart.left}
            x2={chart.width - chart.right}
            y1={y(tick)}
            y2={y(tick)}
            stroke={tick === 100 ? chartTheme.reference.baseline : chartTheme.grid.primary}
            strokeDasharray={tick === 100 ? chartTheme.reference.baselineDash : undefined}
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
        距離維持率 %
      </text>

      {/* X軸目盛り（VSWR） */}
      {xTicks.map((tick) => (
        <text
          key={`x${tick}`}
          x={x(tick)}
          y={chart.height - chart.bottom + 18}
          textAnchor="middle"
          fill={diagramPalette.muted}
          fontSize={11}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {tick}
        </text>
      ))}
      <text
        x={chart.left + plotWidth / 2}
        y={chart.height - 12}
        textAnchor="middle"
        fill={diagramPalette.muted}
        fontSize={12}
        fontWeight={600}
      >
        VSWR
      </text>

      {/* 距離維持率カーブ */}
      <polyline
        points={points}
        fill="none"
        stroke={chartTheme.series.loss}
        strokeWidth={chartTheme.stroke.series}
      />

      {/* 要所の直接ラベル */}
      {labeled.map(({ v, retentionPercent, impactPercent }) => (
        <g key={`lab${v}`}>
          <circle cx={x(v)} cy={y(retentionPercent)} r={2.5} fill={chartTheme.seriesText.loss} />
          <text
            x={x(v)}
            y={y(retentionPercent) + 20}
            textAnchor="middle"
            fill={chartTheme.seriesText.loss}
            fontSize={10.5}
            fontWeight={700}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {`VSWR${formatNumber(v, v % 1 === 0 ? 0 : 1)}: ${formatNumber(impactPercent, 1)}%`}
          </text>
        </g>
      ))}

      {/* 現在点＋ML注釈 */}
      <line x1={cx} x2={cx} y1={cy} y2={chart.height - chart.bottom} stroke={diagramPalette.faint} strokeDasharray="4 4" />
      <circle cx={cx} cy={cy} r={6} fill={chartTheme.series.loss} stroke={chartTheme.surface.plain} strokeWidth={2} />
      <g>
        <text
          x={Math.min(cx + 12, chart.width - chart.right + 2)}
          y={cy - 10}
          textAnchor="start"
          fill={chartTheme.seriesText.total}
          fontSize={12}
          fontWeight={700}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {`維持率 ${formatNumber(currentRetention, 1)}%`}
        </text>
        <text
          x={Math.min(cx + 12, chart.width - chart.right + 2)}
          y={cy + 6}
          textAnchor="start"
          fill={diagramPalette.muted}
          fontSize={11}
          fontWeight={600}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {`ML ${formatNumber(current.mismatchLossDb, 2)}dB`}
        </text>
      </g>
    </svg>
  );
}

export function MismatchRangeImpactPanel() {
  // 既定 VSWR=2.0: 実務で「許容上限」としてよく引かれる点。ML≈0.5dB・距離−5.7% を最初に見せる。
  const [vswr, setVswr] = useState(2);

  const result = useMemo(() => {
    try {
      if (!Number.isFinite(vswr) || vswr < 1) return null;
      return mismatchRangeImpact(vswr);
    } catch {
      return null;
    }
  }, [vswr]);

  const vswrError =
    !Number.isFinite(vswr) || vswr < 1 ? "VSWRは1.0以上の値を入力してください（1.0＝完全整合）。" : undefined;

  const primary = {
    label: "通信距離への影響（自由空間）",
    value: result === null ? "—" : formatNumber(result.distanceImpactPercent, 1),
    unit: "%"
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
            測定器が示すVSWR（整合のずれ具合）を1つ入れるだけです。反射で失う電力を
            ミスマッチ損失[dB]に直し、自由空間ならそれが通信距離にどれだけ響くかを％で見ます。
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">
              VSWRプリセット（現場でよく口にする代表点）
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="VSWRプリセット">
              {VSWR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={chipClass(Math.abs(vswr - preset) < 0.001)}
                  onClick={() => setVswr(preset)}
                >
                  VSWR {preset % 1 === 0 ? preset.toFixed(1) : preset}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Field
              id="vswr"
              label="VSWR"
              value={vswr}
              min={VSWR_MIN}
              max={VSWR_MAX}
              step={0.05}
              showSlider
              emptyBehavior="preserve"
              onChange={setVswr}
              help="定在波比。アンテナや同軸の整合のずれを1.0（完全整合）からの比で表します。アンテナアナライザやネットワークアナライザが直接示す数値です。"
              example="2"
              error={vswrError}
            />
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
            <p>
              <strong className="text-slate-900">読み方:</strong>{" "}
              距離への影響は<strong>自由空間（距離2倍で−6dB）を前提にした目安</strong>です。
              市街地や屋内では距離指数が2から外れるため、絶対距離の保証ではなく
              「整合を追い込む価値」を距離％で見るための相場観として使ってください。
            </p>
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="mismatch-range-impact-primary-result">
            <ResultBar primary={primary} />
          </div>

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">内訳</h2>
            <div className="mt-3 space-y-1.5">
              <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg px-2 py-1 text-sm">
                <span className="text-slate-600">ミスマッチ損失 ML</span>
                <span className="text-right font-semibold tabular-nums text-slate-900">
                  {result ? `${formatNumber(result.mismatchLossDb, 2)} dB` : "—"}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg px-2 py-1 text-sm">
                <span className="text-slate-600">反射電力</span>
                <span className="text-right font-semibold tabular-nums text-slate-900">
                  {result ? `${formatNumber(result.reflectedPowerPercent, 1)} %` : "—"}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg px-2 py-1 text-sm">
                <span className="text-slate-600">距離維持率（自由空間）</span>
                <span className="text-right font-semibold tabular-nums text-slate-900">
                  {result ? `${formatNumber(result.distanceRatio * 100, 1)} %` : "—"}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg px-2 py-1 text-sm">
                <span className="text-slate-600">反射係数 Γ</span>
                <span className="text-right font-semibold tabular-nums text-slate-900">
                  {result ? formatNumber(result.reflectionCoefficient, 3) : "—"}
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              このMLを
              <Link
                href="/tools/rf-basic-link-calculator"
                className="mx-1 inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                リンクバジェット診断の追加損失
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
              に足すと、整合ずれ込みの通信余裕を判定できます。
            </p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="距離カーブ"
          title="VSWRと自由空間での距離維持率"
          description="横軸はVSWR、縦軸は整合が完璧なとき（VSWR=1）を100%とした到達距離の維持率です。VSWR=2でも維持率は約94%＝距離−5.7%どまり。整合ずれは意外と距離に効きません。入力に連動して現在点が動きます。"
          exportName="mismatch-range-impact-curve"
          caption={
            result
              ? `条件: VSWR=${formatNumber(vswr, 2)} ─ ML ${formatNumber(result.mismatchLossDb, 2)}dB・反射電力 ${formatNumber(result.reflectedPowerPercent, 1)}%・距離維持率 ${formatNumber(result.distanceRatio * 100, 1)}%（自由空間目安）`
              : "VSWRは1.0以上を入力してください。"
          }
        >
          {result ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <DistanceRetentionCurve vswr={vswr} />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              VSWRを1.0以上にすると距離維持率カーブが表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜVSWR2は「距離6%減」で済むのか"
          formula={
            "Γ = (VSWR−1)/(VSWR+1)\n" +
            "ML[dB] = −10·log10(1 − Γ²)          （反射で門前払いされる電力）\n" +
            "距離維持率 = 10^(−ML/20) = √(1 − Γ²)   （自由空間: 距離∝√電力）\n" +
            "距離影響[%] = (距離維持率 − 1) × 100"
          }
          showColumnLink={false}
        >
          <p>
            <strong>① 整合ずれは、電力の「門前払い」です。</strong>
            送信機とアンテナのインピーダンスがずれていると、送った電力の一部がアンテナに
            入れずに跳ね返ります。跳ね返る割合が反射係数Γで、VSWRから
            Γ=(VSWR−1)/(VSWR+1)。VSWR2ならΓ=0.33、反射電力はΓ²＝
            <strong>11%</strong>が門前払いされます。水道ホースの継ぎ目で、太さが合わないと
            水が一部跳ね返るのに似ています。
          </p>
          <p>
            <strong>② dBに直すと、意外に小さい。</strong>
            門前払いされずにアンテナへ入る電力は1−Γ²＝89%。これをdBにすると
            ML＝−10log₁₀(0.89)＝<strong>わずか0.51dB</strong>です。「11%も反射している」の
            体感より、失う電力はずっと小さい——これがVSWRの数字に驚きすぎない勘どころです。
          </p>
          <p>
            <strong>③ 自由空間では、ML[dB]の「半分」が距離のdB。</strong>
            自由空間損失は距離の2乗で効く（距離2倍で−6dB＝20log₁₀）ので、電力のdBを距離のdBに
            換算するときは20で割ります。よって距離維持率＝10^(−ML/20)＝√(1−Γ²)。
            VSWR2なら√0.89＝0.943、つまり<strong>距離は約6%減</strong>るだけ。
            「VSWR2は距離6%減」が現場の相場観です。
            ※このホースのたとえは直感用で、実際の反射波は戻ってまた再反射し、線路上に定在波
            （立つ波）をつくります。単に「跳ね返して捨てる」より複雑で、だからこそVSWR＝
            <strong>定在波</strong>比という名前がついています。
          </p>
          <p>
            結論: VSWRの数字は大きく見えても、失う電力（ML[dB]）は小さく、距離に化けるのは
            さらにその半分。整合を1.05まで追い込むより、アンテナの位置を数十cm動かす方が
            距離に効く場面が多いのは、この数字の非対称性が理由です。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <MismatchRangeImpactColumn />
      </div>

      <MobileResultBar primary={primary} targetId="mismatch-range-impact-primary-result" />
    </>
  );
}

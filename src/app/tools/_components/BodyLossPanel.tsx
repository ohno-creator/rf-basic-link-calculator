"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { lookupBodyLoss, type BodyLossBandId, type BodyLossScenarioId } from "@/lib/rf/bodyLoss";
import { CONTACT_URL } from "@/lib/rf/presets";
import { formatNumber } from "@/lib/rf/format";
import { BODY_LOSS_BANDS, BODY_LOSS_SCENARIOS, BODY_LOSS_SOURCES } from "@/data/bodyLoss";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { BodyLossColumn } from "./BodyLossColumn";

// ---- シナリオ×帯域の Typ/Worst 棒グラフ（入力連動の動的SVG） ---------------------------
// 選択中の帯域について、5つの装着シナリオの Typ/Worst をペア棒で並べる。
// 現在選択中のシナリオは背景ハイライトで示し、帯域チップの切替で全棒が連動して動く。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目: v4 R4方式）。

function BodyLossBarChart({
  band,
  scenario
}: {
  band: BodyLossBandId;
  scenario: BodyLossScenarioId;
}) {
  const chart = { width: 680, height: 320, top: 40, right: 20, bottom: 48, left: 48 };
  const yMax = 35; // 表の最大 Worst 30dB + 余白（帯域切替の比較のため固定スケール）
  const plotHeight = chart.height - chart.top - chart.bottom;
  const groupWidth = (chart.width - chart.left - chart.right) / BODY_LOSS_SCENARIOS.length;
  const barWidth = 26;
  const y = (v: number) => chart.top + ((yMax - v) / yMax) * plotHeight;
  const baseY = y(0);
  const ticks = [0, 10, 20, 30];

  const bandLabel = BODY_LOSS_BANDS.find((b) => b.id === band)?.label ?? band;

  return (
    <svg
      role="img"
      aria-label={`${bandLabel}における装着シナリオ別のボディロス（Typ/Worst）。現在の選択をハイライト表示`}
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
      <text x={chart.left} y={chart.top - 24} fill={diagramPalette.muted} fontSize={12} fontWeight={600}>
        追加損失 dB（{bandLabel}）
      </text>

      {/* 凡例 */}
      <g>
        <rect
          x={chart.width - chart.right - 150}
          y={chart.top - 32}
          width={10}
          height={10}
          rx={2}
          fill={chartTheme.series.source}
        />
        <text x={chart.width - chart.right - 136} y={chart.top - 23} fill={diagramPalette.inkSoft} fontSize={11}>
          Typ
        </text>
        <rect
          x={chart.width - chart.right - 96}
          y={chart.top - 32}
          width={10}
          height={10}
          rx={2}
          fill={chartTheme.series.loss}
        />
        <text x={chart.width - chart.right - 82} y={chart.top - 23} fill={diagramPalette.inkSoft} fontSize={11}>
          Worst
        </text>
      </g>

      {BODY_LOSS_SCENARIOS.map((s, index) => {
        const cell = lookupBodyLoss({ band, scenario: s.id });
        const groupX = chart.left + index * groupWidth;
        const centerX = groupX + groupWidth / 2;
        const isCurrent = s.id === scenario;
        const typX = centerX - barWidth - 3;
        const worstX = centerX + 3;
        return (
          <g key={s.id}>
            {isCurrent ? (
              <rect
                x={groupX + 4}
                y={chart.top - 6}
                width={groupWidth - 8}
                height={plotHeight + 44}
                rx={8}
                fill={diagramPalette.skyPale}
                stroke={diagramPalette.staf}
                strokeWidth={1.5}
              />
            ) : null}
            {cell ? (
              <>
                <rect
                  x={typX}
                  y={y(cell.typicalDb)}
                  width={barWidth}
                  height={Math.max(2, baseY - y(cell.typicalDb))}
                  rx={4}
                  fill={chartTheme.series.source}
                  stroke={chartTheme.seriesText.source}
                  strokeWidth={1}
                  opacity={isCurrent ? 1 : 0.55}
                />
                <text
                  x={typX + barWidth / 2}
                  y={y(cell.typicalDb) - 5}
                  textAnchor="middle"
                  fill={chartTheme.seriesText.source}
                  fontSize={10}
                  fontWeight={isCurrent ? 700 : 500}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {formatNumber(cell.typicalDb, 1)}
                </text>
                <rect
                  x={worstX}
                  y={y(cell.worstDb)}
                  width={barWidth}
                  height={Math.max(2, baseY - y(cell.worstDb))}
                  rx={4}
                  fill={chartTheme.series.loss}
                  stroke={chartTheme.seriesText.loss}
                  strokeWidth={1}
                  opacity={isCurrent ? 1 : 0.55}
                />
                <text
                  x={worstX + barWidth / 2}
                  y={y(cell.worstDb) - 5}
                  textAnchor="middle"
                  fill={chartTheme.seriesText.loss}
                  fontSize={10}
                  fontWeight={isCurrent ? 700 : 500}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {formatNumber(cell.worstDb, 1)}
                </text>
              </>
            ) : (
              <>
                <rect
                  x={centerX - barWidth - 3}
                  y={y(10)}
                  width={barWidth * 2 + 6}
                  height={baseY - y(10)}
                  rx={4}
                  fill={chartTheme.surface.plain}
                  stroke={diagramPalette.faint}
                  strokeDasharray="4 4"
                />
                <text
                  x={centerX}
                  y={y(10) - 5}
                  textAnchor="middle"
                  fill={diagramPalette.muted}
                  fontSize={10}
                  fontWeight={isCurrent ? 700 : 500}
                >
                  データなし
                </text>
              </>
            )}
            <text
              x={centerX}
              y={chart.height - 16}
              textAnchor="middle"
              fill={isCurrent ? diagramPalette.stafDark : diagramPalette.inkSoft}
              fontSize={12}
              fontWeight={isCurrent ? 700 : 600}
            >
              {s.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function BodyLossPanel() {
  // 既定は 2.4GHz × 手持ち（BLE/Wi-Fi機器で最も多い相談条件。Typ 5.0 / Worst 10.0 dB）
  const [band, setBand] = useState<BodyLossBandId>("2400");
  const [scenario, setScenario] = useState<BodyLossScenarioId>("handheld");

  const result = useMemo(() => lookupBodyLoss({ band, scenario }), [band, scenario]);
  // データなし時の参考値（最も近い条件=体表密着の同帯域値）
  const fallback = useMemo(() => lookupBodyLoss({ band, scenario: "bodyWorn" }), [band]);

  const bandMeta = BODY_LOSS_BANDS.find((b) => b.id === band);
  const scenarioMeta = BODY_LOSS_SCENARIOS.find((s) => s.id === scenario);

  const primary = {
    label: "推奨追加損失（Typ）",
    value: result === null ? "—" : formatNumber(result.typicalDb, 1),
    unit: result === null ? undefined : "dB"
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
            ボディロスは式ではなく「使い方」で決まります。①どの周波数帯か
            ②体にどう持たれる・着けられるか、の2つを選ぶと、文献の代表値（Typ/Worst）を表引きします。
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">周波数帯</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="周波数帯">
              {BODY_LOSS_BANDS.map((b) => (
                <button key={b.id} type="button" className={chipClass(band === b.id)} onClick={() => setBand(b.id)}>
                  {b.label}
                </button>
              ))}
            </div>
            {bandMeta ? (
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{bandMeta.note}</p>
            ) : null}

            <p className="mt-4 text-xs font-semibold text-slate-500">装着・保持シナリオ</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="装着・保持シナリオ">
              {BODY_LOSS_SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={chipClass(scenario === s.id)}
                  onClick={() => setScenario(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {scenarioMeta ? (
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{scenarioMeta.description}</p>
            ) : null}
          </div>

          <div className="mt-5">
            <Callout tone="caution" icon={<AlertTriangle aria-hidden="true" className="h-5 w-5 text-amber-700" />}>
              <p>
                本表は文献の代表値による<strong>目安値（実測前提）</strong>です。実機では筐体・アンテナ配置・
                姿勢・個人差で±数dB以上変わります。出典: 3GPP TR 36.814 §8.2（TR 37.840併記）／
                CTIA OTA Test Plan（Head/Hand Phantoms）／AntennaWare Body Loss Data。
                装着機器・ハンディ機の最終確認は、
                <a
                  href={CONTACT_URL}
                  className="mx-0.5 font-semibold text-staf-dark underline decoration-staf/40 underline-offset-2 transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
                >
                  筐体込み評価のご相談へ
                </a>
                。
              </p>
            </Callout>
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="body-loss-primary-result">
            <ResultBar primary={primary} />
          </div>

          {result === null ? (
            <Callout tone="warning" title="この組合せの文献データがありません">
              <p>
                GNSS L1 × 頭部近接は、参照文献に代表値がありません（0dB という意味ではありません）。
                {fallback
                  ? `近い条件として「体表密着」（Typ ${formatNumber(fallback.typicalDb, 1)} / Worst ${formatNumber(fallback.worstDb, 1)} dB）を参考にしつつ、`
                  : ""}
                実測での確認を推奨します。
              </p>
            </Callout>
          ) : (
            <Card as="section" padding="lg">
              <h2 className="text-base font-bold text-slate-950">文献レンジと使い方</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <MetricCard
                  label="文献レンジ（Typ〜Worst）"
                  value={`${formatNumber(result.typicalDb, 1)}〜${formatNumber(result.worstDb, 1)}`}
                  unit="dB"
                  sub="Typで計上し、Worstとの差はマージンで吸収"
                />
                <MetricCard
                  label="悪条件（Worst）"
                  value={formatNumber(result.worstDb, 1)}
                  unit="dB"
                  sub="姿勢・密着が最悪側に振れた場合"
                  hint="握り込み・完全遮蔽など、装着姿勢が最悪側に振れた文献値。到達率を厳しく見たいときはこちらで検算します。"
                />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                この値を
                <Link
                  href="/tools/rf-basic-link-calculator"
                  className="mx-1 inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
                >
                  リンクバジェット診断の環境損失欄
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                </Link>
                に足すと、「机上では届くのに、身に着けると届かない」を設計段階で見積もれます。
              </p>
            </Card>
          )}
        </div>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="比較グラフ"
          title="装着シナリオ別のボディロス（Typ/Worst）"
          description="選択中の周波数帯について、5つの装着・保持シナリオの文献値を並べます。帯域チップを切り替えると全体が連動し、周波数が高いほど・体に近いほど損失が増える傾向が読めます。"
          exportName="body-loss-by-scenario"
          caption={`条件: ${bandMeta?.label ?? band} ─ 出典: ${BODY_LOSS_SOURCES.map((s) => s.label.split("(")[0].trim()).join(" / ")}（代表値・目安）`}
        >
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <BodyLossBarChart band={band} scenario={scenario} />
          </div>
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard
          title="基礎から: なぜ体で電波が減るのか"
          formula="リンクバジェットへの計上: 環境損失[dB] に ボディロス[dB]（表引き値・Typ）を加算"
          showColumnLink={false}
        >
          <p>
            <strong>① 人体は2.4GHz帯をよく吸収します。</strong>
            体の約6割は水で、水分子はGHz帯の電磁波エネルギーを吸収します（電子レンジの2.45GHzと同じ帯域）。
            吸収に加えて、体そのものが電波を<strong>遮蔽</strong>し、
            さらにアンテナのすぐ近く（近傍界）に体が入ると<strong>共振がずれて放射効率が落ちます</strong>。
            この3つの合算がボディロスです。
          </p>
          <p>
            <strong>② 式ではなく表引きなのは、支配要因が「使い方」だからです。</strong>
            自由空間損失のような綺麗な式はなく、周波数帯と装着・保持シナリオでレンジが決まります。
            そのため 3GPP の評価前提や CTIA のファントム試験（人体模型で持ち方を再現して測る）に基づく
            文献代表値を、Typ（典型）と Worst（悪条件）の2値で表引きします。
          </p>
          <p>
            <strong>③ 使い方: Typ を環境損失に足し、Worst との差をマージンで吸収します。</strong>
            リンクバジェットの環境損失欄に Typ 値を計上し、Worst − Typ のぶんはフェージングマージンや
            設置条件で吸収できるかを確認します。データなしの組合せ（GNSS×頭部近接）を
            0dB とみなさないことも重要です。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <BodyLossColumn />
      </div>

      <MobileResultBar primary={primary} targetId="body-loss-primary-result" />
    </>
  );
}

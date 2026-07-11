"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { calculateActiveGnssCn0, calculateGnssCn0, type GnssCn0Quality } from "@/lib/rf/gnssCn0";
import { formatNumber } from "@/lib/rf/format";
import type { LinkJudgementLevel } from "@/lib/rf/judgement";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { GnssCn0Column } from "./GnssCn0Column";

const qualityMeta: Record<GnssCn0Quality, { label: string; level: LinkJudgementLevel }> = {
  good: { label: "C/N0目安：良好", level: "excellent" },
  usable: { label: "C/N0目安：使用可", level: "caution" },
  difficult: { label: "C/N0目安：厳しい", level: "poor" }
};

// 捕捉のおおよその下限（分類境界と整合: >40良好・35〜40使用可・<35厳しい）。
const GNSS_ACQUISITION_THRESHOLD_DBHZ = 35;

// 環境減衰の代表値（例示・入力ではない）。値の幅は広く、樹木はITU-R P.833の植生減衰、
// 屋内は建物侵入損（ITU-R P.2109 等）で状況により10〜30dBに及ぶ。ここでは典型例を固定表示する。
const GNSS_ENV_LOSS_STEPS = [
  { label: "− 樹木・林冠", lossDb: 8 },
  { label: "− 屋内侵入損", lossDb: 15 }
] as const;

// ---- C/N0バジェット滝グラフ（入力連動の動的SVG） ------------------------------------
// オープンスカイのC/N0（受信電力−雑音密度）を起点に、樹木→屋内の環境減衰を積み下げ、
// 到達C/N0が捕捉閾値を割る様子を1枚で見せる。テキストは属性直指定（書き出したSVG単体でも
// 画面と同じ見た目: v4 R4方式）。色は chartTheme / diagramPalette のみ（生hex禁止）。

type Cn0Step = {
  label: string;
  sub: string;
  from: number;
  to: number;
  kind: "total" | "loss";
};

function Cn0BudgetWaterfall({ openSkyCn0DbHz, compact = false }: { openSkyCn0DbHz: number; compact?: boolean }) {
  const chart = compact
    ? { width: 360, height: 320, top: 36, right: 12, bottom: 72, left: 42, barWidth: 52 }
    : { width: 640, height: 320, top: 30, right: 24, bottom: 56, left: 56, barWidth: 84 };

  const steps: Cn0Step[] = [];
  steps.push({
    label: "オープンスカイ",
    sub: `${formatNumber(openSkyCn0DbHz, 1)}dB-Hz`,
    from: openSkyCn0DbHz,
    to: openSkyCn0DbHz,
    kind: "total"
  });
  let running = openSkyCn0DbHz;
  for (const env of GNSS_ENV_LOSS_STEPS) {
    const next = running - env.lossDb;
    steps.push({
      label: env.label,
      sub: `−${formatNumber(env.lossDb, 0)}dB`,
      from: running,
      to: next,
      kind: "loss"
    });
    running = next;
  }
  const achievedCn0DbHz = running;
  steps.push({
    label: "到達 C/N0",
    sub: `${formatNumber(achievedCn0DbHz, 1)}dB-Hz`,
    from: achievedCn0DbHz,
    to: achievedCn0DbHz,
    kind: "total"
  });

  const values = [...steps.flatMap((s) => [s.from, s.to]), GNSS_ACQUISITION_THRESHOLD_DBHZ];
  const maxValue = Math.ceil((Math.max(...values) + 6) / 10) * 10;
  const minValue = Math.floor((Math.min(...values) - 6) / 10) * 10;
  const span = Math.max(1, maxValue - minValue);
  const plotHeight = chart.height - chart.top - chart.bottom;
  const stepGap = (chart.width - chart.left - chart.right) / steps.length;
  const y = (v: number) => chart.top + ((maxValue - v) / span) * plotHeight;
  const x = (i: number) => chart.left + i * stepGap + (stepGap - chart.barWidth) / 2;
  const tickStep = compact ? 20 : 10;
  const ticks = Array.from({ length: Math.floor(span / tickStep) + 1 }, (_, i) => maxValue - i * tickStep);

  const styleFor = (kind: Cn0Step["kind"]) =>
    kind === "loss"
      ? { fill: chartTheme.series.loss, stroke: chartTheme.seriesText.loss }
      : { fill: chartTheme.series.source, stroke: chartTheme.seriesText.source };

  const thresholdY = y(GNSS_ACQUISITION_THRESHOLD_DBHZ);
  const belowThreshold = achievedCn0DbHz < GNSS_ACQUISITION_THRESHOLD_DBHZ - 0.05;

  return (
    <svg
      data-testid={compact ? "gnss-cn0-waterfall-mobile" : "gnss-cn0-waterfall-desktop"}
      data-open-sky-cn0={openSkyCn0DbHz.toFixed(3)}
      data-achieved-cn0={achievedCn0DbHz.toFixed(3)}
      role="img"
      aria-label={`オープンスカイC/N0 ${formatNumber(openSkyCn0DbHz, 1)}dB-Hzから環境減衰を引き、到達C/N0は${formatNumber(achievedCn0DbHz, 1)}dB-Hz。捕捉閾値${GNSS_ACQUISITION_THRESHOLD_DBHZ}dB-Hz`}
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
            fontSize={compact ? 13 : 11}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {tick}
          </text>
        </g>
      ))}
      <text x={chart.left} y={chart.top - 12} fill={diagramPalette.muted} fontSize={compact ? 14 : 12} fontWeight={600}>
        dB-Hz
      </text>

      {/* 捕捉閾値の水平基準線: 到達C/N0がこの線より下＝測位不可の目安 */}
      <line
        x1={chart.left}
        x2={chart.width - chart.right}
        y1={thresholdY}
        y2={thresholdY}
        stroke={chartTheme.reference.sensitivity}
        strokeDasharray={chartTheme.reference.sensitivityDash}
      />
      <text
        x={chart.left + 4}
        y={thresholdY - 6}
        fill={chartTheme.seriesText.loss}
        fontSize={compact ? 12 : 11}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {compact ? `捕捉閾値 ${GNSS_ACQUISITION_THRESHOLD_DBHZ}` : `捕捉閾値 ${GNSS_ACQUISITION_THRESHOLD_DBHZ}dB-Hz`}
      </text>

      {steps.map((step, index) => {
        const style = styleFor(step.kind);
        const top = Math.min(y(step.from), y(step.to));
        const height = Math.max(4, Math.abs(y(step.to) - y(step.from)));
        const centerX = x(index) + chart.barWidth / 2;
        const labelAboveY = top - 8;
        const compactLabels = [
          ["オープン", "スカイ"],
          ["樹木", "林冠"],
          ["屋内", "侵入"],
          ["到達", "C/N0"]
        ];
        return (
          <g key={step.label}>
            {index > 0 ? (
              <line
                x1={x(index - 1) + chart.barWidth}
                x2={x(index)}
                y1={y(steps[index - 1].to)}
                y2={y(steps[index - 1].to)}
                stroke={diagramPalette.faint}
                strokeDasharray="4 4"
              />
            ) : null}
            <rect
              x={x(index)}
              y={top}
              width={chart.barWidth}
              height={height}
              rx={6}
              fill={style.fill}
              stroke={style.stroke}
              strokeWidth={1.5}
              opacity={step.kind === "total" ? 1 : 0.9}
            />
            <text
              x={centerX}
              y={labelAboveY}
              textAnchor="middle"
              fill={style.stroke}
              fontSize={compact ? 12 : 11}
              fontWeight={700}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {step.sub}
            </text>
            <text
              x={centerX}
              y={chart.height - (compact ? 40 : 32)}
              textAnchor="middle"
              fill={diagramPalette.inkSoft}
              fontSize={compact ? 11 : 12}
              fontWeight={600}
            >
              {compact ? (
                <>
                  <tspan x={centerX} dy="0">{compactLabels[index][0]}</tspan>
                  <tspan x={centerX} dy="14">{compactLabels[index][1]}</tspan>
                </>
              ) : step.label}
            </text>
          </g>
        );
      })}

      {/* 到達C/N0が閾値を割ったとき: 「捕捉閾値を割る」注記 */}
      {belowThreshold ? (
        <text
          x={chart.width - chart.right}
          y={thresholdY + 16}
          textAnchor="end"
          fill={chartTheme.seriesText.loss}
          fontSize={compact ? 12 : 11}
          fontWeight={700}
        >
          {compact ? "閾値割れ" : "捕捉閾値を割る（測位不可の目安）"}
        </text>
      ) : null}
    </svg>
  );
}

export function GnssCn0Panel() {
  const [receivedPowerDbm, setReceivedPowerDbm] = useState(-130);
  const [antennaGainDbi, setAntennaGainDbi] = useState(3);
  const [cableLossDb, setCableLossDb] = useState(3);
  const [receiverNoiseFigureDb, setReceiverNoiseFigureDb] = useState(4);
  const [lnaGainDb, setLnaGainDb] = useState(20);
  const [lnaNoiseFigureDb, setLnaNoiseFigureDb] = useState(1.5);

  const results = useMemo(() => {
    try {
      return {
        passive: calculateGnssCn0({
          receivedPowerDbm,
          antennaGainDbi,
          preLnaLossDb: cableLossDb,
          receiverNoiseFigureDb
        }),
        active: calculateActiveGnssCn0({
          receivedPowerDbm,
          antennaGainDbi,
          preLnaLossDb: 0,
          postLnaLossDb: cableLossDb,
          lnaGainDb,
          lnaNoiseFigureDb,
          receiverNoiseFigureDb
        })
      };
    } catch {
      return null;
    }
  }, [receivedPowerDbm, antennaGainDbi, cableLossDb, receiverNoiseFigureDb, lnaGainDb, lnaNoiseFigureDb]);

  const judgement = results ? qualityMeta[results.active.quality] : undefined;
  const primary = {
    label: "アクティブ構成 C/N0",
    value: results ? formatNumber(results.active.cn0DbHz, 1) : "—",
    unit: "dB-Hz"
  };

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:items-start">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">同じアンテナとケーブルを、パッシブ構成とLNA内蔵構成で比較します。</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field id="gnssReceivedPower" label="受信信号レベル" unit="dBm" value={receivedPowerDbm} step={1} emptyBehavior="invalid" onChange={setReceivedPowerDbm} help="アンテナ利得を加える前のGNSS搬送波レベルです。GPS L1オープンスカイの初期値として−130dBmを置いています。" />
            <Field id="gnssAntennaGain" label="アンテナ利得" unit="dBi" value={antennaGainDbi} step={0.1} emptyBehavior="invalid" onChange={setAntennaGainDbi} help="衛星方向のアンテナ利得です。" />
            <Field id="gnssCableLoss" label="ケーブル損失" unit="dB" value={cableLossDb} min={0} step={0.1} emptyBehavior="invalid" onChange={setCableLossDb} help="パッシブでは受信機前、アクティブではLNA後にある損失として比較します。" />
            <Field id="gnssReceiverNf" label="受信機NF" unit="dB" value={receiverNoiseFigureDb} min={0} step={0.1} emptyBehavior="invalid" onChange={setReceiverNoiseFigureDb} help="GNSS受信機入力段の雑音指数です。" />
            <Field id="gnssLnaGain" label="LNA利得" unit="dB" value={lnaGainDb} min={0} step={1} emptyBehavior="invalid" onChange={setLnaGainDb} help="アクティブアンテナ内LNAの利得です。後段雑音をこの利得で抑えます。" />
            <Field id="gnssLnaNf" label="LNA NF" unit="dB" value={lnaNoiseFigureDb} min={0} step={0.1} emptyBehavior="invalid" onChange={setLnaNoiseFigureDb} help="アンテナ直後のLNA雑音指数です。小さいほどC/N0が良くなります。" />
          </div>
        </Card>

        <div id="gnss-primary-result" className="space-y-4 lg:sticky lg:top-20">
          <ResultBar primary={primary} judgement={judgement} />
          {results ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard label="パッシブ C/N0" value={formatNumber(results.passive.cn0DbHz, 1)} unit="dB-Hz" tone={results.passive.quality === "good" ? "success" : results.passive.quality === "usable" ? "caution" : "danger"} />
              <MetricCard label="アクティブ C/N0" value={formatNumber(results.active.cn0DbHz, 1)} unit="dB-Hz" tone={results.active.quality === "good" ? "success" : results.active.quality === "usable" ? "caution" : "danger"} />
              <MetricCard label="アクティブ構成 NFsys" value={formatNumber(results.active.systemNoiseFigureDb, 2)} unit="dB" />
              <MetricCard label="アクティブ化の差" value={formatNumber(results.active.cn0DbHz - results.passive.cn0DbHz, 1)} unit="dB" />
            </div>
          ) : (
            <Callout tone="danger">損失・NF・LNA利得は0以上の有限値を入力してください。</Callout>
          )}
          <Callout tone="info" title="判定目安">
            40dB-Hz超は良好、35〜40dB-Hzは使用可、35dB-Hz未満は厳しい目安です。実機のマルチパス・遮蔽は別途評価します。
          </Callout>
        </div>
      </section>

      {results ? (
        <Card as="figure" padding="lg" className="mt-6">
          <figcaption className="text-base font-bold text-slate-950">LNAを置く位置と後段雑音</figcaption>
          <div className="mt-4 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center"><p className="text-xs font-semibold text-slate-500">アンテナ</p><p className="mt-1 font-bold text-slate-950">G {formatNumber(antennaGainDbi, 1)}dBi</p></div>
            <span className="text-center text-xl text-slate-400">→</span>
            <div className="rounded-lg border border-staf/30 bg-staf-light p-4 text-center"><p className="text-xs font-semibold text-staf-dark">LNA</p><p className="mt-1 font-bold text-slate-950">+{formatNumber(lnaGainDb, 1)}dB / NF {formatNumber(lnaNoiseFigureDb, 1)}dB</p></div>
            <span className="text-center text-xl text-slate-400">→</span>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center"><p className="text-xs font-semibold text-slate-500">ケーブル＋受信機</p><p className="mt-1 font-bold text-slate-950">損失 {formatNumber(cableLossDb, 1)}dB</p></div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">LNAをケーブルより前へ置くと、ケーブルと受信機の雑音寄与はLNA利得で割られます。</p>
        </Card>
      ) : null}

      {results ? (
        <div className="mt-6">
          <ChartFrame
            eyebrow="滝グラフ"
            title="C/N0バジェットと環境減衰"
            description="オープンスカイのC/N0（受信電力−雑音密度）を起点に、樹木・屋内の減衰を積み下げます。到達C/N0が捕捉閾値を割ると測位できなくなります。オープンスカイ値は入力に連動して動きます。"
            exportName="gnss-cn0-budget"
            caption={`起点=アクティブ構成のオープンスカイ C/N0 ${formatNumber(results.active.cn0DbHz, 1)}dB-Hz ─ 樹木・屋内の減衰は代表値（例示。ITU-R P.833 植生減衰／建物侵入損は状況で10〜30dBに及ぶ）。捕捉閾値${GNSS_ACQUISITION_THRESHOLD_DBHZ}dB-Hzは分類境界の目安。`}
          >
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <div className="hidden sm:block">
                <Cn0BudgetWaterfall openSkyCn0DbHz={results.active.cn0DbHz} />
              </div>
              <div className="sm:hidden">
                <Cn0BudgetWaterfall compact openSkyCn0DbHz={results.active.cn0DbHz} />
              </div>
            </div>
          </ChartFrame>
        </div>
      ) : null}

      <div className="mt-6">
        <FormulaExplanationCard title="C/N0とFriis縦続NF" formula={"C/N0 = Pr + Gant − Lpre − (−174 + NFsys)\nFsys = Flna + (Lcable−1)/Glna + (Frx−1)·Lcable/Glna"} showColumnLink={false}>
          <p className="text-sm leading-relaxed text-slate-600">NF計算ではdBを線形雑音因子Fへ変換して縦続し、最後にdBへ戻します。</p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <GnssCn0Column />
      </div>

      <MobileResultBar primary={primary} judgement={judgement} targetId="gnss-primary-result" />
    </>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { Tooltip } from "@/components/Tooltip";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { formatDb, formatDbm, formatNumber, formatSigned } from "@/lib/rf/format";
import type { MetricTone } from "@/lib/ui/kit";
import {
  calculateSimpleLinkBudget,
  type SimpleDistanceUnit,
  type SimpleLinkBudgetInput,
  type SimpleLinkBudgetResult
} from "@/lib/rf/simpleLinkBudget";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { SimpleLinkBudgetColumn } from "./SimpleLinkBudgetColumn";

const presets: Array<{ label: string; input: SimpleLinkBudgetInput }> = [
  {
    label: "LPWA 920MHz / 1km",
    input: {
      frequencyMHz: 920,
      distance: 1,
      distanceUnit: "km",
      txPowerDbm: 13,
      antennaGainTotalDbi: 0,
      extraLossDb: 10,
      receiverSensitivityDbm: -120
    }
  },
  {
    label: "Wi-Fi 2.4GHz / 20m",
    input: {
      frequencyMHz: 2400,
      distance: 20,
      distanceUnit: "m",
      txPowerDbm: 15,
      antennaGainTotalDbi: 0,
      extraLossDb: 20,
      receiverSensitivityDbm: -90
    }
  },
  {
    label: "BLE 2.4GHz / 10m",
    input: {
      frequencyMHz: 2400,
      distance: 10,
      distanceUnit: "m",
      txPowerDbm: 0,
      antennaGainTotalDbi: -2,
      extraLossDb: 8,
      receiverSensitivityDbm: -95
    }
  }
];

// 判定レベル → MetricCard の意味トーン。リンク余裕は良否判定を持つため色付けする（§2.1）。
// 数値色は従来の judgementTone と一致（success=emerald / primary=staf / caution・warning=amber / danger=rose）。
const judgementMetricTone: Record<SimpleLinkBudgetResult["judgement"]["level"], MetricTone> = {
  excellent: "success",
  good: "primary",
  caution: "caution",
  unstable: "warning",
  poor: "danger"
};

const judgementClass: Record<SimpleLinkBudgetResult["judgement"]["level"], string> = {
  excellent: "border-emerald-200 bg-emerald-50 text-emerald-900",
  good: "border-staf/25 bg-staf-light text-staf-dark",
  caution: "border-amber-200 bg-amber-50 text-amber-900",
  unstable: "border-amber-200 bg-amber-50 text-amber-900",
  poor: "border-rose-200 bg-rose-50 text-rose-900"
};

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

function formatDistance(distance: number, unit: SimpleDistanceUnit) {
  return unit === "km" ? `${formatNumber(distance, 3)} km` : `${formatNumber(distance, 1)} m`;
}

function MathRow({
  sign,
  label,
  value,
  muted = false
}: {
  sign: "+" | "-" | "=" | "";
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className={`grid grid-cols-[28px_1fr_auto] items-center gap-3 py-2 text-sm ${muted ? "text-slate-500" : "text-slate-800"}`}>
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 font-bold text-slate-600">
        {sign}
      </span>
      <span>{label}</span>
      <span className="font-semibold tabular-nums text-slate-950">{value}</span>
    </div>
  );
}

// ---- リンクバジェット滝グラフ（入力連動の動的SVG） --------------------------------------
// 送信電力から出発し、＋利得／−自由空間損失／−追加損失と積み上げ引きして受信電力に到達。
// 受信感度の水平基準線との差＝リンク余裕（マージン）を右端の縦ブラケットで直接ラベリングする。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目: v4 R4方式）。色は必ずトークン参照。

type WaterfallStep = {
  label: string;
  sub: string;
  from: number;
  to: number;
  kind: "start" | "gain" | "loss" | "total";
};

function LinkBudgetWaterfall({
  txPowerDbm,
  antennaGainTotalDbi,
  fsplDb,
  extraLossDb,
  receivedPowerDbm,
  sensitivityDbm,
  linkMarginDb
}: {
  txPowerDbm: number;
  antennaGainTotalDbi: number;
  fsplDb: number;
  extraLossDb: number;
  receivedPowerDbm: number;
  sensitivityDbm: number;
  linkMarginDb: number;
}) {
  const chart = { width: 680, height: 340, top: 34, right: 24, bottom: 56, left: 56, barWidth: 76 };

  const afterGain = txPowerDbm + antennaGainTotalDbi;
  const afterFspl = afterGain - fsplDb;

  const steps: WaterfallStep[] = [
    {
      label: "送信電力",
      sub: `${formatNumber(txPowerDbm, 1)}dBm`,
      from: txPowerDbm,
      to: txPowerDbm,
      kind: "start"
    },
    {
      label: "＋利得",
      sub: `${antennaGainTotalDbi >= 0 ? "+" : ""}${formatNumber(antennaGainTotalDbi, 1)}dBi`,
      from: txPowerDbm,
      to: afterGain,
      kind: antennaGainTotalDbi >= 0 ? "gain" : "loss"
    },
    {
      label: "−FSPL",
      sub: `-${formatNumber(fsplDb, 1)}dB`,
      from: afterGain,
      to: afterFspl,
      kind: "loss"
    },
    {
      label: "−追加損失",
      sub: `-${formatNumber(extraLossDb, 1)}dB`,
      from: afterFspl,
      to: receivedPowerDbm,
      kind: "loss"
    },
    {
      label: "受信電力",
      sub: `${formatNumber(receivedPowerDbm, 1)}dBm`,
      from: receivedPowerDbm,
      to: receivedPowerDbm,
      kind: "total"
    }
  ];

  const values = [...steps.flatMap((s) => [s.from, s.to]), sensitivityDbm];
  const maxValue = Math.ceil((Math.max(...values) + 6) / 10) * 10;
  const minValue = Math.floor((Math.min(...values) - 6) / 10) * 10;
  const span = Math.max(1, maxValue - minValue);
  const plotHeight = chart.height - chart.top - chart.bottom;
  const slots = steps.length + 1; // 最終スロットはマージン表示用に確保
  const stepGap = (chart.width - chart.left - chart.right) / slots;
  const y = (v: number) => chart.top + ((maxValue - v) / span) * plotHeight;
  const x = (i: number) => chart.left + i * stepGap + (stepGap - chart.barWidth) / 2;

  const tickStep = Math.max(10, Math.ceil(span / 7 / 10) * 10);
  const ticks = Array.from(
    { length: Math.floor(span / tickStep) + 1 },
    (_, i) => maxValue - i * tickStep
  ).filter((t) => t >= minValue);

  const styleFor = (kind: WaterfallStep["kind"]) => {
    if (kind === "gain") return { fill: chartTheme.series.gain, stroke: chartTheme.seriesText.gain };
    if (kind === "loss") return { fill: chartTheme.series.loss, stroke: chartTheme.seriesText.loss };
    if (kind === "total") return { fill: chartTheme.series.total, stroke: chartTheme.seriesText.total };
    return { fill: chartTheme.series.source, stroke: chartTheme.seriesText.source };
  };

  const sensY = y(sensitivityDbm);
  const rxY = y(receivedPowerDbm);
  const marginCenterX = chart.left + steps.length * stepGap + stepGap / 2;
  const marginPositive = linkMarginDb >= 0;
  const marginStyle = marginPositive
    ? { fill: chartTheme.series.gain, stroke: chartTheme.seriesText.gain }
    : { fill: chartTheme.series.loss, stroke: chartTheme.seriesText.loss };
  const marginTop = Math.min(rxY, sensY);
  const marginHeight = Math.max(4, Math.abs(rxY - sensY));

  return (
    <svg
      role="img"
      aria-label={`送信電力${formatNumber(txPowerDbm, 1)}dBmから受信電力${formatNumber(receivedPowerDbm, 1)}dBmへの積み上げ。受信感度${formatNumber(sensitivityDbm, 1)}dBmに対しリンク余裕${formatSigned(linkMarginDb, "dB", 1)}`}
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
      <text x={chart.left} y={chart.top - 14} fill={diagramPalette.muted} fontSize={12} fontWeight={600}>
        dBm
      </text>

      {/* 受信感度の水平基準線: この線を受信電力が上回っている高さが「リンク余裕」 */}
      <line
        x1={chart.left}
        x2={chart.width - chart.right}
        y1={sensY}
        y2={sensY}
        stroke={chartTheme.reference.sensitivity}
        strokeDasharray={chartTheme.reference.sensitivityDash}
      />
      <text
        x={chart.left + 4}
        y={sensY - 6}
        fill={chartTheme.reference.sensitivity}
        fontSize={11}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        受信感度 {formatNumber(sensitivityDbm, 1)}dBm
      </text>

      {steps.map((step, index) => {
        const style = styleFor(step.kind);
        const top = Math.min(y(step.from), y(step.to));
        const height = Math.max(4, Math.abs(y(step.to) - y(step.from)));
        const centerX = x(index) + chart.barWidth / 2;
        const labelAboveY = top - 8;
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
              opacity={step.kind === "start" || step.kind === "total" ? 1 : 0.9}
            />
            <text
              x={centerX}
              y={labelAboveY}
              textAnchor="middle"
              fill={style.stroke}
              fontSize={11}
              fontWeight={700}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {step.sub}
            </text>
            <text
              x={centerX}
              y={chart.height - 32}
              textAnchor="middle"
              fill={diagramPalette.inkSoft}
              fontSize={12}
              fontWeight={600}
            >
              {step.label}
            </text>
          </g>
        );
      })}

      {/* 受信電力の高さをマージンスロットへ導く水平ガイド */}
      <line
        x1={x(steps.length - 1) + chart.barWidth}
        x2={marginCenterX}
        y1={rxY}
        y2={rxY}
        stroke={diagramPalette.faint}
        strokeDasharray="4 4"
      />

      {/* リンク余裕（受信電力と受信感度の差）を縦バーで明示 */}
      <rect
        x={marginCenterX - 20}
        y={marginTop}
        width={40}
        height={marginHeight}
        rx={5}
        fill={marginStyle.fill}
        stroke={marginStyle.stroke}
        strokeWidth={1.5}
        opacity={0.85}
      />
      <text
        x={marginCenterX}
        y={marginTop - 8}
        textAnchor="middle"
        fill={marginStyle.stroke}
        fontSize={11}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {marginPositive ? "余裕 " : "不足 "}
        {formatSigned(linkMarginDb, "dB", 1)}
      </text>
      <text
        x={marginCenterX}
        y={chart.height - 32}
        textAnchor="middle"
        fill={diagramPalette.inkSoft}
        fontSize={12}
        fontWeight={600}
      >
        リンク余裕
      </text>
    </svg>
  );
}

export function SimpleLinkBudgetPanel() {
  const [input, setInput] = useState<SimpleLinkBudgetInput>(presets[0].input);

  const result = useMemo(() => {
    try {
      return calculateSimpleLinkBudget(input);
    } catch {
      return null;
    }
  }, [input]);

  const updateNumber = (key: keyof SimpleLinkBudgetInput) => (value: number) => {
    setInput((current) => ({ ...current, [key]: value }));
  };

  const handleDistanceUnitChange = (nextUnit: SimpleDistanceUnit) => {
    setInput((current) => {
      if (current.distanceUnit === nextUnit) {
        return current;
      }
      const nextDistance =
        nextUnit === "m" ? current.distance * 1000 : current.distance / 1000;
      return {
        ...current,
        distanceUnit: nextUnit,
        distance: Number.parseFloat(nextDistance.toPrecision(6))
      };
    });
  };

  const applyPreset = (presetInput: SimpleLinkBudgetInput) => {
    setInput(presetInput);
  };

  const marginPercent = result ? clampPercent(((result.linkMarginDb + 30) / 60) * 100) : 0;
  const thresholdPercent = 50;

  return (
    <>
      <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <Card as="section" padding="lg">
        <h2 className="text-xl font-bold text-slate-950">かんたんリンク計算</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          送信電力から距離損失と追加損失を引き、受信感度に対して何dB余裕があるかだけを見ます。
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => applyPreset(preset.input)}
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          <Field
            id="simpleFrequencyMHz"
            label="周波数"
            help="使う無線の中心周波数です。920MHz帯、2.4GHz帯なら、それぞれ 920 / 2400 のように入力します。"
            unit="MHz"
            value={input.frequencyMHz}
            min={1}
            step={1}
            onChange={updateNumber("frequencyMHz")}
          />

          <Field
            id="simpleDistance"
            label="通信距離"
            help="送信側と受信側の距離です。屋内や机上の確認は m、屋外の見通し確認は km が扱いやすいです。"
            unitSelect={{
              value: input.distanceUnit,
              options: [
                { value: "m", label: "m" },
                { value: "km", label: "km" }
              ],
              ariaLabel: "距離の単位",
              onChange: (u) => handleDistanceUnitChange(u as SimpleDistanceUnit)
            }}
            value={input.distance}
            min={input.distanceUnit === "m" ? 0.1 : 0.001}
            step={input.distanceUnit === "m" ? 1 : 0.01}
            onChange={updateNumber("distance")}
          />

          <Field
            id="simpleTxPowerDbm"
            label="送信電力"
            help="無線機の送信出力です。0dBm=1mW、10dBm=10mW、20dBm=100mWです。"
            unit="dBm"
            value={input.txPowerDbm}
            step={1}
            onChange={updateNumber("txPowerDbm")}
          />

          <Field
            id="simpleSensitivityDbm"
            label="受信感度"
            help="受信機が復調できる最小レベルです。仕様書の -120dBm などの値を入れます。"
            unit="dBm"
            value={input.receiverSensitivityDbm}
            step={1}
            onChange={updateNumber("receiverSensitivityDbm")}
          />
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-950">必要なら少しだけ補正</h3>
            <Tooltip term="補正">
              まずは0のままで構いません。アンテナ利得が分かる、壁や筐体の追加損失を仮置きしたい、という時だけ入れます。
            </Tooltip>
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field
              id="simpleGainTotal"
              label="アンテナ利得（送受信合計）"
              unit="dBi"
              value={input.antennaGainTotalDbi}
              step={0.5}
              onChange={updateNumber("antennaGainTotalDbi")}
            />
            <Field
              id="simpleExtraLoss"
              label="追加損失"
              unit="dB"
              value={input.extraLossDb}
              min={0}
              step={0.5}
              onChange={updateNumber("extraLossDb")}
            />
          </div>
        </div>
      </Card>

      <Card as="section" padding="lg">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-950">結果</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              自由空間損失だけで見る、最小構成のリンク余裕です。
            </p>
          </div>
          {result ? (
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${judgementClass[result.judgement.level]}`}>
              {result.judgement.label}
            </span>
          ) : null}
        </div>

        {result ? (
          <>
            <div data-testid="primary-result" className="mt-5 grid gap-3 sm:grid-cols-3">
              <MetricCard
                label="リンク余裕"
                value={formatSigned(result.linkMarginDb, "dB", 1)}
                tone={judgementMetricTone[result.judgement.level]}
                size="lg"
                sub="0dBを上回るほど余裕あり"
              />
              <MetricCard
                label="受信電力"
                value={formatNumber(result.receivedPowerDbm)}
                unit="dBm"
                tone="neutral"
                size="md"
                sub={`感度 ${formatDbm(input.receiverSensitivityDbm)}`}
              />
              <MetricCard
                label="自由空間損失"
                value={formatNumber(result.fsplDb)}
                unit="dB"
                tone="neutral"
                size="md"
                sub={formatDistance(input.distance, input.distanceUnit)}
              />
            </div>

            <div className="slate">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-950">0dBラインとの距離</p>
                <Tooltip term="0dBライン">
                  リンク余裕0dBは、受信電力と受信感度がちょうど同じ位置です。右に行くほど余裕があり、左側は不足です。表示範囲は -30〜+30dB です。
                </Tooltip>
              </div>
              <div className="relative mt-4 h-3 rounded-full bg-white">
                <span
                  className="absolute top-1/2 h-7 w-px -translate-y-1/2 bg-slate-400"
                  style={{ left: `${thresholdPercent}%` }}
                />
                <span
                  className={`absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-card ${
                    result.linkMarginDb >= 0 ? "bg-staf" : "bg-rose-500"
                  }`}
                  style={{ left: `${marginPercent}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>-30dB</span>
                <span>0dB</span>
                <span>+30dB</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{result.judgement.summary}</p>
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-950">足し引きの中身</h3>
                <Tooltip term="リンクバジェット">
                  dBmの電力に、dB/dBiの利得と損失を足し引きして受信電力を求めます。最後に受信感度を引いたものがリンク余裕です。
                </Tooltip>
              </div>
              <div className="mt-3 divide-y divide-slate-100">
                <MathRow sign="" label="送信電力" value={formatDbm(input.txPowerDbm)} />
                <MathRow sign="+" label="アンテナ利得（合計）" value={`${formatNumber(input.antennaGainTotalDbi)} dBi`} />
                <MathRow sign="-" label="自由空間損失" value={formatDb(result.fsplDb)} />
                <MathRow sign="-" label="追加損失" value={formatDb(input.extraLossDb)} />
                <MathRow sign="=" label="受信電力" value={formatDbm(result.receivedPowerDbm)} />
                <MathRow sign="-" label="受信感度" value={formatDbm(input.receiverSensitivityDbm)} muted />
                <MathRow sign="=" label="リンク余裕" value={formatSigned(result.linkMarginDb, "dB", 1)} />
              </div>
            </div>

            <div className="mt-5">
              <FormulaExplanationCard
                title="一番小さなリンクバジェット"
                formula={"受信電力[dBm] = 送信電力[dBm] + アンテナ利得[dBi] - FSPL[dB] - 追加損失[dB]\nリンク余裕[dB] = 受信電力[dBm] - 受信感度[dBm]"}
              >
                <p>
                  この簡易版は、伝搬損失を自由空間損失だけで見ます。壁、地面反射、筐体、人体、設置方向の影響を分けたい場合は、総合版のリンクバジェット診断で確認してください。
                </p>
              </FormulaExplanationCard>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/tools/rf-basic-link-calculator"
                className="inline-flex items-center gap-2 rounded-full bg-staf px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-staf-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                詳細版で見る
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                href="/tools/free-space-loss"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-staf/40 hover:text-staf-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                FSPLだけ見る
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </>
        ) : (
          <p className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
            周波数・距離は0より大きい値、追加損失は0以上で入力してください。
          </p>
        )}
      </Card>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="滝グラフ"
          title="送信電力から受信電力への積み上げ引き"
          description="送信電力から出発し、＋アンテナ利得／−自由空間損失／−追加損失と足し引きして受信電力に到達します。受信感度の基準線との差が「リンク余裕」です。入力に連動して動きます。"
          exportName="simple-link-budget-waterfall"
          caption={
            result
              ? `条件: 送信 ${formatDbm(input.txPowerDbm)} / 利得 ${formatNumber(input.antennaGainTotalDbi, 1)}dBi / FSPL ${formatNumber(result.fsplDb, 1)}dB / 追加損失 ${formatDb(input.extraLossDb)} ─ 受信電力 ${formatDbm(result.receivedPowerDbm)}・感度 ${formatDbm(input.receiverSensitivityDbm)}・リンク余裕 ${formatSigned(result.linkMarginDb, "dB", 1)}`
              : "入力値を確認してください。"
          }
        >
          {result ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <LinkBudgetWaterfall
                txPowerDbm={input.txPowerDbm}
                antennaGainTotalDbi={input.antennaGainTotalDbi}
                fsplDb={result.fsplDb}
                extraLossDb={input.extraLossDb}
                receivedPowerDbm={result.receivedPowerDbm}
                sensitivityDbm={input.receiverSensitivityDbm}
                linkMarginDb={result.linkMarginDb}
              />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              入力値を確認すると積み上げグラフが表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <SimpleLinkBudgetColumn />
      </div>
    </>
  );
}

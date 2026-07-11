"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { SegmentedControl } from "@/components/SegmentedControl";
import { ChoiceChips } from "@/components/ChoiceChips";
import { Badge } from "@/components/Badge";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { calculateBatteryLife } from "@/lib/rf/batteryLife";
import { estimateExpertBatteryLife } from "@/lib/rf/batteryLifeExpert";
import { formatNumber } from "@/lib/rf/format";
import { BatteryLifeColumn } from "./BatteryLifeColumn";
import { BatteryLifeExpertColumn } from "./BatteryLifeExpertColumn";
import { FormulaExplanationCard } from "./FormulaExplanationCard";

type IntervalUnit = "seconds" | "minutes" | "hours" | "days";

const intervalFactors: Record<IntervalUnit, number> = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400
};

const presets = [
  { label: "LoRa 毎時", capacity: 2400, txCurrent: 45, txMs: 50, rxCurrent: 0, rxMs: 0, interval: 1, unit: "hours" as const, sleepUa: 5, derate: 70 },
  { label: "LTE-M 毎日", capacity: 2400, txCurrent: 180, txMs: 8000, rxCurrent: 35, rxMs: 12000, interval: 1, unit: "days" as const, sleepUa: 8, derate: 70 },
  { label: "BLE 10秒", capacity: 1000, txCurrent: 12, txMs: 5, rxCurrent: 8, rxMs: 5, interval: 10, unit: "seconds" as const, sleepUa: 3, derate: 80 }
] as const;

const HOURS_PER_YEAR = 365 * 24;

// 軸レンジを 1/2/5×10ⁿ の「切りのいい」上限へ丸める。
function niceMax(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const n = value / pow;
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return m * pow;
}

// ---- 送信頻度と電池寿命の関係（入力連動の動的曲線） ---------------------------------
// 横軸=1時間あたりの送信回数（頻度 f）、縦軸=理論電池寿命[年]。平均電流 Iavg = Q·f + Isleep
// （Q=送信1回の電荷 mA·s）で寿命 ∝ 1/Iavg のため、頻度を上げると寿命が反比例で「急落」する。
// スリープ電流が支配的な低頻度側は「天井」で頭打ちになり、現在の運用点を丸印で重ねる。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目）。
function BatteryLifeDutyCurve({
  capacityMah,
  deratingPercent,
  txCurrentMa,
  txDurationMs,
  rxCurrentMa,
  rxDurationMs,
  sleepCurrentUa,
  intervalSeconds,
  currentLifeYears,
  compact = false
}: {
  capacityMah: number;
  deratingPercent: number;
  txCurrentMa: number;
  txDurationMs: number;
  rxCurrentMa: number;
  rxDurationMs: number;
  sleepCurrentUa: number;
  intervalSeconds: number;
  currentLifeYears: number;
  compact?: boolean;
}) {
  const chart = compact
    ? { width: 360, height: 300, top: 34, right: 18, bottom: 56, left: 48 }
    : { width: 640, height: 320, top: 28, right: 108, bottom: 54, left: 62 };
  const plotW = chart.width - chart.left - chart.right;
  const plotH = chart.height - chart.top - chart.bottom;
  const baselineY = chart.top + plotH;

  const activeSeconds = (txDurationMs + rxDurationMs) / 1000;
  // 送信1回で奪われる電荷 Q [mA·s]（＝送信電流×送信時間＋受信電流×受信時間）
  const chargePerSendMaS =
    txCurrentMa * (txDurationMs / 1000) + rxCurrentMa * (rxDurationMs / 1000);
  const sleepMa = sleepCurrentUa / 1000;
  const capEffMah = capacityMah * (deratingPercent / 100);
  const currentFhr = intervalSeconds > 0 ? 3600 / intervalSeconds : 0;
  const feasibleMaxFhr = activeSeconds > 0 ? 3600 / activeSeconds : Number.POSITIVE_INFINITY;

  // 頻度 f[回/時] → 理論寿命[年]。Iavg[mA] = Q·(f/3600) + Isleep。
  const lifeYearsAt = (fhr: number) => {
    const avgMa = chargePerSendMaS * (fhr / 3600) + sleepMa;
    if (!(avgMa > 0) || !Number.isFinite(avgMa)) return Number.POSITIVE_INFINITY;
    return capEffMah / avgMa / HOURS_PER_YEAR;
  };

  // 送信平均寄与＝スリープと等しくなる頻度（＝崖の始まり）を目安に横軸レンジを決める。
  const fHalfFhr = chargePerSendMaS > 0 && sleepMa > 0 ? (sleepMa / chargePerSendMaS) * 3600 : 0;
  let xAxisMax = niceMax(Math.max(fHalfFhr * 6, currentFhr * 1.3, 4));
  if (Number.isFinite(feasibleMaxFhr)) xAxisMax = Math.min(xAxisMax, feasibleMaxFhr);
  if (!Number.isFinite(xAxisMax) || xAxisMax <= 0) {
    xAxisMax = Math.max(niceMax(currentFhr * 2), 10);
  }

  const sampleCount = 60;
  const samples = Array.from({ length: sampleCount + 1 }, (_, i) => {
    const fhr = (xAxisMax * i) / sampleCount;
    return { fhr, years: lifeYearsAt(fhr) };
  });
  const finiteSamples = samples.filter((s) => Number.isFinite(s.years));
  const maxLife = finiteSamples.length ? Math.max(...finiteSamples.map((s) => s.years)) : 1;
  const yAxisMax = niceMax(maxLife);

  const xOf = (fhr: number) => chart.left + (Math.min(fhr, xAxisMax) / xAxisMax) * plotW;
  const yOf = (years: number) => chart.top + (1 - Math.min(years, yAxisMax) / yAxisMax) * plotH;

  const tickCount = compact ? 4 : 5;
  const xTicks = Array.from({ length: tickCount }, (_, i) => (xAxisMax * i) / (tickCount - 1));
  const yTicks = Array.from({ length: tickCount }, (_, i) => (yAxisMax * i) / (tickCount - 1));

  const linePoints = finiteSamples.map((s) => `${xOf(s.fhr).toFixed(1)},${yOf(s.years).toFixed(1)}`).join(" ");
  const areaPath = finiteSamples.length
    ? `M ${xOf(finiteSamples[0].fhr).toFixed(1)},${baselineY.toFixed(1)} ` +
      finiteSamples.map((s) => `L ${xOf(s.fhr).toFixed(1)},${yOf(s.years).toFixed(1)}`).join(" ") +
      ` L ${xOf(finiteSamples[finiteSamples.length - 1].fhr).toFixed(1)},${baselineY.toFixed(1)} Z`
    : "";

  // スリープ限界の天井（f=0の寿命）。表示レンジ内なら破線で描く。
  const plateauYears = lifeYearsAt(0);
  const showPlateau = Number.isFinite(plateauYears) && plateauYears <= yAxisMax * 1.001;

  const currentYears = Number.isFinite(currentLifeYears) ? currentLifeYears : lifeYearsAt(currentFhr);
  const currentInRange = currentFhr <= xAxisMax + 1e-9 && Number.isFinite(currentYears);
  const cx = xOf(currentFhr);
  const cy = yOf(currentYears);
  const dutyPercent = intervalSeconds > 0 ? (activeSeconds / intervalSeconds) * 100 : 0;
  const labelToLeft = cx > chart.width - chart.right - 128;
  const labelX = labelToLeft ? cx - 10 : cx + 10;
  const labelAnchor = labelToLeft ? "end" : "start";

  return (
    <svg
      data-testid={compact ? "battery-life-curve-mobile" : "battery-life-curve-desktop"}
      data-current-frequency={currentFhr.toFixed(4)}
      data-current-years={currentYears.toFixed(4)}
      role="img"
      aria-label={`送信頻度と電池寿命の関係。現在は1時間あたり${formatNumber(currentFhr, 2)}回で寿命${formatNumber(currentYears, 1)}年`}
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />

      {yTicks.map((tick) => (
        <g key={`y-${tick}`}>
          <line
            x1={chart.left}
            x2={chart.width - chart.right}
            y1={yOf(tick)}
            y2={yOf(tick)}
            stroke={chartTheme.grid.primary}
          />
          <text
            x={chart.left - 8}
            y={yOf(tick) + 4}
            textAnchor="end"
            fill={diagramPalette.muted}
            fontSize={compact ? 13 : 11}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatNumber(tick, tick < 10 ? 1 : 0)}
          </text>
        </g>
      ))}
      <text x={chart.left} y={chart.top - 12} fill={diagramPalette.muted} fontSize={compact ? 14 : 12} fontWeight={600}>
        寿命[年]
      </text>

      {xTicks.map((tick) => (
        <text
          key={`x-${tick}`}
          x={xOf(tick)}
          y={baselineY + 20}
          textAnchor="middle"
          fill={diagramPalette.muted}
          fontSize={compact ? 13 : 11}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formatNumber(tick, tick < 10 ? 1 : 0)}
        </text>
      ))}
      <text
        x={chart.left + plotW / 2}
        y={chart.height - 8}
        textAnchor="middle"
        fill={diagramPalette.inkSoft}
        fontSize={compact ? 14 : 12}
        fontWeight={600}
      >
        1時間あたりの送信回数（頻度）
      </text>

      {areaPath ? <path d={areaPath} fill={chartTheme.series.gain} opacity={0.14} /> : null}
      {linePoints ? (
        <polyline
          points={linePoints}
          fill="none"
          stroke={chartTheme.seriesText.gain}
          strokeWidth={chartTheme.stroke.series}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : null}

      {showPlateau ? (
        <g>
          <line
            x1={chart.left}
            x2={chart.width - chart.right}
            y1={yOf(plateauYears)}
            y2={yOf(plateauYears)}
            stroke={chartTheme.reference.baseline}
            strokeDasharray={chartTheme.reference.baselineDash}
          />
          <text
            x={chart.width - chart.right - 4}
            y={yOf(plateauYears) - 6}
            textAnchor="end"
            fill={diagramPalette.muted}
            fontSize={compact ? 12 : 10}
            fontWeight={600}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            スリープ限界の天井 {formatNumber(plateauYears, 1)}年
          </text>
        </g>
      ) : null}

      {currentInRange ? (
        <g>
          <line x1={cx} x2={cx} y1={cy} y2={baselineY} stroke={diagramPalette.faint} strokeDasharray="4 4" />
          <circle cx={cx} cy={cy} r={5.5} fill={chartTheme.series.source} stroke={diagramPalette.white} strokeWidth={2} />
          <text
            x={labelX}
            y={cy - 10}
            textAnchor={labelAnchor}
            fill={chartTheme.seriesText.total}
            fontSize={compact ? 13 : 11}
            fontWeight={700}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            現在 {formatNumber(currentYears, 1)}年
          </text>
          <text
            x={labelX}
            y={cy + 4}
            textAnchor={labelAnchor}
            fill={diagramPalette.muted}
            fontSize={compact ? 12 : 10}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatNumber(currentFhr, 2)}回/時・duty {formatNumber(dutyPercent, 2)}%
          </text>
        </g>
      ) : null}
    </svg>
  );
}

function ExpertConsumptionBar({
  txUa,
  rxUa,
  sleepUa,
  selfDischargeUa
}: {
  txUa: number;
  rxUa: number;
  sleepUa: number;
  selfDischargeUa: number;
}) {
  const total = txUa + rxUa + sleepUa + selfDischargeUa;
  const txPct = total > 0 ? (txUa / total) * 100 : 0;
  const rxPct = total > 0 ? (rxUa / total) * 100 : 0;
  const sleepPct = total > 0 ? (sleepUa / total) * 100 : 0;
  const selfDischargePct = total > 0 ? (selfDischargeUa / total) * 100 : 0;

  const w = 500;
  const txW = (w * txPct) / 100;
  const rxW = (w * rxPct) / 100;
  const sleepW = (w * sleepPct) / 100;
  const selfW = (w * selfDischargePct) / 100;

  const txX = 0;
  const rxX = txW;
  const sleepX = txW + rxW;
  const selfX = txW + rxW + sleepW;

  return (
    <div className="mt-4">
      <svg
        viewBox={`0 0 ${w} 40`}
        width="100%"
        height="40"
        className="overflow-hidden rounded-lg border border-slate-200"
        preserveAspectRatio="none"
      >
        <rect width={w} height={40} fill={chartTheme.surface.canvas} />
        {txW > 0 && <rect x={txX} y="0" width={txW} height="40" fill={chartTheme.series.source} />}
        {rxW > 0 && <rect x={rxX} y="0" width={rxW} height="40" fill={chartTheme.categorical[5]} />}
        {sleepW > 0 && <rect x={sleepX} y="0" width={sleepW} height="40" fill={chartTheme.grid.secondary} />}
        {selfW > 0 && <rect x={selfX} y="0" width={selfW} height="40" fill={chartTheme.categorical[1]} />}
      </svg>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-700">
        {txPct > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded" style={{ backgroundColor: chartTheme.series.source }} />
            TX: {formatNumber(txPct, 1)}% ({formatNumber(txUa, 2)} µA)
          </span>
        )}
        {rxPct > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded" style={{ backgroundColor: chartTheme.categorical[5] }} />
            RX: {formatNumber(rxPct, 1)}% ({formatNumber(rxUa, 2)} µA)
          </span>
        )}
        {sleepPct > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded" style={{ backgroundColor: chartTheme.grid.secondary }} />
            Sleep: {formatNumber(sleepPct, 1)}% ({formatNumber(sleepUa, 2)} µA)
          </span>
        )}
        {selfDischargePct > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded" style={{ backgroundColor: chartTheme.categorical[1] }} />
            自己放電: {formatNumber(selfDischargePct, 1)}% ({formatNumber(selfDischargeUa, 2)} µA)
          </span>
        )}
      </div>
    </div>
  );
}

export function BatteryLifePanel() {
  const [mode, setMode] = useState<"standard" | "expert">("standard");
  const [capacityMah, setCapacityMah] = useState(2400);
  const [txCurrentMa, setTxCurrentMa] = useState(45);
  const [txDurationMs, setTxDurationMs] = useState(50);
  const [rxCurrentMa, setRxCurrentMa] = useState(0);
  const [rxDurationMs, setRxDurationMs] = useState(0);
  const [intervalValue, setIntervalValue] = useState(1);
  const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>("hours");
  const [sleepCurrentUa, setSleepCurrentUa] = useState(5);
  const [deratingPercent, setDeratingPercent] = useState(70);

  // エキスパートモード用ステート
  const [chemistry, setChemistry] = useState<string>("lisocl2_bobbin");
  const [temperatureC, setTemperatureC] = useState<number>(25);
  const [agingYears, setAgingYears] = useState<number>(0);

  const intervalSeconds = intervalValue * intervalFactors[intervalUnit];

  // 標準モード計算
  const result = useMemo(() => {
    try {
      return calculateBatteryLife({
        capacityMah,
        txCurrentMa,
        txDurationMs,
        rxCurrentMa,
        rxDurationMs,
        intervalSeconds,
        sleepCurrentUa,
        deratingFactor: deratingPercent / 100
      });
    } catch {
      return null;
    }
  }, [capacityMah, txCurrentMa, txDurationMs, rxCurrentMa, rxDurationMs, intervalSeconds, sleepCurrentUa, deratingPercent]);

  // エキスパートモード計算
  const expertResult = useMemo(() => {
    if (mode !== "expert") return null;
    try {
      return estimateExpertBatteryLife({
        chemistry,
        capacityMah,
        temperatureC,
        sleepCurrentUa,
        txCurrentMa,
        txDurationMs,
        txIntervalS: intervalSeconds,
        rxCurrentMa,
        rxDurationMs,
        agingYears
      });
    } catch {
      return null;
    }
  }, [mode, chemistry, capacityMah, temperatureC, sleepCurrentUa, txCurrentMa, txDurationMs, intervalSeconds, rxCurrentMa, rxDurationMs, agingYears]);

  const activeResult = mode === "expert" ? expertResult : result;

  const primary = {
    label: mode === "expert" ? "実効電池寿命 (エキスパート)" : "理論電池寿命",
    value: mode === "expert"
      ? (expertResult ? (expertResult.exceedsTenYears ? "10年+" : `${formatNumber(expertResult.lifeYears, 1)}`) : "—")
      : (result ? formatNumber(result.lifetimeYears, 1) : "—"),
    unit: mode === "expert" && expertResult?.exceedsTenYears ? "（特性限界クランプ）" : "年"
  };

  const applyPreset = (preset: (typeof presets)[number]) => {
    setCapacityMah(preset.capacity);
    setTxCurrentMa(preset.txCurrent);
    setTxDurationMs(preset.txMs);
    setRxCurrentMa(preset.rxCurrent);
    setRxDurationMs(preset.rxMs);
    setIntervalValue(preset.interval);
    setIntervalUnit(preset.unit);
    setSleepCurrentUa(preset.sleepUa);
    setDeratingPercent(preset.derate);
    setMode("standard"); // プリセット適用時は標準にリセット
  };

  const totalUa = result?.averageCurrentUa ?? 1;
  const txPercent = result ? (result.txAverageCurrentUa / totalUa) * 100 : 0;
  const rxPercent = result ? (result.rxAverageCurrentUa / totalUa) * 100 : 0;
  const sleepPercent = Math.max(0, 100 - txPercent - rxPercent);

  // 化学特性別警告の表示条件
  const isCR2032 = chemistry === "cr2032";
  const isAlkaline = chemistry === "alkaline_aa";
  const isLiSOCl2 = chemistry === "lisocl2_bobbin" || chemistry === "lisocl2_spiral";

  const showCR2032Warning = mode === "expert" && isCR2032 && (txCurrentMa > 10 || rxCurrentMa > 10);
  const showPassivationWarning = mode === "expert" && isLiSOCl2 && expertResult?.passivationWarning;
  const showAlkalineWarning = mode === "expert" && isAlkaline && temperatureC <= 0;

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:items-start">
        <Card as="section" padding="lg">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-950">入力条件</h2>
            <SegmentedControl
              options={[
                { id: "standard", label: "標準" },
                { id: "expert", label: "エキスパート" }
              ]}
              value={mode}
              onChange={setMode}
              ariaLabel="動作モード切替"
            />
          </div>

          {mode === "standard" && (
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="運用プリセット">
              {presets.map((preset) => (
                <button key={preset.label} type="button" onClick={() => applyPreset(preset)} className="inline-flex min-h-11 items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-staf/40 hover:text-staf-dark">
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          {mode === "expert" && (
            <div className="mt-4 space-y-4">
              <ChoiceChips
                label="電池化学特性"
                help="自己放電率や動作温度・パルス特性に直結する電池の化学特性プリセットを選択します。"
                value={chemistry}
                onChange={setChemistry}
                options={[
                  { value: "lisocl2_bobbin", label: "Li-SOCl2ボビン型", description: "Tadiran TL-4903 / Saft LS14500 等。自己放電が極小で超長期動作に適するが、高パルスに弱く不動態化被膜リスクあり。", severity: "ok" },
                  { value: "lisocl2_spiral", label: "Li-SOCl2スパイラル型", description: "Saft LSHシリーズ等。高パルス対応。自己放電は年約2%とわずかに高いが、LPWAの大電流パルスに適する。", severity: "ok" },
                  { value: "limno2", label: "Li-MnO2", description: "CR123A等。自己放電が低く、中パルス負荷にも対応。カメラやセンサーに好適。", severity: "ok" },
                  { value: "cr2032", label: "コイン形CR2032", description: "Panasonic CR2032等。小型バックアップ用。大パルス電流で実効容量が大幅に低下する。", severity: "warn" },
                  { value: "alkaline_aa", label: "アルカリAA", description: "Panasonic/Energizer等。安価で入手性が高いが、低温特性が非常に悪く、自己放電も高め。", severity: "severe" }
                ]}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="batteryTemperature"
                  label="動作温度"
                  unit="℃"
                  value={temperatureC}
                  min={-20}
                  max={60}
                  step={1}
                  showSlider
                  emptyBehavior="invalid"
                  onChange={setTemperatureC}
                  help="電池が動作する周囲環境温度です。極端な低温は実効容量を低下させます。"
                />
                <Field
                  id="batteryAging"
                  label="経年期間"
                  unit="年"
                  value={agingYears}
                  min={0}
                  max={10}
                  step={0.5}
                  showSlider
                  emptyBehavior="invalid"
                  onChange={setAgingYears}
                  help="機器の運用開始前に電池が保管されていた、またはすでに消費された年数です。"
                />
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field id="batteryCapacity" label="電池容量" unit="mAh" value={capacityMah} min={1} step={100} emptyBehavior="invalid" onChange={setCapacityMah} help="電池データシートの公称容量です。" />
            
            {mode === "standard" && (
              <Field id="batteryDerate" label="有効容量 derate" unit="%" value={deratingPercent} min={1} max={100} step={1} showSlider emptyBehavior="invalid" onChange={setDeratingPercent} help="温度、自己放電、終止電圧を見込んだ使用可能容量の割合です。" />
            )}

            <Field id="batteryTxCurrent" label="送信電流" unit="mA" value={txCurrentMa} min={0} step={1} emptyBehavior="invalid" onChange={setTxCurrentMa} help="送信中の代表電流です。" />
            <Field id="batteryTxDuration" label="1回の送信時間" unit="ms" value={txDurationMs} min={0} step={1} emptyBehavior="invalid" onChange={setTxDurationMs} help="1周期内で送信状態にいる合計時間です。" />
            <Field id="batteryRxCurrent" label="受信電流" unit="mA" value={rxCurrentMa} min={0} step={1} emptyBehavior="invalid" onChange={setRxCurrentMa} help="待受ではなく、受信処理中の代表電流です。" />
            <Field id="batteryRxDuration" label="1回の受信時間" unit="ms" value={rxDurationMs} min={0} step={1} emptyBehavior="invalid" onChange={setRxDurationMs} help="1周期内で受信状態にいる合計時間です。" />
            <Field
              id="batteryInterval"
              label="動作間隔"
              value={intervalValue}
              min={0.001}
              step={1}
              emptyBehavior="invalid"
              onChange={setIntervalValue}
              unitSelect={{
                value: intervalUnit,
                onChange: (value) => setIntervalUnit(value as IntervalUnit),
                ariaLabel: "動作間隔の単位",
                options: [
                  { value: "seconds", label: "秒" },
                  { value: "minutes", label: "分" },
                  { value: "hours", label: "時間" },
                  { value: "days", label: "日" }
                ]
              }}
              help="送信・受信を1回行う周期です。"
            />
            <Field id="batterySleepCurrent" label="スリープ電流" unit="µA" value={sleepCurrentUa} min={0} step={0.1} emptyBehavior="invalid" onChange={setSleepCurrentUa} help="低消費電力状態のベース電流です。" />
          </div>
        </Card>

        <div id="battery-primary-result" className="space-y-4 lg:sticky lg:top-20">
          <ResultBar primary={primary} />
          
          {mode === "standard" && (
            <>
              {result ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricCard label="平均電流" value={formatNumber(result.averageCurrentUa, 2)} unit="µA" />
                  <MetricCard label="送信の平均寄与" value={formatNumber(result.txAverageCurrentUa, 2)} unit="µA" />
                  <MetricCard label="受信の平均寄与" value={formatNumber(result.rxAverageCurrentUa, 2)} unit="µA" />
                  <MetricCard label="有効容量" value={formatNumber(capacityMah * deratingPercent / 100, 0)} unit="mAh" />
                </div>
              ) : (
                <Callout tone="danger">入力値、derate、動作時間と周期の関係を確認してください。</Callout>
              )}
              {result?.exceedsTenYears ? (
                <Callout tone="caution" title="10年超は電池特性が支配的">
                  自己放電、温度、電圧降下、保管劣化を含む実電池データで上限を確認してください。
                </Callout>
              ) : (
                <Callout tone="info">理論値には電池の自己放電とパルス負荷時の電圧降下を直接含みません。</Callout>
              )}
            </>
          )}

          {mode === "expert" && (
            <>
              {expertResult ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MetricCard label="平均動作電流" value={formatNumber(expertResult.averageCurrentUa, 2)} unit="µA" />
                    <MetricCard label="実効容量（補正後）" value={formatNumber(expertResult.effectiveCapacityMah, 0)} unit="mAh" />
                    <MetricCard label="温度係数 (tempCoeff)" value={formatNumber(expertResult.tempCoeff, 2)} />
                    <MetricCard label="パルス係数 (pulseCoeff)" value={formatNumber(expertResult.pulseCoeff, 2)} />
                  </div>

                  {/* 支配要因バッジと解説 */}
                  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-card space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">寿命の支配要因</span>
                      <Badge tone={
                        expertResult.dominantFactor === "sleep" || expertResult.dominantFactor === "tx" ? "info" :
                        expertResult.dominantFactor === "self_discharge" ? "caution" : "danger"
                      }>
                        {expertResult.dominantFactor === "sleep" ? "スリープ電流" :
                         expertResult.dominantFactor === "tx" ? "送信電流" :
                         expertResult.dominantFactor === "self_discharge" ? "自己放電" :
                         expertResult.dominantFactor === "temperature" ? "温度ロス" : "パルスロス"}
                      </Badge>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600">
                      {expertResult.dominantFactor === "sleep" && "待機（スリープ）時間が長いため、ベースとなるスリープ電流が主な消費要素となっています。"}
                      {expertResult.dominantFactor === "tx" && "送信頻度が高いため、送信時の消費電力が主な寿命決定要因となっています。"}
                      {expertResult.dominantFactor === "self_discharge" && "動作電流が非常に小さいため、電池自体の化学特性である経年自己放電が最大の容量消失要因となっています。"}
                      {expertResult.dominantFactor === "temperature" && "過酷な周囲温度環境（特に低温）による電解液活性の低下と実効容量低下が支配的です。"}
                      {expertResult.dominantFactor === "pulse" && "送信・受信時の大電流パルスによる電圧降下と内部抵抗損失が支配的な容量低下要因です。"}
                    </p>
                  </div>

                  {/* 並記情報 */}
                  {result && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">シンプル版理論寿命との比較</h4>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-xs text-slate-500">シンプル理論寿命</p>
                          <p className="mt-1 text-lg font-bold text-slate-700">{formatNumber(result.lifetimeYears, 1)} 年</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">エキスパート実効寿命</p>
                          <p className="mt-1 text-lg font-bold text-staf">{expertResult.exceedsTenYears ? "10年+" : `${formatNumber(expertResult.lifeYears, 1)} 年`}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 化学特性別警告 */}
                  {showCR2032Warning && (
                    <Callout tone="danger" title="CR2032 大パルス負荷警告">
                      CR2032は等価内部抵抗（ESR）が大きいため、LoRa/LTE-M等の10mAを超える大電流パルス負荷では急激な電圧降下が発生し、実効容量が大幅に低下（約25%）します。高パルス設計に適したスパイラル型電池の採用やコンデンサの並列接続を推奨します。
                    </Callout>
                  )}
                  {showPassivationWarning && (
                    <Callout tone="warning" title="Li-SOCl2 不動態化（Passivation）注意">
                      スリープ電流が10µA未満または周期1時間以上の長期スリープ下では、電極表面にLiCl被膜（不動態化被膜）が成長しやすく、起動時の電圧遅延によって機器が予期せずリセットされるリスクがあります。定期的な強制パルス放電シーケンスなどの対策が必要です。
                    </Callout>
                  )}
                  {showAlkalineWarning && (
                    <Callout tone="danger" title="アルカリAA 低温特性警告">
                      アルカリ乾電池は氷点下の環境で極端に起電力が低下し、-20℃付近では容量が30%程度まで急降下します。屋外や寒冷地での運用には、低温動作（-55℃〜）に強いLi-SOCl2電池等の採用を強く推奨します。
                    </Callout>
                  )}
                </div>
              ) : (
                <Callout tone="danger">入力値を確認してください。動作時間と周期の関係が適正でない可能性があります。</Callout>
              )}
            </>
          )}
        </div>
      </section>

      {/* 平均電流・消費内訳の内訳 */}
      {mode === "standard" && result && (
        <Card as="figure" padding="lg" className="mt-6">
          <figcaption className="text-base font-bold text-slate-950">平均電流の内訳</figcaption>
          <div className="mt-4 flex h-10 overflow-hidden rounded-lg border border-slate-200" aria-label="平均電流の内訳バー">
            {txPercent > 0 && <div className="flex items-center justify-center bg-staf text-xs font-bold text-white" style={{ width: `${txPercent}%` }}>{txPercent >= 5 ? "TX" : null}</div>}
            {rxPercent > 0 && <div className="flex items-center justify-center bg-sky-400 text-xs font-bold text-white" style={{ width: `${rxPercent}%` }}>{rxPercent >= 5 ? "RX" : null}</div>}
            {sleepPercent > 0 && <div className="flex items-center justify-center bg-slate-200 text-xs font-bold text-slate-700" style={{ width: `${sleepPercent}%` }}>{sleepPercent >= 5 ? "Sleep" : null}</div>}
          </div>
          <p className="mt-3 text-sm text-slate-600">TX {formatNumber(txPercent, 1)}% / RX {formatNumber(rxPercent, 1)}% / Sleep {formatNumber(sleepPercent, 1)}%</p>
        </Card>
      )}

      {mode === "expert" && expertResult && (
        <Card as="figure" padding="lg" className="mt-6">
          <figcaption className="text-base font-bold text-slate-950">消費電力（等価自己放電含む）の内訳積み上げ</figcaption>
          <p className="mt-1 text-xs text-slate-500">電池の経年自己放電を等価電流（µA）として加算した、全エネルギーの消費内訳です。</p>
          <ExpertConsumptionBar
            txUa={expertResult.txAverageCurrentUa}
            rxUa={expertResult.rxAverageCurrentUa}
            sleepUa={expertResult.sleepAverageCurrentUa}
            selfDischargeUa={expertResult.selfDischargeEquivalentUa}
          />
        </Card>
      )}

      <div className="mt-6">
        <ChartFrame
          eyebrow="頻度と寿命"
          title="送信頻度を上げると寿命が急落する"
          description="横軸は1時間あたりの送信回数（頻度）、縦軸は理論電池寿命です。平均電流は頻度に比例して増え、寿命はその逆数——だから頻度を上げるほど寿命は反比例で崖のように落ちます。低頻度側はスリープ電流で頭打ち（天井）になります。入力に連動して動きます。"
          exportName="battery-life-duty-curve"
          caption={
            activeResult
              ? `条件: 容量=${formatNumber(capacityMah, 0)}mAh / 送信 ${formatNumber(txCurrentMa, 0)}mA×${formatNumber(txDurationMs, 0)}ms / スリープ ${formatNumber(sleepCurrentUa, 1)}µA ─ 現在の運用点 ${formatNumber(mode === "expert" && expertResult ? expertResult.lifeYears : (result ? result.lifetimeYears : 0), 1)}年（${formatNumber(3600 / intervalSeconds, 2)}回/時）を丸印で表示`
              : "入力値を確認してください。"
          }
        >
          {activeResult ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <div className="hidden sm:block">
                <BatteryLifeDutyCurve
                  capacityMah={capacityMah}
                  deratingPercent={mode === "expert" && expertResult ? (expertResult.tempCoeff * expertResult.pulseCoeff * 100) : deratingPercent}
                  txCurrentMa={txCurrentMa}
                  txDurationMs={txDurationMs}
                  rxCurrentMa={rxCurrentMa}
                  rxDurationMs={rxDurationMs}
                  sleepCurrentUa={sleepCurrentUa}
                  intervalSeconds={intervalSeconds}
                  currentLifeYears={mode === "expert" && expertResult ? expertResult.lifeYears : (result ? result.lifetimeYears : 0)}
                />
              </div>
              <div className="sm:hidden">
                <BatteryLifeDutyCurve
                  compact
                  capacityMah={capacityMah}
                  deratingPercent={mode === "expert" && expertResult ? (expertResult.tempCoeff * expertResult.pulseCoeff * 100) : deratingPercent}
                  txCurrentMa={txCurrentMa}
                  txDurationMs={txDurationMs}
                  rxCurrentMa={rxCurrentMa}
                  rxDurationMs={rxDurationMs}
                  sleepCurrentUa={sleepCurrentUa}
                  intervalSeconds={intervalSeconds}
                  currentLifeYears={mode === "expert" && expertResult ? expertResult.lifeYears : (result ? result.lifetimeYears : 0)}
                />
              </div>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              入力値を確認すると曲線が表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard title="時間平均電流と寿命" formula={mode === "expert" ? "Iavg_eq[mA] = (Itx·ttx + Irx·trx)/T + Isleep + (Cnominal·r)/8760\n実効寿命[年] = (Cnominal·(1-r·aging)·ktemp·kpulse) / (Iavg_eq[mA]·8760)" : "Iavg[mA] = (Itx·ttx + Irx·trx)/T + Isleep\n寿命[h] = 容量[mAh]·derate / Iavg[mA]"} showColumnLink={false}>
          <p className="text-sm leading-relaxed text-slate-600">
            {mode === "expert"
              ? "エキスパートモードでは、化学特性ごとの温度係数(ktemp)、パルス係数(kpulse)、自己放電率(r)、および経年保管による減衰が考慮されます。"
              : "送受信時間は周期Tと同じ単位へそろえて加重平均します。"}
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6 space-y-6">
        <BatteryLifeColumn />
        {mode === "expert" && <BatteryLifeExpertColumn />}
      </div>

      <MobileResultBar primary={primary} targetId="battery-primary-result" />
    </>
  );
}


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
import { calculateBatteryLife } from "@/lib/rf/batteryLife";
import { formatNumber } from "@/lib/rf/format";
import { BatteryLifeColumn } from "./BatteryLifeColumn";
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
  currentLifeYears
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
}) {
  const chart = { width: 640, height: 320, top: 28, right: 108, bottom: 54, left: 62 };
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

  const xTicks = Array.from({ length: 5 }, (_, i) => (xAxisMax * i) / 4);
  const yTicks = Array.from({ length: 5 }, (_, i) => (yAxisMax * i) / 4);

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
            fontSize={11}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatNumber(tick, tick < 10 ? 1 : 0)}
          </text>
        </g>
      ))}
      <text x={chart.left} y={chart.top - 12} fill={diagramPalette.muted} fontSize={12} fontWeight={600}>
        寿命[年]
      </text>

      {xTicks.map((tick) => (
        <text
          key={`x-${tick}`}
          x={xOf(tick)}
          y={baselineY + 20}
          textAnchor="middle"
          fill={diagramPalette.muted}
          fontSize={11}
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
        fontSize={12}
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
            fontSize={10}
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
            fontSize={11}
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
            fontSize={10}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatNumber(currentFhr, 2)}回/時・duty {formatNumber(dutyPercent, 2)}%
          </text>
        </g>
      ) : null}
    </svg>
  );
}

export function BatteryLifePanel() {
  const [capacityMah, setCapacityMah] = useState(2400);
  const [txCurrentMa, setTxCurrentMa] = useState(45);
  const [txDurationMs, setTxDurationMs] = useState(50);
  const [rxCurrentMa, setRxCurrentMa] = useState(0);
  const [rxDurationMs, setRxDurationMs] = useState(0);
  const [intervalValue, setIntervalValue] = useState(1);
  const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>("hours");
  const [sleepCurrentUa, setSleepCurrentUa] = useState(5);
  const [deratingPercent, setDeratingPercent] = useState(70);

  const intervalSeconds = intervalValue * intervalFactors[intervalUnit];
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

  const primary = {
    label: "理論電池寿命",
    value: result ? formatNumber(result.lifetimeYears, 1) : "—",
    unit: "年"
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
  };

  const totalUa = result?.averageCurrentUa ?? 1;
  const txPercent = result ? (result.txAverageCurrentUa / totalUa) * 100 : 0;
  const rxPercent = result ? (result.rxAverageCurrentUa / totalUa) * 100 : 0;
  const sleepPercent = Math.max(0, 100 - txPercent - rxPercent);

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:items-start">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="運用プリセット">
            {presets.map((preset) => (
              <button key={preset.label} type="button" onClick={() => applyPreset(preset)} className="inline-flex min-h-11 items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-staf/40 hover:text-staf-dark">
                {preset.label}
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field id="batteryCapacity" label="電池容量" unit="mAh" value={capacityMah} min={1} step={100} emptyBehavior="invalid" onChange={setCapacityMah} help="電池データシートの公称容量です。" />
            <Field id="batteryDerate" label="有効容量 derate" unit="%" value={deratingPercent} min={1} max={100} step={1} showSlider emptyBehavior="invalid" onChange={setDeratingPercent} help="温度、自己放電、終止電圧を見込んだ使用可能容量の割合です。" />
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
        </div>
      </section>

      {result ? (
        <Card as="figure" padding="lg" className="mt-6">
          <figcaption className="text-base font-bold text-slate-950">平均電流の内訳</figcaption>
          <div className="mt-4 flex h-10 overflow-hidden rounded-lg border border-slate-200" aria-label="平均電流の内訳バー">
            <div className="flex items-center justify-center bg-staf text-xs font-bold text-white" style={{ width: `${txPercent}%` }}>{txPercent >= 5 ? "TX" : null}</div>
            <div className="flex items-center justify-center bg-sky-400 text-xs font-bold text-white" style={{ width: `${rxPercent}%` }}>{rxPercent >= 5 ? "RX" : null}</div>
            <div className="flex items-center justify-center bg-slate-200 text-xs font-bold text-slate-700" style={{ width: `${sleepPercent}%` }}>{sleepPercent >= 5 ? "Sleep" : null}</div>
          </div>
          <p className="mt-3 text-sm text-slate-600">TX {formatNumber(txPercent, 1)}% / RX {formatNumber(rxPercent, 1)}% / Sleep {formatNumber(sleepPercent, 1)}%</p>
        </Card>
      ) : null}

      <div className="mt-6">
        <ChartFrame
          eyebrow="頻度と寿命"
          title="送信頻度を上げると寿命が急落する"
          description="横軸は1時間あたりの送信回数（頻度）、縦軸は理論電池寿命です。平均電流は頻度に比例して増え、寿命はその逆数——だから頻度を上げるほど寿命は反比例で崖のように落ちます。低頻度側はスリープ電流で頭打ち（天井）になります。入力に連動して動きます。"
          exportName="battery-life-duty-curve"
          caption={
            result
              ? `条件: 容量=${formatNumber(capacityMah, 0)}mAh×derate ${formatNumber(deratingPercent, 0)}% / 送信 ${formatNumber(txCurrentMa, 0)}mA×${formatNumber(txDurationMs, 0)}ms / スリープ ${formatNumber(sleepCurrentUa, 1)}µA ─ 現在の運用点 ${formatNumber(result.lifetimeYears, 1)}年（${formatNumber(3600 / intervalSeconds, 2)}回/時）を丸印で表示`
              : "入力値を確認してください。"
          }
        >
          {result ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <BatteryLifeDutyCurve
                capacityMah={capacityMah}
                deratingPercent={deratingPercent}
                txCurrentMa={txCurrentMa}
                txDurationMs={txDurationMs}
                rxCurrentMa={rxCurrentMa}
                rxDurationMs={rxDurationMs}
                sleepCurrentUa={sleepCurrentUa}
                intervalSeconds={intervalSeconds}
                currentLifeYears={result.lifetimeYears}
              />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              入力値を確認すると曲線が表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FormulaExplanationCard title="時間平均電流と寿命" formula={"Iavg[mA]=(Itx·ttx+Irx·trx)/T+Isleep\n寿命[h]=容量[mAh]·derate/Iavg[mA]"} showColumnLink={false}>
          <p className="text-sm leading-relaxed text-slate-600">送受信時間は周期Tと同じ単位へそろえて加重平均します。</p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <BatteryLifeColumn />
      </div>

      <MobileResultBar primary={primary} targetId="battery-primary-result" />
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { calculateBatteryLife } from "@/lib/rf/batteryLife";
import { formatNumber } from "@/lib/rf/format";
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
        <FormulaExplanationCard title="時間平均電流と寿命" formula={"Iavg[mA]=(Itx·ttx+Irx·trx)/T+Isleep\n寿命[h]=容量[mAh]·derate/Iavg[mA]"} showColumnLink={false}>
          <p className="text-sm leading-relaxed text-slate-600">送受信時間は周期Tと同じ単位へそろえて加重平均します。</p>
        </FormulaExplanationCard>
      </div>
      <MobileResultBar primary={primary} targetId="battery-primary-result" />
    </>
  );
}

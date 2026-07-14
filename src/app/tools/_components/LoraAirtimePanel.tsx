"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { ChartFrame } from "@/components/ChartFrame";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { ARIB_T108_POWER_CLASSES } from "@/data/aribT108PowerClasses";
import { chartTheme } from "@/lib/chartTheme";
import { formatNumber } from "@/lib/rf/format";
import {
  calculateLoRaAirtime,
  evaluateLoRaTransmissionLimits,
  type LoRaAirtimeResult,
  type LoRaTransmissionStatus
} from "@/lib/rf/loraAirtime";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import type { LinkJudgementLevel } from "@/lib/rf/judgement";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { ToolColumnCard } from "@/components/ToolColumnCard";
import { loraAirtimeColumn } from "@/data/columns/loraAirtime";

const SF_OPTIONS = [7, 8, 9, 10, 11, 12] as const;
const BW_OPTIONS = [125, 250, 500] as const;
const CR_OPTIONS = [5, 6, 7, 8] as const;

const chipClass = (active: boolean) =>
  `inline-flex min-h-11 items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${
    active
      ? "border-staf bg-staf text-white"
      : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
  }`;

function statusPresentation(status: LoRaTransmissionStatus): {
  label: string;
  level: LinkJudgementLevel;
  tone: "success" | "caution" | "danger";
} {
  if (status === "noncompliant") return { label: "制限超過", level: "poor", tone: "danger" };
  if (status === "boundary") return { label: "4秒上限に近い", level: "caution", tone: "caution" };
  return { label: "入力条件では制限内", level: "good", tone: "success" };
}

function AirtimeComparisonDiagram({
  values,
  selectedSf,
  continuousLimitMs
}: {
  values: Array<{ sf: number; result: LoRaAirtimeResult }>;
  selectedSf: number;
  continuousLimitMs: number;
}) {
  const width = 660;
  const height = 340;
  const left = 64;
  const right = 28;
  const top = 34;
  const bottom = 58;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxValue = Math.max(continuousLimitMs, ...values.map((item) => item.result.airtimeMs));
  const yMax = Math.max(100, Math.ceil((maxValue * 1.08) / 500) * 500);
  const y = (value: number) => top + plotHeight - (value / yMax) * plotHeight;
  const slot = plotWidth / values.length;
  const barWidth = Math.min(58, slot * 0.62);
  const ticks = Array.from({ length: 5 }, (_, index) => (yMax * index) / 4);
  const limitY = y(continuousLimitMs);

  return (
    <svg
      role="img"
      aria-label={`SF7からSF12の送信時間比較。選択中SF${selectedSf}`}
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      data-testid="lora-airtime-diagram"
      data-selected-sf={selectedSf}
      data-selected-airtime={values.find((item) => item.sf === selectedSf)?.result.airtimeMs.toFixed(3)}
    >
      <rect width={width} height={height} fill={chartTheme.surface.canvas} />
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} stroke={chartTheme.grid.primary} />
          <text x={left - 8} y={y(tick) + 4} textAnchor="end" fill={diagramPalette.muted} fontSize={11}>
            {formatNumber(tick, 0)}
          </text>
        </g>
      ))}
      <text x={left} y={18} fill={diagramPalette.muted} fontSize={11} fontWeight={600}>ms</text>
      <line
        x1={left}
        x2={width - right}
        y1={limitY}
        y2={limitY}
        stroke={diagramPalette.dangerDeep}
        strokeWidth={1.5}
        strokeDasharray="6 4"
      />
      <text x={width - right} y={limitY - 7} textAnchor="end" fill={diagramPalette.dangerDeep} fontSize={11} fontWeight={700}>
        連続送信上限 {formatNumber(continuousLimitMs, 0)}ms
      </text>
      {values.map((item, index) => {
        const x = left + index * slot + (slot - barWidth) / 2;
        const barTop = y(item.result.airtimeMs);
        const active = item.sf === selectedSf;
        return (
          <g key={item.sf}>
            <rect
              x={x}
              y={barTop}
              width={barWidth}
              height={Math.max(2, top + plotHeight - barTop)}
              rx={6}
              fill={active ? diagramPalette.staf : diagramPalette.skySoft}
              stroke={active ? diagramPalette.stafDeep : diagramPalette.staf}
              strokeWidth={active ? 2 : 1}
            />
            <text x={x + barWidth / 2} y={barTop - 7} textAnchor="middle" fill={active ? diagramPalette.stafDeep : diagramPalette.inkSoft} fontSize={10} fontWeight={700}>
              {formatNumber(item.result.airtimeMs, item.result.airtimeMs < 100 ? 1 : 0)}
            </text>
            <text x={x + barWidth / 2} y={height - 30} textAnchor="middle" fill={diagramPalette.inkSoft} fontSize={12} fontWeight={active ? 700 : 600}>
              SF{item.sf}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function LoraAirtimePanel() {
  const [spreadingFactor, setSpreadingFactor] = useState(12);
  const [bandwidthKhz, setBandwidthKhz] = useState(125);
  const [payloadBytes, setPayloadBytes] = useState(50);
  const [codingRateDenominator, setCodingRateDenominator] = useState(5);
  const [preambleSymbols, setPreambleSymbols] = useState(8);
  const [explicitHeader, setExplicitHeader] = useState(true);
  const [crcEnabled, setCrcEnabled] = useState(true);
  const [transmissionsPerHour, setTransmissionsPerHour] = useState(60);
  const [powerClassId, setPowerClassId] = useState(ARIB_T108_POWER_CLASSES[0].id);

  const powerClass =
    ARIB_T108_POWER_CLASSES.find((item) => item.id === powerClassId) ?? ARIB_T108_POWER_CLASSES[0];
  const limits = useMemo(
    () => ({
      maxContinuousMs: powerClass.maxTxDurationSec * 1000,
      boundaryWarningMs: powerClass.maxTxDurationSec * 1000 - 100,
      maxHourlyAirtimeMs: powerClass.maxTotalTxPerHourSec * 1000,
      minimumIntermissionMs: powerClass.txPauseMs
    }),
    [powerClass]
  );

  const result = useMemo(() => {
    try {
      const airtime = calculateLoRaAirtime({
        spreadingFactor,
        bandwidthKhz,
        payloadBytes,
        codingRateDenominator,
        preambleSymbols,
        explicitHeader,
        crcEnabled
      });
      const compliance = evaluateLoRaTransmissionLimits({
        airtimeMs: airtime.airtimeMs,
        transmissionsPerHour,
        intermissionMs: powerClass.txPauseMs,
        limits
      });
      return { airtime, compliance };
    } catch {
      return null;
    }
  }, [spreadingFactor, bandwidthKhz, payloadBytes, codingRateDenominator, preambleSymbols, explicitHeader, crcEnabled, transmissionsPerHour, powerClass.txPauseMs, limits]);

  const comparison = useMemo(() => {
    try {
      return SF_OPTIONS.map((sf) => ({
        sf,
        result: calculateLoRaAirtime({
          spreadingFactor: sf,
          bandwidthKhz,
          payloadBytes,
          codingRateDenominator,
          preambleSymbols,
          explicitHeader,
          crcEnabled
        })
      }));
    } catch {
      return [];
    }
  }, [bandwidthKhz, payloadBytes, codingRateDenominator, preambleSymbols, explicitHeader, crcEnabled]);

  const presentation = result ? statusPresentation(result.compliance.status) : null;
  const primary = {
    label: "Time-on-Air",
    value: result ? formatNumber(result.airtime.airtimeMs, 1) : "—",
    unit: "ms"
  };
  const judgement = presentation ? { label: presentation.label, level: presentation.level } : undefined;
  const payloadError = !Number.isInteger(payloadBytes) || payloadBytes < 0 ? "ペイロードは0以上の整数で入力してください。" : undefined;
  const preambleError = !Number.isInteger(preambleSymbols) || preambleSymbols < 6 ? "プリアンブルは6以上の整数で入力してください。" : undefined;
  const hourlyError = !Number.isInteger(transmissionsPerHour) || transmissionsPerHour < 0 ? "送信回数は0以上の整数で入力してください。" : undefined;

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">LoRaパケット条件</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Raw LoRa PHYの送信時間を計算します。LoRaWANのMACヘッダ等は、ペイロード長へ含めてください。
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500">拡散率 SF</p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="拡散率">
                {SF_OPTIONS.map((sf) => <button key={sf} type="button" className={chipClass(spreadingFactor === sf)} onClick={() => setSpreadingFactor(sf)}>SF{sf}</button>)}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">帯域幅 BW</p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="帯域幅">
                {BW_OPTIONS.map((bw) => <button key={bw} type="button" className={chipClass(bandwidthKhz === bw)} onClick={() => setBandwidthKhz(bw)}>{bw}kHz</button>)}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">符号化率 CR</p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="符号化率">
                {CR_OPTIONS.map((denominator) => <button key={denominator} type="button" className={chipClass(codingRateDenominator === denominator)} onClick={() => setCodingRateDenominator(denominator)}>4/{denominator}</button>)}
              </div>
            </div>
            <Field id="loraPayloadBytes" label="PHYペイロード" unit="Bytes" value={payloadBytes} min={0} max={255} step={1} emptyBehavior="preserve" onChange={setPayloadBytes} help="LoRaWAN等のプロトコルヘッダを含め、無線で実際に送るPHYペイロード長を入力します。" example="50" error={payloadError} />
            <Field id="loraPreambleSymbols" label="プリアンブル" unit="symbols" value={preambleSymbols} min={6} max={65535} step={1} emptyBehavior="preserve" onChange={setPreambleSymbols} help="受信機が同期を取るための前置シンボル数です。代表値は8です。" example="8" error={preambleError} />
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" className={chipClass(explicitHeader)} onClick={() => setExplicitHeader((value) => !value)}>Header: {explicitHeader ? "Explicit" : "Implicit"}</button>
              <button type="button" className={chipClass(crcEnabled)} onClick={() => setCrcEnabled((value) => !value)}>Payload CRC: {crcEnabled ? "On" : "Off"}</button>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className="text-xs font-semibold text-slate-500">920MHz帯の照合区分</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="ARIB区分">
              {ARIB_T108_POWER_CLASSES.map((item) => <button key={item.id} type="button" className={chipClass(powerClass.id === item.id)} onClick={() => setPowerClassId(item.id)}>{item.label}</button>)}
            </div>
            <div className="mt-4">
              <Field id="loraTransmissionsPerHour" label="1時間の送信回数" unit="回/h" value={transmissionsPerHour} min={0} step={1} emptyBehavior="preserve" onChange={setTransmissionsPerHour} help="再送を含む実際の最大送信回数で評価します。" example="60" error={hourlyError} />
            </div>
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="lora-airtime-primary-result"><ResultBar primary={primary} judgement={judgement} /></div>
          {result && presentation ? (
            <>
              <Callout tone={presentation.tone} title={presentation.label}>
                連続送信 {formatNumber(result.airtime.airtimeMs, 1)}ms／上限 {formatNumber(limits.maxContinuousMs, 0)}ms、
                1時間累積 {formatNumber(result.compliance.hourlyAirtimeMs / 1000, 1)}秒／上限 {powerClass.maxTotalTxPerHourSec}秒です。
              </Callout>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <MetricCard label="Payload symbols" value={String(result.airtime.payloadSymbols)} unit="symbols" sub={result.airtime.lowDataRateOptimization ? "DE自動適用" : "DEなし"} />
                <MetricCard label="1時間の累積ToA" value={formatNumber(result.compliance.hourlyAirtimeMs / 1000, 1)} unit="s" sub={`${transmissionsPerHour}回/h`} tone={result.compliance.hourlyAirtimePass ? "neutral" : "danger"} />
                <MetricCard label="時間総量からの最大回数" value={String(result.compliance.maximumTransmissionsPerHour)} unit="回/h" sub="再送・待ち時間を除く" />
                <MetricCard label="送信後の休止" value={String(result.compliance.requiredIntermissionMs)} unit="ms以上" sub={`CS ${powerClass.carrierSenseDurationMs}ms / ${powerClass.carrierSenseThresholdDbm}dBm`} />
              </div>
            </>
          ) : <Callout tone="danger">入力値を確認してください。</Callout>}
        </div>
      </section>

      {comparison.length > 0 ? (
        <div className="mt-6">
          <ChartFrame eyebrow="SF比較" title="同じパケットをSFだけ変えた送信時間" description="SFを上げるほど1シンボルが長くなり、ToAが急増します。" exportName="lora-airtime-sf-comparison" caption={`BW=${bandwidthKhz}kHz・CR=4/${codingRateDenominator}・payload=${payloadBytes}Bytes。赤破線は選択区分の連続送信上限。`}>
            <AirtimeComparisonDiagram values={comparison} selectedSf={spreadingFactor} continuousLimitMs={limits.maxContinuousMs} />
          </ChartFrame>
        </div>
      ) : null}

      <div className="mt-6">
        <FormulaExplanationCard title="LoRa Time-on-Air式" formula={"Tsym = 2^SF / BW\nTpre = (Npre + 4.25)·Tsym\nToA = Tpre + Npayload·Tsym"} showColumnLink={false}>
          <p className="text-sm leading-relaxed text-slate-600">
            時間は線形値で加算します。低データレート最適化DEはシンボル長16.384ms以上で自動適用します。
            本結果に再送、受信窓、キャリアセンス待ち時間は含みません。
          </p>
        </FormulaExplanationCard>
      </div>

      <ToolColumnCard
        column={loraAirtimeColumn}
        live={result ? { airtime: `${formatNumber(result.airtime.airtimeMs / 1000, 2)}秒` } : undefined}
      />
      <MobileResultBar primary={primary} judgement={judgement} targetId="lora-airtime-primary-result" />
    </>
  );
}

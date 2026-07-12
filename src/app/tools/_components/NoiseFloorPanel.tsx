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
import { calculateNoiseSensitivity } from "@/lib/rf/noiseFloor";
import { formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { ToolColumnCard } from "@/components/ToolColumnCard";
import { noiseFloorColumn } from "@/data/columns/noiseFloor";

type BandwidthUnit = "Hz" | "kHz" | "MHz";

const BANDWIDTH_UNIT_FACTOR: Record<BandwidthUnit, number> = {
  Hz: 1,
  kHz: 1e3,
  MHz: 1e6
};

// LoRa の復調限界SNR（出典: Semtech SX1276/77/78/79 Datasheet, "LoRa demodulator SNR"。
// SF7→-7.5dB … SF12→-20dB）。ノイズフロアより弱い信号でも復調できる（SNRが負）のがLoRaの特徴。
const LORA_SNR_BY_SF = [
  { sf: 7, snrDb: -7.5 },
  { sf: 8, snrDb: -10 },
  { sf: 9, snrDb: -12.5 },
  { sf: 10, snrDb: -15 },
  { sf: 11, snrDb: -17.5 },
  { sf: 12, snrDb: -20 }
] as const;

// 帯域幅のみのプリセット（所要SNRは方式・変調・実装で幅があるため自動設定しない）。
const BANDWIDTH_PRESETS = [
  { label: "LoRa 125kHz", valueHz: 125_000 },
  { label: "NB-IoT 180kHz", valueHz: 180_000 },
  { label: "BLE 1MHz", valueHz: 1_000_000 },
  { label: "Wi-Fi 20MHz", valueHz: 20_000_000 }
] as const;

function toHz(value: number, unit: BandwidthUnit): number {
  return value * BANDWIDTH_UNIT_FACTOR[unit];
}

// ---- ノイズフロア積み上げ滝グラフ（入力連動の動的SVG） -------------------------------
// -174dBm/Hz（熱雑音の密度）から、帯域幅→NF と積み上げてノイズフロアに達し、
// 所要SNRを足して受信感度が決まる流れを1枚で見せる。LoRaでは所要SNRが負のため、
// 感度バーがノイズフロアの「下」へ潜る＝雑音より弱い電波を復調できることが視覚で伝わる。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目: v4 R4方式）。

type BuildupStep = {
  label: string;
  sub: string;
  from: number;
  to: number;
  kind: "start" | "gain" | "loss" | "total";
};

function NoiseBuildupWaterfall({
  bandwidthHz,
  noiseFigureDb,
  requiredSnrDb,
  noiseFloorDbm,
  sensitivityDbm
}: {
  bandwidthHz: number;
  noiseFigureDb: number;
  requiredSnrDb: number;
  noiseFloorDbm: number;
  sensitivityDbm: number;
}) {
  const chart = { width: 640, height: 320, top: 30, right: 24, bottom: 56, left: 56, barWidth: 84 };
  const bwTermDb = 10 * Math.log10(bandwidthHz);
  const thermalInBw = -174 + bwTermDb;

  const steps: BuildupStep[] = [
    {
      label: "熱雑音",
      sub: `-174+10log₁₀(BW) = ${formatNumber(thermalInBw, 1)}`,
      from: thermalInBw,
      to: thermalInBw,
      kind: "start"
    },
    {
      label: "+ NF",
      sub: `受信機の雑音 +${formatNumber(noiseFigureDb, 1)}dB`,
      from: thermalInBw,
      to: noiseFloorDbm,
      kind: "gain"
    },
    {
      label: "ノイズフロア",
      sub: `${formatNumber(noiseFloorDbm, 1)}dBm`,
      from: noiseFloorDbm,
      to: noiseFloorDbm,
      kind: "total"
    },
    {
      label: "+ 所要SNR",
      sub: `${requiredSnrDb >= 0 ? "+" : ""}${formatNumber(requiredSnrDb, 1)}dB`,
      from: noiseFloorDbm,
      to: sensitivityDbm,
      kind: requiredSnrDb >= 0 ? "gain" : "loss"
    },
    {
      label: "受信感度",
      sub: `${formatNumber(sensitivityDbm, 1)}dBm`,
      from: sensitivityDbm,
      to: sensitivityDbm,
      kind: "total"
    }
  ];

  const values = steps.flatMap((s) => [s.from, s.to]);
  const maxValue = Math.ceil((Math.max(...values) + 6) / 10) * 10;
  const minValue = Math.floor((Math.min(...values) - 6) / 10) * 10;
  const span = Math.max(1, maxValue - minValue);
  const plotHeight = chart.height - chart.top - chart.bottom;
  const stepGap = (chart.width - chart.left - chart.right) / steps.length;
  const y = (v: number) => chart.top + ((maxValue - v) / span) * plotHeight;
  const x = (i: number) => chart.left + i * stepGap + (stepGap - chart.barWidth) / 2;
  const ticks = Array.from({ length: Math.floor(span / 20) + 1 }, (_, i) => maxValue - i * 20);

  const styleFor = (kind: BuildupStep["kind"]) => {
    if (kind === "gain") return { fill: chartTheme.series.gain, stroke: chartTheme.seriesText.gain };
    if (kind === "loss") return { fill: chartTheme.series.loss, stroke: chartTheme.seriesText.loss };
    if (kind === "total") return { fill: chartTheme.series.total, stroke: chartTheme.seriesText.total };
    return { fill: chartTheme.series.source, stroke: chartTheme.seriesText.source };
  };

  const floorY = y(noiseFloorDbm);

  return (
    <svg
      role="img"
      aria-label={`熱雑音から受信感度までの積み上げ。ノイズフロア${formatNumber(noiseFloorDbm, 1)}dBm、受信感度${formatNumber(sensitivityDbm, 1)}dBm`}
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
      <text x={chart.left} y={chart.top - 12} fill={diagramPalette.muted} fontSize={12} fontWeight={600}>
        dBm
      </text>

      {/* ノイズフロアの水平基準線: 感度がこの線より下に潜る＝雑音より弱くても復調できる */}
      <line
        x1={chart.left}
        x2={chart.width - chart.right}
        y1={floorY}
        y2={floorY}
        stroke={chartTheme.reference.baseline}
        strokeDasharray={chartTheme.reference.baselineDash}
      />

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

      {/* 感度がフロアより下のとき: 「雑音より下でも復調できる」注記 */}
      {sensitivityDbm < noiseFloorDbm - 0.05 ? (
        <text
          x={chart.width - chart.right}
          y={floorY + 16}
          textAnchor="end"
          fill={chartTheme.seriesText.loss}
          fontSize={11}
          fontWeight={700}
        >
          ノイズフロアより {formatNumber(noiseFloorDbm - sensitivityDbm, 1)}dB 下まで復調可
        </text>
      ) : null}
    </svg>
  );
}

export function NoiseFloorPanel() {
  // 既定は LoRa SF12/125kHz/NF6dB（感度 ≈ -137dBm）: LPWAの「なぜ遠くまで届くか」を最初に見せる。
  const [bandwidthValue, setBandwidthValue] = useState(125);
  const [bandwidthUnit, setBandwidthUnit] = useState<BandwidthUnit>("kHz");
  const [noiseFigureDb, setNoiseFigureDb] = useState(6);
  const [requiredSnrDb, setRequiredSnrDb] = useState(-20);

  const bandwidthHz = toHz(bandwidthValue, bandwidthUnit);

  const result = useMemo(() => {
    try {
      return calculateNoiseSensitivity(bandwidthHz, noiseFigureDb, requiredSnrDb);
    } catch {
      return null;
    }
  }, [bandwidthHz, noiseFigureDb, requiredSnrDb]);

  // LoRa SF別の感度表（現在のNFで計算。SNRのみデータシート値を使用）。
  const loraTable = useMemo(() => {
    return LORA_SNR_BY_SF.map(({ sf, snrDb }) => {
      try {
        const { sensitivityDbm } = calculateNoiseSensitivity(125_000, noiseFigureDb, snrDb);
        return { sf, snrDb, sensitivityDbm };
      } catch {
        return { sf, snrDb, sensitivityDbm: Number.NaN };
      }
    });
  }, [noiseFigureDb]);

  const bandwidthError =
    !Number.isFinite(bandwidthValue) || bandwidthValue <= 0
      ? "帯域幅は0より大きい値を入力してください。"
      : undefined;
  const noiseFigureError = !Number.isFinite(noiseFigureDb)
    ? "雑音指数（NF）を入力してください。"
    : undefined;
  const snrError = !Number.isFinite(requiredSnrDb)
    ? "所要SNRを入力してください。"
    : undefined;

  const primary = {
    label: "受信感度",
    value: result === null ? "—" : formatNumber(result.sensitivityDbm, 1),
    unit: "dBm"
  };

  const isLora125k =
    bandwidthHz === 125_000 &&
    LORA_SNR_BY_SF.some((row) => Math.abs(row.snrDb - requiredSnrDb) < 0.01);

  const applyLoraPreset = (snrDb: number) => {
    setBandwidthValue(125);
    setBandwidthUnit("kHz");
    setRequiredSnrDb(snrDb);
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
            受信感度は次の3つだけで決まります。①どれだけ広い周波数の幅で電波を受けるか（帯域幅）
            ②受信機自身がどれだけ雑音を足すか（NF）③復調にどれだけ信号の余裕が要るか（所要SNR）。
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">
              LoRaプリセット（BW125kHz＋SF別の復調限界SNR・Semtechデータシート値）
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="LoRa SFプリセット">
              {LORA_SNR_BY_SF.map(({ sf, snrDb }) => (
                <button
                  key={sf}
                  type="button"
                  className={chipClass(isLora125k && Math.abs(requiredSnrDb - snrDb) < 0.01)}
                  onClick={() => applyLoraPreset(snrDb)}
                >
                  SF{sf}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-500">
              帯域幅のみ設定（所要SNRは方式ごとに入力してください）
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="帯域幅プリセット">
              {BANDWIDTH_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className={chipClass(bandwidthHz === preset.valueHz)}
                  onClick={() => {
                    if (preset.valueHz >= 1e6) {
                      setBandwidthValue(preset.valueHz / 1e6);
                      setBandwidthUnit("MHz");
                    } else {
                      setBandwidthValue(preset.valueHz / 1e3);
                      setBandwidthUnit("kHz");
                    }
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Field
              id="noiseBandwidth"
              label="帯域幅 BW"
              value={bandwidthValue}
              min={0.001}
              step={bandwidthUnit === "MHz" ? 0.1 : 1}
              emptyBehavior="preserve"
              onChange={setBandwidthValue}
              unitSelect={{
                value: bandwidthUnit,
                options: [
                  { value: "Hz", label: "Hz" },
                  { value: "kHz", label: "kHz" },
                  { value: "MHz", label: "MHz" }
                ],
                onChange: (value) => setBandwidthUnit(value as BandwidthUnit),
                ariaLabel: "帯域幅の単位"
              }}
              help="ラジオの選局幅のようなものです。幅を広げるほど多くの雑音も一緒に拾うため、ノイズフロアが上がります（10倍で+10dB）。"
              example={bandwidthUnit === "kHz" ? "125" : "20"}
              error={bandwidthError}
            />
            <Field
              id="noiseFigure"
              label="雑音指数 NF"
              unit="dB"
              value={noiseFigureDb}
              min={0}
              max={30}
              step={0.5}
              emptyBehavior="preserve"
              onChange={setNoiseFigureDb}
              help="受信機の増幅回路が自分で足してしまう雑音です。高性能な受信ICで3dB前後、一般的には5〜8dB程度です。"
              example="6"
              error={noiseFigureError}
            />
            <Field
              id="requiredSnr"
              label="所要SNR"
              unit="dB"
              value={requiredSnrDb}
              min={-30}
              max={40}
              step={0.5}
              emptyBehavior="preserve"
              onChange={setRequiredSnrDb}
              help="「雑音より何dB強ければ復調できるか」です。LoRaの拡散変調では負値＝雑音より弱い信号でも復調できます。"
              example="-20"
              error={snrError}
            />
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="noise-floor-primary-result">
            <ResultBar primary={primary} />
          </div>

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">LoRa SF別の感度（BW125kHz・現在のNF）</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              所要SNRはSemtech SX1276データシートの復調限界値。SFを上げるほど「遅く・遠く」なります。
            </p>
            <div className="mt-3 space-y-1.5">
              {loraTable.map((row) => {
                const isCurrent = isLora125k && Math.abs(requiredSnrDb - row.snrDb) < 0.01;
                return (
                  <div
                    key={row.sf}
                    className={`grid grid-cols-[52px_1fr_88px] items-center gap-3 rounded-lg px-2 py-1 text-sm ${
                      isCurrent ? "bg-staf-light ring-1 ring-staf/40" : ""
                    }`}
                  >
                    <span className={isCurrent ? "font-semibold text-staf-dark" : "text-slate-600"}>
                      SF{row.sf}
                    </span>
                    <span className="text-xs tabular-nums text-slate-500">
                      SNR {formatNumber(row.snrDb, 1)}dB
                    </span>
                    <span className="text-right font-semibold tabular-nums text-slate-900">
                      {Number.isFinite(row.sensitivityDbm) ? `${formatNumber(row.sensitivityDbm, 1)}dBm` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              この感度を
              <Link
                href="/tools/rf-basic-link-calculator"
                className="mx-1 inline-flex items-center gap-1 rounded font-semibold text-staf-dark transition hover:text-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
              >
                リンクバジェット診断の受信感度
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
              に入れると、通信距離の見積もりが物理限界とつながります。
            </p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="滝グラフ"
          title="熱雑音から受信感度への積み上げ"
          description="いちばん下の限界（-174dBm/Hzの熱雑音）から、帯域幅→NFと積み上がってノイズフロアが決まり、所要SNRを足すと受信感度になります。入力に連動して動きます。"
          exportName="noise-floor-buildup"
          caption={
            result
              ? `条件: BW=${formatNumber(bandwidthValue)}${bandwidthUnit} / NF=${formatNumber(noiseFigureDb, 1)}dB / 所要SNR=${formatNumber(requiredSnrDb, 1)}dB ─ ノイズフロア ${formatNumber(result.noiseFloorDbm, 1)}dBm・受信感度 ${formatNumber(result.sensitivityDbm, 1)}dBm`
              : "入力値を確認してください。"
          }
        >
          {result ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <NoiseBuildupWaterfall
                bandwidthHz={bandwidthHz}
                noiseFigureDb={noiseFigureDb}
                requiredSnrDb={requiredSnrDb}
                noiseFloorDbm={result.noiseFloorDbm}
                sensitivityDbm={result.sensitivityDbm}
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
        <FormulaExplanationCard
          title="基礎から: なぜこの式で感度が決まるのか"
          formula="受信感度[dBm] = -174 + 10log10(帯域幅[Hz]) + NF[dB] + 所要SNR[dB]"
          showColumnLink={false}
        >
          <p>
            <strong>① 雑音には物理的な下限があります。</strong>
            電子は温度がある限り揺らぎ、その揺らぎが微弱な電気雑音（熱雑音）になります。常温（290K）では
            1Hzの幅あたり -174dBm。これはどんな高級な受信機でも下回れない、自然が決めた床です。
          </p>
          <p>
            <strong>② 帯域幅とNFで「自分の受信機の床」が決まります。</strong>
            電波を受ける周波数の幅（帯域幅）を広げるほど、その分の雑音も一緒に拾います（幅10倍で+10dB）。
            さらに受信機自身の回路が足す雑音がNFです。-174 + 10log₁₀(BW) + NF が、あなたの受信機の
            <strong>ノイズフロア</strong>（雑音の水面）です。
          </p>
          <p>
            <strong>③ 水面からどれだけ余裕が要るかが所要SNRです。</strong>
            ざわつく会場で声を聞き取るには、ざわめきよりある程度大きな声が要ります。それが所要SNRです。
            ただしLoRaのような拡散変調は「合言葉を長く繰り返す」ようなもので、
            <strong>ざわめきより小さな声（負のSNR）でも聞き取れます</strong>——SF12ではノイズフロアの20dB下まで。
            これがLPWAが遠くまで届く種明かしです。
            ※このたとえは直感用で、実際は相関処理による処理利得であり、繰り返すほど通信速度は遅くなります。
          </p>
          <p>
            結論: 受信感度 = ノイズフロア + 所要SNR。データシートの感度は魔法ではなく、
            この3項目の足し算がどこまで詰められているかの結果です。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6">
        <ToolColumnCard
          column={noiseFloorColumn}
          live={
            result
              ? {
                  noiseFloor: `${formatNumber(result.noiseFloorDbm, 1)} dBm`,
                  sensitivity: `${formatNumber(result.sensitivityDbm, 1)} dBm`
                }
              : undefined
          }
        />
      </div>

      <MobileResultBar primary={primary} targetId="noise-floor-primary-result" />
    </>
  );
}

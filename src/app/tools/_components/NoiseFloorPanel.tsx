"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { Stat } from "@/components/Stat";
import { calculateNoiseSensitivity, THERMAL_NOISE_DENSITY_DBM_PER_HZ } from "@/lib/rf/noiseFloor";
import { formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";

type BandwidthUnit = "Hz" | "kHz" | "MHz";

const BANDWIDTH_UNIT_FACTOR: Record<BandwidthUnit, number> = {
  Hz: 1,
  kHz: 1e3,
  MHz: 1e6
};

// LoRa の復調限界SNR（出典: Semtech SX1276/77/78/79 Datasheet, "LoRa demodulator SNR"。
// SF7→-7.5dB … SF12→-20dB）。雑音床より低い信号でも復調できる（SNRが負）のがLoRaの特徴。
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

  const applyLoraPreset = (sf: number, snrDb: number) => {
    setBandwidthValue(125);
    setBandwidthUnit("kHz");
    setRequiredSnrDb(snrDb);
    void sf;
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

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">
              LoRaプリセット（BW125kHz＋SF別の復調限界SNR）
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="LoRa SFプリセット">
              {LORA_SNR_BY_SF.map(({ sf, snrDb }) => (
                <button
                  key={sf}
                  type="button"
                  className={chipClass(isLora125k && Math.abs(requiredSnrDb - snrDb) < 0.01)}
                  onClick={() => applyLoraPreset(sf, snrDb)}
                >
                  SF{sf}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-500">帯域幅のみ設定（SNRは方式により入力）</p>
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
              help="受信機が雑音を拾う周波数幅です。狭いほど雑音床が下がり、感度が良くなります。"
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
              help="受信機自身が足してしまう雑音の量です。一般的な受信ICで3〜8dB程度です。"
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
              help="復調に必要な信号対雑音比です。LoRaの高SFでは負値（雑音より弱くても復調可）になります。"
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
            <h2 className="text-base font-bold text-slate-950">内訳</h2>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <Stat
                label="雑音床（ノイズフロア）"
                value={result === null ? "—" : formatNumber(result.noiseFloorDbm, 1)}
                unit="dBm"
              />
              <Stat
                label="熱雑音密度 kTB"
                value={formatNumber(THERMAL_NOISE_DENSITY_DBM_PER_HZ, 0)}
                unit="dBm/Hz"
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              雑音床 = -174 + 10log10(BW) + NF。感度はこれに所要SNRを足した値です。
            </p>
          </Card>

          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">LoRa SF別の感度（BW125kHz・現在のNF）</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              所要SNRはSemtech SX1276データシートの復調限界値。SFを上げるほど遅く・遠くなります。
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
                    <span className="text-xs tabular-nums text-slate-500">SNR {formatNumber(row.snrDb, 1)}dB</span>
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
              に入れると、通信距離の見積もりと物理限界を突き合わせられます。
            </p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <FormulaExplanationCard
          title="数式と理論"
          formula="感度[dBm] = -174 + 10log10(BW[Hz]) + NF[dB] + 所要SNR[dB]"
          showColumnLink={false}
        >
          <p>
            -174dBm/Hz は温度290Kにおける熱雑音の電力密度（kT）です。帯域を広げるほど拾う雑音が増え、
            受信機の雑音指数（NF）がさらに床を持ち上げます。復調に必要なSNRを足したものが受信感度で、
            データシートの感度spec が物理限界に対してどの位置にあるかを判断できます。
          </p>
        </FormulaExplanationCard>
      </div>

      <MobileResultBar primary={primary} targetId="noise-floor-primary-result" />
    </>
  );
}

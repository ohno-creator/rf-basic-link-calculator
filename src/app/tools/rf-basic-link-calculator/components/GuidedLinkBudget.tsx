"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Lightbulb, SlidersHorizontal, Wand2 } from "lucide-react";
import { Card, StateCard } from "@/components/Card";
import { MobileResultBar } from "@/components/MobileResultBar";
import { environmentLossPresets } from "@/data/environmentLossPresets";
import { quickStartPresets, type QuickStartPreset } from "@/data/quickStartPresets";
import { formatSigned } from "@/lib/rf/format";
import type { LinkBudgetInput, LinkBudgetResult } from "@/lib/rf/linkBudget";
import { adviseLinkBudget, type LinkAdvice } from "@/lib/rf/linkBudgetAdvisor";
import { LinkMarginGauge } from "./LinkMarginGauge";

type GuidedLinkBudgetProps = {
  input: LinkBudgetInput;
  result: LinkBudgetResult | null;
  onChange: (input: LinkBudgetInput) => void;
  onOpenExpert: () => void;
};

/** 距離[m]を人が読みやすい表記へ（1000m以上はkm）。 */
function formatDistanceM(distanceM: number): string {
  if (distanceM >= 1000) {
    const km = distanceM / 1000;
    return `${km >= 10 ? km.toFixed(1) : km.toFixed(2)} km`;
  }
  return `${Math.round(distanceM)} m`;
}

function currentDistanceM(input: LinkBudgetInput): number {
  return input.distanceUnit === "km" ? input.distance * 1000 : input.distance;
}

/** スライダー（対数）→ 入力へ。1km以上はkm単位で保存して詳細モードと自然につながるようにする。 */
function distanceMToInput(distanceM: number): Pick<LinkBudgetInput, "distance" | "distanceUnit"> {
  if (distanceM >= 1000) {
    return { distance: Number((distanceM / 1000).toFixed(2)), distanceUnit: "km" };
  }
  return { distance: Math.round(distanceM), distanceUnit: "m" };
}

const DISTANCE_LOG_MIN = 0; // 10^0 = 1m
const DISTANCE_LOG_MAX = Math.log10(20_000); // 20km

/** かんたんモードで使う環境チップ（手動入力を除く既存プリセットの流用）。 */
const environmentChips = environmentLossPresets.filter((preset) => preset.lossDb !== null);

type CompactSliderProps = {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
};

function CompactSlider({ id, label, unit, min, max, step, value, onChange }: CompactSliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-slate-900">
          {label}
        </label>
        <span className="text-sm font-bold text-staf-dark" style={{ fontVariantNumeric: "tabular-nums" }}>
          {value > 0 && unit !== "dBm" ? "+" : ""}
          {value} {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        className="mt-1.5 w-full"
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function adviceChip(
  advice: LinkAdvice,
  input: LinkBudgetInput,
  onChange: (input: LinkBudgetInput) => void
): { key: string; label: string; onApply?: () => void } | null {
  switch (advice.kind) {
    case "headroom":
      return {
        key: "headroom",
        label: `余裕 ${advice.extraDb.toFixed(1)}dB — このままなら約${formatDistanceM(advice.distanceM)}まで届く見込み`
      };
    case "reach_distance": {
      const target = Math.max(1, advice.distanceM * 0.95); // 5%の安全側で提案
      return {
        key: "distance",
        label: `距離を約${formatDistanceM(target)}まで縮めれば届く`,
        onApply: () => onChange({ ...input, ...distanceMToInput(target) })
      };
    }
    case "raise_power":
      return {
        key: "power",
        label: `送信電力を${advice.toDbm.toFixed(1)}dBmへ（+${advice.gainDb.toFixed(1)}dB）`,
        onApply: () => onChange({ ...input, txPowerDbm: Number(advice.toDbm.toFixed(1)) })
      };
    case "add_gain":
      return {
        key: "gain",
        label: `アンテナ利得を合計+${advice.requiredDb.toFixed(1)}dB（高利得品や外付け化で）`
      };
    case "reduce_environment":
      return {
        key: "environment",
        label: `見通しを改善できれば最大−${advice.availableDb.toFixed(0)}dB（環境を「屋外見通し」に）`,
        onApply: () => onChange({ ...input, environmentLossDb: 0 })
      };
    default:
      return null;
  }
}

/**
 * かんたんモード：3ステップ（シナリオ→距離と環境→機器）＋常時ゲージ＋「次の一手」チップ。
 * 全項目の細部調整は詳細モード（従来パネル）へ引き継ぐ。
 */
export function GuidedLinkBudget({ input, result, onChange, onOpenExpert }: GuidedLinkBudgetProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const distanceM = currentDistanceM(input);
  const distanceLog = Math.min(DISTANCE_LOG_MAX, Math.max(DISTANCE_LOG_MIN, Math.log10(Math.max(1, distanceM))));

  const advices = useMemo(() => {
    if (!result) {
      return [];
    }
    return adviseLinkBudget(input, result);
  }, [input, result]);

  const applyPreset = (preset: QuickStartPreset) => {
    setSelectedPresetId(preset.id);
    onChange(preset.input);
  };

  const environmentActive = (lossDb: number) => input.environmentLossDb === lossDb;

  return (
    <section data-testid="guided-link-budget" className="mx-auto max-w-3xl space-y-4">
      {/* 常時見える結果：ゲージ＋次の一手 */}
      {result ? (
        <div id="guided-result-anchor" className="space-y-3">
          <LinkMarginGauge result={result} />
          <StateCard
            tone={result.linkMarginDb >= 0 ? "info" : "caution"}
            padding="md"
            data-testid="guided-advice"
          >
            <p className="flex items-center gap-2 text-sm font-bold">
              <Lightbulb aria-hidden="true" className="h-4 w-4" />
              次の一手
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {advices.map((advice) => {
                const chip = adviceChip(advice, input, onChange);
                if (!chip) {
                  return null;
                }
                return chip.onApply ? (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onApply}
                    className="inline-flex items-center gap-1 rounded-full border border-staf/40 bg-white px-3 py-1.5 text-xs font-bold text-staf-dark transition hover:bg-staf-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
                  >
                    <Wand2 aria-hidden="true" className="h-3.5 w-3.5" />
                    {chip.label}
                  </button>
                ) : (
                  <span
                    key={chip.key}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    {chip.label}
                  </span>
                );
              })}
            </div>
            <p className="mt-2 text-xs leading-relaxed opacity-80">
              チップを押すとその条件を即適用します（数値は現在の伝搬モデルでの逆算値・目安）。
            </p>
          </StateCard>
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
            <Card padding="sm" shadow={false}>
              <p className="text-xs font-semibold text-slate-500">受信電力</p>
              <p className="text-lg font-bold text-slate-950" style={{ fontVariantNumeric: "tabular-nums" }}>
                {result.receivedPowerDbm.toFixed(1)} dBm
              </p>
            </Card>
            <Card padding="sm" shadow={false}>
              <p className="text-xs font-semibold text-slate-500">受信感度（合格ライン）</p>
              <p className="text-lg font-bold text-slate-950" style={{ fontVariantNumeric: "tabular-nums" }}>
                {input.receiverSensitivityDbm.toFixed(0)} dBm
              </p>
            </Card>
            <Card padding="sm" shadow={false} className="col-span-2 sm:col-span-1">
              <p className="text-xs font-semibold text-slate-500">リンクマージン</p>
              <p
                className={`text-lg font-bold ${result.linkMarginDb >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatSigned(result.linkMarginDb, "dB")}
              </p>
            </Card>
          </div>
        </div>
      ) : (
        <StateCard tone="caution" padding="md">
          入力に確認が必要な項目があります。「詳細モード」でエラー表示を確認してください。
        </StateCard>
      )}

      {/* Step 1: シナリオ */}
      <Card as="section" padding="lg">
        <p className="text-xs font-bold uppercase tracking-wide text-staf-dark">STEP 1</p>
        <h3 className="mt-1 text-base font-bold text-slate-950">どんな通信ですか？</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          近いものを選ぶだけで、周波数・電力・感度などの前提をまとめて妥当な値にセットします。
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {quickStartPresets.map((preset) => {
            const active = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={active}
                data-testid={`guided-preset-${preset.id}`}
                onClick={() => applyPreset(preset)}
                className={`rounded-lg border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${
                  active
                    ? "border-staf bg-staf-light/60"
                    : "border-slate-200 bg-white hover:border-staf/40"
                }`}
              >
                <span className="block text-sm font-bold text-slate-950">{preset.label}</span>
                <span className="mt-0.5 block text-xs text-slate-600">
                  {preset.system}・{preset.frequencyLabel}・{preset.distanceLabel}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Step 2: 距離と環境 */}
      <Card as="section" padding="lg">
        <p className="text-xs font-bold uppercase tracking-wide text-staf-dark">STEP 2</p>
        <h3 className="mt-1 text-base font-bold text-slate-950">どこで、どのくらいの距離を飛ばしますか？</h3>
        <div className="mt-3">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="guided-distance" className="text-sm font-semibold text-slate-900">
              通信距離
            </label>
            <span
              data-testid="guided-distance-value"
              className="text-base font-bold text-staf-dark"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatDistanceM(distanceM)}
            </span>
          </div>
          <input
            id="guided-distance"
            type="range"
            min={DISTANCE_LOG_MIN}
            max={DISTANCE_LOG_MAX}
            step={0.01}
            value={distanceLog}
            aria-label="通信距離（対数スライダー）"
            className="mt-2 w-full"
            onChange={(event) => onChange({ ...input, ...distanceMToInput(10 ** Number(event.target.value)) })}
          />
          <div className="mt-1 flex justify-between text-[11px] text-slate-400" aria-hidden="true">
            <span>1m</span>
            <span>100m</span>
            <span>1km</span>
            <span>20km</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-900">周りの環境</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {environmentChips.map((preset) => {
              const active = environmentActive(preset.lossDb as number);
              return (
                <button
                  key={preset.label}
                  type="button"
                  aria-pressed={active}
                  title={preset.description}
                  onClick={() => onChange({ ...input, environmentLossDb: preset.lossDb as number })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${
                    active
                      ? "border-staf bg-staf text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
                  }`}
                >
                  {preset.label}
                  {preset.lossDb ? `（−${preset.lossDb}dB）` : "（0dB）"}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            壁・筐体・金属などの追加損失の目安です。細かい内訳（地面近接・偏波・遮蔽など）は詳細モードで設定できます。
          </p>
        </div>
      </Card>

      {/* Step 3: 機器の条件 */}
      <Card as="section" padding="lg">
        <p className="text-xs font-bold uppercase tracking-wide text-staf-dark">STEP 3</p>
        <h3 className="mt-1 text-base font-bold text-slate-950">機器の条件を微調整する（任意）</h3>
        <div className="mt-3 grid gap-4">
          <CompactSlider
            id="guided-tx-power"
            label="送信電力"
            unit="dBm"
            min={-20}
            max={30}
            step={0.5}
            value={input.txPowerDbm}
            onChange={(value) => onChange({ ...input, txPowerDbm: value })}
          />
          <CompactSlider
            id="guided-tx-gain"
            label="送信アンテナ利得"
            unit="dBi"
            min={-10}
            max={10}
            step={0.5}
            value={input.txAntennaGainDbi}
            onChange={(value) => onChange({ ...input, txAntennaGainDbi: value })}
          />
          <CompactSlider
            id="guided-rx-gain"
            label="受信アンテナ利得"
            unit="dBi"
            min={-10}
            max={15}
            step={0.5}
            value={input.rxAntennaGainDbi}
            onChange={(value) => onChange({ ...input, rxAntennaGainDbi: value })}
          />
        </div>
      </Card>

      {/* モバイル: スクロール中もマージンが見える固定バー */}
      {result ? (
        <MobileResultBar
          primary={{
            label: "リンクマージン",
            value: formatSigned(result.linkMarginDb, ""),
            unit: "dB"
          }}
          judgement={{ label: result.judgement.label, level: result.judgement.level }}
          targetId="guided-result-anchor"
        />
      ) : null}

      {/* 詳細モードへ */}
      <button
        type="button"
        data-testid="open-expert-mode"
        onClick={onOpenExpert}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-staf/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4 text-staf-dark" />
          <span>
            <span className="block text-sm font-bold text-slate-950">詳細モードで細かく設定する</span>
            <span className="mt-0.5 block text-xs text-slate-500">
              伝搬モデル・アンテナ高・端末近傍損失の内訳・実測補正・滝グラフなど全項目（いまの値は引き継がれます）
            </span>
          </span>
        </span>
        <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
      </button>
    </section>
  );
}

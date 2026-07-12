"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { SegmentedControl } from "@/components/SegmentedControl";
import { dbmToW, wToDbm } from "@/lib/rf/antenna";
import { formatNumber } from "@/lib/rf/format";
import { convertVswr, type VswrSourceKind } from "@/lib/rf/vswr";
import { rfErrorMessage } from "@/lib/rfErrorMessages";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { VswrStandingWaveDiagram } from "./VswrStandingWaveDiagram";
import { ToolColumnCard } from "@/components/ToolColumnCard";
import { vswrColumn } from "@/data/columns/vswr";

const modes: Array<{ id: VswrSourceKind; label: string; unit: string; placeholder: number }> = [
  { id: "vswr", label: "VSWR", unit: "", placeholder: 1.5 },
  { id: "returnLoss", label: "リターンロス", unit: "dB", placeholder: 14 },
  { id: "reflection", label: "反射係数 Γ", unit: "", placeholder: 0.2 }
];

function formatInfinite(value: number, digits: number): string {
  return Number.isFinite(value) ? formatNumber(value, digits) : "∞";
}

export function VswrConverterPanel() {
  const [mode, setMode] = useState<VswrSourceKind>("vswr");
  const [value, setValue] = useState(1.5);
  const [inputPowerDbm, setInputPowerDbm] = useState(20);

  const handleModeChange = (nextMode: VswrSourceKind) => {
    setMode(nextMode);
    const nextPlaceholder = modes.find((item) => item.id === nextMode)?.placeholder;
    if (nextPlaceholder !== undefined) setValue(nextPlaceholder);
  };

  const computation = useMemo(() => {
    try {
      return { result: convertVswr(mode, value), error: null as string | null };
    } catch (error) {
      return {
        result: null,
        error: rfErrorMessage(
          error,
          "VSWRは1以上、反射係数は0以上1未満、リターンロスは0以上のdBで入力してください。"
        )
      };
    }
  }, [mode, value]);

  const result = computation.result;
  const activeMode = modes.find((item) => item.id === mode) ?? modes[0];
  const primary = {
    label: "ミスマッチ損失",
    value: result ? formatInfinite(result.mismatchLossDb, 2) : "—",
    unit: "dB"
  };

  const powerFlow = useMemo(() => {
    if (!result) return null;
    const inputPowerW = dbmToW(inputPowerDbm);
    const reflectedRatio = result.reflectionCoefficient ** 2;
    const acceptedRatio = Math.max(0, 1 - reflectedRatio);
    const reflectedW = inputPowerW * reflectedRatio;
    const acceptedW = inputPowerW * acceptedRatio;
    return {
      reflectedW,
      acceptedW,
      acceptedDbm: acceptedW > 0 ? wToDbm(acceptedW) : Number.NEGATIVE_INFINITY,
      reflectedDbm: reflectedW > 0 ? wToDbm(reflectedW) : Number.NEGATIVE_INFINITY,
      acceptedPercent: acceptedRatio * 100
    };
  }, [inputPowerDbm, result]);

  const convertedMetrics = result
    ? [
        {
          kind: "vswr" as const,
          label: "VSWR",
          value: formatInfinite(result.vswr, 2),
          hint: "電圧定在波比です。1に近いほど整合が良く、全反射では∞になります。"
        },
        {
          kind: "returnLoss" as const,
          label: "リターンロス",
          value: formatInfinite(result.returnLossDb, 1),
          unit: "dB",
          hint: "反射波の小ささを表します。値が大きいほど整合が良好です。"
        },
        {
          kind: "reflection" as const,
          label: "反射係数 Γ",
          value: formatNumber(result.reflectionCoefficient, 3),
          hint: "入射波に対する反射波の電圧比です。0が無反射、1が全反射です。"
        }
      ].filter((metric) => metric.kind !== mode)
    : [];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[5fr_4fr]">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <p className="mt-1 text-sm text-slate-600">
            仕様書や測定器に記載された指標を1つ選び、その値を入力します。
          </p>

          <div className="mt-5">
            <SegmentedControl
              options={modes}
              value={mode}
              onChange={handleModeChange}
              ariaLabel="入力する指標"
              className="w-full justify-center"
            />
          </div>
          <div className="mt-5">
            <Field
              id="vswrValue"
              label={activeMode.label}
              help="VSWRは1以上、リターンロスは0以上、反射係数Γは0以上1未満で入力します。"
              unit={activeMode.unit || undefined}
              value={value}
              step={mode === "reflection" ? 0.01 : 0.1}
              emptyBehavior="preserve"
              error={computation.error ?? undefined}
              onChange={setValue}
            />
          </div>

          <div className="mt-5 rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
            VSWRは小さいほど、リターンロスは大きいほど良好です。反射係数Γの二乗が反射電力の割合になります。
          </div>
        </Card>

        <div id="vswr-primary-result" className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <ResultBar primary={primary} />
          {result ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {convertedMetrics.map((metric) => (
                  <MetricCard
                    key={metric.kind}
                    label={metric.label}
                    value={metric.value}
                    unit={metric.unit}
                    hint={metric.hint}
                  />
                ))}
                <MetricCard
                  label="反射電力"
                  value={formatNumber(result.reflectedPowerPercent, 1)}
                  unit="%"
                  hint="送信電力のうち負荷で反射して戻る割合です。Γ²×100で求めます。"
                />
              </div>
              <VswrStandingWaveDiagram
                reflection={result.reflectionCoefficient}
                vswr={result.vswr}
                reflectedPowerPercent={result.reflectedPowerPercent}
                mismatchLossDb={result.mismatchLossDb}
              />
            </>
          ) : null}
        </div>
      </div>

      <MobileResultBar primary={primary} targetId="vswr-primary-result" />

      <CollapsibleSection
        title="入力電力から反射・受け入れ電力を見る"
        storageKey="vswr-return-loss:power-flow"
      >
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <Field
            id="vswrInputPower"
            label="入力電力"
            unit="dBm"
            value={inputPowerDbm}
            step={0.5}
            emptyBehavior="preserve"
            help="アンテナ端子への入力電力です。受け入れ電力は入力電力×(1-Γ²)で計算します。"
            onChange={setInputPowerDbm}
          />
          {result && powerFlow ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard
                label="アンテナへ入る電力"
                value={Number.isFinite(powerFlow.acceptedDbm) ? formatNumber(powerFlow.acceptedDbm, 1) : "-∞"}
                unit="dBm"
                sub={`${formatNumber(powerFlow.acceptedW * 1000, 1)} mW / ${formatNumber(powerFlow.acceptedPercent, 1)}%`}
                tone="success"
                size="sm"
              />
              <MetricCard
                label="反射して戻る電力"
                value={Number.isFinite(powerFlow.reflectedDbm) ? formatNumber(powerFlow.reflectedDbm, 1) : "-∞"}
                unit="dBm"
                sub={`${formatNumber(powerFlow.reflectedW * 1000, 1)} mW`}
                tone="danger"
                size="sm"
              />
              <MetricCard
                label="整合で失う量"
                value={formatInfinite(result.mismatchLossDb, 2)}
                unit="dB"
                sub="リンクバジェットへ入れられる損失"
                tone="caution"
                size="sm"
              />
            </div>
          ) : null}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="使い方・用語" storageKey="vswr-return-loss:guide">
        <div className="grid gap-4 md:grid-cols-2">
          <ol className="space-y-2">
            <li>1. 仕様書や測定器に合わせて、入力する指標を選びます。</li>
            <li>2. ミスマッチ損失と反射電力から、リンクへの影響を確認します。</li>
            <li>3. 必要なら入力電力を指定し、戻る電力をmWでも確認します。</li>
          </ol>
          <dl className="grid gap-2 text-xs">
            <div>
              <dt className="font-semibold text-slate-900">VSWR</dt>
              <dd>定在波比です。1.0が完全整合で、値が大きいほど反射が増えます。</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">リターンロス</dt>
              <dd>反射の小ささをdBで表します。大きいほど整合が良い指標です。</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">ミスマッチ損失</dt>
              <dd>反射により負荷へ入らない電力をdBで表します。放射効率とは別の損失です。</dd>
            </div>
          </dl>
        </div>
      </CollapsibleSection>

      <FormulaExplanationCard
        title="数式と理論"
        formula={"VSWR = (1 + Γ) / (1 - Γ)\nリターンロス[dB] = -20 log10(Γ)\n反射電力[%] = Γ² × 100"}
        showColumnLink={false}
      >
        <p>
          VSWR 1.5でリターンロスは約14dB、VSWR 2.0で約9.5dBが目安です。ミスマッチ損失は
          -10log10(1-Γ²)で求め、リンクバジェットへ損失として加えます。
        </p>
      </FormulaExplanationCard>

      <ToolColumnCard
        column={vswrColumn}
        live={result ? { vswr15: `Γ${formatNumber(result.reflectionCoefficient, 3)} / RL${formatNumber(result.returnLossDb, 2)}dB / 反射${formatNumber(result.reflectedPowerPercent, 1)}% / ML${formatNumber(result.mismatchLossDb, 3)}dB` } : undefined}
      />
    </div>
  );
}

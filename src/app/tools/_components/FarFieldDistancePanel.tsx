"use client";

import { useMemo, useState } from "react";
import { Card, StateCard } from "@/components/Card";
import { Field } from "@/components/Field";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { formatNumber } from "@/lib/rf/format";
import { farFieldDistance } from "@/lib/rf/farFieldDistance";
import { FormulaExplanationCard } from "./FormulaExplanationCard";

/** 距離[m]を読みやすく（1m未満はcm、1000m以上はkm）。 */
function formatDistance(m: number): string {
  if (!Number.isFinite(m)) {
    return "—";
  }
  if (m >= 1000) {
    return `${formatNumber(m / 1000, 2)} km`;
  }
  if (m >= 1) {
    return `${formatNumber(m, 2)} m`;
  }
  return `${formatNumber(m * 100, 1)} cm`;
}

export function FarFieldDistancePanel() {
  const [frequencyMHz, setFrequencyMHz] = useState(2400);
  const [dimension, setDimension] = useState(100);
  const [dimensionUnit, setDimensionUnit] = useState<"mm" | "m">("mm");
  const dimensionM = dimensionUnit === "mm" ? dimension / 1000 : dimension;

  const result = useMemo(() => {
    try {
      return farFieldDistance({ frequencyMHz, dimensionM });
    } catch {
      return null;
    }
  }, [frequencyMHz, dimensionM]);

  const frequencyError =
    !Number.isFinite(frequencyMHz) || frequencyMHz <= 0
      ? "周波数は0より大きい値を入力してください。"
      : undefined;
  const dimensionError =
    !Number.isFinite(dimension) || dimension <= 0
      ? "アンテナ寸法は0より大きい値を入力してください。"
      : undefined;

  const primary = {
    label: "遠方界の目安（測定推奨距離）",
    value: result ? formatDistance(result.recommendedFarFieldM) : "—",
    unit: ""
  };

  const criterionLabel = result
    ? {
        fraunhofer: "2D²/λ（開口サイズが支配）",
        wavelength: "3λ（電気的に小さいアンテナ）",
        reactive: "反応近傍界の上限"
      }[result.dominantCriterion]
    : "";

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <div className="mt-4 space-y-4">
            <Field
              id="ffFrequency"
              label="周波数"
              unit="MHz"
              value={frequencyMHz}
              min={1}
              step={1}
              emptyBehavior="preserve"
              onChange={setFrequencyMHz}
              help="測定・評価する周波数です。"
              example="2400"
              error={frequencyError}
            />
            <Field
              id="ffDimension"
              label="アンテナ最大寸法 D"
              value={dimension}
              min={dimensionUnit === "mm" ? 1 : 0.001}
              step={dimensionUnit === "mm" ? 1 : 0.01}
              emptyBehavior="preserve"
              onChange={setDimension}
              unitSelect={{
                value: dimensionUnit,
                options: [
                  { value: "mm", label: "mm" },
                  { value: "m", label: "m" }
                ],
                onChange: (value) => setDimensionUnit(value as "mm" | "m"),
                ariaLabel: "寸法の単位"
              }}
              help="放射開口の最大差し渡し寸法です。パッチなら対角、ダイポールなら全長、アレイなら全体の外形をとります。"
              example={dimensionUnit === "mm" ? "100" : "0.1"}
              error={dimensionError}
            />
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="ff-primary-result">
            <ResultBar primary={primary} />
          </div>
          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">3領域の境界</h2>
            {result ? (
              <>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-600">波長 λ</dt>
                    <dd className="font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatDistance(result.wavelengthM)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-600">反応近傍界の上限 0.62√(D³/λ)</dt>
                    <dd className="font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatDistance(result.reactiveNearFieldLimitM)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-600">遠方界の開始 2D²/λ</dt>
                    <dd className="font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatDistance(result.fraunhoferDistanceM)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-md bg-staf-light/50 px-2 py-1">
                    <dt className="font-semibold text-staf-dark">測定推奨距離（実用目安）</dt>
                    <dd className="font-bold text-slate-950" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatDistance(result.recommendedFarFieldM)}
                    </dd>
                  </div>
                </dl>
                <p className="mt-2 text-xs text-slate-500">支配要因: {criterionLabel}</p>
                {result.electricallySmall ? (
                  <StateCard tone="info" padding="sm" className="mt-3 text-xs leading-relaxed">
                    D&lt;λ の電気的に小さいアンテナです。2D²/λ は過小になり、遠方界は実質 r≳数λ が支配的です（本ツールは3λを下限に採用）。
                  </StateCard>
                ) : null}
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500">入力値を確認してください。</p>
            )}
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <FormulaExplanationCard
          title="数式と考え方"
          formula="反応近傍 r<0.62√(D³/λ) ／ 放射近傍 0.62√(D³/λ)≤r<2D²/λ ／ 遠方界 r≥2D²/λ"
          showColumnLink={false}
        >
          <p>
            遠方界（フラウンホーファ領域）では放射パターンが距離によらず一定になり、利得やパターンの測定はここで行います。開口が大きいほど 2D²/λ は急激に伸び、逆に電気的に小さいアンテナ（D&lt;λ）では波長基準（r≳数λ）が支配的になります。OTA・電波暗室・アンテナ測定の離隔距離の目安に使います。
          </p>
        </FormulaExplanationCard>
      </div>

      <MobileResultBar primary={primary} targetId="ff-primary-result" />
    </>
  );
}

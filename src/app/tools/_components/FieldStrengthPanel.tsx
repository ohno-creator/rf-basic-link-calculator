"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { formatNumber } from "@/lib/rf/format";
import { fieldStrengthAtDistance } from "@/lib/rf/fieldStrength";
import { FormulaExplanationCard } from "./FormulaExplanationCard";

/** W/m² を桁に応じて mW/m²・µW/m² 併記なしで簡潔に。 */
function formatPowerDensity(wm2: number): string {
  if (!Number.isFinite(wm2)) {
    return "—";
  }
  if (wm2 >= 1) {
    return `${formatNumber(wm2, 3)} W/m²`;
  }
  if (wm2 >= 1e-3) {
    return `${formatNumber(wm2 * 1e3, 3)} mW/m²`;
  }
  return `${formatNumber(wm2 * 1e6, 2)} µW/m²`;
}

export function FieldStrengthPanel() {
  const [eirpDbm, setEirpDbm] = useState(30);
  const [distance, setDistance] = useState(10);
  const [distanceUnit, setDistanceUnit] = useState<"m" | "km">("m");
  const [useReceiver, setUseReceiver] = useState(false);
  const [frequencyMHz, setFrequencyMHz] = useState(920);
  const [rxGainDbi, setRxGainDbi] = useState(2);
  const distanceM = distanceUnit === "km" ? distance * 1000 : distance;

  const result = useMemo(() => {
    try {
      return fieldStrengthAtDistance({
        eirpDbm,
        distanceM,
        frequencyMHz: useReceiver ? frequencyMHz : undefined,
        rxGainDbi: useReceiver ? rxGainDbi : undefined
      });
    } catch {
      return null;
    }
  }, [eirpDbm, distanceM, useReceiver, frequencyMHz, rxGainDbi]);

  const eirpError = !Number.isFinite(eirpDbm) ? "EIRPを数値（dBm）で入力してください。" : undefined;
  const distanceError =
    !Number.isFinite(distance) || distance <= 0 ? "距離は0より大きい値を入力してください。" : undefined;

  const primary = {
    label: "電界強度 E",
    value: result ? formatNumber(result.eFieldVm, 3) : "—",
    unit: "V/m"
  };

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <div className="mt-4 space-y-4">
            <Field
              id="fsEirp"
              label="送信源の EIRP"
              unit="dBm"
              value={eirpDbm}
              step={0.5}
              emptyBehavior="preserve"
              onChange={setEirpDbm}
              help="等価等方輻射電力。送信電力＋アンテナ利得−給電損失です。30dBm=1W。"
              example="30"
              error={eirpError}
            />
            <Field
              id="fsDistance"
              label="距離 r"
              value={distance}
              min={distanceUnit === "km" ? 0.001 : 0.1}
              step={distanceUnit === "km" ? 0.01 : 0.1}
              emptyBehavior="preserve"
              onChange={setDistance}
              unitSelect={{
                value: distanceUnit,
                options: [
                  { value: "m", label: "m" },
                  { value: "km", label: "km" }
                ],
                onChange: (value) => setDistanceUnit(value as "m" | "km"),
                ariaLabel: "距離の単位"
              }}
              help="送信源からの離隔距離です。遠方界・自由空間を仮定します。"
              example={distanceUnit === "km" ? "0.1" : "10"}
              error={distanceError}
            />

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                data-testid="fs-use-receiver"
                checked={useReceiver}
                onChange={(event) => setUseReceiver(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-staf focus-visible:ring-staf/40"
              />
              受信アンテナでの受信電力も計算する
            </label>
            {useReceiver ? (
              <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <Field
                  id="fsFrequency"
                  label="周波数"
                  unit="MHz"
                  value={frequencyMHz}
                  min={1}
                  step={1}
                  emptyBehavior="preserve"
                  onChange={setFrequencyMHz}
                  help="実効開口 Aeff=Gλ²/4π の計算に使います。"
                  example="920"
                />
                <Field
                  id="fsRxGain"
                  label="受信アンテナ利得"
                  unit="dBi"
                  value={rxGainDbi}
                  step={0.5}
                  emptyBehavior="preserve"
                  onChange={setRxGainDbi}
                  help="受信側アンテナの利得です。"
                  example="2"
                />
              </div>
            ) : null}
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="fs-primary-result">
            <ResultBar primary={primary} />
          </div>
          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">換算</h2>
            {result ? (
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3 rounded-md bg-staf-light/50 px-2 py-1">
                  <dt className="font-semibold text-staf-dark">電界強度 E</dt>
                  <dd className="font-bold text-slate-950" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatNumber(result.eFieldVm, 3)} V/m
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">電界強度（dBµV/m）</dt>
                  <dd className="font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatNumber(result.eFieldDbuVm, 1)} dBµV/m
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">電力密度 S</dt>
                  <dd className="font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatPowerDensity(result.powerDensityWm2)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">電力密度（mW/cm²）</dt>
                  <dd className="font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatNumber(result.powerDensityMwCm2, 5)} mW/cm²
                  </dd>
                </div>
                {result.receivedPowerDbm !== null ? (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-600">受信電力（Aeff経由）</dt>
                    <dd className="font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatNumber(result.receivedPowerDbm, 1)} dBm
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <p className="mt-3 text-sm text-slate-500">入力値を確認してください。</p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              遠方界・自由空間の理想条件です。反射・地面・多重波のある実環境では変動します。電波防護指針や測定値との突き合わせの一次目安に。
            </p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <FormulaExplanationCard
          title="数式と考え方"
          formula="S = EIRP/(4πr²)、E = √(η0·S) = √(30·EIRP[W])/r、E[dBµV/m]=20log10(E/1µV)、Prx = S·Gλ²/4π"
          showColumnLink={false}
        >
          <p>
            点源から距離rの球面に電力が均等に広がると考えると、電力密度Sは距離の2乗で薄まります。自由空間インピーダンスη0≈377Ωを介して電界強度Eに換算できます。規制（電波防護指針）・実測（電界強度計）・受信レベルの一次見積もりを1画面で結びます。
          </p>
        </FormulaExplanationCard>
      </div>

      <MobileResultBar primary={primary} targetId="fs-primary-result" />
    </>
  );
}

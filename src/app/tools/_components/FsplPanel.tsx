"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { glossary } from "@/data/glossary";
import { calculateFsplDb } from "@/lib/rf/fspl";
import { formatDb, formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";

export function FsplPanel() {
  const [frequencyMHz, setFrequencyMHz] = useState(920);
  const [distance, setDistance] = useState(1);
  const [distanceUnit, setDistanceUnit] = useState<"m" | "km">("km");
  const distanceKm = distanceUnit === "m" ? distance / 1000 : distance;

  const result = useMemo(() => {
    try {
      const fspl = calculateFsplDb(frequencyMHz, distanceKm);
      // FSPLが負になる極端な近距離・低周波では、遠方界を前提とする式を無効扱いにする。
      return fspl >= 0 ? fspl : null;
    } catch {
      return null;
    }
  }, [frequencyMHz, distanceKm]);

  const sampleDistances = useMemo(() => {
    return [0.01, 0.1, 1, 10].map((distanceValue) => {
      try {
        const fspl = calculateFsplDb(frequencyMHz, distanceValue);
        return { distance: distanceValue, fspl: fspl >= 0 ? fspl : Number.NaN };
      } catch {
        return { distance: distanceValue, fspl: Number.NaN };
      }
    });
  }, [frequencyMHz]);

  const frequencyError =
    !Number.isFinite(frequencyMHz) || frequencyMHz <= 0
      ? "周波数は0より大きい値を入力してください。"
      : undefined;
  const distanceError =
    !Number.isFinite(distance) || distance <= 0
      ? "距離は0より大きい値を入力してください。"
      : undefined;
  const modelError = result === null && !frequencyError && !distanceError;
  const primary = {
    label: "自由空間損失",
    value: result === null ? "—" : formatNumber(result),
    unit: "dB"
  };

  // バー幅は固定のdBレンジ（60〜140dB）で正規化し、距離間を定量比較する。
  const barWidthPercent = (fspl: number) => {
    if (!Number.isFinite(fspl)) return 0;
    const ratio = (fspl - 60) / (140 - 60);
    return Math.min(100, Math.max(2, ratio * 100));
  };

  const inputMatchesSample = sampleDistances.some(
    (item) =>
      Number.isFinite(distanceKm) &&
      Math.abs(distanceKm - item.distance) < item.distance * 0.001
  );

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <div className="mt-4 space-y-4">
            <Field
              id="fsplFrequency"
              label="周波数"
              unit="MHz"
              value={frequencyMHz}
              min={1}
              step={1}
              emptyBehavior="preserve"
              onChange={setFrequencyMHz}
              help={glossary.fspl.description}
              example="920"
              error={frequencyError}
            />
            <Field
              id="fsplDistance"
              label="距離"
              value={distance}
              min={distanceUnit === "m" ? 1 : 0.001}
              step={distanceUnit === "m" ? 1 : 0.01}
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
              help="送受信間の直線距離です。mは屋内・近距離、kmは屋外の見通し距離に使います。"
              example={distanceUnit === "m" ? "100" : "1"}
              error={distanceError}
            />
          </div>
          {modelError ? (
            <p className="mt-4 text-sm font-medium leading-relaxed text-rose-700">
              距離が波長に対して極端に短く、遠方界を前提とする自由空間損失の式が成立しません。
            </p>
          ) : null}
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="fspl-primary-result">
            <ResultBar primary={primary} />
          </div>
          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">距離ごとの損失比較</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              現在の周波数で、距離が10倍になると損失が約20dB増える様子を比較します。
            </p>

            {Number.isFinite(frequencyMHz) && frequencyMHz > 0 ? (
              <>
                <div className="mt-4 space-y-3">
                  {sampleDistances.map((item) => {
                    const isCurrent =
                      Number.isFinite(distanceKm) &&
                      Math.abs(distanceKm - item.distance) < item.distance * 0.001;
                    return (
                      <div
                        key={item.distance}
                        className={`grid grid-cols-[64px_1fr_72px] items-center gap-3 rounded-lg px-2 py-1 text-sm ${
                          isCurrent ? "bg-staf-light ring-1 ring-staf/40" : ""
                        }`}
                      >
                        <span className={isCurrent ? "font-semibold text-staf-dark" : "text-slate-600"}>
                          {item.distance < 1 ? `${item.distance * 1000}m` : `${item.distance}km`}
                        </span>
                        <div className="h-3 rounded-full bg-slate-100">
                          <div
                            className="h-3 rounded-full bg-staf"
                            style={{ width: `${barWidthPercent(item.fspl)}%` }}
                          />
                        </div>
                        <span className="text-right font-semibold text-slate-900">
                          {Number.isFinite(item.fspl) ? formatDb(item.fspl, 0) : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {result !== null && Number.isFinite(distanceKm) && !inputMatchesSample ? (
                  <div className="mt-4 grid grid-cols-[64px_1fr_72px] items-center gap-3 rounded-lg border border-staf/40 bg-staf-light px-2 py-2 text-sm">
                    <span className="font-semibold text-staf-dark">入力値</span>
                    <div className="h-3 rounded-full bg-white/70">
                      <div
                        className="h-3 rounded-full bg-staf-dark"
                        style={{ width: `${barWidthPercent(result)}%` }}
                      />
                    </div>
                    <span className="text-right font-bold text-slate-950">{formatDb(result, 0)}</span>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                周波数を入力すると距離ごとの損失が表示されます。
              </p>
            )}
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <FormulaExplanationCard
          title="数式と理論"
          formula="FSPL[dB] = 32.44 + 20log10(距離[km]) + 20log10(周波数[MHz])"
          showColumnLink={false}
        >
          <p>
            自由空間損失は理想環境での損失です。実環境では壁、床、金属、人体、筐体、ノイズ、マルチパスの影響が加わります。
          </p>
        </FormulaExplanationCard>
      </div>

      <MobileResultBar primary={primary} targetId="fspl-primary-result" />
    </>
  );
}

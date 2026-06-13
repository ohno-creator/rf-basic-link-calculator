"use client";

import { useMemo, useState } from "react";
import { Tooltip } from "@/components/Tooltip";
import { glossary } from "@/data/glossary";
import { calculateFsplDb } from "@/lib/rf/fspl";
import { formatDb } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";

export function FsplPanel() {
  const [frequencyMHz, setFrequencyMHz] = useState(920);
  const [distance, setDistance] = useState(1);
  const [distanceUnit, setDistanceUnit] = useState<"m" | "km">("km");
  const distanceKm = distanceUnit === "m" ? distance / 1000 : distance;

  const result = useMemo(() => {
    try {
      return calculateFsplDb(frequencyMHz, distanceKm);
    } catch {
      return null;
    }
  }, [frequencyMHz, distanceKm]);

  const sampleDistances = [0.01, 0.1, 1, 10].map((distanceValue) => ({
    distance: distanceValue,
    fspl: calculateFsplDb(Math.max(frequencyMHz, 1), distanceValue)
  }));

  return (
    <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">自由空間損失 FSPL 計算</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          障害物や反射がない理想的な空間で、距離により電波が弱くなる量を計算します。
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="fsplFrequency" className="text-sm font-semibold text-slate-950">
                周波数 MHz
              </label>
              <Tooltip term={glossary.fspl.term}>{glossary.fspl.description}</Tooltip>
            </div>
            <input
              id="fsplFrequency"
              type="number"
              min={1}
              step={1}
              value={Number.isFinite(frequencyMHz) ? frequencyMHz : ""}
              className="mt-3 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
              onChange={(event) => setFrequencyMHz(event.target.value === "" ? Number.NaN : Number(event.target.value))}
              aria-invalid={!result}
            />
          </div>

          <div>
            <label htmlFor="fsplDistance" className="text-sm font-semibold text-slate-950">
              距離
            </label>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px]">
              <input
                id="fsplDistance"
                type="number"
                min={distanceUnit === "m" ? 1 : 0.001}
                step={distanceUnit === "m" ? 1 : 0.01}
                value={Number.isFinite(distance) ? distance : ""}
                className="h-11 rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
                onChange={(event) => setDistance(event.target.value === "" ? Number.NaN : Number(event.target.value))}
                aria-invalid={!result}
              />
              <select
                value={distanceUnit}
                className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
                onChange={(event) => setDistanceUnit(event.target.value as "m" | "km")}
              >
                <option value="m">m</option>
                <option value="km">km</option>
              </select>
            </div>
          </div>
        </div>

        {result ? (
          <div className="mt-5 rounded-lg bg-staf-light p-5">
            <p className="text-sm font-semibold text-staf">自由空間損失</p>
            <p className="mt-1 text-4xl font-bold text-slate-950">{formatDb(result)}</p>
          </div>
        ) : (
          <p className="mt-4 text-sm font-medium text-rose-700">
            周波数と距離は0より大きい値を入力してください。
          </p>
        )}

        <div className="mt-5">
          <FormulaExplanationCard
            title="自由空間損失の意味を見る"
            formula="FSPL[dB] = 32.44 + 20log10(距離[km]) + 20log10(周波数[MHz])"
          >
            <p>
              自由空間損失は理想環境での損失です。実際の環境では、壁、床、金属、人体、筐体、ノイズ、マルチパスの影響が加わります。
            </p>
          </FormulaExplanationCard>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-950">FSPL Visual</h3>
        <div className="mt-4 rounded-lg bg-slate-50 p-5 text-center text-sm text-slate-700">
          <p className="font-semibold">送信機 ● ))) ))) ))) ))) 受信機</p>
          <div className="mt-4 grid gap-2 text-left sm:grid-cols-4">
            {["距離が伸びる", "電波が広がる", "受信点で小さくなる", "損失が大きくなる"].map((item) => (
              <div key={item} className="rounded-md bg-white p-3 text-center shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {sampleDistances.map((item) => (
            <div key={item.distance} className="grid grid-cols-[80px_1fr_80px] items-center gap-3 text-sm">
              <span className="text-slate-600">
                {item.distance < 1 ? `${item.distance * 1000}m` : `${item.distance}km`}
              </span>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-staf"
                  style={{ width: `${Math.min(100, Math.max(12, item.fspl - 40))}%` }}
                />
              </div>
              <span className="text-right font-semibold text-slate-900">
                {formatDb(item.fspl, 0)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

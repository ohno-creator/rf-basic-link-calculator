"use client";

import { useMemo, useState } from "react";
import { Tooltip } from "@/components/Tooltip";
import { glossary } from "@/data/glossary";
import {
  calculateWavelengthFractions,
  calculateWavelengthFromMHz
} from "@/lib/rf/frequency";
import { formatMeters } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { WavelengthVisual } from "./WavelengthVisual";

export function FrequencyWavelengthPanel() {
  const [frequency, setFrequency] = useState(920);
  const [unit, setUnit] = useState<"MHz" | "GHz">("MHz");
  const frequencyMHz = unit === "GHz" ? frequency * 1000 : frequency;

  const result = useMemo(() => {
    try {
      return calculateWavelengthFractions(frequencyMHz);
    } catch {
      return null;
    }
  }, [frequencyMHz]);

  return (
    <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">周波数・波長計算</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          周波数から波長 λ、λ/2、λ/4、λ/8 を計算します。
        </p>

        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="waveFrequency" className="text-sm font-semibold text-slate-950">
              周波数
            </label>
            <Tooltip term={glossary.wavelength.term}>{glossary.wavelength.description}</Tooltip>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px]">
            <input
              id="waveFrequency"
              type="number"
              min={0.001}
              step={unit === "GHz" ? 0.01 : 1}
              value={Number.isFinite(frequency) ? frequency : ""}
              className="h-11 rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
              onChange={(event) => setFrequency(event.target.value === "" ? Number.NaN : Number(event.target.value))}
              aria-invalid={!result}
            />
            <select
              value={unit}
              className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
              onChange={(event) => setUnit(event.target.value as "MHz" | "GHz")}
            >
              <option value="MHz">MHz</option>
              <option value="GHz">GHz</option>
            </select>
          </div>
          {!result ? (
            <p className="mt-2 text-sm font-medium text-rose-700">
              周波数は0より大きい値を入力してください。
            </p>
          ) : null}
        </div>

        {result ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["波長 λ", result.wavelengthM],
              ["λ/2", result.halfM],
              ["λ/4", result.quarterM],
              ["λ/8", result.eighthM]
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">{label as string}</p>
                <p className="mt-1 text-2xl font-bold text-staf">
                  {formatMeters(value as number)}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-5">
          <FormulaExplanationCard
            title="計算式を見る"
            formula="λ[m] = 299,792,458 / 周波数[Hz]"
          >
            <p>
              920MHzの場合、波長は約{formatMeters(calculateWavelengthFromMHz(920))}です。アンテナ長は単純なλ/4だけでは決まらず、筐体やGND、誘電体の影響を受けます。
            </p>
          </FormulaExplanationCard>
        </div>
      </div>
      {result ? <WavelengthVisual frequencyMHz={frequencyMHz} /> : null}
    </section>
  );
}

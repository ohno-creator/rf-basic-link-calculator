"use client";

import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/rf/format";
import { convertVswr, type VswrSourceKind } from "@/lib/rf/vswr";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { VswrStandingWaveDiagram } from "./VswrStandingWaveDiagram";

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

  const result = useMemo(() => {
    try {
      return convertVswr(mode, value);
    } catch {
      return null;
    }
  }, [mode, value]);

  const activeMode = modes.find((item) => item.id === mode);

  return (
    <section className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-950">VSWR・リターンロス変換</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        アンテナや線路の整合の良さを表す指標を相互変換します。どれか1つを入力してください。
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px]">
        <input
          type="number"
          step={mode === "reflection" ? 0.01 : 0.1}
          value={Number.isFinite(value) ? value : ""}
          aria-label={`${activeMode?.label}の入力`}
          aria-invalid={!result}
          className="h-11 rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
          onChange={(event) => setValue(event.target.value === "" ? Number.NaN : Number(event.target.value))}
        />
        <select
          value={mode}
          aria-label="入力する指標"
          className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
          onChange={(event) => setMode(event.target.value as VswrSourceKind)}
        >
          {modes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
              {item.unit ? `（${item.unit}）` : ""}
            </option>
          ))}
        </select>
      </div>

      {result ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-staf-light p-4">
            <p className="text-xs font-semibold text-staf">VSWR</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{formatInfinite(result.vswr, 2)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">リターンロス</p>
            <p className="mt-1 text-2xl font-bold text-staf">{formatInfinite(result.returnLossDb, 1)} dB</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">反射係数 Γ</p>
            <p className="mt-1 text-2xl font-bold text-staf">{formatNumber(result.reflectionCoefficient, 3)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">反射電力</p>
            <p className="mt-1 text-2xl font-bold text-staf">{formatNumber(result.reflectedPowerPercent, 1)} %</p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm font-medium text-rose-700">
          VSWRは1以上、反射係数は0以上1未満、リターンロスは0以上のdBで入力してください。
        </p>
      )}

      {result ? (
        <div className="mt-5">
          <VswrStandingWaveDiagram
            reflection={result.reflectionCoefficient}
            vswr={result.vswr}
            reflectedPowerPercent={result.reflectedPowerPercent}
          />
        </div>
      ) : null}

      <div className="mt-5">
        <FormulaExplanationCard
          title="指標の意味を見る"
          formula={"VSWR = (1 + Γ) / (1 - Γ)\nリターンロス[dB] = -20 log10(Γ)\n反射電力[%] = Γ² × 100"}
        >
          <p>
            VSWRが1に近いほど、リターンロスが大きいほど整合が良い状態です。VSWR
            1.5でリターンロスは約14dB、VSWR 2.0で約9.5dBが目安です。反射が大きいと送信電力の一部が戻り、通信効率が下がります。
          </p>
        </FormulaExplanationCard>
      </div>
    </section>
  );
}

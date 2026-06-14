"use client";

import { useMemo, useState } from "react";
import { calculateCoaxImpedance } from "@/lib/rf/coax";
import { formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";

const dielectricPresets = [
  { label: "空気", value: 1 },
  { label: "PTFE（テフロン）", value: 2.1 },
  { label: "ポリエチレン", value: 2.3 }
];

export function CoaxImpedancePanel() {
  const [outerInnerDiameter, setOuterInnerDiameter] = useState(2.3);
  const [innerOuterDiameter, setInnerOuterDiameter] = useState(1);
  const [dielectricConstant, setDielectricConstant] = useState(2.1);

  const result = useMemo(() => {
    try {
      return calculateCoaxImpedance(outerInnerDiameter, innerOuterDiameter, dielectricConstant);
    } catch {
      return null;
    }
  }, [outerInnerDiameter, innerOuterDiameter, dielectricConstant]);

  return (
    <section className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-950">同軸線路インピーダンス</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        同軸ケーブルの寸法と誘電体から、特性インピーダンスと速度係数（波長短縮率）を計算します。
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="coaxOuter" className="text-sm font-semibold text-slate-950">
            外部導体の内径 D（mm）
          </label>
          <input
            id="coaxOuter"
            type="number"
            min={0.01}
            step={0.1}
            value={Number.isFinite(outerInnerDiameter) ? outerInnerDiameter : ""}
            aria-invalid={!result}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => setOuterInnerDiameter(event.target.value === "" ? Number.NaN : Number(event.target.value))}
          />
        </div>
        <div>
          <label htmlFor="coaxInner" className="text-sm font-semibold text-slate-950">
            内部導体の外径 d（mm）
          </label>
          <input
            id="coaxInner"
            type="number"
            min={0.01}
            step={0.1}
            value={Number.isFinite(innerOuterDiameter) ? innerOuterDiameter : ""}
            aria-invalid={!result}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => setInnerOuterDiameter(event.target.value === "" ? Number.NaN : Number(event.target.value))}
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="coaxEr" className="text-sm font-semibold text-slate-950">
          比誘電率 εr
        </label>
        <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_180px]">
          <input
            id="coaxEr"
            type="number"
            min={1}
            step={0.1}
            value={Number.isFinite(dielectricConstant) ? dielectricConstant : ""}
            aria-invalid={!result}
            className="h-11 rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => setDielectricConstant(event.target.value === "" ? Number.NaN : Number(event.target.value))}
          />
          <select
            aria-label="誘電体プリセット"
            value={dielectricPresets.find((preset) => preset.value === dielectricConstant)?.value ?? ""}
            className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => {
              if (event.target.value !== "") {
                setDielectricConstant(Number(event.target.value));
              }
            }}
          >
            <option value="">材質から選ぶ</option>
            {dielectricPresets.map((preset) => (
              <option key={preset.label} value={preset.value}>
                {preset.label}（{preset.value}）
              </option>
            ))}
          </select>
        </div>
      </div>

      {result ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-staf-light p-4">
            <p className="text-xs font-semibold text-staf">特性インピーダンス</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{formatNumber(result.impedanceOhms, 1)} Ω</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">速度係数 VF</p>
            <p className="mt-1 text-2xl font-bold text-staf">{formatNumber(result.velocityFactor, 3)}</p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm font-medium text-rose-700">
          外径Dは内径dより大きく、比誘電率は1以上で入力してください。
        </p>
      )}

      <div className="mt-5">
        <FormulaExplanationCard
          title="同軸線路の意味を見る"
          formula={"Z0[Ω] = (138 / √εr) × log10(D / d)\n速度係数 VF = 1 / √εr"}
        >
          <p>
            特性インピーダンスは、外部導体の内径Dと内部導体の外径dの比、そして誘電体の比誘電率で決まります。無線では50Ω系が一般的です。速度係数は、ケーブル内を信号が伝わる速さの割合で、波長や電気長の計算に使います。
          </p>
        </FormulaExplanationCard>
      </div>
    </section>
  );
}

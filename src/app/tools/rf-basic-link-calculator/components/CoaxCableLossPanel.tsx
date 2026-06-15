"use client";

import { useMemo, useState } from "react";
import { cableAssemblies, referenceCables } from "@/data/coaxCables";
import { cableAssemblyLoss, interpolateCableLoss } from "@/lib/rf/coax";
import { formatNumber } from "@/lib/rf/format";
import { CableLossCurveDiagram } from "./CableLossCurveDiagram";
import { FormulaExplanationCard } from "./FormulaExplanationCard";

export function CoaxCableLossPanel() {
  const [cableIndex, setCableIndex] = useState(0);
  const [frequencyMHz, setFrequencyMHz] = useState(2400);
  const [quantity, setQuantity] = useState(1);

  const cable = cableAssemblies[cableIndex] ?? cableAssemblies[0];

  const result = useMemo(() => {
    try {
      return cableAssemblyLoss(cable.points, frequencyMHz, quantity);
    } catch {
      return null;
    }
  }, [cable.points, frequencyMHz, quantity]);

  const outOfRange = frequencyMHz < 500 || frequencyMHz > 8000;

  return (
    <section className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">同軸ケーブル損失（実測値）</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        標準品（変換・延長用）の同軸ケーブルについて、品番と周波数から1本あたりの挿入損失（実測値）を求めます。求めた合計を、リンクバジェットの「ケーブル・コネクタ損失」に入れて使えます。
      </p>

      <div className="mt-4">
        <label htmlFor="cablePart" className="text-sm font-semibold text-slate-950">
          品番
        </label>
        <select
          id="cablePart"
          value={cableIndex}
          className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
          onChange={(event) => setCableIndex(Number(event.target.value))}
        >
          {cableAssemblies.map((item, index) => (
            <option key={item.partNumber} value={index}>
              {item.partNumber}（{item.description}・@2GHz ≈ {formatNumber(interpolateCableLoss(item.points, 2000), 2)}dB）
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="cableFreq" className="text-sm font-semibold text-slate-950">
            周波数（MHz）
          </label>
          <input
            id="cableFreq"
            type="number"
            min={1}
            step={10}
            value={Number.isFinite(frequencyMHz) ? frequencyMHz : ""}
            aria-invalid={!result}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => setFrequencyMHz(event.target.value === "" ? Number.NaN : Number(event.target.value))}
          />
        </div>
        <div>
          <label htmlFor="cableQty" className="text-sm font-semibold text-slate-950">
            本数（直列に繋ぐ数）
          </label>
          <input
            id="cableQty"
            type="number"
            min={1}
            step={1}
            value={Number.isFinite(quantity) ? quantity : ""}
            aria-invalid={!result}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => setQuantity(event.target.value === "" ? Number.NaN : Number(event.target.value))}
          />
        </div>
      </div>

      {result ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-staf-light p-4">
              <p className="text-xs font-semibold text-staf">1本あたり損失</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{formatNumber(result.perPieceDb, 2)} dB</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">合計損失（{Number.isFinite(quantity) ? quantity : 1}本）</p>
              <p className="mt-1 text-2xl font-bold text-staf">{formatNumber(result.totalDb, 2)} dB</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">アンテナに残る電力</p>
              <p className="mt-1 text-2xl font-bold text-staf">{formatNumber(result.powerRemainingPercent, 0)} %</p>
            </div>
          </div>

          {outOfRange ? (
            <p className="mt-2 text-xs leading-relaxed text-amber-700">
              指定周波数が測定点の範囲（500〜8000MHz）の外側です。外挿による参考値としてご利用ください。
            </p>
          ) : null}

          <div className="mt-5">
            <CableLossCurveDiagram
              partNumber={cable.partNumber}
              points={cable.points}
              frequencyMHz={frequencyMHz}
              currentLossDb={result.perPieceDb}
              referenceCables={referenceCables}
            />
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm font-medium text-rose-700">
          周波数は0より大きい値、本数は1以上で入力してください。
        </p>
      )}

      <div className="mt-5">
        <FormulaExplanationCard
          title="損失の見方を見る"
          formula={"合計損失[dB] = 1本あたり損失（実測の補間値） × 本数\n残る電力[%] = 10^(-損失/10) × 100"}
        >
          <p>
            数値はスタッフ標準品の実測挿入損失（S12, 100〜9000MHz）を、指定周波数で補間したものです。高周波ほど損失は増えます。3dBで電力は半分、6dBで1/4になります。複数本を直列に繋ぐ場合は本数を入れてください。実測値ですが、個体差・コネクタ品質・曲げ・温度で多少変わる目安です。
          </p>
        </FormulaExplanationCard>
      </div>
    </section>
  );
}

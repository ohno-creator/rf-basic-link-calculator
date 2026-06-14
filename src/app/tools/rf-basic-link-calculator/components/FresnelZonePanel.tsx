"use client";

import { useMemo, useState } from "react";
import { calculateFresnel } from "@/lib/rf/fresnel";
import { formatMeters, formatNumber } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";

export function FresnelZonePanel() {
  const [frequencyMHz, setFrequencyMHz] = useState(2400);
  const [distanceKm, setDistanceKm] = useState(1);
  const [positionPercent, setPositionPercent] = useState(50);

  const result = useMemo(() => {
    try {
      return calculateFresnel(frequencyMHz, distanceKm, positionPercent / 100);
    } catch {
      return null;
    }
  }, [frequencyMHz, distanceKm, positionPercent]);

  return (
    <section className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-950">フレネルゾーン半径</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        見通し通信で「どれだけ障害物を空けるべきか」の目安になる、第1フレネルゾーンの半径を計算します。
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="fresnelFreq" className="text-sm font-semibold text-slate-950">
            周波数 MHz
          </label>
          <input
            id="fresnelFreq"
            type="number"
            min={1}
            step={1}
            value={Number.isFinite(frequencyMHz) ? frequencyMHz : ""}
            aria-invalid={!result}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => setFrequencyMHz(event.target.value === "" ? Number.NaN : Number(event.target.value))}
          />
        </div>
        <div>
          <label htmlFor="fresnelDist" className="text-sm font-semibold text-slate-950">
            通信距離 km
          </label>
          <input
            id="fresnelDist"
            type="number"
            min={0.001}
            step={0.1}
            value={Number.isFinite(distanceKm) ? distanceKm : ""}
            aria-invalid={!result}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => setDistanceKm(event.target.value === "" ? Number.NaN : Number(event.target.value))}
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <label htmlFor="fresnelPos" className="text-sm font-semibold text-slate-950">
            障害物の位置
          </label>
          <span className="text-sm font-semibold text-staf">送信側から {positionPercent}%</span>
        </div>
        <input
          id="fresnelPos"
          type="range"
          min={5}
          max={95}
          step={1}
          value={positionPercent}
          className="mt-3 w-full"
          aria-label="障害物の位置"
          onChange={(event) => setPositionPercent(Number(event.target.value))}
        />
      </div>

      {result ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-staf-light p-4">
            <p className="text-xs font-semibold text-staf">第1フレネルゾーン半径</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{formatMeters(result.firstZoneRadiusM)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">60%クリアランス</p>
            <p className="mt-1 text-2xl font-bold text-staf">{formatMeters(result.clearance60M)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">波長</p>
            <p className="mt-1 text-2xl font-bold text-staf">{formatNumber(result.wavelengthM, 3)} m</p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm font-medium text-rose-700">
          周波数と距離は0より大きい値を入力してください。
        </p>
      )}

      <div className="mt-5">
        <FormulaExplanationCard
          title="フレネルゾーンの意味を見る"
          formula={"r1 = √( λ × d1 × d2 / (d1 + d2) )"}
        >
          <p>
            電波は直線だけでなく、その周囲の楕円体（フレネルゾーン）を通って伝わります。第1フレネルゾーンの60%以上を障害物から空けると、回り込みによる損失を抑えられます。建物や樹木が半径内に入る場合は、アンテナ高や経路の見直しを検討してください。
          </p>
        </FormulaExplanationCard>
      </div>
    </section>
  );
}

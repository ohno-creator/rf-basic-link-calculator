"use client";

import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/rf/format";
import { type AreaType, calculatePropagationLoss } from "@/lib/rf/propagation";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { PropagationCurveDiagram } from "./PropagationCurveDiagram";

const areaOptions: Array<{ id: AreaType; label: string }> = [
  { id: "urbanLarge", label: "市街地（大都市）" },
  { id: "urbanMedium", label: "市街地（中小都市）" },
  { id: "suburban", label: "郊外" },
  { id: "open", label: "開放地" }
];

export function PropagationLossPanel() {
  const [frequencyMHz, setFrequencyMHz] = useState(900);
  const [baseHeightM, setBaseHeightM] = useState(30);
  const [mobileHeightM, setMobileHeightM] = useState(1.5);
  const [distanceKm, setDistanceKm] = useState(1);
  const [area, setArea] = useState<AreaType>("urbanMedium");

  const result = useMemo(() => {
    try {
      return calculatePropagationLoss({ frequencyMHz, baseHeightM, mobileHeightM, distanceKm, area });
    } catch {
      return null;
    }
  }, [frequencyMHz, baseHeightM, mobileHeightM, distanceKm, area]);

  return (
    <section className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-950">伝搬損失（奥村-秦モデル）</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        市街地・郊外などの実環境での伝搬損失を、奥村-秦／COST 231-Hata モデルで推定します。
      </p>
      <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-950">
        空中線地上高は固定ではありません。基地局アンテナ高 hb と移動局アンテナ高 hm を入力値として扱い、伝搬損失に反映します。
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="propFreq" className="text-sm font-semibold text-slate-950">
            周波数 MHz
          </label>
          <input
            id="propFreq"
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
          <label htmlFor="propDist" className="text-sm font-semibold text-slate-950">
            距離 km
          </label>
          <input
            id="propDist"
            type="number"
            min={0.1}
            step={0.1}
            value={Number.isFinite(distanceKm) ? distanceKm : ""}
            aria-invalid={!result}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => setDistanceKm(event.target.value === "" ? Number.NaN : Number(event.target.value))}
          />
        </div>
        <div>
          <label htmlFor="propHb" className="text-sm font-semibold text-slate-950">
            基地局空中線地上高 hb（m）
          </label>
          <input
            id="propHb"
            type="number"
            min={1}
            step={1}
            value={Number.isFinite(baseHeightM) ? baseHeightM : ""}
            aria-invalid={!result}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => setBaseHeightM(event.target.value === "" ? Number.NaN : Number(event.target.value))}
          />
        </div>
        <div>
          <label htmlFor="propHm" className="text-sm font-semibold text-slate-950">
            移動局空中線地上高 hm（m）
          </label>
          <input
            id="propHm"
            type="number"
            min={0.5}
            step={0.5}
            value={Number.isFinite(mobileHeightM) ? mobileHeightM : ""}
            aria-invalid={!result}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
            onChange={(event) => setMobileHeightM(event.target.value === "" ? Number.NaN : Number(event.target.value))}
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="propArea" className="text-sm font-semibold text-slate-950">
          エリア種別
        </label>
        <select
          id="propArea"
          value={area}
          className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
          onChange={(event) => setArea(event.target.value as AreaType)}
        >
          {areaOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {result ? (
        <>
          <div className="mt-4 rounded-lg bg-staf-light p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-staf">推定伝搬損失</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">
                {result.model}
              </span>
            </div>
            <p className="mt-1 text-3xl font-bold text-slate-950">{formatNumber(result.pathLossDb, 1)} dB</p>
          </div>
          {result.outOfRange ? (
            <p className="mt-2 text-xs leading-relaxed text-amber-700">
              入力値がモデルの適用目安（f 150〜2000MHz、hb 30〜200m、hm 1〜10m、距離 1〜20km）の外側です。参考値としてご利用ください。
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-4 text-sm font-medium text-rose-700">
          各項目は0より大きい値を入力してください。
        </p>
      )}

      {result ? (
        <div className="mt-5">
          <PropagationCurveDiagram
            frequencyMHz={frequencyMHz}
            baseHeightM={baseHeightM}
            mobileHeightM={mobileHeightM}
            distanceKm={distanceKm}
            area={area}
          />
        </div>
      ) : null}

      <div className="mt-5">
        <FormulaExplanationCard
          title="伝搬損失モデルの意味を見る"
          formula={
            "L_urban = 69.55 + 26.16·log10(f) − 13.82·log10(hb)\n        − a(hm) + (44.9 − 6.55·log10(hb))·log10(d)\n郊外   : L = L_urban − 2·(log10(f/28))² − 5.4\n開放地 : L = L_urban − 4.78·(log10 f)² + 18.33·log10 f − 40.94"
          }
        >
          <p>
            奥村-秦モデルは、実測に基づき市街地・郊外などの伝搬損失を推定する代表的な経験式です。自由空間損失と違い、建物や地形による損失を含みます。1500MHzを超える帯域では、拡張版のCOST
            231-Hataに自動で切り替わります（大都市は+3dBの補正）。あくまで中央値の推定で、実際の値は地形やフェージングで変動します。
          </p>
          <p>
            hb と hm は固定値ではなく、画面上の「基地局空中線地上高」「移動局空中線地上高」の入力値です。
            一般的な適用目安は、基地局高30〜200m、移動局高1〜10m、距離1〜20kmです。
          </p>
        </FormulaExplanationCard>
      </div>
    </section>
  );
}

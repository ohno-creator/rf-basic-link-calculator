"use client";

import { type ReactNode, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { getPropagationModelOption, propagationAreaOptions } from "@/data/linkBudgetOptions";
import { type AreaType } from "@/lib/rf/propagation";
import {
  type GeometricPropagationModel,
  type PropagationLossParams,
  calculatePropagationLossResult,
  geometricPropagationModels
} from "@/lib/rf/propagationLossModels";
import { PropagationGeometryDiagram } from "./PropagationGeometryDiagram";
import { PropagationModelComparisonChart } from "./PropagationModelComparisonChart";

const MODEL_COLORS: Record<GeometricPropagationModel, string> = {
  free_space: "#64748b",
  two_ray: "#6366f1",
  log_distance: "#0071BD",
  okumura_hata: "#ea580c",
  cost231_hata: "#be123c"
};

const HATA_MODELS: GeometricPropagationModel[] = ["okumura_hata", "cost231_hata"];

const frequencyChips = [920, 2400, 5000, 700, 1500, 3700];

type FieldProps = {
  id: string;
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  hint?: string;
  children?: ReactNode;
};

function Field({ id, label, unit, value, min, max, step, onChange, hint, children }: FieldProps) {
  const sliderValue = Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-slate-950">
          {label}
        </label>
        <span className="text-xs font-medium text-slate-400">{unit}</span>
      </div>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : ""}
        className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
        onChange={(event) => onChange(event.target.value === "" ? Number.NaN : Number(event.target.value))}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        className="mt-2 w-full"
        aria-label={`${label}のスライダー`}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {children}
      {hint ? <p className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function PropagationExplorer() {
  const [frequencyMHz, setFrequencyMHz] = useState(920);
  const [distanceKm, setDistanceKm] = useState(1);
  const [txHeightM, setTxHeightM] = useState(30);
  const [rxHeightM, setRxHeightM] = useState(1.5);
  const [area, setArea] = useState<AreaType>("urbanMedium");
  const [pathLossExponent, setPathLossExponent] = useState(3);
  const [selected, setSelected] = useState<Set<GeometricPropagationModel>>(
    () => new Set<GeometricPropagationModel>(["free_space", "two_ray", "log_distance", "okumura_hata"])
  );

  const params: PropagationLossParams = useMemo(
    () => ({ frequencyMHz, distanceKm, txHeightM, rxHeightM, area, pathLossExponent }),
    [frequencyMHz, distanceKm, txHeightM, rxHeightM, area, pathLossExponent]
  );

  const selectedOrder = useMemo(
    () => geometricPropagationModels.filter((model) => selected.has(model)),
    [selected]
  );

  const hataActive = selectedOrder.some((model) => HATA_MODELS.includes(model));
  const logDistanceActive = selected.has("log_distance");
  const twoRayActive = selected.has("two_ray");
  const areaLabel = propagationAreaOptions.find((option) => option.value === area)?.label ?? "市街地";

  const results = useMemo(() => {
    const list: ReturnType<typeof calculatePropagationLossResult>[] = [];
    for (const model of selectedOrder) {
      try {
        const result = calculatePropagationLossResult(model, params);
        if (Number.isFinite(result.pathLossDb)) {
          list.push(result);
        }
      } catch {
        // 無効な入力（空欄など）はスキップ
      }
    }
    return list.sort((a, b) => a.pathLossDb - b.pathLossDb);
  }, [selectedOrder, params]);

  const minLoss = results.length > 0 ? results[0].pathLossDb : null;
  const chartModels = selectedOrder.map((model) => ({
    value: model,
    label: getPropagationModelOption(model).label,
    color: MODEL_COLORS[model]
  }));

  const toggleModel = (model: GeometricPropagationModel) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(model)) {
        next.delete(model);
      } else {
        next.add(model);
      }
      return next;
    });
  };

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-bold text-slate-950">伝搬損失モデル比較</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          リンクバジェット計算機に組み込まれている伝搬モデルを、同じ条件（周波数・距離・アンテナ高）で並べて比較できます。
          自由空間損失からHata系まで、どのモデルがどれだけ損失を見積もるかを一目で確認できます。
        </p>
      </div>

      {/* モデル選択チップ */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-950">比較するモデル</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          チップをタップで追加・解除できます。複数選ぶと図とグラフ・一覧で同時に比較します。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {geometricPropagationModels.map((model) => {
            const option = getPropagationModelOption(model);
            const isOn = selected.has(model);
            return (
              <button
                key={model}
                type="button"
                aria-pressed={isOn}
                onClick={() => toggleModel(model)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                  isOn
                    ? "border-staf bg-white text-slate-900 shadow-sm"
                    : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600"
                }`}
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: isOn ? MODEL_COLORS[model] : "#cbd5e1" }}
                />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 共通条件の入力 */}
      <div>
        <p className="text-sm font-semibold text-slate-950">共通条件</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <Field
            id="propFrequency"
            label="周波数"
            unit="MHz"
            value={frequencyMHz}
            min={50}
            max={6000}
            step={10}
            onChange={setFrequencyMHz}
          >
            <div className="mt-2 flex flex-wrap gap-1.5">
              {frequencyChips.map((mhz) => (
                <button
                  key={mhz}
                  type="button"
                  onClick={() => setFrequencyMHz(mhz)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition ${
                    frequencyMHz === mhz
                      ? "border-staf bg-staf-light text-staf"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {mhz >= 1000 ? `${mhz / 1000}G` : `${mhz}M`}
                </button>
              ))}
            </div>
          </Field>
          <Field
            id="propDistance"
            label="距離"
            unit="km"
            value={distanceKm}
            min={0.01}
            max={20}
            step={0.01}
            onChange={setDistanceKm}
            hint="10m〜20km。Hata系の適用目安は1〜20kmです。"
          />
          <Field
            id="propTxHeight"
            label="送信側アンテナ高 hb"
            unit="m"
            value={txHeightM}
            min={1}
            max={200}
            step={1}
            onChange={setTxHeightM}
            hint="基地局・ゲートウェイ側。Hataの目安は30〜200m。"
          />
          <Field
            id="propRxHeight"
            label="受信側アンテナ高 hm"
            unit="m"
            value={rxHeightM}
            min={0.5}
            max={20}
            step={0.5}
            onChange={setRxHeightM}
            hint="端末・移動局側。Hataの目安は1〜10m。"
          />
          {logDistanceActive ? (
            <Field
              id="propExponent"
              label="距離損失指数 n（Log-distance）"
              unit="n"
              value={pathLossExponent}
              min={1.6}
              max={6}
              step={0.1}
              onChange={setPathLossExponent}
              hint="自由空間=2、市街地NLOS=3〜4が目安。"
            />
          ) : null}
          {hataActive ? (
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <label htmlFor="propArea" className="text-sm font-semibold text-slate-950">
                エリア種別（Hata系）
              </label>
              <select
                id="propArea"
                value={area}
                className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
                onChange={(event) => setArea(event.target.value as AreaType)}
              >
                {propagationAreaOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                市街地ほど損失が大きく、開放地ほど小さく推定します。
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* 2D 前提図 */}
      <div>
        <p className="text-sm font-semibold text-slate-950">前提条件の2D図</p>
        <p className="mt-1 mb-2 text-xs leading-relaxed text-slate-500">
          入力中の周波数・距離・アンテナ高（hb / hm）を断面図で示します。2波モデルでは地面反射経路、Hata系では市街地クラッタを描きます。
        </p>
        <PropagationGeometryDiagram
          frequencyMHz={frequencyMHz}
          distanceKm={distanceKm}
          txHeightM={txHeightM}
          rxHeightM={rxHeightM}
          areaLabel={areaLabel}
          showReflection={twoRayActive}
          showBuildings={hataActive}
        />
      </div>

      {/* 比較結果（現在距離） */}
      <div>
        <p className="text-sm font-semibold text-slate-950">
          現在距離 {distanceKm >= 1 ? `${distanceKm}km` : `${Math.round(distanceKm * 1000)}m`} での伝搬損失（届きやすい順）
        </p>
        {results.length === 0 ? (
          <p className="mt-2 rounded-md bg-rose-50 p-3 text-sm font-medium text-rose-700">
            比較するモデルを選び、各入力に0より大きい値を入れてください。
          </p>
        ) : (
          <ul className="mt-2 grid gap-2">
            {results.map((result, index) => {
              const option = getPropagationModelOption(result.model);
              const deltaDb = minLoss !== null ? result.pathLossDb - minLoss : 0;
              return (
                <li
                  key={result.model}
                  className="rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: MODEL_COLORS[result.model] }}
                      />
                      <span className="truncate text-sm font-bold text-slate-950">{option.label}</span>
                      {index === 0 ? (
                        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                          最小
                        </span>
                      ) : null}
                      {result.outOfRange ? (
                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                          適用範囲外
                        </span>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-lg font-bold text-slate-950">{result.pathLossDb.toFixed(1)}</span>
                      <span className="ml-1 text-xs font-semibold text-slate-500">dB</span>
                      {deltaDb > 0.05 ? (
                        <span className="ml-2 text-xs font-medium text-slate-400">+{deltaDb.toFixed(1)}</span>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                    <span className="font-semibold text-slate-700">向いている：</span>
                    {option.bestFor}
                    <span className="ml-2 font-semibold text-amber-700">注意：</span>
                    <span className="text-amber-700">{option.caution}</span>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 距離スイープのグラフ */}
      <PropagationModelComparisonChart
        models={chartModels}
        params={{ frequencyMHz, txHeightM, rxHeightM, area, pathLossExponent }}
        currentDistanceKm={distanceKm}
      />

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p className="text-xs leading-relaxed text-amber-950">
            いずれのモデルも中央値・基準値の概算です。実際の損失は建物配置、地形、屋内侵入、マルチパス、筐体・設置条件で変動します。
            通信可否の判断には、リンクバジェット計算機で環境損失・端末近傍損失・実測補正を併用してください。
          </p>
        </div>
      </div>
    </section>
  );
}

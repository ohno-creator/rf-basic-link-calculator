"use client";

import { type ReactNode, useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, Copy, Plus, Printer, Trash2 } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { Tooltip } from "@/components/Tooltip";
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

const MAX_MEASURED_POINTS = 10;

type MeasuredPoint = {
  id: number;
  distanceKm: number | null;
  lossDb: number | null;
};

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
  tooltip?: ReactNode;
  children?: ReactNode;
};

function Field({ id, label, unit, value, min, max, step, onChange, hint, tooltip, children }: FieldProps) {
  const sliderValue = Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;

  return (
    <Card padding="sm" shadow={false}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-slate-950">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {tooltip ? <Tooltip term={label}>{tooltip}</Tooltip> : null}
          <span className="text-xs font-medium text-slate-400">{unit}</span>
        </div>
      </div>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : ""}
        className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/40"
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
    </Card>
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
  const [measuredPoints, setMeasuredPoints] = useState<MeasuredPoint[]>([
    { id: 0, distanceKm: null, lossDb: null }
  ]);
  const nextMeasuredId = useRef(1);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

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
  const flooredByFspl = results.some((result) => result.flooredByFspl);
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

  const updateMeasured = (id: number, key: "distanceKm" | "lossDb", raw: string) => {
    const parsed = raw === "" ? null : Number(raw);
    const value = parsed !== null && Number.isFinite(parsed) ? parsed : null;
    setMeasuredPoints((points) =>
      points.map((point) => (point.id === id ? { ...point, [key]: value } : point))
    );
  };

  const addMeasured = () => {
    setMeasuredPoints((points) =>
      points.length >= MAX_MEASURED_POINTS
        ? points
        : [...points, { id: nextMeasuredId.current++, distanceKm: null, lossDb: null }]
    );
  };

  const removeMeasured = (id: number) => {
    setMeasuredPoints((points) => (points.length <= 1 ? points : points.filter((point) => point.id !== id)));
  };

  const validMeasured = useMemo(
    () =>
      measuredPoints
        .filter(
          (point): point is { id: number; distanceKm: number; lossDb: number } =>
            point.distanceKm !== null &&
            point.lossDb !== null &&
            Number.isFinite(point.distanceKm) &&
            Number.isFinite(point.lossDb) &&
            point.distanceKm > 0 &&
            point.lossDb > 0
        )
        .map((point) => ({ distanceKm: point.distanceKm, lossDb: point.lossDb })),
    [measuredPoints]
  );

  // グラフの距離軸は 0.01〜20km。範囲外の実測点は重ねず、件数だけ注意表示する。
  const chartMeasured = useMemo(
    () => validMeasured.filter((point) => point.distanceKm >= 0.01 && point.distanceKm <= 20),
    [validMeasured]
  );
  const measuredOutOfRange = validMeasured.length - chartMeasured.length;

  const formatDistance = (km: number) => (km >= 1 ? `${km} km` : `${Math.round(km * 1000)} m`);

  const buildClipboardText = () => {
    const lines: string[] = ["# 伝搬損失モデル比較の結果", "", "## 条件"];
    lines.push(`- 周波数: ${frequencyMHz} MHz`);
    lines.push(`- 距離: ${formatDistance(distanceKm)}`);
    lines.push(`- 送信側アンテナ高 hb: ${txHeightM} m`);
    lines.push(`- 受信側アンテナ高 hm: ${rxHeightM} m`);
    if (hataActive) {
      lines.push(`- エリア種別: ${areaLabel}`);
    }
    if (logDistanceActive) {
      lines.push(`- 距離損失指数 n: ${pathLossExponent}`);
    }
    lines.push("", `## 現在距離 ${formatDistance(distanceKm)} でのモデル別 伝搬損失（届きやすい順）`);
    for (const result of results) {
      lines.push(
        `- ${getPropagationModelOption(result.model).label}: ${result.pathLossDb.toFixed(1)} dB${
          result.outOfRange ? "（適用範囲外）" : ""
        }`
      );
    }
    if (validMeasured.length > 0) {
      lines.push("", "## 実測値");
      for (const point of validMeasured) {
        lines.push(`- ${point.distanceKm} km: ${point.lossDb} dB`);
      }
    }
    lines.push(
      "",
      "## 分析してほしいこと",
      "上記の条件・各モデルの伝搬損失・実測値をもとに、(1) 実測に最も近いモデルと妥当な距離損失指数 n、(2) 実測がモデルから外れる理由（地形・建物クラッタ・回折・反射・植生・マルチパス等）、(3) この環境での通信設計やアンテナ選定の注意点 を考察してください。"
    );
    return lines.join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildClipboardText());
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 4000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card as="section" padding="lg" className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-bold text-slate-950">伝搬損失モデル比較</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          リンクバジェット計算機に組み込まれている伝搬モデルを、同じ条件（周波数・距離・アンテナ高）で並べて比較できます。
          自由空間損失からHata系まで、どのモデルがどれだけ損失を見積もるかを一目で確認できます。
        </p>
      </div>

      {/* モデル選択チップ */}
      <Card variant="slate" padding="md" shadow={false}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-950">比較するモデル</p>
          <Tooltip term="伝搬モデル">
            距離による電波の減り方の式です。自由空間＝見通しの基準（最小）、2波＝地面反射、Log-distance＝指数nで近似、奥村・秦／COST231-Hata＝市街地の経験式。複数選ぶと同条件で損失を比較できます。
          </Tooltip>
        </div>
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
                    ? "border-staf bg-white text-slate-900 shadow-card"
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
      </Card>

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
            hint="低い周波数ほど損失は小さく届きやすい。Hataは150〜1500MHz、COST231-Hataは1500〜2000MHzが目安。"
            tooltip="送信に使う中心周波数です。高いほど自由空間損失が増え、届きにくくなります。奥村・秦は150〜1500MHz、COST231-Hataは1500〜2000MHzが目安で、外れると結果は参考値になります。"
          >
            <div className="mt-2 flex flex-wrap gap-1.5">
              {frequencyChips.map((mhz) => (
                <button
                  key={mhz}
                  type="button"
                  onClick={() => setFrequencyMHz(mhz)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition ${
                    frequencyMHz === mhz
                      ? "border-staf bg-staf-light text-staf-dark"
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
            tooltip="送受信点間の距離です。距離が2倍になると自由空間損失は約6dB増えます。Hata系は1〜20km、2波モデルはブレークポイント以遠が本来の適用範囲です。"
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
            tooltip="送信側（基地局・ゲートウェイ）のアンテナ地上高です。高いほど見通しが良く損失は小さめになります。Hata系の目安は30〜200m。"
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
            tooltip="受信側（端末・移動局）のアンテナ地上高です。低いほど地面反射やクラッタの影響を受けます。Hata系の目安は1〜10m。"
          />
          {logDistanceActive ? (
            <Field
              id="propExponent"
              label="距離損失指数 n（Log-distance）"
              unit="n"
              value={pathLossExponent}
              min={1}
              max={6}
              step={0.1}
              onChange={setPathLossExponent}
              hint="n=1（緩やか）〜6（急峻）。自由空間=2、市街地NLOS=3〜4が目安。"
              tooltip="Log-distanceモデルの距離減衰の急峻さです。自由空間=2、市街地などの見通し外=3〜4が目安。大きいほど距離が伸びると急に弱くなります。現地のRSSI/RSRP実測に合わせて調整します。"
            />
          ) : null}
          {hataActive ? (
            <Card padding="sm" shadow={false}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="propArea" className="text-sm font-semibold text-slate-950">
                  エリア種別（Hata系）
                </label>
                <Tooltip term="エリア種別">
                  Hata系で使う環境区分です。市街地（大都市）→市街地（中小都市）→郊外→開放地の順に伝搬損失が小さくなります。自由空間／2波／Log-distanceには影響しません。
                </Tooltip>
              </div>
              <select
                id="propArea"
                value={area}
                className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/40"
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
            </Card>
          ) : null}
        </div>
      </div>

      {/* 2D 前提図 */}
      <div>
        <p className="text-sm font-semibold text-slate-950">前提条件の2D図</p>
        <p className="mt-1 mb-2 text-xs leading-relaxed text-slate-500">
          図形は距離とアンテナ高（hb / hm）で決まります。周波数・エリアは図中の表示のみで、図形の大きさには反映しません（高さは見やすさ優先の圧縮表示です）。2波モデルを選ぶと地面反射経路、Hata系を選ぶと市街地クラッタを描きます。
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
                <Card as="li" key={result.model} padding="sm" shadow={false}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: MODEL_COLORS[result.model] }}
                      />
                      <span className="truncate text-sm font-bold text-slate-950">{option.label}</span>
                      {index === 0 ? (
                        <Badge tone="success" size="xs" className="shrink-0">
                          最小
                        </Badge>
                      ) : null}
                      {result.outOfRange ? (
                        <Badge tone="caution" size="xs" className="shrink-0">
                          適用範囲外
                        </Badge>
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
                </Card>
              );
            })}
          </ul>
        )}
        {flooredByFspl ? (
          <Callout tone="caution" size="sm" className="mt-2">
            <p className="text-xs leading-relaxed">
              経験式が自由空間損失を下回ったため下限値を表示
            </p>
          </Callout>
        ) : null}
      </div>

      {/* 実測値の入力 */}
      <Card variant="slate" padding="md" shadow={false}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-950">実測値を重ねる（任意・最大10点）</p>
          <Tooltip term="実測値">
            現地で測った「距離」と「実測の経路損失[dB]」を入れると、グラフに黒点で重なり、どのモデル・距離損失指数nが現地に近いか比較できます。経路損失は概算で「送信電力＋送受信利得−受信電力(RSSI)」で求められます。
          </Tooltip>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Google Earthで距離を測り、現地の実測損失を入れて重ねると、どのモデルが合うか・なぜ外れるかが分かります（下の「実測で深掘りする」コラム参照）。距離は10m〜20kmが表示範囲です。
        </p>
        <div className="mt-3 grid gap-2">
          {measuredPoints.map((point, index) => (
            <div key={point.id} className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-xs font-semibold text-slate-400">#{index + 1}</span>
              <input
                type="number"
                inputMode="decimal"
                min={0.01}
                max={20}
                step={0.01}
                placeholder="距離 km"
                aria-label={`実測${index + 1} 距離（km）`}
                value={point.distanceKm ?? ""}
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/40"
                onChange={(event) => updateMeasured(point.id, "distanceKm", event.target.value)}
              />
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                placeholder="損失 dB"
                aria-label={`実測${index + 1} 経路損失（dB）`}
                value={point.lossDb ?? ""}
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/40"
                onChange={(event) => updateMeasured(point.id, "lossDb", event.target.value)}
              />
              <button
                type="button"
                aria-label={`実測${index + 1}を削除`}
                disabled={measuredPoints.length <= 1}
                onClick={() => removeMeasured(point.id)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 aria-hidden className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addMeasured}
          disabled={measuredPoints.length >= MAX_MEASURED_POINTS}
          className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-staf/40 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus aria-hidden className="h-3.5 w-3.5" /> 実測点を追加（{measuredPoints.length}/{MAX_MEASURED_POINTS}）
        </button>
        {measuredOutOfRange > 0 ? (
          <p className="mt-2 text-xs font-medium text-amber-700">
            {measuredOutOfRange}点が表示範囲（10m〜20km）外のため、グラフには重ねていません。
          </p>
        ) : null}
      </Card>

      {/* 距離スイープのグラフ */}
      <PropagationModelComparisonChart
        models={chartModels}
        params={{ frequencyMHz, txHeightM, rxHeightM, area, pathLossExponent }}
        currentDistanceKm={distanceKm}
        measured={chartMeasured}
        flooredByFspl={flooredByFspl}
      />

      {/* 書き出し */}
      <div className="no-print">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-staf"
          >
            {copyState === "copied" ? (
              <Check aria-hidden className="h-4 w-4" />
            ) : (
              <Copy aria-hidden className="h-4 w-4" />
            )}
            {copyState === "copied" ? "コピーしました" : "結果をコピー（ChatGPT等で分析）"}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-staf/40"
          >
            <Printer aria-hidden className="h-4 w-4" /> PDFで印刷・保存
          </button>
        </div>
        <p role="status" aria-live="polite" className="sr-only">
          {copyState === "copied"
            ? "結果をコピーしました"
            : copyState === "error"
              ? "コピーに失敗しました"
              : ""}
        </p>
        {copyState === "error" ? (
          <p className="mt-2 text-xs font-medium text-rose-700">
            コピーできませんでした。お手数ですが結果のテキストを手動で選択してコピーしてください。
          </p>
        ) : null}
      </div>

      <Callout tone="caution" size="md" icon={<AlertTriangle aria-hidden className="h-4 w-4" />}>
        <p className="text-xs leading-relaxed">
          いずれのモデルも中央値・基準値の概算です。実際の損失は建物配置、地形、屋内侵入、マルチパス、筐体・設置条件で変動します。
          通信可否の判断には、リンクバジェット計算機で環境損失・端末近傍損失・実測補正を併用してください。
        </p>
      </Callout>
    </Card>
  );
}

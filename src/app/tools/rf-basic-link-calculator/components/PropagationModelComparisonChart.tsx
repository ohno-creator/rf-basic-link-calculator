"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts";
import { chartTheme } from "@/lib/chartTheme";
import { SPEED_OF_LIGHT_M_PER_S } from "@/lib/rf/frequency";
import {
  type GeometricPropagationModel,
  type PropagationLossParams,
  calculatePropagationLossCurveDb,
  twoRayBreakpointM
} from "@/lib/rf/propagationLossModels";

type ModelMeta = {
  value: GeometricPropagationModel;
  label: string;
  color: string;
};

export type MeasuredChartPoint = {
  distanceKm: number;
  lossDb: number;
};

type PropagationModelComparisonChartProps = {
  models: ModelMeta[];
  params: Omit<PropagationLossParams, "distanceKm">;
  currentDistanceKm: number;
  measured?: MeasuredChartPoint[];
};

const MIN_DISTANCE_KM = 0.01;
const MAX_DISTANCE_KM = 20;
const DEFAULT_SAMPLE_COUNT = 180;
const TWO_RAY_SAMPLE_COUNT = 900;
const TWO_RAY_PHASE_SAMPLE_LIMIT = 1200;

function addDistanceKm(distances: Set<number>, distanceKm: number): void {
  if (Number.isFinite(distanceKm) && distanceKm >= MIN_DISTANCE_KM && distanceKm <= MAX_DISTANCE_KM) {
    distances.add(Number(distanceKm.toPrecision(8)));
  }
}

function twoRayPhaseRad(distanceKm: number, params: Omit<PropagationLossParams, "distanceKm">): number {
  const wavelengthM = SPEED_OF_LIGHT_M_PER_S / (params.frequencyMHz * 1_000_000);
  const distanceM = distanceKm * 1000;
  const directM = Math.hypot(distanceM, params.txHeightM - params.rxHeightM);
  const reflectedM = Math.hypot(distanceM, params.txHeightM + params.rxHeightM);
  return (2 * Math.PI * (reflectedM - directM)) / wavelengthM;
}

function addTwoRayPhaseSamplesKm(
  distances: Set<number>,
  params: Omit<PropagationLossParams, "distanceKm">
): void {
  if (params.frequencyMHz <= 0 || params.txHeightM <= 0 || params.rxHeightM <= 0) {
    return;
  }

  const phaseAtMin = twoRayPhaseRad(MIN_DISTANCE_KM, params);
  const phaseAtMax = twoRayPhaseRad(MAX_DISTANCE_KM, params);
  const phaseSpan = Math.abs(phaseAtMin - phaseAtMax);
  if (!Number.isFinite(phaseSpan) || phaseSpan <= 0) {
    return;
  }

  const cycles = phaseSpan / (2 * Math.PI);
  const count = Math.min(TWO_RAY_PHASE_SAMPLE_LIMIT, Math.ceil(cycles * 4));
  for (let index = 1; index < count; index += 1) {
    const targetPhase = phaseAtMin + ((phaseAtMax - phaseAtMin) * index) / count;
    let lowKm = MIN_DISTANCE_KM;
    let highKm = MAX_DISTANCE_KM;

    for (let step = 0; step < 32; step += 1) {
      const midKm = (lowKm + highKm) / 2;
      if (twoRayPhaseRad(midKm, params) > targetPhase) {
        lowKm = midKm;
      } else {
        highKm = midKm;
      }
    }

    addDistanceKm(distances, (lowKm + highKm) / 2);
  }
}

function buildDistanceSamplesKm(
  includeTwoRay: boolean,
  currentDistanceKm: number,
  measured: MeasuredChartPoint[],
  params: Omit<PropagationLossParams, "distanceKm">
) {
  const count = includeTwoRay ? TWO_RAY_SAMPLE_COUNT : DEFAULT_SAMPLE_COUNT;
  const logMin = Math.log10(MIN_DISTANCE_KM);
  const logMax = Math.log10(MAX_DISTANCE_KM);
  const distances = new Set<number>();

  for (let index = 0; index < count; index += 1) {
    const ratio = index / (count - 1);
    addDistanceKm(distances, 10 ** (logMin + (logMax - logMin) * ratio));
  }

  if (includeTwoRay) {
    addTwoRayPhaseSamplesKm(distances, params);
  }

  addDistanceKm(distances, currentDistanceKm);
  for (const point of measured) {
    addDistanceKm(distances, point.distanceKm);
  }

  return [...distances].sort((a, b) => a - b);
}

export function PropagationModelComparisonChart({
  models,
  params,
  currentDistanceKm,
  measured = []
}: PropagationModelComparisonChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const hasTwoRay = models.some((model) => model.value === "two_ray");
  const data = useMemo(() => {
    const distancesKm = buildDistanceSamplesKm(hasTwoRay, currentDistanceKm, measured, params);
    return distancesKm.map((distanceKm) => {
      const row: Record<string, number | null> = { d: distanceKm };
      for (const model of models) {
        try {
          const value = calculatePropagationLossCurveDb(model.value, { ...params, distanceKm });
          row[model.value] = Number.isFinite(value) ? Number(value.toFixed(1)) : null;
        } catch {
          row[model.value] = null;
        }
      }
      return row;
    });
  }, [currentDistanceKm, hasTwoRay, measured, models, params]);

  const measuredData = measured.map((point) => ({ d: point.distanceKm, loss: point.lossDb }));
  const twoRayBreakpointKm =
    hasTwoRay && params.frequencyMHz > 0 && params.txHeightM > 0 && params.rxHeightM > 0
      ? twoRayBreakpointM(params.frequencyMHz, params.txHeightM, params.rxHeightM) / 1000
      : null;

  return (
    <figure className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <figcaption className="text-sm font-semibold text-slate-950">距離で見るモデル別 伝搬損失</figcaption>
      <div className="mt-2 h-72 w-full" aria-label="距離に対する伝搬損失をモデル別に比較したグラフ">
        {isMounted && models.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288}>
            <ComposedChart data={data} margin={{ left: 6, right: 16, top: 12, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid.primary} />
              <XAxis
                dataKey="d"
                type="number"
                scale="log"
                domain={[MIN_DISTANCE_KM, MAX_DISTANCE_KM]}
                ticks={[0.01, 0.1, 1, 10]}
                tickFormatter={(value) => (value < 1 ? `${value * 1000}m` : `${value}km`)}
                tick={{ fontSize: chartTheme.axis.label.fontSize, fill: chartTheme.axis.label.fill }}
              />
              <YAxis
                unit="dB"
                tick={{ fontSize: chartTheme.axis.label.fontSize, fill: chartTheme.axis.label.fill }}
                domain={["dataMin - 6", "dataMax + 6"]}
              />
              <RechartsTooltip
                formatter={(value, name) => [`${value} dB`, name as string]}
                labelFormatter={(label) => `距離 ${Number(label) < 1 ? `${Number(label) * 1000}m` : `${label}km`}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {models.map((model) => (
                <Line
                  key={model.value}
                  type={model.value === "two_ray" ? "linear" : "monotone"}
                  dataKey={model.value}
                  name={model.value === "two_ray" ? `${model.label}（干渉込み）` : model.label}
                  stroke={model.color}
                  strokeWidth={chartTheme.stroke.series}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              ))}
              {measuredData.length > 0 ? (
                <Scatter
                  data={measuredData}
                  dataKey="loss"
                  name="実測値"
                  fill="#0f172a"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  isAnimationActive={false}
                />
              ) : null}
              {Number.isFinite(currentDistanceKm) && currentDistanceKm > 0 ? (
                <ReferenceLine
                  x={currentDistanceKm}
                  stroke="#0f172a"
                  strokeDasharray="5 4"
                  label={{ value: "現在距離", position: "top", fontSize: 11, fill: "#0f172a" }}
                />
              ) : null}
              {twoRayBreakpointKm !== null &&
              twoRayBreakpointKm >= MIN_DISTANCE_KM &&
              twoRayBreakpointKm <= MAX_DISTANCE_KM ? (
                <ReferenceLine
                  x={twoRayBreakpointKm}
                  stroke="#6366f1"
                  strokeDasharray="2 4"
                  label={{ value: "2波bp", position: "insideTopRight", fontSize: 11, fill: "#4f46e5" }}
                />
              ) : null}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg bg-white text-sm text-slate-500">
            {models.length === 0 ? "比較するモデルを1つ以上選んでください" : "グラフを読み込み中"}
          </div>
        )}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        縦の破線が現在の距離です。線が上にあるモデルほど損失が大きく（届きにくく）見積もります。
        {measuredData.length > 0 ? "黒点は入力した実測値です。実測に最も近い線が、その環境に合うモデルの目安になります。" : null}
        {hasTwoRay
          ? "2波モデルの線は直接波と地面反射波を位相込みで合成した干渉カーブです。現在距離の一覧値やリンク判定では、局所的な山谷をならした平滑化値を使います。"
          : null}
        Hata系は1〜20km、2波モデルはブレークポイント以遠が本来の適用範囲です。
      </p>
    </figure>
  );
}

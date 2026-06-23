"use client";

import { useEffect, useState } from "react";
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
import {
  type GeometricPropagationModel,
  type PropagationLossParams,
  calculatePropagationLossResult
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

const distancesKm = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 3, 5, 7, 10, 15, 20];

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

  const data = distancesKm.map((distanceKm) => {
    const row: Record<string, number | null> = { d: distanceKm };
    for (const model of models) {
      try {
        const value = calculatePropagationLossResult(model.value, { ...params, distanceKm }).pathLossDb;
        row[model.value] = Number.isFinite(value) ? Number(value.toFixed(1)) : null;
      } catch {
        row[model.value] = null;
      }
    }
    return row;
  });

  const measuredData = measured.map((point) => ({ d: point.distanceKm, loss: point.lossDb }));

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
                domain={[0.01, 20]}
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
                  type="monotone"
                  dataKey={model.value}
                  name={model.label}
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
        Hata系は1〜20km、2波モデルはブレークポイント以遠が本来の適用範囲です。
      </p>
    </figure>
  );
}

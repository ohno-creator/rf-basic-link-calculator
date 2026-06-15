"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts";
import { type AreaType, calculatePropagationLoss } from "@/lib/rf/propagation";

type PropagationCurveDiagramProps = {
  frequencyMHz: number;
  baseHeightM: number;
  mobileHeightM: number;
  distanceKm: number;
  area: AreaType;
};

const areaMeta: Array<{ key: AreaType; label: string; color: string }> = [
  { key: "urbanLarge", label: "市街地（大都市）", color: "#be123c" },
  { key: "urbanMedium", label: "市街地（中小都市）", color: "#ea580c" },
  { key: "suburban", label: "郊外", color: "#0071BD" },
  { key: "open", label: "開放地", color: "#047857" }
];

const distances = [0.5, 1, 2, 3, 4, 5, 7, 9, 12, 15, 20];

function safeLoss(
  base: Omit<Parameters<typeof calculatePropagationLoss>[0], "distanceKm" | "area">,
  distanceKm: number,
  area: AreaType
): number | null {
  try {
    return Number(calculatePropagationLoss({ ...base, distanceKm, area }).pathLossDb.toFixed(1));
  } catch {
    return null;
  }
}

export function PropagationCurveDiagram({
  frequencyMHz,
  baseHeightM,
  mobileHeightM,
  distanceKm,
  area
}: PropagationCurveDiagramProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const base = { frequencyMHz, baseHeightM, mobileHeightM };
  const data = distances.map((d) => {
    const row: Record<string, number | null> = { d };
    for (const meta of areaMeta) {
      row[meta.key] = safeLoss(base, d, meta.key);
    }
    return row;
  });

  const currentLoss = safeLoss(base, distanceKm, area);

  return (
    <figure className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <figcaption className="text-sm font-semibold text-slate-950">
        距離で見る伝搬損失（エリア別）
      </figcaption>
      <div className="mt-2 h-72 w-full" aria-label="距離に対する伝搬損失のグラフ">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288}>
            <LineChart data={data} margin={{ left: 6, right: 16, top: 12, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="d"
                type="number"
                scale="log"
                domain={[0.5, 20]}
                ticks={[0.5, 1, 2, 5, 10, 20]}
                tick={{ fontSize: 12, fill: "#64748B" }}
                unit="km"
              />
              <YAxis
                unit="dB"
                tick={{ fontSize: 12, fill: "#64748B" }}
                domain={["dataMin - 6", "dataMax + 6"]}
              />
              <RechartsTooltip
                formatter={(value, name) => [`${value} dB`, name as string]}
                labelFormatter={(label) => `距離 ${label} km`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {areaMeta.map((meta) => {
                const active = meta.key === area;
                return (
                  <Line
                    key={meta.key}
                    type="monotone"
                    dataKey={meta.key}
                    name={meta.label}
                    stroke={meta.color}
                    strokeWidth={active ? 3 : 1.5}
                    strokeOpacity={active ? 1 : 0.4}
                    dot={false}
                    isAnimationActive={false}
                  />
                );
              })}
              {currentLoss !== null ? (
                <ReferenceDot
                  x={distanceKm}
                  y={currentLoss}
                  r={6}
                  fill="#0f172a"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg bg-white text-sm text-slate-500">
            グラフを読み込み中
          </div>
        )}
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        実環境の損失は、自由空間損失に建物や地形の影響を足したものです。市街地ほど損失が大きく、開放地ほど小さくなります。黒点が現在の条件です。距離が伸びるほど損失は対数的に増えます。
      </p>
    </figure>
  );
}

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
import type { ReferenceCable } from "@/data/coaxCables";
import type { LossPoint } from "@/lib/rf/coax";

type CableLossCurveDiagramProps = {
  partNumber: string;
  points: LossPoint[];
  frequencyMHz: number;
  currentLossDb: number;
  referenceCables: ReferenceCable[];
};

export function CableLossCurveDiagram({
  partNumber,
  points,
  frequencyMHz,
  currentLossDb,
  referenceCables
}: CableLossCurveDiagramProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 選択品番と参考ケーブルは同じ周波数点を共有するので、周波数ごとに一行へまとめる。
  const data = points.map((point, index) => {
    const row: Record<string, number> = { f: point.freqMHz, selected: point.lossDb };
    referenceCables.forEach((cable, cableIndex) => {
      row[`ref${cableIndex}`] = cable.points[index]?.lossDb ?? Number.NaN;
    });
    return row;
  });

  return (
    <figure className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <figcaption className="text-sm font-semibold text-slate-950">
        ロス比較（{partNumber} 実測 ＋ 一般的なケーブル参考）
      </figcaption>
      <div className="mt-2 h-72 w-full" aria-label="周波数に対するケーブル損失の比較グラフ">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288}>
            <LineChart data={data} margin={{ left: 4, right: 16, top: 12, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="f"
                type="number"
                scale="log"
                domain={[300, 9000]}
                ticks={[500, 1000, 2000, 4000, 8000]}
                tick={{ fontSize: 12, fill: "#64748B" }}
                unit="MHz"
              />
              <YAxis unit="dB" tick={{ fontSize: 12, fill: "#64748B" }} domain={[0, "dataMax + 1"]} />
              <RechartsTooltip
                formatter={(value, name) => [`${value} dB`, name as string]}
                labelFormatter={(label) => `${label} MHz`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {referenceCables.map((cable, index) => (
                <Line
                  key={cable.label}
                  type="monotone"
                  dataKey={`ref${index}`}
                  name={cable.label}
                  stroke={cable.color}
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
              <Line
                type="monotone"
                dataKey="selected"
                name={`${partNumber}（実測）`}
                stroke="#0071BD"
                strokeWidth={3}
                dot={{ r: 3, fill: "#0071BD" }}
                isAnimationActive={false}
              />
              <ReferenceDot
                x={frequencyMHz}
                y={currentLossDb}
                r={6}
                fill="#0f172a"
                stroke="#ffffff"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg bg-white text-sm text-slate-500">
            グラフを読み込み中
          </div>
        )}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        太い青線が選択品番の実測挿入損失（S12）、黒点が指定周波数の読み取り値です。点線は一般的なケーブルの参考カーブ（1m相当の目安）で、低損失な品番ほど参考線より下に位置します。この値はリンクバジェットの「ケーブル・コネクタ損失」に入れられます。
      </p>
    </figure>
  );
}

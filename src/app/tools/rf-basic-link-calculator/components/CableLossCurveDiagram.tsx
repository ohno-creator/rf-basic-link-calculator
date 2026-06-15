"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts";
import type { LossPoint } from "@/lib/rf/coax";

type CableLossCurveDiagramProps = {
  partNumber: string;
  points: LossPoint[];
  frequencyMHz: number;
  currentLossDb: number;
};

export function CableLossCurveDiagram({
  partNumber,
  points,
  frequencyMHz,
  currentLossDb
}: CableLossCurveDiagramProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const data = points.map((point) => ({ f: point.freqMHz, loss: point.lossDb }));

  return (
    <figure className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <figcaption className="text-sm font-semibold text-slate-950">
        実測ロス曲線（{partNumber}・1本あたり）
      </figcaption>
      <div className="mt-2 h-64 w-full" aria-label="周波数に対するケーブル損失の実測グラフ">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
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
              <YAxis
                unit="dB"
                tick={{ fontSize: 12, fill: "#64748B" }}
                domain={[0, "dataMax + 1"]}
              />
              <RechartsTooltip
                formatter={(value) => [`${value} dB`, "挿入損失"]}
                labelFormatter={(label) => `${label} MHz`}
              />
              <Line
                type="monotone"
                dataKey="loss"
                stroke="#0071BD"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#0071BD" }}
                isAnimationActive={false}
                name="実測損失"
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
        青線が実測の挿入損失（S12）、黒点が指定周波数での読み取り値です。測定点の間は補間しています。高周波ほど損失は増えます。この値はリンクバジェットの「ケーブル・コネクタ損失」に入れられます。
      </p>
    </figure>
  );
}

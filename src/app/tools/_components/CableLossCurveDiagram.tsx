"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Label,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts";
import { ChartFrame } from "@/components/ChartFrame";
import { chartTheme, rfActiveDot, rfGridProps, rfTickProps, rfTooltipProps } from "@/lib/chartTheme";
import type { ReferenceCable } from "@/data/coaxCables";
import type { LossPoint } from "@/lib/rf/coax";

type CableLossCurveDiagramProps = {
  partNumber: string;
  points: LossPoint[];
  frequencyMHz: number;
  currentLossDb: number;
  quantity: number;
  referenceCables: ReferenceCable[];
};

const X_DOMAIN_MIN = 300;
const X_DOMAIN_MAX = 9000;

export function CableLossCurveDiagram({
  partNumber,
  points,
  frequencyMHz,
  currentLossDb,
  quantity,
  referenceCables
}: CableLossCurveDiagramProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 指定周波数が軸範囲外でも黒点が消えないよう、x をドメイン内へクランプして端に表示する。
  const dotIsFinite = Number.isFinite(frequencyMHz);
  const dotX = dotIsFinite ? Math.min(Math.max(frequencyMHz, X_DOMAIN_MIN), X_DOMAIN_MAX) : Number.NaN;
  const dotIsClamped = dotIsFinite && dotX !== frequencyMHz;
  const showTotalLine = Number.isFinite(quantity) && quantity > 1;

  // 選択品番と参考ケーブルは同じ周波数点を共有するので、周波数(freqMHz)で突き合わせて一行へまとめる。
  const data = points.map((point) => {
    const row: Record<string, number> = { f: point.freqMHz, selected: point.lossDb };
    if (showTotalLine) {
      row.total = point.lossDb * quantity;
    }
    referenceCables.forEach((cable, cableIndex) => {
      const match = cable.points.find((refPoint) => refPoint.freqMHz === point.freqMHz);
      row[`ref${cableIndex}`] = match?.lossDb ?? Number.NaN;
    });
    return row;
  });

  return (
    <ChartFrame
      title={`ロス比較（${partNumber} 実測 ＋ 一般的なケーブル参考）`}
      description="カーブ・黒点は1本あたりの損失です。"
      variant="slate"
      padding="md"
      exportName="coax-loss-curve"
    >
      <div className="h-72 w-full" aria-label="周波数に対するケーブル損失の比較グラフ">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288}>
            <LineChart data={data} margin={{ left: 4, right: 16, top: 12, bottom: 4 }}>
              <CartesianGrid {...rfGridProps()} />
              <XAxis
                dataKey="f"
                type="number"
                scale="log"
                domain={[300, 9000]}
                ticks={[500, 1000, 2000, 4000, 8000]}
                tick={rfTickProps()}
                unit="MHz"
              />
              <YAxis unit="dB" tick={rfTickProps()} domain={[0, "dataMax + 1"]} />
              <RechartsTooltip
                {...rfTooltipProps()}
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
                name={`${partNumber}（1本あたり実測）`}
                stroke={chartTheme.series.source}
                strokeWidth={chartTheme.stroke.emphasis}
                dot={{ r: 3, fill: chartTheme.series.source }}
                activeDot={rfActiveDot(chartTheme.series.source)}
                isAnimationActive={false}
              />
              {showTotalLine ? (
                <Line
                  type="monotone"
                  dataKey="total"
                  name={`合計（${quantity}本）`}
                  stroke={chartTheme.series.source}
                  strokeWidth={2}
                  strokeDasharray="2 3"
                  dot={false}
                  isAnimationActive={false}
                />
              ) : null}
              {dotIsFinite ? (
                <ReferenceDot
                  x={dotX}
                  y={currentLossDb}
                  r={6}
                  fill="#0f172a"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {dotIsClamped ? (
                    <Label
                      value="範囲外（外挿）"
                      position={frequencyMHz < X_DOMAIN_MIN ? "right" : "left"}
                      fontSize={11}
                      fill="#b45309"
                    />
                  ) : null}
                </ReferenceDot>
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
        太い青線が選択品番の実測挿入損失（S12）、黒点が指定周波数の読み取り値です。グラフのカーブ・黒点はいずれも1本あたりの損失で、合計損失は「1本あたり × 本数」です（数値カードの合計値はこの図には反映されません）。
        {showTotalLine ? "本数が2本以上のときは、点線で合計損失カーブも重ねて表示します。" : null}
        点線（グレー／橙）は一般的なケーブルの参考カーブ（1m相当の目安）で、低損失な品番ほど参考線より下に位置します。指定周波数が軸範囲（{X_DOMAIN_MIN}〜{X_DOMAIN_MAX}MHz）の外側のときは、黒点を端にクランプして「範囲外（外挿）」と表示します。1本あたりの値はリンクバジェットの「ケーブル・コネクタ損失」に入れられます。
      </p>
    </ChartFrame>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts";
import { ChartFrame } from "@/components/ChartFrame";
import { chartTheme, rfGridProps, rfTickProps, rfTooltipProps } from "@/lib/chartTheme";
import { formatReachDistanceLabel, generateReachCurveData } from "@/lib/rf/chartData";
import type { LinkBudgetInput, LinkBudgetResult } from "@/lib/rf/linkBudget";

type ReachDistanceChartProps = {
  input: LinkBudgetInput;
  result: LinkBudgetResult;
  /** マージン0となる到達限界[m]（範囲内で届かないときは null）。 */
  maxReachM: number | null;
  /** 逆算で狙っている目標マージン[dB]（>0のとき水平参照線を描く）。 */
  targetMarginDb?: number;
};

function currentDistanceM(input: LinkBudgetInput): number {
  return input.distanceUnit === "km" ? input.distance * 1000 : input.distance;
}

export function ReachDistanceChart({ input, result, maxReachM, targetMarginDb = 0 }: ReachDistanceChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const data = generateReachCurveData(input, maxReachM);
  const currentM = currentDistanceM(input);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <ChartFrame
      title="距離とリンクマージンのグラフ"
      description="距離が伸びるほど余裕（リンクマージン）は下がります。0dBのラインを下回る手前が、通信が成立する到達限界の目安です。"
      aside={
        maxReachM ? (
          <span className="rounded-full bg-staf-light px-3 py-1 text-xs font-semibold text-staf-dark">
            到達限界: 約 {formatReachDistanceLabel(maxReachM)}
          </span>
        ) : null
      }
      exportName="reach-distance"
    >
      <div className="h-72 w-full" aria-label="距離とリンクマージンのグラフ">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288}>
            <LineChart data={data} margin={{ left: 6, right: 18, top: 12, bottom: 8 }}>
              <CartesianGrid {...rfGridProps()} />
              <XAxis
                dataKey="distanceM"
                type="number"
                scale="log"
                domain={["dataMin", "dataMax"]}
                tick={rfTickProps()}
                tickFormatter={(value: number) => formatReachDistanceLabel(value)}
              />
              <YAxis unit="dB" tick={rfTickProps()} domain={["auto", "auto"]} />
              <RechartsTooltip
                {...rfTooltipProps()}
                formatter={(value) => [`${value} dB`, "リンクマージン"]}
                labelFormatter={(label) => `距離 ${formatReachDistanceLabel(Number(label))}`}
              />
              {/* 通信可否ライン（0dB） */}
              <ReferenceLine
                y={0}
                stroke={chartTheme.reference.sensitivity}
                strokeDasharray={chartTheme.reference.sensitivityDash}
                label={{
                  value: "通信ライン 0dB",
                  position: "insideBottomRight",
                  fill: chartTheme.seriesText.loss,
                  fontSize: 12
                }}
              />
              {/* 逆算の目標マージン（0dB以外のとき） */}
              {targetMarginDb > 0 ? (
                <ReferenceLine
                  y={targetMarginDb}
                  stroke={chartTheme.reference.baseline}
                  strokeDasharray={chartTheme.reference.baselineDash}
                  label={{
                    value: `目標 ${targetMarginDb}dB`,
                    position: "insideTopRight",
                    fill: chartTheme.axis.label.fill,
                    fontSize: 12
                  }}
                />
              ) : null}
              {/* 到達限界（縦線） */}
              {maxReachM ? (
                <ReferenceLine
                  x={maxReachM}
                  stroke={chartTheme.series.total}
                  strokeDasharray="4 4"
                  label={{
                    value: "到達限界",
                    position: "top",
                    fill: chartTheme.seriesText.total,
                    fontSize: 12
                  }}
                />
              ) : null}
              <Line
                type="monotone"
                dataKey="linkMarginDb"
                stroke={chartTheme.series.source}
                strokeWidth={chartTheme.stroke.emphasis}
                dot={false}
                name="リンクマージン"
              />
              {/* 現在地点 */}
              <ReferenceDot
                x={currentM}
                y={Number(result.linkMarginDb.toFixed(2))}
                r={6}
                fill={chartTheme.series.source}
                stroke={chartTheme.surface.plain}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">
            グラフを読み込み中
          </div>
        )}
      </div>
    </ChartFrame>
  );
}

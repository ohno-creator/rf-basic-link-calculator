"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card } from "@/components/Card";
import { chartTheme, rfActiveDot, rfGridProps, rfTickProps, rfTooltipProps } from "@/lib/chartTheme";
import { generateDistancePowerData } from "@/lib/rf/chartData";
import type { LinkBudgetInput } from "@/lib/rf/linkBudget";

type DistancePowerChartProps = {
  input: LinkBudgetInput;
};

export function DistancePowerChart({ input }: DistancePowerChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const data = generateDistancePowerData(input);
  const current = data.find((point) => point.current);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Card as="section" padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-950">
            通信距離と受信電力のグラフ
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            距離が伸びるほど、受信機に届く電波は弱くなります。受信電力が受信感度のラインを下回ると、通信が不安定になる可能性があります。
          </p>
        </div>
        {current ? (
          <span className="rounded-full bg-staf-light px-3 py-1 text-xs font-semibold text-staf-dark">
            現在: {current.distanceLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-5 h-72 w-full" aria-label="距離と受信電力のグラフ">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288}>
            <LineChart data={data} margin={{ left: 6, right: 18, top: 12, bottom: 8 }}>
              <CartesianGrid {...rfGridProps()} />
              <XAxis dataKey="distanceLabel" tick={rfTickProps()} interval={0} />
              <YAxis unit="dBm" tick={rfTickProps()} domain={["dataMin - 12", "dataMax + 8"]} />
              <RechartsTooltip
                {...rfTooltipProps()}
                formatter={(value) => [`${value} dBm`, "受信電力"]}
                labelFormatter={(label) => `距離 ${label}`}
              />
              <ReferenceLine
                y={input.receiverSensitivityDbm}
                stroke={chartTheme.reference.sensitivity}
                strokeDasharray={chartTheme.reference.sensitivityDash}
                label={{
                  value: "受信感度",
                  position: "insideTopRight",
                  fill: chartTheme.seriesText.loss,
                  fontSize: 12
                }}
              />
              <Line
                type="monotone"
                dataKey="receivedPowerDbm"
                stroke={chartTheme.series.source}
                strokeWidth={chartTheme.stroke.emphasis}
                dot={(props) => {
                  const payload = props.payload as { current?: boolean };
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={payload.current ? 6 : 4}
                      fill={payload.current ? chartTheme.series.source : chartTheme.surface.plain}
                      stroke={chartTheme.series.source}
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={rfActiveDot(chartTheme.series.source)}
                name="受信電力"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">
            グラフを読み込み中
          </div>
        )}
      </div>
    </Card>
  );
}

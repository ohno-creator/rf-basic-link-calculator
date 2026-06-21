"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts";
import { calculateFsplDb } from "@/lib/rf/fspl";
import {
  calculatePropagationLossResult,
  twoRayBreakpointM,
  twoRayInterferencePathLossDb
} from "@/lib/rf/propagationLossModels";

type Slider = {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
};

function LabSlider({ id, label, unit, min, max, step, value, onChange }: Slider) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-slate-950">
          {label}
        </label>
        <span className="text-sm font-bold text-staf">
          {value}
          <span className="ml-0.5 text-xs font-medium text-slate-400">{unit}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        className="mt-2 w-full"
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

type TwoRayInterferenceLabProps = {
  frequencyMHz?: number;
  txHeightM?: number;
  rxHeightM?: number;
};

export function TwoRayInterferenceLab({
  frequencyMHz: syncedFrequencyMHz = 920,
  txHeightM: syncedTxHeightM = 30,
  rxHeightM: syncedRxHeightM = 1.5
}: TwoRayInterferenceLabProps) {
  const [frequencyMHz, setFrequencyMHz] = useState(syncedFrequencyMHz);
  const [txHeightM, setTxHeightM] = useState(syncedTxHeightM);
  const [rxHeightM, setRxHeightM] = useState(syncedRxHeightM);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  useEffect(() => {
    setFrequencyMHz(syncedFrequencyMHz);
    setTxHeightM(syncedTxHeightM);
    setRxHeightM(syncedRxHeightM);
  }, [syncedFrequencyMHz, syncedTxHeightM, syncedRxHeightM]);

  const breakpointM = twoRayBreakpointM(frequencyMHz, txHeightM, rxHeightM);

  const data = useMemo(() => {
    const minM = 5;
    const maxM = Math.min(8000, Math.max(400, breakpointM * 4));
    const count = 260;
    return Array.from({ length: count }, (_, index) => {
      const distanceM = minM + ((maxM - minM) * index) / (count - 1);
      const distanceKm = distanceM / 1000;
      const fspl = calculateFsplDb(frequencyMHz, distanceKm);
      const envelope = calculatePropagationLossResult("two_ray", {
        frequencyMHz,
        distanceKm,
        txHeightM,
        rxHeightM,
        area: "urbanMedium",
        pathLossExponent: 3
      }).pathLossDb;
      const full = twoRayInterferencePathLossDb(frequencyMHz, distanceKm, txHeightM, rxHeightM);
      return {
        d: distanceM,
        fspl: Number(fspl.toFixed(2)),
        envelope: Number(envelope.toFixed(2)),
        full: Number(full.toFixed(2))
      };
    });
  }, [frequencyMHz, txHeightM, rxHeightM, breakpointM]);

  const formatDistance = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${Math.round(m)}m`);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-bold text-slate-950">2波モデル実験室：干渉で波打つ様子を見る</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">
        直接波と地面反射波を位相込みで合成（コヒーレント和）した「完全版」と、リンクバジェットで使う「平滑化した包絡線」、基準の「自由空間損失」を重ねています。
        スライダーを動かすと、強め合い（最大 +6dB のピーク）と弱め合い（深い谷＝ヌル）が交互に現れる山谷が変化します。
      </p>
      <details className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <summary className="cursor-pointer text-xs font-bold text-slate-800">
          このグラフの前提と読み方
        </summary>
        <div className="mt-2 space-y-2 text-xs leading-relaxed text-slate-600">
          <p>
            オレンジ線は、直接波と地面で反射した波を位相つきで足し合わせたものです。ここでは低仰角の簡略値として反射係数 Γ=-1 を使っています。距離が少し変わるだけで、波が強め合う場所と打ち消し合う場所が入れ替わります。
          </p>
          <p>
            実際の地面は完全反射ではないため、谷の深さは地面材質、偏波、アンテナ指向性、周辺物で変わります。リンクバジェットでは一点の深い谷を過信せず、青の平滑化線と端末近傍損失・実測補正を併用します。
          </p>
        </div>
      </details>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <LabSlider id="lab-freq" label="周波数" unit="MHz" min={400} max={5000} step={10} value={frequencyMHz} onChange={setFrequencyMHz} />
        <LabSlider id="lab-ht" label="送信高 ht" unit="m" min={1} max={60} step={0.5} value={txHeightM} onChange={setTxHeightM} />
        <LabSlider id="lab-hr" label="受信高 hr" unit="m" min={0.5} max={20} step={0.5} value={rxHeightM} onChange={setRxHeightM} />
      </div>

      <div className="mt-3 h-72 w-full" aria-label="2波モデルの干渉による伝搬損失グラフ">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288}>
            <LineChart data={data} margin={{ left: 6, right: 16, top: 12, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="d"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={formatDistance}
                tick={{ fontSize: 12, fill: "#64748B" }}
              />
              <YAxis
                unit="dB"
                reversed
                tick={{ fontSize: 12, fill: "#64748B" }}
                domain={["dataMin - 4", "dataMax + 4"]}
              />
              <RechartsTooltip
                formatter={(value, name) => [`${value} dB`, name as string]}
                labelFormatter={(label) => `距離 ${formatDistance(Number(label))}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="full" name="2波（干渉・完全版）" stroke="#ea580c" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="envelope" name="2波（平滑化・包絡線）" stroke="#0071BD" strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="fspl" name="自由空間損失" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="2 4" dot={false} isAnimationActive={false} />
              <ReferenceLine
                x={breakpointM}
                stroke="#0f172a"
                strokeDasharray="4 4"
                label={{ value: `ブレークポイント ${formatDistance(breakpointM)}`, position: "top", fontSize: 11, fill: "#0f172a" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">
            グラフを読み込み中
          </div>
        )}
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        縦軸は上ほど損失が小さい（届きやすい）向きです。<span className="font-semibold text-orange-700">オレンジの完全版</span>は山谷を持ち、
        <span className="font-semibold text-staf">破線の平滑化線</span>は一点の山谷をならしたリンク判定用の近似です。
        点線の縦線（ブレークポイント d_bp = 4·ht·hr/λ）付近から、平均的には 40·log10(d) の2波遠方近似へ寄っていきます。
        実機ではアンテナを少し動かすと数dB〜十数dB変わるのは、この干渉の谷を踏むためです。
      </p>
    </div>
  );
}

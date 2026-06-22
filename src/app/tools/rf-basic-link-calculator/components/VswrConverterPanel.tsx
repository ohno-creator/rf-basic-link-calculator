"use client";

import { useMemo, useState } from "react";
import { Stat } from "@/components/Stat";
import { Tooltip } from "@/components/Tooltip";
import { formatNumber } from "@/lib/rf/format";
import { convertVswr, type VswrSourceKind } from "@/lib/rf/vswr";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { VswrStandingWaveDiagram } from "./VswrStandingWaveDiagram";

const modes: Array<{ id: VswrSourceKind; label: string; unit: string; placeholder: number }> = [
  { id: "vswr", label: "VSWR", unit: "", placeholder: 1.5 },
  { id: "returnLoss", label: "リターンロス", unit: "dB", placeholder: 14 },
  { id: "reflection", label: "反射係数 Γ", unit: "", placeholder: 0.2 }
];

function formatInfinite(value: number, digits: number): string {
  return Number.isFinite(value) ? formatNumber(value, digits) : "∞";
}

export function VswrConverterPanel() {
  const [mode, setMode] = useState<VswrSourceKind>("vswr");
  const [value, setValue] = useState(1.5);

  // モード切替時は前モードの値を引き継がず、新モードの代表値へリセットする。
  // これにより VSWR=1.5 のまま「反射係数Γ」に切り替えて即エラーになる事故を防ぐ。
  const handleModeChange = (nextMode: VswrSourceKind) => {
    setMode(nextMode);
    const nextPlaceholder = modes.find((item) => item.id === nextMode)?.placeholder;
    if (nextPlaceholder !== undefined) {
      setValue(nextPlaceholder);
    }
  };

  const computation = useMemo(() => {
    try {
      return { result: convertVswr(mode, value), error: null as string | null };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "VSWRは1以上、反射係数は0以上1未満、リターンロスは0以上のdBで入力してください。";
      return { result: null, error: message };
    }
  }, [mode, value]);

  const result = computation.result;
  const activeMode = modes.find((item) => item.id === mode);

  return (
    <section className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-card">
      <h3 className="text-lg font-bold text-slate-950">VSWR・リターンロス変換</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        アンテナや線路の整合の良さを表す指標を相互変換します。どれか1つを入力してください。
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-950">
          指標の値{activeMode?.unit ? `（${activeMode.unit}）` : ""}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Tooltip term="数値入力">
            選択中の指標の値を入力します。VSWRは1以上（1.0が完全整合）、リターンロスは0以上のdB（大きいほど良好／14dBが目安）、反射係数Γは0以上1未満です。
          </Tooltip>
          <Tooltip term="入力する指標">
            どの指標で入力するかを選択します。3指標は相互に換算可能で、手元の測定値や仕様書の記載に合わせて選んでください。残り2指標は自動算出されます。
          </Tooltip>
        </div>
      </div>

      <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_140px]">
        <input
          type="number"
          step={mode === "reflection" ? 0.01 : 0.1}
          value={Number.isFinite(value) ? value : ""}
          placeholder={activeMode ? String(activeMode.placeholder) : undefined}
          aria-label={`${activeMode?.label}の入力`}
          aria-invalid={!result}
          className="h-11 rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 placeholder:font-normal placeholder:text-slate-400 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
          onChange={(event) => setValue(event.target.value === "" ? Number.NaN : Number(event.target.value))}
        />
        <select
          value={mode}
          aria-label="入力する指標"
          className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
          onChange={(event) => handleModeChange(event.target.value as VswrSourceKind)}
        >
          {modes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
              {item.unit ? `（${item.unit}）` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">各指標の説明：</span>
        <Tooltip term="VSWR">
          電圧定在波比（Vmax/Vmin）。1.0で完全整合、値が大きいほど不整合です。アンテナ仕様で一般的。代表値1.5（良好）〜2.0（許容上限の目安）。
        </Tooltip>
        <Tooltip term="リターンロス">
          戻ってくる反射波の小ささをdBで表します。値が大きいほど整合良好です。VSWR1.5≒14dB、2.0≒9.5dB。ネットアナ測定値で多用されます。
        </Tooltip>
        <Tooltip term="反射係数 Γ">
          入射波に対する反射波の電圧比。0＝無反射（完全整合）、1＝全反射。0以上1未満で入力します。Γ²が反射電力割合になります。代表値0.2。
        </Tooltip>
      </div>

      {result ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-staf-light p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-staf-dark">VSWR</p>
              <Tooltip term="VSWR">
                算出されたVSWR（Vmax/Vmin）。1に近いほど整合が良い状態です。Γ=1（全反射）では∞表示になります。
              </Tooltip>
            </div>
            <Stat className="mt-1" value={formatInfinite(result.vswr, 2)} tone="neutral" size="md" />
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-slate-500">リターンロス</p>
              <Tooltip term="リターンロス">
                算出されたリターンロス -20log10(Γ)。大きいほど整合良好です。完全整合（Γ=0）では∞dBになります。
              </Tooltip>
            </div>
            <Stat className="mt-1" value={formatInfinite(result.returnLossDb, 1)} unit="dB" tone="staf" size="md" />
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-slate-500">反射係数 Γ</p>
              <Tooltip term="反射係数 Γ">
                算出された反射係数。0＝無反射、1に近いほど反射大。VSWR・リターンロスの基準量です。
              </Tooltip>
            </div>
            <Stat className="mt-1" value={formatNumber(result.reflectionCoefficient, 3)} tone="staf" size="md" />
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-slate-500">反射電力</p>
              <Tooltip term="反射電力">
                送信電力のうち負荷で反射して戻る割合 Γ²×100。小さいほど効率的です。例：Γ=0.2で4%。残りが負荷へ伝わる電力です。
              </Tooltip>
            </div>
            <Stat className="mt-1" value={formatNumber(result.reflectedPowerPercent, 1)} unit="%" tone="staf" size="md" />
          </div>
          <div className="rounded-lg bg-slate-50 p-4 sm:col-span-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-slate-500">ミスマッチ損失（整合損失）</p>
              <Tooltip term="ミスマッチ損失">
                不整合により負荷へ伝わらず失われる電力 -10log10(1−Γ²)。小さいほど良好で、リンクバジェットへ直接効きます。完全整合（Γ=0）では0dB、全反射（Γ=1）では∞dB。
              </Tooltip>
            </div>
            <Stat className="mt-1" value={formatInfinite(result.mismatchLossDb, 2)} unit="dB" tone="staf" size="md" />
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm font-medium text-rose-700">{computation.error}</p>
      )}

      {result ? (
        <div className="mt-5">
          <VswrStandingWaveDiagram
            reflection={result.reflectionCoefficient}
            vswr={result.vswr}
            reflectedPowerPercent={result.reflectedPowerPercent}
            mismatchLossDb={result.mismatchLossDb}
          />
        </div>
      ) : null}

      <div className="mt-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-950">数式と整合の読み方</span>
          <Tooltip term="指標の意味を見る">
            VSWR・リターンロス・反射電力の変換式と、整合の良し悪しの読み方を展開表示します。VSWRは小さいほど良く、リターンロスは大きいほど良好です。
          </Tooltip>
        </div>
        <FormulaExplanationCard
          title="指標の意味を見る"
          formula={"VSWR = (1 + Γ) / (1 - Γ)\nリターンロス[dB] = -20 log10(Γ)\n反射電力[%] = Γ² × 100"}
        >
          <p>
            VSWRが1に近いほど、リターンロスが大きいほど整合が良い状態です。VSWR
            1.5でリターンロスは約14dB、VSWR 2.0で約9.5dBが目安です。反射が大きいと送信電力の一部が戻り、通信効率が下がります。
          </p>
        </FormulaExplanationCard>
      </div>
    </section>
  );
}

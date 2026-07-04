"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { Tooltip } from "@/components/Tooltip";
import { dbmToW, wToDbm } from "@/lib/rf/antenna";
import { formatNumber } from "@/lib/rf/format";
import { convertVswr, type VswrSourceKind } from "@/lib/rf/vswr";
import { rfErrorMessage } from "@/lib/rfErrorMessages";
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
  const [inputPowerDbm, setInputPowerDbm] = useState(20);

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
      const message = rfErrorMessage(
        error,
        "VSWRは1以上、反射係数は0以上1未満、リターンロスは0以上のdBで入力してください。"
      );
      return { result: null, error: message };
    }
  }, [mode, value]);

  const result = computation.result;
  const activeMode = modes.find((item) => item.id === mode);
  const powerFlow = useMemo(() => {
    if (!result) {
      return null;
    }
    const inputPowerW = dbmToW(inputPowerDbm);
    const reflectedRatio = result.reflectionCoefficient ** 2;
    const acceptedRatio = Math.max(0, 1 - reflectedRatio);
    const reflectedW = inputPowerW * reflectedRatio;
    const acceptedW = inputPowerW * acceptedRatio;
    return {
      inputPowerW,
      reflectedW,
      acceptedW,
      acceptedDbm: acceptedW > 0 ? wToDbm(acceptedW) : Number.NEGATIVE_INFINITY,
      reflectedDbm: reflectedW > 0 ? wToDbm(reflectedW) : Number.NEGATIVE_INFINITY,
      acceptedPercent: acceptedRatio * 100
    };
  }, [inputPowerDbm, result]);

  return (
    <Card as="section" padding="lg" className="flex flex-col">
      <h3 className="text-lg font-bold text-slate-950">VSWR・リターンロス変換</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        アンテナや線路の整合の良さを表す指標を相互変換します。どれか1つを入力してください。
      </p>

      <div className="mt-4">
        <Field
          id="vswrInput"
          label={`指標の値${activeMode?.unit ? `（${activeMode.unit}）` : ""}`}
          help="選択中の指標の値を入力します。VSWRは1以上（1.0が完全整合）、リターンロスは0以上のdB（大きいほど良好／14dBが目安）、反射係数Γは0以上1未満です。どの指標で入力するかを選択します。3指標は相互に換算可能で、手元の測定値や仕様書の記載に合わせて選んでください。残り2指標は自動算出されます。"
          unitSelect={{
            value: mode,
            options: modes.map((item) => ({
              value: item.id,
              label: `${item.label}${item.unit ? `（${item.unit}）` : ""}`
            })),
            ariaLabel: "入力する指標",
            onChange: (next) => handleModeChange(next as VswrSourceKind)
          }}
          value={value}
          onChange={(v) => setValue(v)}
          step={mode === "reflection" ? 0.01 : 0.1}
          example={activeMode ? String(activeMode.placeholder) : undefined}
          error={computation.error ?? undefined}
          emptyBehavior="invalid"
        />
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
          <MetricCard
            label="VSWR"
            value={formatInfinite(result.vswr, 2)}
            tone="neutral"
            hint="算出されたVSWR（Vmax/Vmin）。1に近いほど整合が良い状態です。Γ=1（全反射）では∞表示になります。"
          />
          <MetricCard
            label="リターンロス"
            value={formatInfinite(result.returnLossDb, 1)}
            unit="dB"
            tone="neutral"
            hint="算出されたリターンロス -20log10(Γ)。大きいほど整合良好です。完全整合（Γ=0）では∞dBになります。"
          />
          <MetricCard
            label="反射係数 Γ"
            value={formatNumber(result.reflectionCoefficient, 3)}
            tone="neutral"
            hint="算出された反射係数。0＝無反射、1に近いほど反射大。VSWR・リターンロスの基準量です。"
          />
          <MetricCard
            label="反射電力"
            value={formatNumber(result.reflectedPowerPercent, 1)}
            unit="%"
            tone="neutral"
            hint="送信電力のうち負荷で反射して戻る割合 Γ²×100。小さいほど効率的です。例：Γ=0.2で4%。残りが負荷へ伝わる電力です。"
          />
          <div className="sm:col-span-2">
            <MetricCard
              label="ミスマッチ損失（整合損失）"
              value={formatInfinite(result.mismatchLossDb, 2)}
              unit="dB"
              tone="neutral"
              hint="不整合により負荷へ伝わらず失われる電力 -10log10(1−Γ²)。小さいほど良好で、リンクバジェットへ直接効きます。完全整合（Γ=0）では0dB、全反射（Γ=1）では∞dB。"
            />
          </div>
        </div>
      ) : null}

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

      {result && powerFlow ? (
        <div className="mt-5 rounded-lg border border-staf/20 bg-staf-light p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-950">
                入力電力から見る反射・受け入れ電力
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                VSWRの値を、送信電力の何mWが戻るか、アンテナへ何mW入るかに換算します。
              </p>
            </div>
            <Tooltip term="受け入れ電力">
              ここではアンテナ端子へ入る電力 = 入力電力 × (1-Γ²) として計算します。実際に放射される電力は、さらにアンテナ効率や導体損・誘電体損に左右されます。
            </Tooltip>
          </div>
          <div className="mt-3 grid gap-4 lg:grid-cols-[220px_1fr]">
            <Field
              id="vswrInputPower"
              label="入力電力"
              unit="dBm"
              value={inputPowerDbm}
              step={0.5}
              onChange={setInputPowerDbm}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard
                label="アンテナへ入る電力"
                value={Number.isFinite(powerFlow.acceptedDbm) ? formatNumber(powerFlow.acceptedDbm, 1) : "-∞"}
                unit="dBm"
                tone="neutral"
                size="sm"
                sub={`${formatNumber(powerFlow.acceptedW * 1000, 1)} mW / ${formatNumber(powerFlow.acceptedPercent, 1)}%`}
              />
              <MetricCard
                label="反射して戻る電力"
                value={Number.isFinite(powerFlow.reflectedDbm) ? formatNumber(powerFlow.reflectedDbm, 1) : "-∞"}
                unit="dBm"
                tone="neutral"
                size="sm"
                sub={`${formatNumber(powerFlow.reflectedW * 1000, 1)} mW`}
              />
              <MetricCard
                label="整合で失う量"
                value={formatInfinite(result.mismatchLossDb, 2)}
                unit="dB"
                tone="neutral"
                size="sm"
                sub="リンクバジェットへ入れられる損失"
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h4 className="text-sm font-semibold text-slate-950">使い方チュートリアル</h4>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <ol className="space-y-2 text-sm leading-relaxed text-slate-700">
            <li>
              <span className="font-semibold text-staf-dark">1.</span> 仕様書や測定器に合わせて、VSWR・リターンロス・Γのどれで入力するか選びます。
            </li>
            <li>
              <span className="font-semibold text-staf-dark">2.</span> 反射電力%とミスマッチ損失を見て、リンクバジェットへ入れるべき損失感を掴みます。
            </li>
            <li>
              <span className="font-semibold text-staf-dark">3.</span> 入力電力を実機の送信電力に合わせ、何mWが戻るかを確認します。
            </li>
          </ol>
          <dl className="grid gap-2 text-xs leading-relaxed text-slate-600">
            <div>
              <dt className="font-semibold text-slate-900">VSWR</dt>
              <dd>定在波比です。1.0が完全整合で、値が大きいほど反射が増えます。</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">リターンロス</dt>
              <dd>反射の小ささをdBで表します。大きいほど整合が良い指標です。</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">ミスマッチ損失</dt>
              <dd>反射により負荷へ入らない電力をdBで表したものです。放射効率とは別の損失です。</dd>
            </div>
          </dl>
        </div>
      </div>

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
    </Card>
  );
}

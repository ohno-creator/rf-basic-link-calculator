"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Callout } from "@/components/Callout";
import { Card, StateCard } from "@/components/Card";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Badge } from "@/components/Badge";
import { HelpHint as FieldHint } from "@/components/HelpHint";
import { NumberField } from "@/components/NumberField";
import { Stat } from "@/components/Stat";
import { Check, Copy, Download, Info, Settings2, Signal, Sparkles } from "lucide-react";
import {
  GLASS_TYPES,
  HEATMAP_MODES,
  NAMI_GATE_SPEC,
  buildProposalSummary,
  calculateSimulation,
  defaultNamiGateInput,
  normalizeNamiGateInput,
  signed,
  toCsv,
  type GlassType,
  type HeatmapMode,
  type NamiGateInput
} from "@/lib/rf/namiGate";
import { NamiGateHeatmap } from "./NamiGateHeatmap";
import { NamiIncidenceDiagram } from "./NamiIncidenceDiagram";

const selectClass =
  "mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base font-semibold text-slate-950 outline-none transition focus:border-staf/70 focus:ring-2 focus:ring-staf/40";

const evalToneText: Record<string, string> = {
  success: "text-emerald-800",
  info: "text-sky-800",
  caution: "text-amber-800",
  warning: "text-orange-800"
};

export function NamiGateClient() {
  const [input, setInput] = useState<NamiGateInput>(defaultNamiGateInput);
  const [mode, setMode] = useState<HeatmapMode>("on");
  const [copied, setCopied] = useState(false);

  // スライダー操作の即応性を保ちつつ、816セルの再計算は最新フレームに遅延させる。
  // 結果表示（ヒートマップ・サマリ・コピー）は計算と同じ正規化後の safeInput で揃え、
  // 入力途中の一時的な不正値（空欄=0など）で条件表示と計算結果が食い違わないようにする。
  const deferredInput = useDeferredValue(input);
  const safeInput = useMemo(() => normalizeNamiGateInput(deferredInput), [deferredInput]);
  const sim = useMemo(() => calculateSimulation(safeInput), [safeInput]);
  const evaluation = sim.evaluation;
  const deferredGlass = GLASS_TYPES.find((g) => g.id === safeInput.glassType);

  const update = <K extends keyof NamiGateInput>(key: K, value: NamiGateInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));



  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildProposalSummary(safeInput, sim));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleCsv = () => {
    const blob = new Blob([toCsv(sim, mode)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nami-gate-${mode}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 入力条件 */}
        <Card as="section" padding="lg" className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-950">
            <Signal aria-hidden="true" className="h-5 w-5 text-staf-dark" />
            入力条件
          </h2>

          <NumberField
            id="nami-frequency"
            label="周波数（GHz）"
            help="ローカル5G（4.7〜4.9GHz帯）やWi-Fi 5GHzを想定。周波数帯ごとにナミゲートの基準利得が変わります。"
            unit="GHz"
            value={input.frequencyGHz}
            min={4.6}
            max={5.2}
            step={0.1}
            showSlider
            onChange={(value) => update("frequencyGHz", value)}
          />

          <NumberField
            id="nami-angle"
            label="電波の入射角（°）"
            help="窓面の法線に対する電波の入射角です。0°が正面。角度が大きいほどガラス透過損失と指向性損失が増えます。"
            unit="°"
            value={input.incidentAngleDeg}
            min={-60}
            max={60}
            step={1}
            showSlider
            onChange={(value) => update("incidentAngleDeg", value)}
          />

          {/* 入射角の幾何を可視化（スライダー連動）。指定した方向へ室内ビームが steer される様子を示す。 */}
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <NamiIncidenceDiagram incidentAngleDeg={safeInput.incidentAngleDeg} />
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            入射角を変えると、下のヒートマップでも受信が強い領域が入射方向へ寄ります（ナミゲートが入射方向へ再放射するため）。
          </p>

          <label className="block" htmlFor="nami-glass">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
              ガラス種類
              <FieldHint text="窓ガラスの構造です。ガラス種類で絶対受信レベルは変わりますが、改善量は暫定モデル上は一定です。" />
            </span>
            <select
              id="nami-glass"
              className={selectClass}
              value={input.glassType}
              onChange={(event) => update("glassType", event.target.value as GlassType)}
            >
              {GLASS_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}（透過損失 約{option.lossDb}dB）
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              {GLASS_TYPES.find((g) => g.id === input.glassType)?.note}
            </p>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              id="nami-tx"
              label="送信電力"
              help="基地局アンテナのEIRP相当。"
              unit="dBm"
              value={input.txPowerDbm}
              min={-10}
              max={60}
              step={1}
              onChange={(value) => update("txPowerDbm", value)}
            />
            <NumberField
              id="nami-outdoor"
              label="屋外距離"
              help="基地局から窓面までのおおよその距離。"
              unit="m"
              value={input.outdoorDistanceM}
              min={1}
              max={2000}
              step={1}
              onChange={(value) => update("outdoorDistanceM", value)}
            />
            <NumberField
              id="nami-roomw"
              label="室内幅"
              help="窓面に平行な室内の幅。"
              unit="m"
              value={input.roomWidthM}
              min={1}
              max={30}
              step={0.5}
              onChange={(value) => update("roomWidthM", value)}
            />
            <NumberField
              id="nami-roomd"
              label="室内奥行"
              help="窓面から室内方向の奥行。"
              unit="m"
              value={input.roomDepthM}
              min={1}
              max={30}
              step={0.5}
              onChange={(value) => update("roomDepthM", value)}
            />
          </div>

          {/* 固定仕様＋導出値 */}
          <div className="slate">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
              <Settings2 aria-hidden="true" className="h-4 w-4 text-staf-dark" />
              ナミゲート仕様（固定）
            </div>
            <dl className="grid gap-1.5 text-sm">
              <SpecRow label="設置位置" value="窓面中央" />
              <SpecRow label="サイズ" value="30cm × 30cm" />
              <SpecRow label="開口効率" value={`${Math.round(NAMI_GATE_SPEC.apertureEfficiency * 100)}%`} />
              <SpecRow label="偏波損失" value={`${NAMI_GATE_SPEC.polarizationLossDb.toFixed(1)} dB`} />
              <SpecRow label="ガラス損失" value={`${sim.derived.glassLossDb.toFixed(1)} dB`} />
              <SpecRow label="周波数補正後の利得" value={`${sim.derived.namiGateGainDb.toFixed(1)} dB`} />
              <SpecRow label="入射角損失" value={`${sim.derived.angleLossDb.toFixed(1)} dB`} />
              <SpecRow label="屋外伝搬損失" value={`${sim.derived.outdoorLossDb.toFixed(1)} dB`} />
            </dl>
          </div>
        </Card>

        {/* 結果サマリー */}
        <Card as="section" variant="slate" padding="lg" className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-950">
            <Sparkles aria-hidden="true" className="h-5 w-5 text-staf-dark" />
            シミュレーション結果（設置あり）
          </h2>

          {/* 判定 */}
          <StateCard data-testid="primary-result" tone={evaluation.tone} padding="md" className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge tone={evaluation.tone} size="sm">
                判定：{evaluation.label}
              </Badge>
            </div>
            <p className={`text-sm font-semibold leading-relaxed ${evalToneText[evaluation.tone] ?? "text-slate-800"}`}>
              {evaluation.detail}
            </p>
          </StateCard>

          {/* 主要指標 */}
          <div className="grid grid-cols-2 gap-3">
            <Card padding="md">
              <Stat label="平均受信電力" value={sim.onStats.avg.toFixed(1)} unit="dBm" size="sm" tone="staf" />
            </Card>
            <Card padding="md">
              <Stat label="最大受信電力" value={sim.onStats.max.toFixed(1)} unit="dBm" size="sm" tone="staf" />
            </Card>
            <Card padding="md">
              <Stat
                label="平均改善量"
                value={signed(sim.diffStats.avg)}
                unit="dB"
                size="sm"
                tone="emerald"
                note="OFF比"
              />
            </Card>
            <Card padding="md">
              <Stat
                label="最大改善量"
                value={signed(sim.diffStats.max)}
                unit="dB"
                size="sm"
                tone="emerald"
              />
            </Card>
          </div>

          {/* 書き出し */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-staf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
            >
              {copied ? <Check aria-hidden className="h-4 w-4" /> : <Copy aria-hidden className="h-4 w-4" />}
              {copied ? "コピーしました" : "提案用サマリをコピー"}
            </button>
            <button
              type="button"
              onClick={handleCsv}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-staf/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-staf/40"
            >
              <Download aria-hidden className="h-4 w-4" />
              CSV出力（{HEATMAP_MODES.find((m) => m.id === mode)?.short}）
            </button>
          </div>
          <p aria-live="polite" className="sr-only">
            {copied ? "提案用サマリをコピーしました" : ""}
          </p>
        </Card>
      </div>

      {/* ヒートマップ */}
      <Card as="section" padding="lg" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-950">室内受信電力ヒートマップ</h2>
            <p className="mt-1 text-sm text-slate-500">
              窓面（上辺）から室内へ広がる受信電力の分布を、設置前後・改善量で切り替えて確認できます。
            </p>
          </div>
          <SegmentedControl
            ariaLabel="ヒートマップの表示"
            options={HEATMAP_MODES}
            value={mode}
            onChange={setMode}
          />
        </div>

        <NamiGateHeatmap sim={sim} mode={mode} input={safeInput} />
      </Card>

      {/* 商用デモ用の説明文 */}
      <Card as="section" variant="slate" padding="lg" className="space-y-3 text-sm leading-relaxed text-slate-600">
        <h2 className="text-base font-bold text-slate-900">商用デモ用の説明</h2>
        <p>
          窓面中央に30cm×30cmのナミゲートを設置した場合の、屋外から入射する
          {safeInput.frequencyGHz.toFixed(2)}GHz帯の電波が室内へ透過したときの受信電力分布を概算しています。
          現在の条件では、ガラスは「{deferredGlass?.label}」、入射角{safeInput.incidentAngleDeg}°、
          ナミゲートによる平均改善量は約 {signed(sim.diffStats.avg)}dB です。
        </p>
        <div className="sm">
          <p className="font-bold text-slate-900">計算式</p>
          <p className="mt-1">
            各セルの受信電力 = 送信電力 − 屋外伝搬損失 − ガラス損失 − 入射角損失 − 屋内スプレッド損失（窓面基準）
            ＋ ナミゲート利得 ＋ 指向性補正
          </p>
        </div>
      </Card>

      <Callout tone="caution" size="sm" icon={<Info className="h-4 w-4" />}>
        本シミュレーターは営業提案・概念説明用の概算ツールです。周波数ごとの利得テーブル・ガラス損失・各補正係数は
        暫定値（実測値差し替え前提）で、ヒートマップの色は固定dBmスケールでの相対比較、絶対値は未校正です。
        屋内側は窓面基準の相対伝搬で、反射・什器・人体遮蔽・実機アンテナ指向性・MIMOは含みません。
        最終判断には現地測定または電磁界解析による確認を推奨します。
      </Callout>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold tabular-nums text-slate-900">{value}</dd>
    </div>
  );
}

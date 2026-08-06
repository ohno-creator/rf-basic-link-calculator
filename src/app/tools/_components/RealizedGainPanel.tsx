"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { formatNumber, formatSigned } from "@/lib/rf/format";
import { realizedGain } from "@/lib/rf/realizedGain";
import { FormulaExplanationCard } from "./FormulaExplanationCard";

export function RealizedGainPanel() {
  const [directivityDbi, setDirectivityDbi] = useState(2.15);
  const [efficiencyPercent, setEfficiencyPercent] = useState(60);
  const [vswr, setVswr] = useState(2);

  const result = useMemo(() => {
    try {
      return realizedGain({ directivityDbi, efficiencyPercent, vswr });
    } catch {
      return null;
    }
  }, [directivityDbi, efficiencyPercent, vswr]);

  const directivityError = !Number.isFinite(directivityDbi) ? "指向性を数値で入力してください。" : undefined;
  const efficiencyError =
    !Number.isFinite(efficiencyPercent) || efficiencyPercent <= 0 || efficiencyPercent > 100
      ? "放射効率は0より大きく100以下（%）で入力してください。"
      : undefined;
  const vswrError = !Number.isFinite(vswr) || vswr < 1 ? "VSWRは1以上で入力してください。" : undefined;

  const primary = {
    label: "実現利得（放射効率・整合損込み）",
    value: result ? formatSigned(result.realizedGainDbi, "").trim() : "—",
    unit: "dBi"
  };

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <Card as="section" padding="lg">
          <h2 className="text-base font-bold text-slate-950">入力条件</h2>
          <div className="mt-4 space-y-4">
            <Field
              id="rgDirectivity"
              label="指向性 D"
              unit="dBi"
              value={directivityDbi}
              step={0.1}
              emptyBehavior="preserve"
              onChange={setDirectivityDbi}
              help="損失ゼロと仮定したときの方向性の鋭さ（理想利得）。半波長ダイポールは2.15dBi、微小アンテナは約1.76dBiが目安。"
              example="2.15"
              error={directivityError}
            />
            <Field
              id="rgEfficiency"
              label="放射効率 η"
              unit="%"
              value={efficiencyPercent}
              min={1}
              max={100}
              step={1}
              emptyBehavior="preserve"
              onChange={setEfficiencyPercent}
              help="投入電力のうち電波として放射される割合。小型・低姿勢アンテナや損失の多い基板では下がります。"
              example="60"
              error={efficiencyError}
            />
            <Field
              id="rgVswr"
              label="VSWR（入力整合）"
              value={vswr}
              min={1}
              step={0.1}
              emptyBehavior="preserve"
              onChange={setVswr}
              help="給電点の反射の度合い。1.0で無反射、値が大きいほど反射で失う電力が増えます。"
              example="2"
              error={vswrError}
            />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            データシートの「Gain」が実現利得（realized gain）か、放射効率のみ込みの利得（gain）かで数dB変わります。比較時は定義を揃えて読みましょう。
          </p>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div id="rg-primary-result">
            <ResultBar primary={primary} />
          </div>
          <Card as="section" padding="lg">
            <h2 className="text-base font-bold text-slate-950">内訳</h2>
            {result ? (
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">放射効率</dt>
                  <dd className="font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatNumber(efficiencyPercent, 0)}%（{formatSigned(result.efficiencyDb, "dB")}）
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">利得（指向性＋放射効率）</dt>
                  <dd className="font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatSigned(result.gainDbi, "dBi")}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">反射係数 |Γ| ／ 不整合損失</dt>
                  <dd className="font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatNumber(result.reflectionCoefficient, 3)} ／ −{formatNumber(result.mismatchLossDb, 2)}dB
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">総合効率</dt>
                  <dd className="font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatNumber(result.totalEfficiency * 100, 1)}%
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-md bg-staf-light/50 px-2 py-1">
                  <dt className="font-semibold text-staf-dark">実現利得</dt>
                  <dd className="font-bold text-slate-950" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatSigned(result.realizedGainDbi, "dBi")} ／ {formatSigned(result.realizedGainDbd, "dBd")}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-slate-500">入力値を確認してください。</p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              dBd は半波長ダイポール基準（dBi − 2.15）。円偏波アンテナで直線偏波の波を受けると、さらに約3dB（dBiC→実効）差し引かれます。
            </p>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <FormulaExplanationCard
          title="数式と考え方"
          formula="利得=指向性+10log10(η)、実現利得=利得−不整合損失、不整合損失=−10log10(1−|Γ|²)、|Γ|=(VSWR−1)/(VSWR+1)"
          showColumnLink={false}
        >
          <p>
            アンテナの「利得」は、方向性（指向性）に放射効率を掛けたものです。さらに給電点の反射（VSWR）で失う分を引くと、実際に系が得る実現利得になります。データシート比較や、リンクバジェットに入れる利得の妥当性チェックに使えます。
          </p>
        </FormulaExplanationCard>
      </div>

      <MobileResultBar primary={primary} targetId="rg-primary-result" />
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/rf/format";
import {
  type BendSignificance,
  bendSignificance,
  guidedWavelengthMm,
  isMiterFormulaApplicable,
  microstripImpedance,
  miterCutbackMm,
  optimalMiterPercent,
  recommendedBendRadiusMm
} from "@/lib/rf/microstrip";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { MicrostripBendDiagram } from "./MicrostripBendDiagram";
import { MicrostripCrossSectionDiagram } from "./MicrostripCrossSectionDiagram";

const substratePresets = [
  { label: "テフロン系", value: 2.1 },
  { label: "Rogers RO4350B", value: 3.48 },
  { label: "FR4", value: 4.4 },
  { label: "ガラスエポキシ", value: 4.6 }
];

const significanceMeta: Record<
  BendSignificance,
  { label: string; tone: string; lead: string }
> = {
  negligible: {
    label: "ほぼ無視できる",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-900",
    lead: "この周波数では曲げの影響は小さく、直角のままでも実用上は問題になりにくいレベルです。"
  },
  minor: {
    label: "小さめ（対策推奨）",
    tone: "border-amber-200 bg-amber-50 text-amber-900",
    lead: "影響は大きくありませんが、念のため対策しておくと安心です。"
  },
  significant: {
    label: "大きい（要対策）",
    tone: "border-rose-200 bg-rose-50 text-rose-900",
    lead: "曲げの影響が無視できません。きちんと対策し、最終は電磁界シミュレータで確認してください。"
  }
};

function bendRecommendations(bend: {
  significance: BendSignificance;
  miterPercent: number;
  cutbackMm: number;
  radiusMm: number;
}): string[] {
  const miter = `90°マイター ${bend.miterPercent.toFixed(0)}%（対角カット ${bend.cutbackMm.toFixed(2)}mm）を適用`;

  if (bend.significance === "negligible") {
    return [
      "直角のままでも実用上OK。製造ルール上の角処理だけで十分なことが多いです。",
      `気になる場合は${miter}。`
    ];
  }
  if (bend.significance === "minor") {
    return [`${miter}。`, "または45°×2回の緩い曲げにすると、よりおだやかです。"];
  }
  return [
    `45°×2回の曲げ、または円弧（推奨最小半径 R ≥ ${bend.radiusMm.toFixed(1)}mm）で滑らかに曲げる。`,
    `${miter}は応急策。最終は電磁界シミュレータで確認を。`
  ];
}

function NumberInput({
  id,
  label,
  value,
  min,
  step,
  invalid,
  onChange
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  step: number;
  invalid: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-slate-950">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={min}
        step={step}
        value={Number.isFinite(value) ? value : ""}
        aria-invalid={invalid}
        className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-semibold text-slate-950 focus:border-staf focus:outline-none focus:ring-2 focus:ring-staf/20"
        onChange={(event) => onChange(event.target.value === "" ? Number.NaN : Number(event.target.value))}
      />
    </div>
  );
}

export function MicrostripLinePanel() {
  const [widthMm, setWidthMm] = useState(3.0);
  const [heightMm, setHeightMm] = useState(1.6);
  const [dielectricConstant, setDielectricConstant] = useState(4.4);
  const [bendFrequencyMHz, setBendFrequencyMHz] = useState(2400);

  const result = useMemo(() => {
    try {
      return microstripImpedance(widthMm, heightMm, dielectricConstant);
    } catch {
      return null;
    }
  }, [widthMm, heightMm, dielectricConstant]);

  // 90°曲げのマイター設計値と、「この周波数でその曲げを気にすべきか」の判定。
  const bend = useMemo(() => {
    if (!result) {
      return null;
    }
    try {
      const miterPercent = optimalMiterPercent(widthMm, heightMm);
      const lambdaGMm = guidedWavelengthMm(bendFrequencyMHz, result.effectiveDielectric);
      return {
        miterPercent,
        cutbackMm: miterCutbackMm(widthMm, miterPercent),
        lambdaGMm,
        ratioInverse: lambdaGMm / widthMm,
        significance: bendSignificance(widthMm, lambdaGMm),
        radiusMm: recommendedBendRadiusMm(widthMm),
        formulaInRange: isMiterFormulaApplicable(widthMm, heightMm, dielectricConstant)
      };
    } catch {
      return null;
    }
  }, [result, widthMm, heightMm, dielectricConstant, bendFrequencyMHz]);

  return (
    <section className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">マイクロストリップ線路シミュレーション</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        基板上の配線（マイクロストリップ）の特性インピーダンスを計算し、曲げ部については「この周波数でその曲げを気にすべきか」を判定して、マイター・45°・円弧などの対策を提案します。
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <NumberInput id="msW" label="線路幅 W（mm）" value={widthMm} min={0.05} step={0.05} invalid={!result} onChange={setWidthMm} />
        <NumberInput id="msH" label="基板厚 h（mm）" value={heightMm} min={0.05} step={0.05} invalid={!result} onChange={setHeightMm} />
        <NumberInput id="msEr" label="比誘電率 εr" value={dielectricConstant} min={1} step={0.1} invalid={!result} onChange={setDielectricConstant} />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {substratePresets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              dielectricConstant === preset.value
                ? "border-staf bg-staf text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-staf/40"
            }`}
            onClick={() => setDielectricConstant(preset.value)}
          >
            {preset.label}（{preset.value}）
          </button>
        ))}
      </div>

      {result ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-staf-light p-4">
              <p className="text-xs font-semibold text-staf">特性インピーダンス</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{formatNumber(result.impedanceOhms, 1)} Ω</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">実効比誘電率 εeff</p>
              <p className="mt-1 text-2xl font-bold text-staf">{formatNumber(result.effectiveDielectric, 2)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">速度係数 VF</p>
              <p className="mt-1 text-2xl font-bold text-staf">{formatNumber(result.velocityFactor, 3)}</p>
            </div>
          </div>

          <div className="mt-5">
            <MicrostripCrossSectionDiagram
              widthMm={widthMm}
              heightMm={heightMm}
              dielectricConstant={dielectricConstant}
              impedanceOhms={result.impedanceOhms}
              effectiveDielectric={result.effectiveDielectric}
              velocityFactor={result.velocityFactor}
            />
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm font-medium text-rose-700">
          線路幅・基板厚は0より大きい値、比誘電率は1以上で入力してください。
        </p>
      )}

      <div className="mt-5">
        <FormulaExplanationCard
          title="特性インピーダンスの式を見る"
          formula={"u = W / h\nεeff = (εr+1)/2 + (εr-1)/2 · (1 + 12/u)^(-1/2)\nZ0 = (120π/√εeff) / (u + 1.393 + 0.667·ln(u + 1.444))   ※ u ≥ 1"}
        >
          <p>
            Hammerstad-Wheelerの近似式です。線路幅W、基板厚h、比誘電率εrの3つで特性インピーダンスがほぼ決まります。同軸と違い、電界の一部が空気中、一部が基板中を通るため、実効比誘電率
            εeff（1〜εr）で扱います。基板の比誘電率は材料データシートの値を使ってください。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <h3 className="text-lg font-bold text-slate-950">曲げの設計：まず「気にすべきか」</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          配線を直角に曲げると角で反射が出ますが、効くかどうかは周波数（波長）次第です。動作周波数を入れて、そもそも対策が要るかを確認します。
        </p>

        <div className="mt-4 sm:max-w-xs">
          <NumberInput
            id="msFreq"
            label="動作周波数（MHz）"
            value={bendFrequencyMHz}
            min={1}
            step={10}
            invalid={!bend}
            onChange={setBendFrequencyMHz}
          />
        </div>

        {bend ? (
          <>
            <div className={`mt-4 rounded-lg border p-4 ${significanceMeta[bend.significance].tone}`}>
              <p className="text-xs font-semibold">曲げの影響</p>
              <p className="mt-1 text-xl font-bold">{significanceMeta[bend.significance].label}</p>
              <p className="mt-1 text-sm leading-relaxed">{significanceMeta[bend.significance].lead}</p>
              <p className="mt-2 text-xs leading-relaxed">
                導波波長 λg ≈ {formatNumber(bend.lambdaGMm, 1)} mm。線路幅 W（{formatNumber(widthMm, 2)}mm）は
                λg の約 1/{Math.round(bend.ratioInverse)} です。目安：W が λg/20 より小さければほぼ無視でき、λg/10 を超えると無視できません。
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">推奨する曲げ方</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {bendRecommendations(bend).map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
              {!bend.formulaInRange ? (
                <p className="mt-3 text-xs leading-relaxed text-amber-700">
                  注意：W/h または εr が Douville-James の適用範囲（W/h 0.25〜2.75、εr ≤ 25）の外です。マイター率は参考目安としてご利用ください。
                </p>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-staf-light p-4">
                <p className="text-xs font-semibold text-staf">90°マイター率</p>
                <p className="mt-1 text-2xl font-bold text-slate-950">{formatNumber(bend.miterPercent, 0)} %</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">対角カット長</p>
                <p className="mt-1 text-2xl font-bold text-staf">{formatNumber(bend.cutbackMm, 2)} mm</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">円弧の推奨最小R</p>
                <p className="mt-1 text-2xl font-bold text-staf">{formatNumber(bend.radiusMm, 1)} mm</p>
              </div>
            </div>

            <div className="mt-5">
              <MicrostripBendDiagram
                angleDeg={90}
                miterPercent={bend.miterPercent}
                cutbackMm={bend.cutbackMm}
              />
            </div>
          </>
        ) : null}

        <div className="mt-5">
          <FormulaExplanationCard
            title="曲げ対策の考え方を見る"
            formula={"効くかの目安: 線路幅W と 導波波長 λg = c/(f√εeff) を比較\n90°の最適マイター率 M[%] = 52 + 65 · exp(-1.35 · W/h)   （Douville-James）"}
          >
            <p>
              配線を直角に曲げると外側の角に余分な容量が付き、反射が増えます。ただし効くかどうかは周波数次第で、線路幅Wが導波波長λgに対して十分小さい（おおむねλg/20以下）なら、低周波・低速では気にしなくて構いません。効く場合の対策は、角を斜めにカットするマイター（90°はDouville-Jamesの式）、45°×2回の緩い曲げ、円弧（推奨半径 R≥約3W）です。重要な配線ほど直角を避け、最終は電磁界シミュレータ（HFSS / ADS Momentum / Sonnet 等）で確認するのが確実です。
            </p>
          </FormulaExplanationCard>
        </div>
      </div>
    </section>
  );
}

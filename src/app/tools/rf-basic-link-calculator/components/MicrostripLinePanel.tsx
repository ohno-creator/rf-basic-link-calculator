"use client";

import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/rf/format";
import {
  type BendSignificance,
  bendSignificance,
  electricalLengthDegrees,
  guidedWavelengthMm,
  isMiterFormulaApplicable,
  microstripImpedance,
  miterCutbackMm,
  optimalMiterPercent,
  recommendedBendRadiusMm,
  stitchingViaPitchMm
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

function ResultCard({ label, value, primary = false }: { label: string; value: string; primary?: boolean }) {
  return (
    <div className={`rounded-lg p-4 ${primary ? "bg-staf-light" : "bg-slate-50"}`}>
      <p className={`text-xs ${primary ? "font-semibold text-staf" : "text-slate-500"}`}>{label}</p>
      <p className={`mt-1 text-2xl font-bold ${primary ? "text-slate-950" : "text-staf"}`}>{value}</p>
    </div>
  );
}

export function MicrostripLinePanel() {
  const [widthMm, setWidthMm] = useState(3.0);
  const [heightMm, setHeightMm] = useState(1.6);
  const [dielectricConstant, setDielectricConstant] = useState(4.4);
  const [frequencyMHz, setFrequencyMHz] = useState(2400);
  const [lengthMm, setLengthMm] = useState(25);

  const result = useMemo(() => {
    try {
      return microstripImpedance(widthMm, heightMm, dielectricConstant);
    } catch {
      return null;
    }
  }, [widthMm, heightMm, dielectricConstant]);

  // 電気長・導波波長・Vp と、ビア（スルーホール）の推奨ピッチ。
  const electrical = useMemo(() => {
    if (!result) {
      return null;
    }
    try {
      const lambdaGMm = guidedWavelengthMm(frequencyMHz, result.effectiveDielectric);
      return {
        lambdaGMm,
        electricalDeg: electricalLengthDegrees(lengthMm, lambdaGMm),
        electricalLambda: lengthMm / lambdaGMm,
        viaPitchLooseMm: stitchingViaPitchMm(lambdaGMm, 0.1),
        viaPitchTightMm: stitchingViaPitchMm(lambdaGMm, 0.05)
      };
    } catch {
      return null;
    }
  }, [result, frequencyMHz, lengthMm]);

  // 90°曲げのマイター設計値と、「この周波数でその曲げを気にすべきか」の判定。
  const bend = useMemo(() => {
    if (!result) {
      return null;
    }
    try {
      const miterPercent = optimalMiterPercent(widthMm, heightMm);
      const lambdaGMm = guidedWavelengthMm(frequencyMHz, result.effectiveDielectric);
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
  }, [result, widthMm, heightMm, dielectricConstant, frequencyMHz]);

  return (
    <section className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">マイクロストリップ線路シミュレーション</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        基板上の配線（マイクロストリップ）の特性インピーダンス・実効比誘電率・電気長を計算し、曲げ（マイター）やグラウンドのスルーホール（ビア）の設計目安まで確認できます。
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
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <NumberInput id="msFreq" label="動作周波数（MHz）" value={frequencyMHz} min={1} step={10} invalid={!electrical} onChange={setFrequencyMHz} />
        <NumberInput id="msLen" label="線路長 L（mm）" value={lengthMm} min={0.1} step={1} invalid={!electrical} onChange={setLengthMm} />
      </div>

      {result ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <ResultCard label="特性インピーダンス" value={`${formatNumber(result.impedanceOhms, 1)} Ω`} primary />
            <ResultCard label="実効比誘電率 εeff" value={formatNumber(result.effectiveDielectric, 2)} />
            <ResultCard label="速度係数 VF（Vp）" value={formatNumber(result.velocityFactor, 3)} />
          </div>

          {electrical ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <ResultCard label="導波波長 λg" value={`${formatNumber(electrical.lambdaGMm, 1)} mm`} />
              <ResultCard label={`電気長（L=${formatNumber(lengthMm, 1)}mm）`} value={`${formatNumber(electrical.electricalDeg, 1)}°`} />
              <ResultCard label="電気長（波長比）" value={`${formatNumber(electrical.electricalLambda, 3)} λ`} />
            </div>
          ) : null}

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
          線路幅・基板厚は0より大きい値、比誘電率は1以上、周波数・長さは0より大きい値で入力してください。
        </p>
      )}

      <div className="mt-5">
        <FormulaExplanationCard
          title="特性インピーダンス・電気長の式を見る"
          formula={
            "u = W / h\nεeff = (εr+1)/2 + (εr-1)/2 · (1 + 12/u)^(-1/2)\nZ0 = (120π/√εeff) / (u + 1.393 + 0.667·ln(u + 1.444))   ※ u ≥ 1\nλg = c / (f·√εeff),  Vp = 1/√εeff,  電気長[度] = 360 · L / λg"
          }
        >
          <p>
            Hammerstad-Wheelerの近似式です。線路幅W・基板厚h・比誘電率εrで特性インピーダンスが、εeffから導波波長λgと速度係数Vp（=1/√εeff）が決まります。電気長はλgに対する物理長Lの割合で、整合スタブやλ/4変成器の設計に使います。
          </p>
        </FormulaExplanationCard>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <h3 className="text-lg font-bold text-slate-950">スルーホール（ビア）の目安</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          表裏グラウンドをつなぐスティッチングビアは、共振や電磁波の漏れを抑えるため、導波波長 λg の数分の1以下のピッチで並べます。
        </p>

        {electrical ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ResultCard label="推奨 最大ピッチ（λg/10）" value={`${formatNumber(electrical.viaPitchLooseMm, 2)} mm 以下`} primary />
            <ResultCard label="より安全側（λg/20）" value={`${formatNumber(electrical.viaPitchTightMm, 2)} mm 以下`} />
          </div>
        ) : null}

        <div className="mt-5">
          <FormulaExplanationCard
            title="ビア（スルーホール）の考え方を見る"
            formula={"スティッチングビアの最大ピッチ ≈ λg / 10（より安全側は λg / 20）"}
          >
            <p>
              グラウンド面の電位を均一に保ち、スロット共振や放射・漏れを抑えるために、信号線の脇やグラウンド境界にビアを並べます。ピッチが波長に対して大きいとビアの隙間から漏れるため、目安として
              λg/10 以下（高アイソレーションが要る場合は λg/20 以下）にします。コネクタや端の近く、グラウンド境界、リファレンス層を切り替える箇所は特に重要です。グランデッドCPWでは表裏グラウンドの接続ビアが必須です。
            </p>
          </FormulaExplanationCard>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <h3 className="text-lg font-bold text-slate-950">曲げの設計：まず「気にすべきか」</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          上で入力した動作周波数をもとに、配線の曲げで反射を気にすべきかを判定し、マイター・45°・円弧などの対策を提案します。
        </p>

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
              <ResultCard label="90°マイター率" value={`${formatNumber(bend.miterPercent, 0)} %`} primary />
              <ResultCard label="対角カット長" value={`${formatNumber(bend.cutbackMm, 2)} mm`} />
              <ResultCard label="円弧の推奨最小R" value={`${formatNumber(bend.radiusMm, 1)} mm`} />
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

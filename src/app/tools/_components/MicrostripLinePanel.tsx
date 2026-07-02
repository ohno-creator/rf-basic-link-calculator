"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { Stat } from "@/components/Stat";
import { Tooltip } from "@/components/Tooltip";
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
  {
    label: "テフロン系",
    value: 2.1,
    tooltip: "低誘電率・低損失材（PTFE系）。εr≈2.1。ミリ波・高周波の低損失基板向け。押すとεrを2.1に設定。"
  },
  {
    label: "Rogers RO4350B",
    value: 3.48,
    tooltip: "高周波用低損失ラミネート。εr≈3.48。RF/マイクロ波で実用的な定番。押すとεrを3.48に設定。"
  },
  {
    label: "FR4",
    value: 4.4,
    tooltip:
      "汎用ガラスエポキシ。εr≈4.4（ロット・周波数で3.8〜4.6と変動・高周波で損失大）。一般基板の標準。押すとεrを4.4に設定。"
  },
  {
    label: "ガラスエポキシ",
    value: 4.6,
    tooltip: "ガラスエポキシ系（FR4近縁の高め値）。εr≈4.6。低周波・コスト重視向け。押すとεrを4.6に設定。"
  }
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
  onChange,
  tooltip
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  step: number;
  invalid: boolean;
  onChange: (value: number) => void;
  tooltip?: ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-slate-950">
          {label}
        </label>
        {tooltip}
      </div>
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

function ResultCard({
  label,
  value,
  primary = false,
  tooltip
}: {
  label: string;
  value: string;
  primary?: boolean;
  tooltip?: ReactNode;
}) {
  return (
    <div className={`rounded-lg p-4 ${primary ? "bg-staf-light" : "bg-slate-50"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className={`text-xs ${primary ? "font-semibold text-staf-dark" : "text-slate-500"}`}>{label}</p>
        {tooltip}
      </div>
      <Stat className="mt-1" value={value} tone={primary ? "neutral" : "staf"} size="md" />
    </div>
  );
}

export function MicrostripLinePanel() {
  const [widthMm, setWidthMm] = useState(3.0);
  const [heightMm, setHeightMm] = useState(1.6);
  const [dielectricConstant, setDielectricConstant] = useState(4.4);
  const [frequencyMHz, setFrequencyMHz] = useState(2400);
  const [lengthMm, setLengthMm] = useState(25);

  // 各入力欄は「自身の値の妥当性」で invalid を判定する。
  // （W/h/εr が不正なときに、正しく入っている周波数・線路長まで赤枠になるのを防ぐ）
  const widthValid = Number.isFinite(widthMm) && widthMm > 0;
  const heightValid = Number.isFinite(heightMm) && heightMm > 0;
  const dielectricValid = Number.isFinite(dielectricConstant) && dielectricConstant >= 1;
  const frequencyValid = Number.isFinite(frequencyMHz) && frequencyMHz > 0;
  const lengthValid = Number.isFinite(lengthMm) && lengthMm > 0;

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
    <Card as="section" padding="lg" className="flex flex-col">
      <h2 className="text-xl font-bold text-slate-950">マイクロストリップ線路シミュレーション</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        基板上の配線（マイクロストリップ）の特性インピーダンス・実効比誘電率・電気長を計算し、曲げ（マイター）やグラウンドのスルーホール（ビア）の設計目安まで確認できます。
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <NumberInput
          id="msW"
          label="線路幅 W（mm）"
          value={widthMm}
          min={0.05}
          step={0.05}
          invalid={!widthValid}
          onChange={setWidthMm}
          tooltip={
            <Tooltip term="線路幅 W">
              基板上の信号導体の幅。広げるとZ0は下がる。50Ω狙いはεr・基板厚で変わり、FR4・h=1.6mmなら約2.9〜3.0mmが目安。最小0.05mm。
            </Tooltip>
          }
        />
        <NumberInput
          id="msH"
          label="基板厚 h（mm）"
          value={heightMm}
          min={0.05}
          step={0.05}
          invalid={!heightValid}
          onChange={setHeightMm}
          tooltip={
            <Tooltip term="基板厚 h">
              信号層とグラウンド面の間の誘電体厚。厚いほどZ0は上がる。両面FR4で1.6mm、薄基板で0.2〜0.8mmが代表。データシートのコア/プリプレグ厚を入力。
            </Tooltip>
          }
        />
        <NumberInput
          id="msEr"
          label="比誘電率 εr"
          value={dielectricConstant}
          min={1}
          step={0.1}
          invalid={!dielectricValid}
          onChange={setDielectricConstant}
          tooltip={
            <Tooltip term="比誘電率 εr">
              基板材料の比誘電率。高いほど波長が縮みZ0は下がる。FR4≈4.4、Rogers RO4350B≈3.48、テフロン系≈2.1。1以上で入力。下のプリセットも利用可。
            </Tooltip>
          }
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {substratePresets.map((preset) => (
          <span key={preset.label} className="inline-flex items-center gap-1">
            <button
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
            <Tooltip term={`${preset.label}（${preset.value}）`}>{preset.tooltip}</Tooltip>
          </span>
        ))}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <NumberInput
          id="msFreq"
          label="動作周波数（MHz）"
          value={frequencyMHz}
          min={1}
          step={10}
          invalid={!frequencyValid}
          onChange={setFrequencyMHz}
          tooltip={
            <Tooltip term="動作周波数">
              対象信号の周波数。λg=c/(f√εeff) と電気長・ビアピッチ・曲げ影響判定に使用。例: Wi‑Fi 2400、Sub‑GHz 920、GPS 1575。0より大きい値。
            </Tooltip>
          }
        />
        <NumberInput
          id="msLen"
          label="線路長 L（mm）"
          value={lengthMm}
          min={0.1}
          step={1}
          invalid={!lengthValid}
          onChange={setLengthMm}
          tooltip={
            <Tooltip term="線路長 L">
              対象配線の物理長。電気長[度]=360·L/λg と波長比λを算出。λ/4変成器やスタブ設計の基準。0より大きい値で入力。
            </Tooltip>
          }
        />
      </div>

      {result ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <ResultCard
              label="特性インピーダンス"
              value={`${formatNumber(result.impedanceOhms, 1)} Ω`}
              primary
              tooltip={
                <Tooltip term="特性インピーダンス Z0">
                  線路の特性インピーダンス。RFは50Ω、差動は片側で約45〜50Ω（差動100Ω）が基本。W・h・εrで決まる。
                </Tooltip>
              }
            />
            <ResultCard
              label="実効比誘電率 εeff"
              value={formatNumber(result.effectiveDielectric, 2)}
              tooltip={
                <Tooltip term="実効比誘電率 εeff">
                  電界が基板と空気にまたがるための実効的なεr。1&lt;εeff&lt;εr。λgとVpを決める。値が大きいほど波長は縮む。
                </Tooltip>
              }
            />
            <ResultCard
              label="速度係数 VF（Vp）"
              value={formatNumber(result.velocityFactor, 3)}
              tooltip={
                <Tooltip term="速度係数 VF（Vp）">
                  線路上の伝搬速度の真空比 Vp=1/√εeff。例εeff≈3.3→VF≈0.55。遅延=L/(c·VF)。配線遅延・長さ整合の計算に使う。
                </Tooltip>
              }
            />
          </div>

          {electrical ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <ResultCard
                label="導波波長 λg"
                value={`${formatNumber(electrical.lambdaGMm, 1)} mm`}
                tooltip={
                  <Tooltip term="導波波長 λg">
                    線路上の1波長の物理長 λg=c/(f√εeff)。λ/4スタブやビアピッチ（λg/10）の基準。周波数が高いほど短い。
                  </Tooltip>
                }
              />
              <ResultCard
                label={`電気長（L=${formatNumber(lengthMm, 1)}mm）`}
                value={`${formatNumber(electrical.electricalDeg, 1)}°`}
                tooltip={
                  <Tooltip term="電気長（度）">
                    物理長Lが何度に相当するか＝360·L/λg。90°=λ/4、180°=λ/2。整合回路・移相設計で重要。Lとλgで変化。
                  </Tooltip>
                }
              />
              <ResultCard
                label="電気長（波長比）"
                value={`${formatNumber(electrical.electricalLambda, 3)} λ`}
                tooltip={
                  <Tooltip term="電気長（波長比 λ）">
                    物理長を波長単位で表したもの＝L/λg。0.25λ=λ/4変成器、0.5λ=半波長。配線が波長に対しどれだけ長いかの直感指標。
                  </Tooltip>
                }
              />
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
        <div className="mb-2 flex justify-end">
          <Tooltip term="特性インピーダンス・電気長の式を見る">
            Hammerstad-Wheeler近似式とλg・電気長の定義式を表示。計算の根拠を確認したいとき。
          </Tooltip>
        </div>
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
            <ResultCard
              label="推奨 最大ピッチ（λg/10）"
              value={`${formatNumber(electrical.viaPitchLooseMm, 2)} mm 以下`}
              primary
              tooltip={
                <Tooltip term="推奨 最大ピッチ（λg/10）">
                  スティッチングビアの一般的な最大間隔＝λg/10。これ以下なら共振・漏れを実用上抑えられる。コネクタ/境界近傍はより密に。
                </Tooltip>
              }
            />
            <ResultCard
              label="より安全側（λg/20）"
              value={`${formatNumber(electrical.viaPitchTightMm, 2)} mm 以下`}
              tooltip={
                <Tooltip term="より安全側（λg/20）">
                  高アイソレーション要求時のビア間隔＝λg/20。シールド性を高めたい箇所・高周波で採用。製造コストと相談。
                </Tooltip>
              }
            />
          </div>
        ) : null}

        <div className="mt-5">
          <div className="mb-2 flex justify-end">
            <Tooltip term="ビア（スルーホール）の考え方を見る">
              スティッチングビアのピッチ目安（λg/10・λg/20）と配置すべき箇所の解説を表示。
            </Tooltip>
          </div>
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
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-xs font-semibold">曲げの影響</p>
                <Tooltip term="曲げの影響">
                  W/λg比で曲げ反射の重要度を判定。&lt;1/20:ほぼ無視、1/20〜1/10:小さめ、&gt;1/10:要対策。周波数・W・εrで変化。
                </Tooltip>
              </div>
              <p className="mt-1 text-xl font-bold">{significanceMeta[bend.significance].label}</p>
              <p className="mt-1 text-sm leading-relaxed">{significanceMeta[bend.significance].lead}</p>
              <p className="mt-2 text-xs leading-relaxed">
                導波波長 λg ≈ {formatNumber(bend.lambdaGMm, 1)} mm。線路幅 W（{formatNumber(widthMm, 2)}mm）は
                {bend.ratioInverse >= 2
                  ? ` λg の約 1/${Math.round(bend.ratioInverse)} です。`
                  : ` λg と同等以上（W ≈ λg の ${formatNumber(widthMm / bend.lambdaGMm, 2)} 倍）で、波長に対して幅が広い領域です。`}
                目安：W が λg/20 より小さければほぼ無視でき、λg/10 を超えると無視できません。
              </p>
            </div>

            <Card padding="md" shadow={false} className="mt-4">
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
            </Card>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <ResultCard
                label="90°マイター率"
                value={`${formatNumber(bend.miterPercent, 0)} %`}
                primary
                tooltip={
                  <Tooltip term="90°マイター率">
                    直角の角を斜めにカットする割合 M[%]=52+65·exp(-1.35·W/h)（Douville-James）。50%前後が代表。W/h
                    0.25〜2.75で妥当。
                  </Tooltip>
                }
              />
              <ResultCard
                label="対角カット長"
                value={`${formatNumber(bend.cutbackMm, 2)} mm`}
                tooltip={
                  <Tooltip term="対角カット長">
                    マイターで角から斜めに切る対角長＝（率/100)·W·√2。基板CADでこの寸法だけ角を落とす。
                  </Tooltip>
                }
              />
              <ResultCard
                label="円弧の推奨最小R"
                value={`${formatNumber(bend.radiusMm, 1)} mm`}
                tooltip={
                  <Tooltip term="円弧の推奨最小R">
                    円弧で曲げる場合の中心線推奨最小半径≈3·W。これより小さいと反射が増えやすい。緩い曲げほど良好。
                  </Tooltip>
                }
              />
            </div>

            <div className="mt-5">
              <MicrostripBendDiagram
                angleDeg={90}
                miterPercent={bend.miterPercent}
                cutbackMm={bend.cutbackMm}
                significance={bend.significance}
              />
            </div>
          </>
        ) : null}

        <div className="mt-5">
          <div className="mb-2 flex justify-end">
            <Tooltip term="曲げ対策の考え方を見る">
              曲げ反射の原理とマイター/45°/円弧の対策、Douville-James式と適用範囲を表示。
            </Tooltip>
          </div>
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
    </Card>
  );
}

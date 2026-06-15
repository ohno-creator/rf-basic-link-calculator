"use client";

import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/rf/format";
import {
  microstripImpedance,
  miterCutbackMm,
  recommendedMiterPercent
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
  const [angleDeg, setAngleDeg] = useState(90);

  const result = useMemo(() => {
    try {
      return microstripImpedance(widthMm, heightMm, dielectricConstant);
    } catch {
      return null;
    }
  }, [widthMm, heightMm, dielectricConstant]);

  const miter = useMemo(() => {
    try {
      const percent = recommendedMiterPercent(widthMm, heightMm, angleDeg);
      return { percent, cutbackMm: miterCutbackMm(widthMm, percent) };
    } catch {
      return null;
    }
  }, [widthMm, heightMm, angleDeg]);

  return (
    <section className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">マイクロストリップ線路シミュレーション</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        基板上の配線（マイクロストリップ）の特性インピーダンスを計算し、曲げ部のマイター（角の斜めカット）設計の目安を求めます。
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
        <h3 className="text-lg font-bold text-slate-950">曲げ（マイター）設計</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          配線を曲げる角度に対して、反射を抑える最適なマイター（角の斜めカット）率の目安を求めます。
        </p>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label htmlFor="msAngle" className="text-sm font-semibold text-slate-950">
              曲げ角度
            </label>
            <span className="text-sm font-semibold text-staf">{angleDeg}°</span>
          </div>
          <input
            id="msAngle"
            type="range"
            min={15}
            max={90}
            step={5}
            value={angleDeg}
            className="mt-3 w-full"
            aria-label="曲げ角度"
            onChange={(event) => setAngleDeg(Number(event.target.value))}
          />
        </div>

        {miter ? (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-staf-light p-4">
                <p className="text-xs font-semibold text-staf">推奨マイター率</p>
                <p className="mt-1 text-2xl font-bold text-slate-950">{formatNumber(miter.percent, 0)} %</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">対角カット長</p>
                <p className="mt-1 text-2xl font-bold text-staf">{formatNumber(miter.cutbackMm, 2)} mm</p>
              </div>
            </div>

            <div className="mt-5">
              <MicrostripBendDiagram
                angleDeg={angleDeg}
                miterPercent={miter.percent}
                cutbackMm={miter.cutbackMm}
              />
            </div>
          </>
        ) : null}

        <div className="mt-5">
          <FormulaExplanationCard
            title="マイターの考え方を見る"
            formula={"直角(90°)の最適マイター率\nM[%] = 52 + 65 · exp(-1.35 · W/h)   （Douville-James）"}
          >
            <p>
              配線を急に曲げると、外側の角に余分な容量が付いて反射が増えます。角を斜めにカット（マイター）すると、この容量を打ち消して整合が改善します。90°曲げの最適マイター率はDouville-Jamesの式で、W/hで決まります。本ツールは他の角度には90°の値を角度比で按分した目安を表示します（厳密値は電磁界シミュレータで確認してください）。RFで重要な配線は、直角を避けて緩い角度や円弧で曲げるのも有効です。
            </p>
          </FormulaExplanationCard>
        </div>
      </div>
    </section>
  );
}

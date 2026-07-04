"use client";

import { useMemo, useState } from "react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { Stat } from "@/components/Stat";
import { Tooltip } from "@/components/Tooltip";
import { glossary } from "@/data/glossary";
import { calculateAntennaLengths } from "@/lib/rf/antenna";
import {
  calculateWavelengthFractions,
  calculateWavelengthFromMHz
} from "@/lib/rf/frequency";
import { formatMeters } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { WavelengthVisual } from "./WavelengthVisual";

// 各結果（λ系）の用途を一言で補足するためのツールチップ定義。
const RESULT_HINTS: Record<string, { term: string; description: string }> = {
  "波長 λ": {
    term: "波長 λ",
    description:
      "電波1周期分の長さ（λ=光速/周波数）です。アンテナ寸法の基準になります。例:920MHzで約33cm。"
  },
  "λ/2": {
    term: "λ/2",
    description:
      "半波長。ダイポールなどが共振する基本アンテナ長の目安です。実際は端部効果で数%短くなります。"
  },
  "λ/4": {
    term: "λ/4",
    description:
      "4分の1波長。モノポール/接地アンテナや整合スタブの基準長です。GND面を半波長の片側代わりに使う構成で用います。"
  },
  "λ/8": {
    term: "λ/8",
    description:
      "8分の1波長。小型化アンテナや整合素子の寸法目安です。短いほど効率・帯域は犠牲になりやすくなります。"
  }
};

export function FrequencyWavelengthPanel() {
  const [frequency, setFrequency] = useState(920);
  const [unit, setUnit] = useState<"MHz" | "GHz">("MHz");
  const [velocityFactorPercent, setVelocityFactorPercent] = useState(95);
  const frequencyMHz = unit === "GHz" ? frequency * 1000 : frequency;

  // 単位切替時は表示値を等価換算し、物理周波数を保存する。
  const handleUnitChange = (nextUnit: "MHz" | "GHz") => {
    if (nextUnit === unit) {
      return;
    }
    setFrequency((current) => {
      if (!Number.isFinite(current)) {
        return current;
      }
      return nextUnit === "GHz" ? current / 1000 : current * 1000;
    });
    setUnit(nextUnit);
  };

  const result = useMemo(() => {
    try {
      return calculateWavelengthFractions(frequencyMHz);
    } catch {
      return null;
    }
  }, [frequencyMHz]);

  const antennaLengths = useMemo(() => {
    try {
      return calculateAntennaLengths(frequencyMHz, velocityFactorPercent);
    } catch {
      return null;
    }
  }, [frequencyMHz, velocityFactorPercent]);

  const primary = {
    label: "波長 λ",
    value: result ? formatMeters(result.wavelengthM) : "—"
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[5fr_4fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-lg font-bold text-slate-950">入力条件</h2>

        <div className="mt-5">
          <Field
            id="waveFrequency"
            label="周波数"
            help={`${glossary.frequency.description}\n\n入力した数値の単位です。MHz=百万Hz、GHz=十億Hz（=1000MHz）。920は「MHz」、2.4や5.8は「GHz」を選びます。単位を切り替えると表示値は自動で換算され、実周波数は保たれます。`}
            unitSelect={{
              value: unit,
              options: [
                { value: "MHz", label: "MHz（百万ヘルツ。サブGHz帯：LPWA/RFID 920MHz等）" },
                { value: "GHz", label: "GHz（十億ヘルツ＝1000MHz。WiFi/BLE 2.4/5/6GHz等）" }
              ],
              ariaLabel: "周波数の単位",
              onChange: (u) => handleUnitChange(u as "MHz" | "GHz")
            }}
            value={frequency}
            onChange={setFrequency}
            min={0.001}
            step={unit === "GHz" ? 0.01 : 0.1}
            error={result ? undefined : "周波数は0より大きい値を入力してください。"}
            emptyBehavior="preserve"
          />
        </div>

        {result ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["λ/2", result.halfM],
              ["λ/4", result.quarterM],
              ["λ/8", result.eighthM]
            ].map(([label, value]) => (
              <MetricCard
                key={label as string}
                label={label as string}
                value={formatMeters(value as number)}
                hint={RESULT_HINTS[label as string].description}
              />
            ))}
          </div>
        ) : null}

        {antennaLengths ? (
          <div className="mt-5">
            <CollapsibleSection title="アンテナ物理長・短縮率" storageKey="frequency-wavelength:antenna-lengths">
            <p className="text-xs leading-relaxed">端部効果や誘電体を想定した短縮率込みで換算します。</p>
            <div className="mt-3 max-w-xs">
              <Field
                id="antennaVelocityFactor"
                label="短縮率"
                unit="%"
                value={velocityFactorPercent}
                min={20}
                max={100}
                step={1}
                showSlider
                emptyBehavior="preserve"
                onChange={setVelocityFactorPercent}
              />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["λ/4", antennaLengths.physical.quarterM, "モノポールやラジアルの基準"],
                ["λ/2", antennaLengths.physical.halfM, "ダイポールや半波長ホイップの基準"],
                ["5/8λ", antennaLengths.physical.fiveEighthM, "高めの打上げ角を抑える外部アンテナの目安"]
              ].map(([label, length, help]) => (
                <div key={label as string} className="rounded-lg bg-white p-3 shadow-card">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-500">{label as string}</p>
                    <Tooltip term={label as string}>{help as string}</Tooltip>
                  </div>
                  <Stat className="mt-1" value={formatMeters(length as number)} tone="staf" size="sm" />
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-staf"
                      style={{ width: `${Math.max(10, Math.min(100, ((length as number) / antennaLengths.physical.fiveEighthM) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            </CollapsibleSection>
          </div>
        ) : null}

        <div className="mt-5">
          <CollapsibleSection title="使い方・用語" storageKey="frequency-wavelength:guide">
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <ol className="space-y-2 text-sm leading-relaxed text-slate-600">
              <li>
                <span className="font-semibold text-staf-dark">1.</span> まず周波数と単位を合わせます。920MHzならMHz、2.4GHzならGHzが便利です。
              </li>
              <li>
                <span className="font-semibold text-staf-dark">2.</span> λ/4、λ/2、5/8λのどれが検討中のアンテナ形式に近いかを見ます。
              </li>
              <li>
                <span className="font-semibold text-staf-dark">3.</span> 短縮率を動かして、実際の物理長が筐体に入るか確認します。
              </li>
            </ol>
            <dl className="grid gap-2 text-xs leading-relaxed text-slate-600">
              <div>
                <dt className="font-semibold text-slate-900">短縮率</dt>
                <dd>理想的な電気長に対する実際の物理長の割合です。端部効果、誘電体、ヘリカル化で短くなります。</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">λ/4</dt>
                <dd>モノポールやラジアル、接地型アンテナでよく使う基準長です。</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">λ/2</dt>
                <dd>ダイポールや半波長ホイップの基準です。スタッフ標準品の920MHz λ/2ホイップの理解にもつながります。</dd>
              </div>
            </dl>
          </div>
          </CollapsibleSection>
        </div>

        <div className="mt-5">
          <FormulaExplanationCard
            title="計算式を見る"
            formula={"λ[m] = 299,792,458 / 周波数[Hz]\n物理長 = 電気長 × 短縮率"}
            showColumnLink={false}
          >
            <p>
              920MHzの場合、波長は約{formatMeters(calculateWavelengthFromMHz(920))}です。アンテナ長は単純なλ/4だけでは決まらず、筐体やGND、誘電体の影響を受けます。
            </p>
          </FormulaExplanationCard>
        </div>
      </div>
      <div id="wavelength-primary-result" className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <ResultBar primary={primary} />
        <WavelengthVisual frequencyMHz={frequencyMHz} hasInput={Boolean(result)} />
      </div>
      <MobileResultBar primary={primary} targetId="wavelength-primary-result" />
    </section>
  );
}

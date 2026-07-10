"use client";

import { useMemo, useState } from "react";
import { ChartFrame } from "@/components/ChartFrame";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { MobileResultBar } from "@/components/MobileResultBar";
import { ResultBar } from "@/components/ResultBar";
import { Stat } from "@/components/Stat";
import { Tooltip } from "@/components/Tooltip";
import { glossary } from "@/data/glossary";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { calculateAntennaLengths } from "@/lib/rf/antenna";
import {
  calculateWavelengthFractions,
  calculateWavelengthFromMHz
} from "@/lib/rf/frequency";
import { formatMeters } from "@/lib/rf/format";
import { FormulaExplanationCard } from "./FormulaExplanationCard";
import { FrequencyWavelengthColumn } from "./FrequencyWavelengthColumn";
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

// ---- 波長と共振長の動的SVG（入力連動） --------------------------------------------
// 1波長ぶんの正弦波を常にプロット幅いっぱいに描き、横軸の目盛りに「実際の長さ(cm/m)」を
// 入れる。周波数が上がると軸の数値が反比例で縮む＝「高い周波数ほど波長もアンテナも短い」
// が一目で伝わる。crest(λ/4)・zero-cross(λ/2)に共振長の寸法線を重ねる。
// テキストは属性直指定（書き出したSVG単体でも画面と同じ見た目: v4 R4方式）。

const WAVE_FRACTIONS = [
  { f: 0, name: "0" },
  { f: 0.25, name: "λ/4" },
  { f: 0.5, name: "λ/2" },
  { f: 0.75, name: "3λ/4" },
  { f: 1, name: "λ" }
] as const;

function WavelengthSineFigure({
  frequencyMHz,
  wavelengthM
}: {
  frequencyMHz: number;
  wavelengthM: number;
}) {
  const chart = { width: 640, height: 300, left: 40, right: 28, top: 20 };
  const sineY = 78; // 正弦波の中心線
  const amp = 44; // 振幅
  const axisY = 158; // 長さ軸（0基準）
  const xAt = (t: number) => chart.left + t * (chart.width - chart.left - chart.right);

  const SAMPLES = 96;
  const wavePath = Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const t = i / SAMPLES;
    const px = xAt(t);
    const py = sineY - amp * Math.sin(2 * Math.PI * t);
    return `${i === 0 ? "M" : "L"}${px.toFixed(2)} ${py.toFixed(2)}`;
  }).join(" ");

  // 共振長の寸法線（λ/4 モノポール=緑 / λ/2 ダイポール=ブランド青）
  const brackets = [
    {
      key: "quarter",
      to: 0.25,
      y: 210,
      label: `λ/4 モノポール = ${formatMeters(wavelengthM / 4)}`,
      fill: chartTheme.series.gain,
      stroke: chartTheme.seriesText.gain
    },
    {
      key: "half",
      to: 0.5,
      y: 248,
      label: `λ/2 ダイポール = ${formatMeters(wavelengthM / 2)}`,
      fill: chartTheme.series.source,
      stroke: chartTheme.seriesText.source
    }
  ] as const;

  return (
    <svg
      role="img"
      aria-label={`1波長ぶんの正弦波と共振長。周波数${Math.round(frequencyMHz)}MHz、波長${formatMeters(wavelengthM)}、λ/4=${formatMeters(wavelengthM / 4)}、λ/2=${formatMeters(wavelengthM / 2)}`}
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="h-auto w-full"
    >
      <rect width={chart.width} height={chart.height} fill={chartTheme.surface.canvas} />

      {/* 長さ軸 */}
      <line
        x1={chart.left}
        x2={chart.width - chart.right}
        y1={axisY}
        y2={axisY}
        stroke={diagramPalette.faint}
        strokeWidth={1.5}
      />
      <text
        x={chart.left}
        y={chart.top}
        fill={diagramPalette.muted}
        fontSize={12}
        fontWeight={600}
      >
        1波長（λ）= {formatMeters(wavelengthM)}
      </text>

      {/* 分数の縦ガイド＋長さ目盛り */}
      {WAVE_FRACTIONS.map(({ f, name }) => {
        const px = xAt(f);
        const wavePy = sineY - amp * Math.sin(2 * Math.PI * f);
        return (
          <g key={name}>
            <line
              x1={px}
              x2={px}
              y1={Math.min(wavePy, sineY)}
              y2={axisY}
              stroke={diagramPalette.line}
              strokeDasharray="4 4"
            />
            <circle cx={px} cy={wavePy} r={3.5} fill={diagramPalette.staf} />
            <line x1={px} x2={px} y1={axisY} y2={axisY + 6} stroke={diagramPalette.faint} strokeWidth={1.5} />
            <text
              x={px}
              y={axisY + 20}
              textAnchor="middle"
              fill={diagramPalette.inkSoft}
              fontSize={12}
              fontWeight={700}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {name}
            </text>
            {f > 0 ? (
              <text
                x={px}
                y={axisY + 34}
                textAnchor="middle"
                fill={diagramPalette.muted}
                fontSize={10}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatMeters(wavelengthM * f)}
              </text>
            ) : null}
          </g>
        );
      })}

      {/* 正弦波（1波長ぶん） */}
      <path d={wavePath} fill="none" stroke={diagramPalette.staf} strokeWidth={2.5} />

      {/* 共振長の寸法線 */}
      {brackets.map((b) => {
        const x0 = xAt(0);
        const x1 = xAt(b.to);
        const centerX = (x0 + x1) / 2;
        return (
          <g key={b.key}>
            <line x1={x0} x2={x1} y1={b.y} y2={b.y} stroke={b.fill} strokeWidth={2.5} />
            <line x1={x0} x2={x0} y1={b.y - 5} y2={b.y + 5} stroke={b.fill} strokeWidth={2.5} />
            <line x1={x1} x2={x1} y1={b.y - 5} y2={b.y + 5} stroke={b.fill} strokeWidth={2.5} />
            <text
              x={centerX}
              y={b.y - 8}
              textAnchor="middle"
              fill={b.stroke}
              fontSize={12}
              fontWeight={700}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

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
    <>
    <section className="grid gap-6 lg:grid-cols-[5fr_4fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-base font-bold text-slate-950">入力条件</h2>

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
                <div key={label as string} className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
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
    </section>

      <div className="mt-6">
        <ChartFrame
          eyebrow="波長と共振長"
          title="1波長ぶんの正弦波と、共振するアンテナ長"
          description="正弦波1つ分をつねに横いっぱいに描き、目盛りに実際の長さを入れています。周波数を上げると波長（＝目盛りの数値）が反比例で縮み、共振に必要なλ/4・λ/2も同じ割合で短くなります。入力に連動して動きます。"
          exportName="frequency-wavelength-resonant-length"
          caption={
            result
              ? `条件: ${formatMeters(result.wavelengthM)} = 波長（周波数 ${unit === "GHz" ? `${frequency}GHz` : `${frequency}MHz`}）─ λ/4 ${formatMeters(result.quarterM)}・λ/2 ${formatMeters(result.halfM)}。表示は理想的な電気長で、実際の共振長は端部効果・短縮率で数%短くなります。`
              : "有効な周波数を入力してください。"
          }
        >
          {result ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <WavelengthSineFigure frequencyMHz={frequencyMHz} wavelengthM={result.wavelengthM} />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              有効な周波数を入力すると波長と共振長の図が表示されます。
            </p>
          )}
        </ChartFrame>
      </div>

      <div className="mt-6">
        <FrequencyWavelengthColumn />
      </div>

      <MobileResultBar primary={primary} targetId="wavelength-primary-result" />
    </>
  );
}

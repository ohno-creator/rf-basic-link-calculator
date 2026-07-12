"use client";

import { useMemo, useState } from "react";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { TermFrame, PlayPauseButton } from "../TermFrame";
import { useExperiencePlayback, useIntuitionAnimation } from "../useTermAnimation";
import { calculateAntennaLengths } from "@/lib/rf/antenna";

const FREQUENCY_PRESETS = [
  { label: "キーレス 315MHz", mhz: 315 },
  { label: "LPWA 920MHz", mhz: 920 },
  { label: "GPS 1575MHz", mhz: 1575 },
  { label: "Wi-Fi/BLE 2450MHz", mhz: 2450 },
  { label: "Wi-Fi 5GHz 5600MHz", mhz: 5600 }
];

const EVERYDAY_OBJECTS = [
  { cm: 96, label: "ビニール傘の長さ" },
  { cm: 29.7, label: "A4用紙の長辺" },
  { cm: 15, label: "スマホの縦の長さ" },
  { cm: 8.56, label: "ICカードの横幅" },
  { cm: 5.4, label: "ICカードの縦幅" },
  { cm: 2.26, label: "百円玉の直径" },
  { cm: 1.0, label: "小指の爪" }
];

const VIEW_W = 560;
const VIEW_H = 250;
const PLOT_X0 = 20;
const PLOT_W = 520;
const WAVE_Y = 120;
const WAVE_AMP = 46;
const RULER_Y = 26;

function closestObject(lambdaCm: number) {
  let best = EVERYDAY_OBJECTS[0];
  let bestRatio = Number.POSITIVE_INFINITY;
  for (const object of EVERYDAY_OBJECTS) {
    const ratio = Math.abs(Math.log(lambdaCm / object.cm));
    if (ratio < bestRatio) {
      bestRatio = ratio;
      best = object;
    }
  }
  return best;
}

function formatLambda(lambdaM: number): string {
  if (lambdaM >= 1) {
    return `${lambdaM.toFixed(2)} m`;
  }
  if (lambdaM >= 0.1) {
    return `${(lambdaM * 100).toFixed(1)} cm`;
  }
  return `${(lambdaM * 1000).toFixed(1)} mm`;
}

function WaveExperience() {
  const [logFreq, setLogFreq] = useState(Math.log10(920));
  const [phase, setPhase] = useState(0);
  const { playing, toggle } = useExperiencePlayback();

  useIntuitionAnimation((elapsedMs) => {
    setPhase((elapsedMs / 1000) * Math.PI * 2 * 0.7);
  }, playing);

  const frequencyMHz = Math.round(10 ** logFreq);
  const { wavelengthM } = calculateAntennaLengths(frequencyMHz, 100);
  const lambdaPx = wavelengthM * PLOT_W;
  const lambdaCm = wavelengthM * 100;
  const anchor = closestObject(lambdaCm);

  const path = useMemo(() => {
    const points: string[] = [];
    for (let i = 0; i <= PLOT_W; i += 2) {
      const y = WAVE_Y - WAVE_AMP * Math.sin((i / lambdaPx) * Math.PI * 2 - phase);
      points.push(`${i === 0 ? "M" : "L"} ${PLOT_X0 + i} ${y.toFixed(1)}`);
    }
    return points.join(" ");
  }, [lambdaPx, phase]);

  const lambdaMarkerW = Math.min(lambdaPx, PLOT_W);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {FREQUENCY_PRESETS.map((preset) => {
            const active = frequencyMHz === preset.mhz;
            return (
              <button
                key={preset.mhz}
                type="button"
                aria-pressed={active}
                onClick={() => setLogFreq(Math.log10(preset.mhz))}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  active
                    ? "border-staf bg-staf text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <PlayPauseButton playing={playing} onToggle={toggle} />
      </div>

      <svg
        role="img"
        aria-label={`周波数 ${frequencyMHz} MHz の電波の波形。波長は ${formatLambda(wavelengthM)}。横幅は実寸1mのものさし。`}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mt-3 h-auto w-full"
        data-testid="experience-wave-svg"
        data-wavelength-mm={Math.round(wavelengthM * 1000)}
      >
        <rect width={VIEW_W} height={VIEW_H} fill={chartTheme.surface.canvas} />

        {/* 1mものさし */}
        <line x1={PLOT_X0} y1={RULER_Y} x2={PLOT_X0 + PLOT_W} y2={RULER_Y} stroke={diagramPalette.inkMuted} strokeWidth={1.5} />
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <line
              x1={PLOT_X0 + (PLOT_W / 10) * i}
              y1={RULER_Y - (i % 5 === 0 ? 7 : 4)}
              x2={PLOT_X0 + (PLOT_W / 10) * i}
              y2={RULER_Y}
              stroke={diagramPalette.inkMuted}
              strokeWidth={1}
            />
            {i % 5 === 0 ? (
              <text
                x={PLOT_X0 + (PLOT_W / 10) * i}
                y={RULER_Y - 11}
                textAnchor="middle"
                fill={diagramPalette.muted}
                fontSize={10}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {i * 10}cm
              </text>
            ) : null}
          </g>
        ))}

        {/* 波形 */}
        <line x1={PLOT_X0} y1={WAVE_Y} x2={PLOT_X0 + PLOT_W} y2={WAVE_Y} stroke={diagramPalette.faint} strokeDasharray="4 4" />
        <path d={path} fill="none" stroke={chartTheme.series.gain} strokeWidth={2.5} strokeLinecap="round" />

        {/* λブラケット */}
        <g>
          <line
            x1={PLOT_X0}
            y1={WAVE_Y + WAVE_AMP + 18}
            x2={PLOT_X0 + lambdaMarkerW}
            y2={WAVE_Y + WAVE_AMP + 18}
            stroke={chartTheme.seriesText.loss}
            strokeWidth={1.5}
          />
          <line x1={PLOT_X0} y1={WAVE_Y + WAVE_AMP + 12} x2={PLOT_X0} y2={WAVE_Y + WAVE_AMP + 24} stroke={chartTheme.seriesText.loss} strokeWidth={1.5} />
          <line
            x1={PLOT_X0 + lambdaMarkerW}
            y1={WAVE_Y + WAVE_AMP + 12}
            x2={PLOT_X0 + lambdaMarkerW}
            y2={WAVE_Y + WAVE_AMP + 24}
            stroke={chartTheme.seriesText.loss}
            strokeWidth={1.5}
          />
          <text
            x={PLOT_X0 + Math.min(lambdaMarkerW / 2, PLOT_W / 2)}
            y={WAVE_Y + WAVE_AMP + 38}
            textAnchor="middle"
            fill={chartTheme.seriesText.loss}
            fontSize={13}
            fontWeight={700}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            波長 λ = {formatLambda(wavelengthM)}
            {lambdaPx > PLOT_W ? "（画面は1mまで）" : ""}
          </text>
        </g>
      </svg>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="term-wave-freq" className="text-sm font-semibold text-slate-900">
            周波数
          </label>
          <span className="text-sm font-bold text-staf-dark" style={{ fontVariantNumeric: "tabular-nums" }}>
            {frequencyMHz.toLocaleString()} MHz
          </span>
        </div>
        <input
          id="term-wave-freq"
          type="range"
          min={2}
          max={Math.log10(6000)}
          step={0.005}
          value={logFreq}
          aria-label="周波数（対数スケール）"
          className="mt-2 w-full"
          onChange={(event) => setLogFreq(Number(event.target.value))}
        />
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          波1つの長さは<span className="font-bold text-slate-900">「{anchor.label}」</span>
          くらい（λ = {formatLambda(wavelengthM)}）。
          この波が1秒に<span className="font-bold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>{(frequencyMHz / 1000).toFixed(2)}×10⁹回</span>振動しながら、光と同じ速さで空間を伝わります。
        </p>
      </div>
    </div>
  );
}

export function TermFrequencyWavelength() {
  return (
    <TermFrame
      termId="frequency-wavelength"
      title="周波数・波長"
      experienceHint="周波数を変えて、波の細かさと波長（波1つの長さ）がどう連動するか触ってみましょう。"
      experience={<WaveExperience />}
      grasp={[
        "周波数（f）が高くなるほど、波長（λ）は短くなります。",
        "電波は常に光の速さ（約30万km/s）で進みます。そのため、周波数と波長は単純な反比例の関係にあります。",
        "アンテナのサイズは波長に比例するため、周波数が高いほどアンテナは小さくなります。"
      ]}
      iotPerspective={{
        text: "IoT機器の設計において、使用する無線方式の周波数は筐体サイズを決定づける最も重要な要素です。例えば920MHz帯のアンテナはWi-Fi/BLEの2.4GHz帯に比べて約2.6倍の長さが必要になるため、筐体内のアンテナスペース設計が全く異なります。",
        toolHref: "/tools/frequency-wavelength",
        toolLabel: "周波数・波長計算ツールへ"
      }}
      deepDive={{
        formula: "λ [m] = c / f = 299,792,458 / f [Hz]\n例: 920 MHz → λ = 32.6 cm, λ/4 = 8.15 cm\n例: 2.44 GHz → λ = 12.3 cm, λ/4 = 3.07 cm",
        body: (
          <p>
            電波は真空中を光速 c で伝搬します。媒質中（空気や基板など）では位相速度が 1/√εr に低下するため、波長もそれに比例して短縮されます。アンテナの基本的な基準長である λ/4 や λ/2 は、この空間または媒質中の波長を基準に計算されます。
          </p>
        )
      }}
    />
  );
}

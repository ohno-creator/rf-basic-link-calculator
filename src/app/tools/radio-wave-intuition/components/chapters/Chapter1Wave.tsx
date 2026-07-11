"use client";

import { useMemo, useState } from "react";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { ChapterFrame, PlayPauseButton } from "./ChapterFrame";
import { useExperiencePlayback, useIntuitionAnimation } from "./useIntuitionAnimation";
import type { IntuitionChapterMeta } from "./types";

export const chapter1WaveMeta: IntuitionChapterMeta = {
  id: "wave",
  order: 1,
  title: "電波は波だ——周波数と波長",
  lead: "スライダーを動かすと波の細かさが変わります。「速さは同じ・細かさが違う」が全ての出発点です。",
  navLabel: "波を見る"
};

const SPEED_OF_LIGHT_M_S = 299_792_458;

const FREQUENCY_PRESETS = [
  { label: "キーレス 315MHz", mhz: 315 },
  { label: "LPWA 920MHz", mhz: 920 },
  { label: "GPS 1575MHz", mhz: 1575 },
  { label: "Wi-Fi/BLE 2450MHz", mhz: 2450 },
  { label: "Wi-Fi5GHz帯 5600MHz", mhz: 5600 }
];

/** λに近い身近なモノ（体感の錨）。cm降順に並べ、最も比率が近いものを選ぶ。 */
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
  // log10(MHz)で持つ（100MHz〜6000MHzを滑らかに往復できるように）
  const [logFreq, setLogFreq] = useState(Math.log10(920));
  const [phase, setPhase] = useState(0);
  const { playing, toggle } = useExperiencePlayback();

  useIntuitionAnimation((elapsedMs) => {
    setPhase((elapsedMs / 1000) * Math.PI * 2 * 0.7);
  }, playing);

  const frequencyMHz = Math.round(10 ** logFreq);
  const lambdaM = SPEED_OF_LIGHT_M_S / (frequencyMHz * 1e6);
  const lambdaPx = lambdaM * PLOT_W; // 表示は「幅=1m」の実寸スケール
  const lambdaCm = lambdaM * 100;
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
        aria-label={`周波数 ${frequencyMHz} MHz の電波の波形。波長は ${formatLambda(lambdaM)}。横幅は実寸1mのものさし。`}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mt-3 h-auto w-full"
        data-testid="intuition-wave-svg"
        data-wavelength-mm={Math.round(lambdaM * 1000)}
      >
        <rect width={VIEW_W} height={VIEW_H} fill={chartTheme.surface.canvas} />

        {/* 1mものさし（固定・実寸の基準） */}
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
            波長 λ = {formatLambda(lambdaM)}
            {lambdaPx > PLOT_W ? "（画面は1mまで）" : ""}
          </text>
        </g>
      </svg>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="intuition-wave-freq" className="text-sm font-semibold text-slate-900">
            周波数
          </label>
          <span className="text-sm font-bold text-staf-dark" style={{ fontVariantNumeric: "tabular-nums" }}>
            {frequencyMHz.toLocaleString()} MHz
          </span>
        </div>
        <input
          id="intuition-wave-freq"
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
          いまの波1つの長さは<span className="font-bold text-slate-900">「{anchor.label}」</span>
          くらい（λ={formatLambda(lambdaM)}）。この波が
          <span className="font-bold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
            1秒に{(frequencyMHz / 1000).toFixed(2)}×10⁹回
          </span>
          振動しながら、光と同じ速さで飛んでいきます。
        </p>
      </div>
    </div>
  );
}

export function Chapter1Wave() {
  return (
    <ChapterFrame
      chapterId="wave"
      experienceHint="周波数スライダーを左右に動かして、波の「細かさ」と「1つぶんの長さ（波長）」がどう変わるかを見てください。"
      experience={<WaveExperience />}
      grasp={[
        "電波はすべて光と同じ速さ。違うのは1秒に振動する回数（周波数）だけ。",
        "周波数が高いほど波長は短い。920MHzはA4用紙、2.4GHzは手のひら、28GHzは小指の爪サイズ。",
        "アンテナの大きさは波長で決まる。だから「使う周波数」を最初に決めないとアンテナは選べない。"
      ]}
      practice={{
        text: "設計では「λ/2」「λ/4」という波長の分数がアンテナ長の目安になります。実際の数値は計算ツールで確かめられます。",
        toolHref: "/tools/frequency-wavelength",
        toolLabel: "周波数・波長ツールで計算する"
      }}
      deepDive={{
        formula: "λ[m] = c / f = 299,792,458 / f[Hz]\n例: 920MHz → λ = 0.3259 m、λ/4 = 81.5 mm",
        body: (
          <>
            <p>
              この画面の波は「空間スナップショット」です。横軸は実寸1mで波長は正確ですが、アニメーションの進む速さだけは
              体感用に落としています（実際は1秒に地球7周半＝知覚不能）。また電波は横波で、電界と磁界が直交して進みます——
              ここで描いた1本のカーブは電界成分の大きさだけを取り出したものです。
            </p>
            <p>
              媒質中では位相速度が c/√εr に落ち、波長も同じ比で縮みます（基板上のパターンが「短縮率」で短くなる理由）。
            </p>
          </>
        )
      }}
      column={{
        title: "「何の役にも立たない」と言った発見者",
        body: (
          <>
            <p>
              1888年、ハインリヒ・ヘルツは火花放電の実験で、マクスウェルが数式の上で予言した電磁波を初めて捕まえました。
              学生に「これは何の役に立つのですか」と聞かれたヘルツの答えは「何の役にも立たない。マクスウェル先生が正しかったと分かるだけだ」。
              その「役に立たない波」は、わずか7年後にマルコーニの無線電信になり、いまや人類の通信の土台です。
            </p>
            <p>
              ヘルツの実験装置は、火花ギャップ（送信）と、小さな隙間をもつ金属の輪（受信）。輪の隙間に飛ぶ微かな火花を暗室で目視する——
              つまり人類最初の電波受信機は「人間の目」でした。周波数の単位Hz（ヘルツ）は、この人の名前です。
              あなたがスライダーで動かした「1秒あたりの振動回数」は、130年前に暗室で火花を数えた物理学者への敬意を単位にしています。
            </p>
          </>
        ),
        breakNote:
          "「波」という言葉から水面の波を思い浮かべますが、水と違い電波は媒質なしの真空を伝わります——揺れているのは水ではなく電界と磁界そのものです。",
        sources: [
          {
            label: "H. Hertz, Untersuchungen über die Ausbreitung der elektrischen Kraft (1892)",
            note: "電磁波実証実験の原典"
          },
          {
            label: "J. C. Maxwell, A Treatise on Electricity and Magnetism (1873)",
            note: "電磁波の理論的予言"
          },
          {
            label: "IEEE Spectrum: Heinrich Hertz and the Discovery of Radio Waves",
            href: "https://spectrum.ieee.org/hertz-and-the-discovery-of-radio-waves",
            note: "逸話の背景解説"
          }
        ]
      }}
    />
  );
}

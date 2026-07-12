"use client";

import { useMemo, useState } from "react";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { TermFrame, PlayPauseButton } from "../TermFrame";
import { useExperiencePlayback, useIntuitionAnimation } from "../useTermAnimation";
import { calculatePatchAntenna } from "@/lib/rf/antenna";

const VIEW_W = 560;
const VIEW_H = 260;

function DielectricExperience() {
  const [er, setEr] = useState(4.4); // Default to standard FR-4 approx
  const [phase, setPhase] = useState(0);
  const { playing, toggle } = useExperiencePlayback();

  useIntuitionAnimation((elapsedMs) => {
    setPhase((elapsedMs / 1000) * Math.PI * 2 * 0.5);
  }, playing);

  const freqMHz = 2450;
  // Free space wavelength (er = 1.0)
  const lambda0 = 299792458 / (freqMHz * 1e6);
  // Substrate effective wavelength (simplified or patch-based)
  // Let's use calculatePatchAntenna to show actual sizes
  const patchInfo = useMemo(() => {
    try {
      return calculatePatchAntenna({
        frequencyMHz: freqMHz,
        dielectricConstant: er,
        substrateHeightMm: 1.6
      });
    } catch {
      // Fallback
      return {
        widthM: 0.05,
        lengthM: 0.05 / Math.sqrt(er),
        wavelengthM: lambda0
      };
    }
  }, [er]);

  // Scaled wavelengths for plotting
  // Let's say lambda0 is represented by 160px
  const lambda0Px = 180;
  const lambdaGPx = lambda0Px / Math.sqrt(er);

  // Wave paths
  const pathFree = useMemo(() => {
    const points: string[] = [];
    const startX = 160;
    const endX = 540;
    const waveY = 60;
    for (let x = startX; x <= endX; x += 2) {
      const y = waveY - 20 * Math.sin(((x - startX) / lambda0Px) * Math.PI * 2 - phase);
      points.push(`${x === startX ? "M" : "L"} ${x} ${y.toFixed(1)}`);
    }
    return points.join(" ");
  }, [phase]);

  const pathSub = useMemo(() => {
    const points: string[] = [];
    const startX = 160;
    const endX = 540;
    const waveY = 140;
    for (let x = startX; x <= endX; x += 2) {
      const y = waveY - 20 * Math.sin(((x - startX) / lambdaGPx) * Math.PI * 2 - phase * Math.sqrt(er));
      points.push(`${x === startX ? "M" : "L"} ${x} ${y.toFixed(1)}`);
    }
    return points.join(" ");
  }, [er, lambdaGPx, phase]);

  // Patch antenna representation (scaled)
  // At er = 1.0, length is about 61mm (approx half wavelength), let's scale it to 80px
  const patchWidthPx = 70;
  const patchLengthPx = 100 / Math.sqrt(er);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-semibold text-slate-500">
          周波数: 固定 2.45 GHz
        </div>
        <PlayPauseButton playing={playing} onToggle={toggle} />
      </div>

      <svg
        role="img"
        aria-label="比誘電率の違いによる波長短縮とパッチアンテナの小型化の様子。"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mt-3 h-auto w-full"
        data-testid="experience-dielectric-svg"
        data-dielectric={er}
      >
        <rect width={VIEW_W} height={VIEW_H} fill={chartTheme.surface.canvas} />

        {/* Free Space Wave */}
        <text x="20" y="45" fill={diagramPalette.ink} fontSize="12" fontWeight="bold">自由空間 (空気)</text>
        <text x="20" y="65" fill={diagramPalette.muted} fontSize="10" style={{ fontVariantNumeric: "tabular-nums" }}>εr = 1.0</text>
        <line x1="160" y1="60" x2="540" y2="60" stroke={diagramPalette.faint} strokeDasharray="4 4" />
        <path d={pathFree} fill="none" stroke={chartTheme.series.gain} strokeWidth="2" />

        {/* Substrate Wave */}
        <text x="20" y="125" fill={diagramPalette.ink} fontSize="12" fontWeight="bold">基板内部 (誘電体)</text>
        <text x="20" y="145" fill={chartTheme.seriesText.loss} fontSize="11" fontWeight="bold" style={{ fontVariantNumeric: "tabular-nums" }}>
          εr = {er.toFixed(1)}
        </text>
        <line x1="160" y1="140" x2="540" y2="140" stroke={diagramPalette.faint} strokeDasharray="4 4" />
        <path d={pathSub} fill="none" stroke={chartTheme.series.loss} strokeWidth="2" />

        {/* Divider */}
        <line x1="10" y1="180" x2="550" y2="180" stroke={diagramPalette.faint} strokeWidth="1" />

        {/* Patch Antenna Comparison */}
        <g transform="translate(20, 195)">
          <text x="0" y="15" fill={diagramPalette.ink} fontSize="12" fontWeight="bold">基板上のパッチアンテナ（サイズ感）</text>
          
          {/* FR-4 Green Board background */}
          <rect x="220" y="-5" width="280" height="60" fill="#1e3f20" rx="4" />
          <text x="230" y="15" fill="#ffffff" opacity="0.6" fontSize="9">FR-4 基板</text>

          {/* Copper patch */}
          <rect
            x={360 - patchLengthPx / 2}
            y={25 - patchWidthPx / 4}
            width={patchLengthPx}
            height={patchWidthPx / 2}
            fill="#d97706"
            stroke="#b45309"
            strokeWidth="1"
          />
          
          {/* Dimension texts */}
          <text
            x="360"
            y="48"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="bold"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            長 L ≒ {(patchInfo.lengthM * 1000).toFixed(1)} mm
          </text>
        </g>
      </svg>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="term-dielectric-slider" className="text-sm font-semibold text-slate-900">
            比誘電率 (εr)
          </label>
          <span className="text-sm font-bold text-staf-dark" style={{ fontVariantNumeric: "tabular-nums" }}>
            εr = {er.toFixed(1)}
          </span>
        </div>
        <input
          id="term-dielectric-slider"
          type="range"
          min="1.0"
          max="10.0"
          step="0.1"
          value={er}
          aria-label="比誘電率"
          className="mt-2 w-full"
          onChange={(event) => setEr(Number(event.target.value))}
        />
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          比誘電率 εr を高くすると、誘電体中を伝わる電波が遅くなるため波がギュッと縮みます（波長短縮）。
          基板に印刷するパッチアンテナの長さも <span className="font-bold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>1 / √εr</span> に縮み、小型化できます。
        </p>
      </div>
    </div>
  );
}

export function TermDielectricConstant() {
  return (
    <TermFrame
      termId="dielectric-constant"
      title="誘電率"
      experienceHint="スライダーを動かして、比誘電率を高くすると電波の波長が縮む様子と、パッチアンテナが小型化する様子を観察しましょう。"
      experience={<DielectricExperience />}
      grasp={[
        "比誘電率（εr）が大きい媒質（ガラス、基板の樹脂、セラミックなど）の中では、電波の波長が短縮されます。",
        "短縮率は 1 / √εr（または実効誘電率を用いて 1 / √εeff）で表されます。",
        "誘電率の高い材料を使うことで、アンテナや高周波回路のパターン寸法を大幅に小型化できます。"
      ]}
      iotPerspective={{
        text: "IoT機器の設計において、使用する基板材料（FR-4: εr≒4.4、テフロン系: εr≒2.6、高誘電セラミックなど）の選択によりアンテナの物理サイズが決まります。小型のチップアンテナなどは高い誘電率のセラミックを利用することで、アンテナサイズを数ミリ程度にまで縮小しています。",
        toolHref: "/tools/patch-antenna-dimensions",
        toolLabel: "パッチアンテナ寸法計算ツールへ"
      }}
      deepDive={{
        formula: "λg = λ0 / √εeff\n矩形パッチアンテナの実効比誘電率 εeff ≒ (εr + 1) / 2 (厚みが十分薄く幅が広い場合の近似)\n例: εr = 4.4 のとき、短縮率 1 / √εr ≒ 0.48 (約半分のサイズに縮む)",
        body: (
          <p>
            電波が空気と基板の境界を伝わる場合、電界が両方に広がる（フリンジング電界）ため、アンテナパターンの設計では基板単体の比誘電率 εr ではなく、合成された「実効比誘電率 εeff」を用いて設計計算を行います。誘電率を高くするとアンテナは小さくなりますが、電磁界が基板内部に閉じ込められるため、アンテナの帯域幅が狭くなり放射効率が低下する傾向があります。
          </p>
        )
      }}
    />
  );
}

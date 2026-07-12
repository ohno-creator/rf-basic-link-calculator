"use client";

import { useMemo, useState } from "react";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { TermFrame } from "../TermFrame";

const VIEW_W = 560;
const VIEW_H = 220;

function PolarizationExperience() {
  const [theta, setTheta] = useState(30); // angle in degrees

  const rad = (theta * Math.PI) / 180;
  const powerRatio = Math.cos(rad) ** 2;
  const powerPercent = powerRatio * 100;
  const lossDb = theta === 90 ? Number.POSITIVE_INFINITY : -20 * Math.log10(Math.cos(rad));

  // Coordinates for the receiver antenna rod
  // Centered at (340, 100), length 80px
  const rxLine = useMemo(() => {
    const cx = 340;
    const cy = 110;
    const len = 40;
    const dx = len * Math.sin(rad);
    const dy = len * Math.cos(rad);
    return {
      x1: cx - dx,
      y1: cy - dy,
      x2: cx + dx,
      y2: cy + dy
    };
  }, [rad]);

  return (
    <div>
      <svg
        role="img"
        aria-label={`偏波の角度ずれ ${theta} 度。受信電力は ${powerPercent.toFixed(1)}% に低下（損失 ${lossDb === Number.POSITIVE_INFINITY ? "無限大" : `${lossDb.toFixed(2)} dB`}）。`}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mt-3 h-auto w-full"
        data-testid="experience-polarization-svg"
        data-angle={theta}
      >
        <rect width={VIEW_W} height={VIEW_H} fill={chartTheme.surface.canvas} />

        {/* Transmitter antenna (Vertical) */}
        <g transform="translate(60, 110)">
          <line x1="0" y1="-40" x2="0" y2="40" stroke={diagramPalette.ink} strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="0" r="4" fill={chartTheme.series.gain} />
          <text x="0" y="-50" textAnchor="middle" fill={diagramPalette.ink} fontSize="11" fontWeight="bold">送信偏波</text>
          <text x="0" y="55" textAnchor="middle" fill={diagramPalette.muted} fontSize="10">垂直偏波固定</text>
        </g>

        {/* Wave propagation arrow */}
        <g transform="translate(140, 110)">
          <path d="M 0 0 L 80 0" stroke={diagramPalette.faint} strokeWidth="2" strokeDasharray="4 4" />
          <polygon points="80,-4 88,0 80,4" fill={diagramPalette.muted} />
          <text x="40" y="-10" textAnchor="middle" fill={diagramPalette.muted} fontSize="9">電波の進行方向</text>
        </g>

        {/* Receiver antenna (Rotatable) */}
        <g>
          {/* Reference vertical line */}
          <line x1="340" y1="50" x2="340" y2="170" stroke={diagramPalette.faint} strokeWidth="1" strokeDasharray="3 3" />
          
          {/* Rotating receiver antenna */}
          <line
            x1={rxLine.x1}
            y1={rxLine.y1}
            x2={rxLine.x2}
            y2={rxLine.y2}
            stroke={chartTheme.series.gain}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="340" cy="110" r="4" fill={chartTheme.series.loss} />
          
          {/* Angle arc */}
          <path
            d={`M 340 80 A 30 30 0 0 1 ${340 + 30 * Math.sin(rad)} ${110 - 30 * Math.cos(rad)}`}
            fill="none"
            stroke={chartTheme.seriesText.loss}
            strokeWidth="1.5"
          />
          
          <text x="340" y="40" textAnchor="middle" fill={diagramPalette.ink} fontSize="11" fontWeight="bold">受信アンテナ</text>
          <text
            x="340"
            y="170"
            textAnchor="middle"
            fill={chartTheme.seriesText.loss}
            fontSize="11"
            fontWeight="bold"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            ずれ角 θ = {theta}°
          </text>
        </g>

        {/* Right side: Power bar chart */}
        <g transform="translate(460, 40)">
          <text x="25" y="-10" textAnchor="middle" fill={diagramPalette.ink} fontSize="11" fontWeight="bold">受信電力比</text>
          
          {/* Background bar */}
          <rect x="15" y="0" width="20" height="120" fill={chartTheme.surface.nested} rx="3" />
          
          {/* Foreground active power bar */}
          <rect
            x="15"
            y={120 * (1 - powerRatio)}
            width="20"
            height={120 * powerRatio}
            fill={theta === 90 ? diagramPalette.muted : chartTheme.series.gain}
            rx="3"
          />
          
          <text
            x="25"
            y="135"
            textAnchor="middle"
            fill={diagramPalette.ink}
            fontSize="12"
            fontWeight="bold"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {powerPercent.toFixed(0)}%
          </text>

          <text
            x="25"
            y="150"
            textAnchor="middle"
            fill={chartTheme.seriesText.loss}
            fontSize="10"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {theta === 90 ? "損失 無限大" : `-${lossDb.toFixed(1)} dB`}
          </text>
        </g>
      </svg>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="term-polarization-slider" className="text-sm font-semibold text-slate-900">
            受信アンテナの傾き角 (θ)
          </label>
          <span className="text-sm font-bold text-staf-dark" style={{ fontVariantNumeric: "tabular-nums" }}>
            {theta}°
          </span>
        </div>
        <input
          id="term-polarization-slider"
          type="range"
          min="0"
          max="90"
          step="1"
          value={theta}
          aria-label="受信アンテナ傾き角"
          className="mt-2 w-full"
          onChange={(event) => setTheta(Number(event.target.value))}
        />
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          偏波の向きが揃っているとき（θ = 0°）は電力を <span className="font-bold text-slate-900">100%</span> 受信できます。
          アンテナが傾くにつれて電界のひろえる成分が減少し、完全に直交（θ = 90°）すると理論上受信電力は <span className="font-bold text-slate-900">0%</span> になります。
        </p>
      </div>
    </div>
  );
}

export function TermPolarization() {
  return (
    <TermFrame
      termId="polarization"
      title="偏波"
      experienceHint="スライダーで受信アンテナを傾けて、偏波面の角度のズレによって受信できる電力がどのように減少していくか確認しましょう。"
      experience={<PolarizationExperience />}
      grasp={[
        "偏波（へんぱ）は電波の電界が振動する方向を表します（垂直、水平、円偏波など）。",
        "直線偏波どうし（例：垂直と垂直）の角度がずれると、受信可能な電力は cos²θ で減衰します。",
        "角度が45°ずれると電力は半分（-3dB）、90°で直交すると電波は理論上全く受け取れなくなります。"
      ]}
      iotPerspective={{
        text: "IoTデバイスの設置環境や、ユーザーによる携帯の向きによってアンテナの角度が変化する場合、この偏波ロスを考慮する必要があります。直線偏波のアンテナを使用する場合、最大損失（直交）を避けるために 3dB 程度の「偏波マージン」を見積もるか、リーダー側に回転する円偏波アンテナを用いて向きの依存性をキャンセルします。",
        toolHref: "/tools/polarization-loss",
        toolLabel: "偏波不整合損失計算ツールへ"
      }}
      deepDive={{
        formula: "Loss [dB] = -20 log10( |cos θ| )\n例: θ = 0°  → Loss = 0 dB (100%)\n例: θ = 30° → Loss ≒ 1.25 dB (75%)\n例: θ = 45° → Loss ≒ 3.01 dB (50%)\n例: θ = 90° → Loss = ∞ dB (0%)",
        body: (
          <p>
            偏波には振動方向が直線上にとどまる「直線偏波（垂直/水平）」と、進行に伴い回転する「円偏波（右旋/左旋）」があります。円偏波と直線偏波を組み合わせた場合、角度に依存せず常に 3dB（半分）の偏波損失が発生しますが、どのような傾きであっても安定して受信できるというメリットがあります。
          </p>
        )
      }}
    />
  );
}

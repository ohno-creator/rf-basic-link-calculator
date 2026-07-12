"use client";

import { useMemo, useState } from "react";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { TermFrame } from "../TermFrame";
import { dbiToLinear } from "@/lib/rf/antenna";

const VIEW_W = 560;
const VIEW_H = 220;

function AntennaGainExperience() {
  const [gainDbi, setGainDbi] = useState(6);

  const gainLinear = dbiToLinear(gainDbi);

  // Generate pattern path
  const patternPath = useMemo(() => {
    const cx = 220;
    const cy = 110;
    const baseR = 60; // Isotropic radius
    const samples: Array<{ rad: number; radius: number }> = [];

    // We want to deform the circle based on gain
    // As gain increases, we stretch forward (phi=0) and compress sides/back
    for (let deg = 0; deg <= 360; deg += 5) {
      const rad = (deg * Math.PI) / 180;
      
      // Morphing function:
      // forward (cos(rad) > 0) gets stretched.
      // back/sides get compressed.
      // We can use a cardioid-like shape with gain factor
      // Let's model: r = baseR * (1 + factor * cos(rad)) / Normalization
      // factor goes from 0 (0dBi) to 2.0 (15dBi)
      const factor = (gainDbi / 15) * 1.5;
      
      // To simulate constant power, we normalize the area
      // Area of circle is pi * baseR^2. Area of morphed shape should be similar.
      // A simple formula that stretches to the right:
      const cosVal = Math.cos(rad);
      
      // Let's make the beam narrower as factor increases
      // We can use a power of cosine for narrower beams: cos(rad)^pow
      const beamPow = 1 + gainDbi / 2;
      let r = baseR;
      if (cosVal > 0) {
        r = baseR * (1 - factor * 0.4 + factor * 1.8 * Math.pow(cosVal, beamPow));
      } else {
        r = baseR * (1 - factor * 0.4) * (1 + 0.3 * factor * Math.abs(cosVal));
      }
      
      // Ensure r doesn't go negative
      r = Math.max(10, r);

      samples.push({ rad, radius: r });
    }
    // 極座標図の面積∝∫r²dθ。平均r²を基準円と一致させ、総放射電力の保存を図形でも表す。
    const meanSquareRadius = samples.reduce((sum, sample) => sum + sample.radius ** 2, 0) / samples.length;
    const normalization = baseR / Math.sqrt(meanSquareRadius);
    const points: string[] = [];
    samples.forEach(({ rad, radius }, index) => {
      const normalizedRadius = radius * normalization;
      const x = cx + normalizedRadius * Math.cos(rad);
      const y = cy + normalizedRadius * Math.sin(rad);
      points.push(`${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    });
    return points.join(" ") + " Z";
  }, [gainDbi]);

  return (
    <div>
      <svg
        role="img"
        aria-label={`アンテナ利得 ${gainDbi} dBi。真数値 ${gainLinear.toFixed(1)} 倍。全放射電力は 100% で不変。`}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mt-3 h-auto w-full"
        data-testid="experience-gain-svg"
        data-gain={gainDbi}
      >
        <rect width={VIEW_W} height={VIEW_H} fill={chartTheme.surface.canvas} />

        {/* Isotropic Reference Circle (0 dBi) */}
        <circle cx="220" cy="110" r="60" fill="none" stroke={diagramPalette.muted} strokeWidth="1.5" strokeDasharray="3 3" />
        <text x="220" y="42" textAnchor="middle" fill={diagramPalette.muted} fontSize="10">等方球 0 dBi基準</text>

        {/* Ant Center Indicator */}
        <circle cx="220" cy="110" r="4" fill={diagramPalette.ink} />
        <text x="220" y="125" textAnchor="middle" fill={diagramPalette.ink} fontSize="9" fontWeight="bold">アンテナ源</text>

        {/* Morphed Pattern */}
        <path d={patternPath} fill={chartTheme.series.gain} fillOpacity="0.15" stroke={chartTheme.series.gain} strokeWidth="2.5" />

        {/* Direction Indicator */}
        <g transform="translate(420, 110)">
          <path d="M -20 0 L 20 0" stroke={diagramPalette.ink} strokeWidth="1.5" />
          <polygon points="20,-4 28,0 20,4" fill={diagramPalette.ink} />
          <text x="0" y="-8" textAnchor="middle" fill={diagramPalette.ink} fontSize="10" fontWeight="bold">最大放射方向</text>
        </g>

        {/* Right Info Section */}
        <g transform="translate(410, 30)">
          <text x="0" y="15" fill={diagramPalette.ink} fontSize="11" fontWeight="bold">利得設定:</text>
          <text
            x="0"
            y="35"
            fill={chartTheme.seriesText.gain}
            fontSize="18"
            fontWeight="bold"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {gainDbi} dBi
          </text>
          
          <text x="0" y="60" fill={diagramPalette.ink} fontSize="10">正面電力集中倍率:</text>
          <text
            x="0"
            y="75"
            fill={chartTheme.seriesText.gain}
            fontSize="12"
            fontWeight="bold"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {gainLinear.toFixed(1)} 倍
          </text>

          <text x="0" y="105" fill={diagramPalette.ink} fontSize="10">総放射電力:</text>
          <rect x="0" y="112" width="120" height="20" fill={chartTheme.surface.canvas} stroke={diagramPalette.faint} rx="2" />
          <text
            x="60"
            y="126"
            textAnchor="middle"
            fill={chartTheme.seriesText.total}
            fontSize="10"
            fontWeight="bold"
          >
            100%（増幅なし・一定）
          </text>
        </g>
      </svg>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="term-gain-slider" className="text-sm font-semibold text-slate-900">
            アンテナ利得 (Gain)
          </label>
          <span className="text-sm font-bold text-staf-dark" style={{ fontVariantNumeric: "tabular-nums" }}>
            {gainDbi} dBi
          </span>
        </div>
        <input
          id="term-gain-slider"
          type="range"
          min="0"
          max="15"
          step="1"
          value={gainDbi}
          aria-label="アンテナ利得"
          className="mt-2 w-full"
          onChange={(event) => setGainDbi(Number(event.target.value))}
        />
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          利得を上げると、ビームが特定方向に鋭く引き伸ばされ（電力の集中）、それ以外の方向への放射は凹んで小さくなります。
          全放射電力の総量は <span className="font-bold text-slate-900">100%のまま変化していません</span>。
        </p>
      </div>
    </div>
  );
}

export function TermAntennaGain() {
  return (
    <TermFrame
      termId="antenna-gain"
      title="利得（dBi）"
      experienceHint="スライダーで利得を大きくして、円形の放射パターンがどのように絞り込まれ、特定の方向へ集中していくか体感しましょう。"
      experience={<AntennaGainExperience />}
      grasp={[
        "アンテナ利得は、すべての方向に均一に放射する仮想アンテナ（等方性アンテナ＝0dBi）との比率を表します。",
        "アンテナ自身はアクティブに電波を増幅しません。利得の増加は、他の方向の電波を削って正面に『集中』させることで実現しています。",
        "高利得アンテナにするほどビームが細くなり、角度ズレによる通信切断のリスクが高くなります。"
      ]}
      iotPerspective={{
        text: "IoT機器の選定で『高利得アンテナを選べば距離が伸びる』と考えるのは危険です。向きが固定される基地局やアンテナ指向性が安定している場合を除き、角度が不確定なモバイル端末や設置姿勢がバラつくIoTセンサーでは、むしろ利得が低く全方向へ均等に飛ぶ低利得アンテナ（2dBi程度）の方が接続が安定します。",
        toolHref: "/tools/simple-link-budget",
        toolLabel: "かんたんリンク計算ツールへ"
      }}
      deepDive={{
        formula: "Gain [dBi] = 10 log10( g_linear )\n例: 0 dBi  → 1.0 倍 (等方性)\n例: 3 dBi  → 約 2.0 倍\n例: 10 dBi → 10 倍\n例: 15 dBi → 約 31.6 倍",
        body: (
          <p>
            利得の単位『dBi』の『i』はIsotropic（等方性）を意味します。ダイポールアンテナ（実在する最も基本的なアンテナ）を基準にする場合は『dBd』を用い、dBi = dBd + 2.15 という換算関係になります。高利得化するほど、電力を受け取る「有効開口面積」も広がります。
          </p>
        )
      }}
    />
  );
}

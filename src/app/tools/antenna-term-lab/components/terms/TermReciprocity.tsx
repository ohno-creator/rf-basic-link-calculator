"use client";

import { useEffect, useState } from "react";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { TermFrame, PlayPauseButton } from "../TermFrame";
import { useExperiencePlayback, useIntuitionAnimation } from "../useTermAnimation";

const VIEW_W = 560;
const VIEW_H = 200;

function ReciprocityExperience() {
  const [isLeftTx, setIsLeftTx] = useState(true);
  const [waveOffset, setWaveOffset] = useState(0);
  const { playing, toggle } = useExperiencePlayback();

  useIntuitionAnimation((elapsedMs) => {
    // Wave moves from Tx to Rx
    const speed = 0.08;
    setWaveOffset((elapsedMs * speed) % 120);
  }, playing);

  // Auto-switch direction every 5 seconds if playing
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setIsLeftTx((prev) => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, [playing]);

  const ant1Gain = 2.15; // Dipole gain in dBi
  const ant2Gain = 3.0;  // Custom antenna gain in dBi
  const pathLossDb = 40.0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsLeftTx(!isLeftTx)}
          className="rounded border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-staf/40 hover:text-staf-dark transition"
        >
          送受方向を切り替える ({isLeftTx ? "アンテナ1 → 2" : "アンテナ2 → 1"})
        </button>
        <PlayPauseButton playing={playing} onToggle={toggle} />
      </div>

      <svg
        role="img"
        aria-label={`アンテナの相反性デモ。現在の送信はアンテナ${isLeftTx ? "1" : "2"}、受信はアンテナ${isLeftTx ? "2" : "1"}。特性値（利得、経路損失）は送受反転しても変わりません。`}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mt-3 h-auto w-full"
        data-testid="experience-reciprocity-svg"
        data-direction={isLeftTx ? "1to2" : "2to1"}
      >
        <rect width={VIEW_W} height={VIEW_H} fill={chartTheme.surface.canvas} />

        {/* Left Antenna (Antenna 1) */}
        <g transform="translate(80, 100)">
          <line x1="0" y1="-35" x2="0" y2="35" stroke={diagramPalette.ink} strokeWidth="3" />
          <line x1="-10" y1="-35" x2="10" y2="-35" stroke={diagramPalette.ink} strokeWidth="2" />
          <line x1="-10" y1="35" x2="10" y2="35" stroke={diagramPalette.ink} strokeWidth="2" />
          
          <rect x="-40" y="-70" width="80" height="25" fill={isLeftTx ? chartTheme.series.gain : chartTheme.surface.canvas} rx="3" />
          <text x="0" y="-54" textAnchor="middle" fill={isLeftTx ? diagramPalette.white : diagramPalette.ink} fontSize="11" fontWeight="bold">
            {isLeftTx ? "送信 (Tx)" : "受信 (Rx)"}
          </text>

          <text x="0" y="52" textAnchor="middle" fill={diagramPalette.ink} fontSize="11" fontWeight="bold">アンテナ 1</text>
          <text x="0" y="67" textAnchor="middle" fill={diagramPalette.muted} fontSize="10" style={{ fontVariantNumeric: "tabular-nums" }}>
            利得: {ant1Gain.toFixed(2)} dBi
          </text>
        </g>

        {/* Right Antenna (Antenna 2) */}
        <g transform="translate(480, 100)">
          {/* Patch antenna representation */}
          <rect x="-15" y="-30" width="30" height="60" fill={diagramPalette.ink} rx="2" />
          <rect x="-8" y="-15" width="16" height="30" fill={diagramPalette.amber} />

          <rect x="-40" y="-70" width="80" height="25" fill={!isLeftTx ? chartTheme.series.gain : chartTheme.surface.canvas} rx="3" />
          <text x="0" y="-54" textAnchor="middle" fill={!isLeftTx ? diagramPalette.white : diagramPalette.ink} fontSize="11" fontWeight="bold">
            {!isLeftTx ? "送信 (Tx)" : "受信 (Rx)"}
          </text>

          <text x="0" y="52" textAnchor="middle" fill={diagramPalette.ink} fontSize="11" fontWeight="bold">アンテナ 2</text>
          <text x="0" y="67" textAnchor="middle" fill={diagramPalette.muted} fontSize="10" style={{ fontVariantNumeric: "tabular-nums" }}>
            利得: {ant2Gain.toFixed(1)} dBi
          </text>
        </g>

        {/* Transmission Path (Wave Animation) */}
        <g>
          <path d="M 140 100 L 420 100" stroke={diagramPalette.faint} strokeWidth="2" strokeDasharray="5 5" />
          
          {/* Moving waves */}
          {Array.from({ length: 3 }).map((_, idx) => {
            const basePos = (waveOffset + idx * 90) % 270;
            // Map pos depending on direction
            const x = isLeftTx ? 150 + basePos : 410 - basePos;
            if (x < 140 || x > 420) return null;
            return (
              <path
                key={idx}
                d={isLeftTx 
                  ? `M ${x} 90 A 15 15 0 0 1 ${x} 110` 
                  : `M ${x} 90 A 15 15 0 0 0 ${x} 110`}
                fill="none"
                stroke={chartTheme.series.gain}
                strokeWidth="2.5"
                opacity={isLeftTx ? (420 - x) / 270 : (x - 140) / 270}
              />
            );
          })}

          <rect x="230" y="112" width="100" height="24" fill={chartTheme.surface.canvas} rx="3" />
          <text
            x="280"
            y="128"
            textAnchor="middle"
            fill={diagramPalette.ink}
            fontSize="10"
            fontWeight="bold"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            伝送損失: {pathLossDb.toFixed(1)} dB
          </text>
          
          <text x="280" y="85" textAnchor="middle" fill={diagramPalette.muted} fontSize="9">
            {isLeftTx ? "伝搬方向 →" : "← 伝搬方向"}
          </text>
        </g>
      </svg>

      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        アンテナの相反性（そうはんせい）により、アンテナ1から送信してアンテナ2で受ける際の伝送損失（40.0 dB）は、
        逆にアンテナ2から送信してアンテナ1で受ける際の損失と<span className="font-bold text-slate-900">完全に一致</span>します。
      </p>
    </div>
  );
}

export function TermReciprocity() {
  return (
    <TermFrame
      termId="reciprocity"
      title="相反性"
      experienceHint="「送受方向を切り替える」ボタンを押すか、自動アニメーションで電波の進行方向が反転しても、アンテナ利得や伝送損失が全く変化しないことを確認してください。"
      experience={<ReciprocityExperience />}
      grasp={[
        "アンテナの相反性定理は、同一のアンテナを送信と受信のどちらに使っても性能特性が完全に同一になるという法則です。",
        "送信アンテナのデータシートに書かれている利得（dBi）や指向性は、受信アンテナとして使うときにもそのまま適用できます。",
        "送受信間での電波の通りやすさ（空間の減衰特性）も、方向に関わらず対称になります。"
      ]}
      iotPerspective={{
        text: "IoT機器開発において、アンテナの送受信特性は基本的に相反であるため、送信時の実効放射電力（EIRP）が良いアンテナは、受信感度やパケット受信率（PER）も同じ比率で向上します。GPS受信やBLEのペリフェラルなど、受信がメインとなる機器であっても、送信試験で得られた指向性データや利得値をそのまま設計に流用して問題ありません。",
        toolHref: "/tools/simple-link-budget",
        toolLabel: "かんたんリンク計算ツールへ"
      }}
      deepDive={{
        formula: "S12 = S21 (Sパラメータの可逆性・対称性)\n同一アンテナにおいて: G_tx(θ, φ) = G_rx(θ, φ)\n(送信指向性と受信指向性の完全一致)",
        body: (
          <p>
            アンテナの相反性が成り立つのは、アンテナ自体に非線形素子（ダイオード等）や磁性体（フェライト等を使用したアイソレータ）などの非可逆な材料が含まれず、伝搬環境が時間的に線形かつ等方である場合に限られます。一般的な誘電体・金属基板と自由空間で構成される無線システムでは、相反性は非常に高い精度で成立します。
          </p>
        )
      }}
    />
  );
}

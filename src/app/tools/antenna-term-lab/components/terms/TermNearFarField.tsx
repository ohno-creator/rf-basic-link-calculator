"use client";

import { useMemo, useState } from "react";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { TermFrame } from "../TermFrame";
import { calculateLargeArrayNearField } from "@/lib/rf/antenna";

const VIEW_W = 560;
const VIEW_H = 220;

function NearFarFieldExperience() {
  const [distCm, setDistCm] = useState(30);

  const freqMHz = 2450;
  const D_m = 0.15; // 15 cm antenna size
  const distM = distCm / 100;

  const result = useMemo(() => {
    return calculateLargeArrayNearField({
      frequencyMHz: freqMHz,
      apertureSizeM: D_m,
      distanceM: distM
    });
  }, [distM]);

  // Boundaries in cm
  const reactiveLimitCm = result.reactiveNearFieldM * 100;
  const farFieldLimitCm = result.fraunhoferM * 100;

  // Let's determine the current zone
  let zoneName = "";
  let zoneDesc = "";
  let zoneColor = "";

  if (distCm <= reactiveLimitCm) {
    zoneName = "リアクティブ近傍界 (Reactive Near Field)";
    zoneDesc = "アンテナのごく近く。電波として放射されず、コイルやコンデンサのように静電・磁界結合する領域（NFCなど）。";
    zoneColor = chartTheme.seriesText.loss;
  } else if (distCm <= farFieldLimitCm) {
    zoneName = "放射近傍界 (Radiating Near Field / Fresnel)";
    zoneDesc = "電磁界は放射されていますが、アンテナ各部からの波の位相が揃っておらず、ビームパターンが距離で変化する過渡領域。";
    zoneColor = "#b45309"; // Amber/Orange
  } else {
    zoneName = "遠方界 (Far Field / Fraunhofer)";
    zoneDesc = "アンテナから十分に離れた領域。電波は平面波となり、放射パターンや利得が距離に依存せず一定の形に落ち着きます（OTA測定条件）。";
    zoneColor = chartTheme.series.gain;
  }

  // Plot scaling: 560px represents 100cm.
  // 1cm = 4.8px. Left antenna is at 30px (x=0).
  const scaleX = (valCm: number) => 30 + valCm * 4.8;

  const antX = scaleX(0);
  const reactiveX = scaleX(reactiveLimitCm);
  const farFieldX = scaleX(farFieldLimitCm);
  const rxX = scaleX(distCm);

  return (
    <div>
      <svg
        role="img"
        aria-label={`距離 ${distCm} cm。現在の領域：${zoneName}。境界値はリアクティブ限界 ${reactiveLimitCm.toFixed(1)} cm、遠方界境界 ${farFieldLimitCm.toFixed(1)} cm。`}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mt-3 h-auto w-full"
        data-testid="experience-near-far-field-svg"
        data-distance={distCm}
      >
        <rect width={VIEW_W} height={VIEW_H} fill={chartTheme.surface.canvas} />

        {/* Zones Background */}
        {/* Reactive zone */}
        <rect x={antX} y="30" width={reactiveX - antX} height="120" fill={chartTheme.seriesText.loss} opacity="0.08" />
        {/* Transition zone */}
        <rect x={reactiveX} y="30" width={farFieldX - reactiveX} height="120" fill="#b45309" opacity="0.08" />
        {/* Far field zone */}
        <rect x={farFieldX} y="30" width={530 - farFieldX} height="120" fill={chartTheme.series.gain} opacity="0.08" />

        {/* Zone boundaries */}
        <line x1={reactiveX} y1="30" x2={reactiveX} y2="150" stroke={diagramPalette.muted} strokeWidth="1" strokeDasharray="3 3" />
        <line x1={farFieldX} y1="30" x2={farFieldX} y2="150" stroke={diagramPalette.muted} strokeWidth="1" strokeDasharray="3 3" />

        {/* Boundary Labels */}
        <text x={reactiveX} y="22" textAnchor="middle" fill={diagramPalette.muted} fontSize="9" style={{ fontVariantNumeric: "tabular-nums" }}>
          {reactiveLimitCm.toFixed(0)}cm
        </text>
        <text x={farFieldX} y="22" textAnchor="middle" fill={diagramPalette.muted} fontSize="9" style={{ fontVariantNumeric: "tabular-nums" }}>
          {farFieldLimitCm.toFixed(0)}cm
        </text>

        {/* Bottom scale axis */}
        <line x1={antX} y1="150" x2="510" y2="150" stroke={diagramPalette.inkMuted} strokeWidth="1.5" />
        {Array.from({ length: 11 }, (_, i) => {
          const valCm = i * 10;
          const x = scaleX(valCm);
          return (
            <g key={i}>
              <line x1={x} y1="150" x2={x} y2="155" stroke={diagramPalette.inkMuted} strokeWidth="1" />
              <text x={x} y="167" textAnchor="middle" fill={diagramPalette.muted} fontSize="9" style={{ fontVariantNumeric: "tabular-nums" }}>
                {valCm}
              </text>
            </g>
          );
        })}
        <text x="530" y="153" fill={diagramPalette.muted} fontSize="9">cm</text>

        {/* Transmitter Antenna Representation */}
        <g transform={`translate(${antX}, 90)`}>
          <line x1="0" y1="-30" x2="0" y2="30" stroke={diagramPalette.ink} strokeWidth="3" />
          <circle cx="0" cy="-20" r="3" fill={diagramPalette.ink} />
          <circle cx="0" cy="20" r="3" fill={diagramPalette.ink} />
          <text x="5" y="-35" fill={diagramPalette.ink} fontSize="10" fontWeight="bold">送信アンテナ (D=15cm)</text>
        </g>

        {/* Receiver Position Indicator */}
        <g transform={`translate(${rxX}, 90)`}>
          <line x1="0" y1="-15" x2="0" y2="15" stroke={zoneColor} strokeWidth="2.5" />
          <circle cx="0" cy="0" r="4" fill={zoneColor} />
          <polygon points="-8,-4 0,0 -8,4" fill={zoneColor} transform="rotate(180)" />
          <text x="0" y="-22" textAnchor="middle" fill={zoneColor} fontSize="10" fontWeight="bold">受信機</text>
        </g>

        {/* Legend */}
        <text x="40" y="195" fill={chartTheme.seriesText.loss} fontSize="9" fontWeight="bold">■ リアクティブ近傍界</text>
        <text x="175" y="195" fill="#b45309" fontSize="9" fontWeight="bold">■ 放射近傍界</text>
        <text x="290" y="195" fill={chartTheme.series.gain} fontSize="9" fontWeight="bold">■ 遠方界</text>
      </svg>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="term-near-far-slider" className="text-sm font-semibold text-slate-900">
            アンテナからの距離
          </label>
          <span className="text-sm font-bold text-staf-dark" style={{ fontVariantNumeric: "tabular-nums" }}>
            d = {distCm} cm
          </span>
        </div>
        <input
          id="term-near-far-slider"
          type="range"
          min="1"
          max="100"
          step="1"
          value={distCm}
          aria-label="受信距離"
          className="mt-2 w-full"
          onChange={(event) => setDistCm(Number(event.target.value))}
        />
        <div className="mt-3 rounded-md bg-slate-50 p-3">
          <div className="text-xs font-bold" style={{ color: zoneColor }}>
            {zoneName}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            {zoneDesc}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TermNearFarField() {
  return (
    <TermFrame
      termId="near-far-field"
      title="近傍界・遠方界"
      experienceHint="距離スライダーを動かして、アンテナからの距離に応じて電磁界の性質を示すエリアがどのように遷移するか観察しましょう。"
      experience={<NearFarFieldExperience />}
      grasp={[
        "アンテナ周辺の空間は、アンテナサイズ D と波長 λ に基づき、リアクティブ近傍界、放射近傍界（過渡）、遠方界に分かれます。",
        "アンテナに極めて近いリアクティブ近傍界では、電波が飛ぶのではなく、静電容量やインダクタンスによるエネルギー蓄積（結合）が主となります。",
        "測定器などで正しい放射パターンを評価するためには、波の位相が平面上に揃う「遠方界」の領域まで離す必要があります。"
      ]}
      iotPerspective={{
        text: "IoT分野では、NFCやワイヤレス電力伝送（WPT）はリアクティブ近傍界の強い磁気結合を利用して通信を行います（数cm以内）。一方で、LTEやWi-Fiなどの一般的な空間通信や、アンテナ特性のOTA性能測定は、安定した放射電波を評価するために遠方界領域（例えば2.4GHz帯のスマートフォンサイズで35cm以上先）で行う必要があります。",
        toolHref: "/tools/large-array-near-field",
        toolLabel: "大型アレイ近傍界判定ツールへ"
      }}
      deepDive={{
        formula: "遠方界境界距離 Rff = 2D² / λ\nリアクティブ近傍界境界距離 Rnf ≒ 0.62 √(D³ / λ)\n(※アンテナ最大寸法 D が波長 λ より十分大きい場合)\n例: D = 15 cm, f = 2450 MHz (λ = 12.24 cm) のとき、Rff ≒ 36.7 cm",
        body: (
          <p>
            アンテナの開口寸法 D が波長 λ に比べて小さい（例：半波長ダイポール）場合、遠方界の基準は 2D²/λ よりも「波長の数倍先（2λ〜3λ程度）」が支配的になります。近傍界では電磁界の波としての進行方向だけでなく、アンテナからの反射的な不要電流も大きく干渉するため、インピーダンスや利得の測定値が距離に依存して激しく変動します。
          </p>
        )
      }}
    />
  );
}

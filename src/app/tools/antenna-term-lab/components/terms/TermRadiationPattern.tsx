"use client";

import { useMemo, useState } from "react";
import { chartTheme } from "@/lib/chartTheme";
import { diagramPalette } from "@/lib/ui/diagramTheme";
import { TermFrame } from "../TermFrame";

const VIEW_W = 560;
const VIEW_H = 220;

function RadiationPatternExperience() {
  const [slicePlane, setSlicePlane] = useState<"vertical" | "horizontal">("vertical");

  // Generate 2D slice path
  // Vertical slice is a figure-8: r = baseR * sin(rad)
  // Horizontal slice is a circle: r = baseR
  const slicePath = useMemo(() => {
    const cx = 380;
    const cy = 110;
    const points: string[] = [];
    const baseR = 65;

    for (let deg = 0; deg <= 360; deg += 5) {
      const rad = (deg * Math.PI) / 180;
      let r = baseR;

      if (slicePlane === "vertical") {
        // Figure-8 pattern: r = baseR * |sin(rad)|
        // Ant is vertical, so peak is at rad = 0 and rad = pi (horizontal directions)
        r = baseR * Math.abs(Math.cos(rad));
      } else {
        // Horizontal plane: perfect circle
        r = baseR;
      }
      
      // Pad slightly to not shrink to absolute zero for rendering
      r = Math.max(2, r);

      const x = cx + r * Math.cos(rad);
      const y = cy + r * Math.sin(rad);
      points.push(`${deg === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return points.join(" ") + " Z";
  }, [slicePlane]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSlicePlane("vertical")}
            className={`rounded px-3 py-1 text-xs font-semibold transition ${
              slicePlane === "vertical"
                ? "bg-staf text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-staf/40"
            }`}
          >
            垂直面断面 (E面)
          </button>
          <button
            type="button"
            onClick={() => setSlicePlane("horizontal")}
            className={`rounded px-3 py-1 text-xs font-semibold transition ${
              slicePlane === "horizontal"
                ? "bg-staf text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-staf/40"
            }`}
          >
            水平面断面 (H面)
          </button>
        </div>
        <div className="text-xs font-semibold text-slate-500">
          ダイポールアンテナ基準
        </div>
      </div>

      <svg
        role="img"
        aria-label={`ダイポールアンテナの放射パターン。現在の表示は${slicePlane === "vertical" ? "垂直面（8の字型）" : "水平面（円形）"}。`}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mt-3 h-auto w-full"
        data-testid="experience-pattern-svg"
        data-plane={slicePlane}
      >
        <rect width={VIEW_W} height={VIEW_H} fill={chartTheme.surface.canvas} />

        {/* Left Side: 2.5D Donut representation */}
        <g transform="translate(130, 110)">
          {/* Donut back */}
          <ellipse cx="0" cy="0" rx="70" ry="30" fill="none" stroke={diagramPalette.muted} strokeWidth="1" strokeDasharray="3 3" />
          <ellipse cx="0" cy="0" rx="30" ry="12" fill="none" stroke={diagramPalette.muted} strokeWidth="1" strokeDasharray="3 3" />
          
          {/* Vertical Dipole rod */}
          <line x1="0" y1="-55" x2="0" y2="55" stroke={diagramPalette.ink} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="0" cy="0" r="3.5" fill={chartTheme.series.loss} />

          {/* Donut front */}
          <path d="M -70,0 A 70,30 0 0,0 70,0 A 30,12 0 0,1 -30,0" fill={chartTheme.series.gain} fillOpacity="0.1" stroke={chartTheme.series.gain} strokeWidth="1.5" />
          <path d="M -70,0 A 70,30 0 0,0 70,0" fill="none" stroke={chartTheme.series.gain} strokeWidth="2" />
          
          <text x="0" y="75" textAnchor="middle" fill={diagramPalette.ink} fontSize="11" fontWeight="bold">3D放射パターン（ドーナツ型）</text>
        </g>

        {/* Vertical divider */}
        <line x1="260" y1="20" x2="260" y2="200" stroke={diagramPalette.faint} strokeWidth="1" />

        {/* Right Side: 2D slice */}
        <g>
          {/* Grid lines */}
          <circle cx="380" cy="110" r="65" fill="none" stroke={diagramPalette.faint} strokeWidth="1" />
          <circle cx="380" cy="110" r="32" fill="none" stroke={diagramPalette.faint} strokeWidth="1" />
          <line x1="300" y1="110" x2="460" y2="110" stroke={diagramPalette.faint} strokeWidth="1" />
          <line x1="380" y1="30" x2="380" y2="190" stroke={diagramPalette.faint} strokeWidth="1" />

          {/* The Ant Rod representation in vertical slice */}
          {slicePlane === "vertical" ? (
            <line x1="380" y1="90" x2="380" y2="130" stroke={diagramPalette.ink} strokeWidth="3" />
          ) : (
            <circle cx="380" cy="110" r="4" fill={diagramPalette.ink} />
          )}

          {/* Sliced Pattern */}
          <path d={slicePath} fill={chartTheme.series.gain} fillOpacity="0.15" stroke={chartTheme.series.gain} strokeWidth="2.5" />

          <text x="380" y="22" textAnchor="middle" fill={diagramPalette.ink} fontSize="11" fontWeight="bold">
            {slicePlane === "vertical" ? "垂直面断面 (E面)" : "水平面断面 (H面)"}
          </text>
          
          <text x="380" y="196" textAnchor="middle" fill={diagramPalette.muted} fontSize="10">
            {slicePlane === "vertical" ? "真上・真下は放射ゼロ (ヌル点)" : "全方向に均等に放射"}
          </text>
        </g>
      </svg>

      <div className="mt-3">
        <p className="text-sm leading-relaxed text-slate-600">
          {slicePlane === "vertical" ? (
            <span>垂直面（E面）では、アンテナの軸方向（上下）へは電波が全く飛ばず、真横へ強く飛ぶ<span className="font-bold text-slate-900">「8の字型」</span>になります。</span>
          ) : (
            <span>水平面（H面）では、アンテナの軸から均等な距離に飛ぶため、きれいな<span className="font-bold text-slate-900">「円形（全指向性）」</span>になります。</span>
          )}
        </p>
      </div>
    </div>
  );
}

export function TermRadiationPattern() {
  return (
    <TermFrame
      termId="radiation-pattern"
      title="指向性・放射パターン"
      experienceHint="ボタンを押して、3次元のドーナツ型パターンを「垂直面」と「水平面」で切り取ったときの断面図の形状変化を確認しましょう。"
      experience={<RadiationPatternExperience />}
      grasp={[
        "放射パターン（指向性）は、アンテナがどの方向へ強く電波を飛ばすか（または受信するか）を示す3次元の分布特性です。",
        "半波長ダイポールなどの基本アンテナは、軸と直交する方向に電波が広がり、軸方向（端）には電波が出ないドーナツ型指向性を持ちます。",
        "データシートでは、これを垂直面断面（E面）と水平面断面（H面）の2つの二次元グラフで表現します。"
      ]}
      iotPerspective={{
        text: "IoTゲートウェイなどを天井の中央に設置する場合、ドーナツの円形部分（H面）が床と平行に広がるように、アンテナを垂直に立てて設置します。逆に壁面に設置する場合は、パターンの向きが90度変わるため、アンテナの倒し方や指向性を考慮しないと、部屋の端や特定階への通信品質が劣化します。",
        toolHref: "/tools/aperture-gain-beamwidth",
        toolLabel: "ビーム幅計算ツールへ"
      }}
      deepDive={{
        formula: "E(θ) ＝ cos( (π/2) cos θ ) / sin θ\n(半波長ダイポールアンテナの垂直面内の正規化電界指向性式)\nθ ＝ 90°(直交方向)で最大放射 1.0、θ ＝ 0°, 180°(端部方向)でゼロ放射(ヌル点)",
        body: (
          <p>
            アンテナの周囲に障害物（筐体の金属、ネジ、あるいは人体や壁など）が存在すると、この綺麗なドーナツパターンは反射・回折・吸収によって激しく歪みます。アンテナ単体がいくら全指向性（水平面で円）であっても、筐体組み込み後は非対称なパターンになり、通信方向による相性の原因となります。
          </p>
        )
      }}
    />
  );
}

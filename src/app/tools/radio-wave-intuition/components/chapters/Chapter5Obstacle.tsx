"use client";

import { useState } from "react";
import { chartTheme } from "@/lib/chartTheme";
import { diagramMaterial, diagramPalette } from "@/lib/ui/diagramTheme";
import { ChapterFrame, PlayPauseButton } from "./ChapterFrame";
import { useExperiencePlayback, useIntuitionAnimation } from "./useIntuitionAnimation";
import type { IntuitionChapterMeta } from "./types";

export const chapter5ObstacleMeta: IntuitionChapterMeta = {
  id: "obstacle",
  order: 5,
  title: "遮られても、回り込む——影と回折",
  lead: "壁の材質と周波数を替えて、電波の『影の濃さ』を見てください。",
  navLabel: "影と回折"
};

const SPEED_OF_LIGHT_M_S = 299_792_458;

const FREQ_PRESETS = [
  { mhz: 430, label: "430MHz" },
  { mhz: 920, label: "920MHz" },
  { mhz: 2400, label: "2.4GHz" },
  { mhz: 5600, label: "5.6GHz" }
] as const;

type FreqMHz = (typeof FREQ_PRESETS)[number]["mhz"];

/**
 * 透過損失の目安表（dB）。本章の感覚用で、根拠は ITU-R P.2040-2 系の建材電気定数
 * （deepDive で明記）。実際は壁厚・含水率・鉄筋・入射角で大きく変わる。
 */
const MATERIALS = [
  { key: "wood", label: "木の内壁", fill: diagramMaterial.soil, loss: { 430: 2, 920: 3, 2400: 4, 5600: 5 } },
  { key: "concrete", label: "コンクリート壁", fill: diagramMaterial.concrete, loss: { 430: 10, 920: 12, 2400: 16, 5600: 20 } },
  { key: "metal", label: "金属板", fill: diagramMaterial.metal, loss: { 430: 40, 920: 40, 2400: 40, 5600: 40 } }
] as const;

type MaterialKey = (typeof MATERIALS)[number]["key"];

/** 壁の陰のグラデ濃度（感覚表現）。高い周波数ほど影が濃く・シャープに。 */
const SHADOW_OPACITY: Record<FreqMHz, number> = { 430: 0.1, 920: 0.15, 2400: 0.21, 5600: 0.27 };

// ---- 物理ジオメトリ（実寸・メートル） ----
const D1_M = 10; // 送信 → 壁
const D2_M = 10; // 壁 → 受信
const TX_HEIGHT_M = 3.5;
const WALL_HEIGHT_M = 3.0;
const RX_MIN_M = 0.2;
const RX_MAX_M = 4.0;

// ---- SVG レイアウト（px） ----
const VIEW_W = 560;
const VIEW_H = 292;
const GROUND_Y = 256;
const PX_PER_M = 48;
const TX_X = 70;
const WALL_X = 290;
const RX_X = 510;
const WALL_HALF_W = 7;
const SHADOW_EDGE_X = 546;

function yOf(heightM: number): number {
  return GROUND_Y - heightM * PX_PER_M;
}

/**
 * ナイフエッジ回折損失 J(v)（ITU-R P.526 の近似式）。
 * v ≤ −0.78（十分な見通し余裕）では 0 dB とする。
 */
function knifeEdgeLossDb(v: number): number {
  if (v <= -0.78) {
    return 0;
  }
  return 6.9 + 20 * Math.log10(Math.sqrt((v - 0.1) ** 2 + 1) + v - 0.1);
}

function formatDb(db: number): string {
  if (Math.abs(db) < 0.05) {
    return "0.0 dB";
  }
  return `${db < 0 ? "−" : ""}${Math.abs(db).toFixed(1)} dB`;
}

type Pt = { x: number; y: number };

/** 折れ線 points 上を割合 t（0〜1）だけ進んだ座標。移動パルスの描画用。 */
function pointAlong(points: Pt[], t: number): Pt {
  const lengths: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const len = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    lengths.push(len);
    total += len;
  }
  let dist = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < lengths.length; i += 1) {
    if (dist <= lengths[i] || i === lengths.length - 1) {
      const r = lengths[i] === 0 ? 0 : dist / lengths[i];
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * r,
        y: points[i].y + (points[i + 1].y - points[i].y) * r
      };
    }
    dist -= lengths[i];
  }
  return points[points.length - 1];
}

function ObstacleExperience() {
  const [materialKey, setMaterialKey] = useState<MaterialKey>("concrete");
  const [freqMHz, setFreqMHz] = useState<FreqMHz>(920);
  const [rxHeightM, setRxHeightM] = useState(1.0);
  const [phase, setPhase] = useState(0);
  const { playing, toggle } = useExperiencePlayback();

  useIntuitionAnimation((elapsedMs) => {
    setPhase(elapsedMs / 1000);
  }, playing);

  const material = MATERIALS.find((m) => m.key === materialKey) ?? MATERIALS[1];
  const freq = FREQ_PRESETS.find((f) => f.mhz === freqMHz) ?? FREQ_PRESETS[1];

  // --- 物理計算（実寸） ---
  const lambdaM = SPEED_OF_LIGHT_M_S / (freqMHz * 1e6);
  // 送信→受信の直線が壁の位置を通る高さ
  const lineAtWallM = TX_HEIGHT_M + (rxHeightM - TX_HEIGHT_M) * (D1_M / (D1_M + D2_M));
  const clearanceM = WALL_HEIGHT_M - lineAtWallM; // 正なら遮蔽（陰の深さ）
  const blocked = clearanceM > 0;
  const v = clearanceM * Math.sqrt((2 * (D1_M + D2_M)) / (lambdaM * D1_M * D2_M));
  const diffLossDb = knifeEdgeLossDb(v);
  const throughLossDb = blocked ? material.loss[freqMHz] : 0;
  const bestLossDb = blocked ? Math.min(throughLossDb, diffLossDb) : 0;
  const rxDb = -bestLossDb;
  const adopted: "los" | "through" | "diffraction" = !blocked
    ? "los"
    : diffLossDb < throughLossDb
      ? "diffraction"
      : "through";

  // --- SVG ジオメトリ ---
  const txPt: Pt = { x: TX_X, y: yOf(TX_HEIGHT_M) };
  const rxPt: Pt = { x: RX_X, y: yOf(rxHeightM) };
  const wallTopPt: Pt = { x: WALL_X, y: yOf(WALL_HEIGHT_M) };
  const wallCrossPt: Pt = { x: WALL_X, y: yOf(lineAtWallM) };

  // 幾何影の境界: 送信点→壁上端の光線を右へ延長
  const pxPerHorizM = (RX_X - WALL_X) / D2_M;
  const shadowEdgeHeightM =
    WALL_HEIGHT_M + ((WALL_HEIGHT_M - TX_HEIGHT_M) / D1_M) * ((SHADOW_EDGE_X - WALL_X) / pxPerHorizM);
  const shadowOpacity = SHADOW_OPACITY[freqMHz];

  const adoptedPoints: Pt[] =
    adopted === "los" ? [txPt, rxPt] : adopted === "through" ? [txPt, wallCrossPt, rxPt] : [txPt, wallTopPt, rxPt];
  const routeColor = adopted === "diffraction" ? diagramPalette.success : diagramPalette.staf;
  const afterWallOpacity = Math.max(0.2, 1 - bestLossDb / 45);

  const statusColor =
    rxDb >= -6 ? chartTheme.seriesText.gain : rxDb >= -20 ? diagramPalette.warnDeep : chartTheme.seriesText.loss;
  const routeNote =
    adopted === "los"
      ? "壁の上に見通しあり"
      : adopted === "diffraction"
        ? "回り込み（回折）ルートが有利"
        : "透過ルートが有利";

  const dotCount = 3;
  const dots = Array.from({ length: dotCount }, (_, i) => {
    const t = (phase * 0.35 + i / dotCount) % 1;
    return pointAlong(adoptedPoints, t);
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">材質</span>
          {MATERIALS.map((item) => {
            const active = materialKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={active}
                onClick={() => setMaterialKey(item.key)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  active
                    ? "border-staf bg-staf text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-staf-dark"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <PlayPauseButton playing={playing} onToggle={toggle} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-slate-500">周波数</span>
        {FREQ_PRESETS.map((preset) => {
          const active = freqMHz === preset.mhz;
          return (
            <button
              key={preset.mhz}
              type="button"
              aria-pressed={active}
              onClick={() => setFreqMHz(preset.mhz)}
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

      <div className="mt-3 flex items-stretch gap-3">
        <div className="min-w-0 flex-1">
          <svg
            role="img"
            aria-label={`壁の材質 ${material.label}、周波数 ${freq.label}、受信点の高さ ${rxHeightM.toFixed(2)} m。受信レベルは送信基準で ${formatDb(rxDb)}。${routeNote}。`}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="h-auto w-full"
            data-testid="intuition-obstacle-svg"
            data-rx-db={rxDb.toFixed(1)}
          >
            <defs>
              <linearGradient id="ch5-shadow-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor={diagramPalette.ink} stopOpacity={shadowOpacity} />
                <stop offset="1" stopColor={diagramPalette.ink} stopOpacity={shadowOpacity * 0.25} />
              </linearGradient>
            </defs>

            <rect width={VIEW_W} height={VIEW_H} fill={chartTheme.surface.canvas} />

            {/* 壁の陰（幾何影。濃さは周波数依存＝低周波ほど薄い） */}
            <polygon
              points={`${WALL_X + WALL_HALF_W},${wallTopPt.y} ${SHADOW_EDGE_X},${yOf(shadowEdgeHeightM).toFixed(1)} ${SHADOW_EDGE_X},${GROUND_Y} ${WALL_X + WALL_HALF_W},${GROUND_Y}`}
              fill="url(#ch5-shadow-grad)"
            />

            {/* 地面 */}
            <line x1={12} y1={GROUND_Y} x2={VIEW_W - 12} y2={GROUND_Y} stroke={diagramPalette.muted} strokeWidth={1.5} />
            <text x={SHADOW_EDGE_X} y={GROUND_Y + 18} textAnchor="end" fill={diagramPalette.faint} fontSize={10}>
              送信—壁 10 m・壁—受信 10 m（実寸）
            </text>

            {/* 壁 */}
            <rect
              x={WALL_X - WALL_HALF_W}
              y={wallTopPt.y}
              width={WALL_HALF_W * 2}
              height={GROUND_Y - wallTopPt.y}
              fill={material.fill}
              stroke={diagramPalette.inkSoft}
              strokeWidth={1}
            />
            <text
              x={WALL_X}
              y={GROUND_Y + 18}
              textAnchor="middle"
              fill={diagramPalette.inkSoft}
              fontSize={10}
              fontWeight={600}
            >
              {material.label}（高さ 3 m）
            </text>

            {/* 直接波（透過ルート）: 壁の手前は実線、壁から先は減衰して破線 */}
            {blocked ? (
              <g>
                <line
                  x1={txPt.x}
                  y1={txPt.y}
                  x2={wallCrossPt.x}
                  y2={wallCrossPt.y}
                  stroke={diagramPalette.staf}
                  strokeWidth={adopted === "through" ? 3 : 1.5}
                  strokeOpacity={adopted === "through" ? 1 : 0.45}
                  strokeLinecap="round"
                />
                <line
                  x1={wallCrossPt.x}
                  y1={wallCrossPt.y}
                  x2={rxPt.x}
                  y2={rxPt.y}
                  stroke={diagramPalette.staf}
                  strokeWidth={adopted === "through" ? 3 : 1.5}
                  strokeDasharray="6 5"
                  strokeOpacity={(adopted === "through" ? 1 : 0.45) * Math.max(0.2, 1 - throughLossDb / 45)}
                  strokeLinecap="round"
                />
                <text
                  x={(WALL_X + RX_X) / 2}
                  y={(wallCrossPt.y + rxPt.y) / 2 - 9}
                  textAnchor="middle"
                  fill={diagramPalette.stafDark}
                  fontSize={11}
                  fontWeight={adopted === "through" ? 700 : 400}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  透過 −{throughLossDb} dB
                </text>
              </g>
            ) : (
              <line
                x1={txPt.x}
                y1={txPt.y}
                x2={rxPt.x}
                y2={rxPt.y}
                stroke={diagramPalette.staf}
                strokeWidth={3}
                strokeLinecap="round"
              />
            )}

            {/* 回折波（壁上端で折れ曲がるルート） */}
            {blocked ? (
              <g>
                <path
                  d={`M ${txPt.x} ${txPt.y} L ${wallTopPt.x} ${wallTopPt.y} L ${rxPt.x} ${rxPt.y}`}
                  fill="none"
                  stroke={diagramPalette.success}
                  strokeWidth={adopted === "diffraction" ? 3 : 1.5}
                  strokeOpacity={adopted === "diffraction" ? 1 : 0.45}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <text
                  x={WALL_X - 14}
                  y={wallTopPt.y - 10}
                  textAnchor="end"
                  fill={chartTheme.seriesText.gain}
                  fontSize={11}
                  fontWeight={adopted === "diffraction" ? 700 : 400}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  回折 −{diffLossDb.toFixed(1)} dB
                </text>
              </g>
            ) : null}

            {/* 採用ルートを進むパルス */}
            {dots.map((dot, i) => (
              <circle
                key={i}
                cx={dot.x.toFixed(1)}
                cy={dot.y.toFixed(1)}
                r={4}
                fill={routeColor}
                stroke={diagramPalette.white}
                strokeWidth={1.5}
                opacity={dot.x <= WALL_X ? 1 : afterWallOpacity}
              />
            ))}

            {/* 送信 */}
            <line x1={TX_X} y1={GROUND_Y} x2={TX_X} y2={txPt.y + 6} stroke={diagramPalette.inkMuted} strokeWidth={2} />
            <circle cx={txPt.x} cy={txPt.y} r={6} fill={diagramPalette.staf} stroke={diagramPalette.white} strokeWidth={2} />
            <text x={TX_X} y={txPt.y - 12} textAnchor="middle" fill={diagramPalette.stafDark} fontSize={11} fontWeight={700}>
              送信
            </text>

            {/* 受信（縦スライダーで上下） */}
            <line
              x1={RX_X}
              y1={yOf(RX_MAX_M)}
              x2={RX_X}
              y2={GROUND_Y}
              stroke={diagramPalette.faint}
              strokeWidth={1}
              strokeDasharray="2 4"
            />
            <circle cx={rxPt.x} cy={rxPt.y} r={7} fill={diagramPalette.staf} stroke={diagramPalette.white} strokeWidth={2} />
            <text x={RX_X} y={rxPt.y - 13} textAnchor="middle" fill={diagramPalette.stafDark} fontSize={11} fontWeight={700}>
              受信
            </text>

            {/* 読み値 */}
            <text x={20} y={22} fill={diagramPalette.muted} fontSize={10}>
              受信レベル（送信を 0 dB として）
            </text>
            <text
              x={20}
              y={44}
              fill={statusColor}
              fontSize={20}
              fontWeight={700}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatDb(rxDb)}
            </text>
            <text x={20} y={61} fill={diagramPalette.inkSoft} fontSize={11}>
              {routeNote}
            </text>
          </svg>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1">
          <span className="text-center text-xs font-semibold text-slate-500">受信点の高さ</span>
          <span className="text-xs font-bold text-staf-dark" style={{ fontVariantNumeric: "tabular-nums" }}>
            {rxHeightM.toFixed(2)} m
          </span>
          <input
            id="intuition-obstacle-rxh"
            type="range"
            min={RX_MIN_M}
            max={RX_MAX_M}
            step={0.05}
            value={rxHeightM}
            aria-label="受信点の高さ（メートル）"
            aria-orientation="vertical"
            className="min-h-0 flex-1"
            style={{ writingMode: "vertical-lr", direction: "rtl" }}
            onChange={(event) => setRxHeightM(Number(event.target.value))}
          />
          <span className="text-center text-[10px] leading-tight text-slate-400">
            低いほど
            <br />
            深い陰
          </span>
        </div>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {blocked ? (
          <>
            {material.label}を<span className="font-bold text-slate-900">透過</span>すると{" "}
            <span style={{ fontVariantNumeric: "tabular-nums" }}>−{throughLossDb} dB</span>、壁の上端を
            <span className="font-bold text-slate-900">回り込む</span>と{" "}
            <span style={{ fontVariantNumeric: "tabular-nums" }}>−{diffLossDb.toFixed(1)} dB</span>（{freq.label}・波長{" "}
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{(lambdaM * 100).toFixed(1)} cm</span>）。 強い方のルートが生き残り、受信レベルは
            <span className="font-bold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
              {formatDb(rxDb)}
            </span>
            になります。
          </>
        ) : (
          <>
            受信点から壁の上ごしに送信アンテナが見えています（見通し内）。遮るものがないので、この図の範囲では損失はほぼ 0 dB
            です。スライダーで受信点を下げて、陰に入れてみてください。
          </>
        )}
      </p>
    </div>
  );
}

export function Chapter5Obstacle() {
  return (
    <ChapterFrame
      chapterId="obstacle"
      experienceHint="材質と周波数を切り替え、受信点を縦スライダーで壁の陰へ沈めて、受信レベルがどちらのルート（透過／回り込み）で決まるかを見てください。"
      experience={<ObstacleExperience />}
      grasp={[
        "低い周波数（長い波長）ほど障害物の陰へ回り込む。AMラジオが山陰でも聞こえるのはこのため。",
        "材質で桁が違う——木の内壁は数dB、コンクリートは10dB超、金属板は約40dBでほぼ遮断。",
        "「見えない場所に届くか」は透過と回折の勝負。強い方のルートが実効的な受信レベルを決める。"
      ]}
      practice={{
        text: "見通しが取れていても、経路のまわりの「フレネルゾーン」に障害物がかかると回折損失が生じます。必要なクリアランスの実寸はツールで計算できます。",
        toolHref: "/tools/fresnel-zone",
        toolLabel: "フレネルゾーンツールで見通しと回折を計算"
      }}
      deepDive={{
        formula:
          "v = h·√( 2(d₁+d₂) / (λ·d₁·d₂) )   h: 遮蔽高[m]、d₁,d₂: 端点→壁上端の水平距離[m]\nJ(v) ≈ 6.9 + 20·log₁₀( √((v−0.1)²+1) + v − 0.1 ) dB   （v > −0.78、それ以下は 0 dB）\n例: d₁=d₂=10m, h=1.0m → 430MHz(λ=0.70m): v≈0.76 → 12dB ／ 5.6GHz(λ=0.054m): v≈2.7 → 22dB",
        body: (
          <>
            <p>
              回折はナイフエッジ（薄い刃状の障害物）近似（ITU-R P.526）で計算しています。遮蔽の深さを表す無次元数 v
              が大きいほど損失が増え、同じ幾何でも λ が長い（周波数が低い）ほど v は小さくなる——これが
              「低い周波数ほど回り込む」の正体です。厚みのある壁や屋根状の障害物では、単一ナイフエッジより数dB大きくなります。
            </p>
            <p>
              透過損失の表は ITU-R P.2040-2（建材の電気定数）系の値をもとにした本章用の目安です。実際は壁の厚さ・含水率・
              鉄筋ピッチ・入射角で大きく変わり、同じ「コンクリート」でも±10dB級のばらつきがあります。
            </p>
            <p>
              この図のうそ：経路を「透過」と「上端回折」の2本だけに簡略化し、強い方のみを採用しています。実際は床・天井・
              周囲の壁からの反射（マルチパス）や壁側面の回折も合成され、受信レベルは場所によって数dB〜十数dB波打ちます。
              地面反射と自由空間伝搬損失（距離による減衰）もこの図では省略し、壁の影響だけを取り出しています。
            </p>
          </>
        )
      }}
      column={{
        title: "災害のとき、なぜAMラジオなのか",
        body: (
          <>
            <p>
              2011年3月11日、東日本大震災。停電でテレビは消え、携帯電話は輻輳で沈黙するなか、避難所で最後まで情報を運び
              続けた経路のひとつがAMラジオでした。AM放送が使う中波（531〜1602kHz）の波長はおよそ190mから560m。
              山ひとつ、ビル一棟でさえ波長より小さな障害物にすぎず、この章で見た回折が桁違いのスケールで働いて、
              電波は陰へ陰へと回り込みます。さらに中波は大地の表面に沿って曲がりながら進む「地表波」として伝わり、
              見通し距離をはるかに超えて、地平線の先の谷あいまで届きます。カーラジオが山道のどこでも鳴るのはこのためです。
            </p>
            <p>
              ところが皮肉なことに、送信する側は災害に弱いままでした。波長数百mに見合う送信アンテナは高さ100m級の鉄塔で、
              広い敷地と良好な大地導電率を求めて、河口や埋立地の低地に建てられてきた——つまり津波や洪水の浸水想定区域です。
              そこで総務省は2014年に制度を整え、AM局の番組を災害に強い山上のFM局からも同時に流す「FM補完放送
              （ワイドFM、90.1〜94.9MHz）」が始まりました。回り込みで面を覆うAMと、送信所を守りやすいFM。
              ひとつの番組を波長の異なる2つの波で運ぶ二段構えは、周波数ごとの得意・不得意を組み合わせる、
              この章の教科書のような実例です。
            </p>
          </>
        ),
        breakNote:
          "「低い周波数は何でも回り込む」は言い過ぎで、中波でも大山塊の陰では減衰が深く、またトンネルや鉄筋の建物の中では、開口より長い波長はかえって入り込めないという逆転も起きます。",
        sources: [
          {
            label: "ITU-R P.368: Ground-wave propagation curves",
            note: "中波の地表波伝搬の標準曲線"
          },
          {
            label: "ITU-R P.526: Propagation by diffraction",
            note: "ナイフエッジ回折と v 値の原典"
          },
          {
            label: "総務省「放送ネットワークの強靱化に関する検討会」報告書・FM補完中継局制度（2014）",
            note: "ワイドFM導入の経緯"
          }
        ]
      }}
    />
  );
}

"use client";

import { Card } from "@/components/Card";
import { DiagramExportButton } from "@/components/DiagramExportButton";
import { DiagramDefs } from "@/components/diagrams/DiagramDefs";
import { DIAGRAM_DEF_IDS, diagramMaterial, diagramPalette, diagramRef } from "@/lib/ui/diagramTheme";
import { isoPolygonPoints, isoProject, shadeColor } from "@/lib/ui/iso";
import type {
  NcuAntennaPosition,
  NcuBelowGroundInput,
  NcuBelowGroundResult,
  NcuBoxMaterial,
  NcuCoverMaterial
} from "@/lib/rf/ncuBelowGround";

type NcuIsometricSceneProps = {
  input: NcuBelowGroundInput;
  result: NcuBelowGroundResult;
};

// 素材→ベース色（etc は diagramMaterial に集約）。蓋/箱の材質選択に連動させる。
function coverColor(material: NcuCoverMaterial): string | null {
  switch (material) {
    case "open":
      return null;
    case "resin":
      return diagramMaterial.resin;
    case "concrete":
      return diagramMaterial.concrete;
    case "cast_iron":
    case "steel":
      return diagramMaterial.metal;
    default:
      return diagramPalette.line;
  }
}

function boxColor(material: NcuBoxMaterial): string {
  switch (material) {
    case "resin":
      return diagramMaterial.resin;
    case "concrete":
      return diagramMaterial.concrete;
    case "metal":
      return diagramMaterial.metal;
    default:
      return diagramPalette.line;
  }
}

const coverLabel: Record<NcuCoverMaterial, string> = {
  open: "開口（蓋なし）",
  resin: "樹脂蓋",
  concrete: "コンクリート蓋",
  cast_iron: "鋳鉄蓋（FCD450）",
  steel: "鋼板蓋",
  unknown: "蓋（材質不明）"
};

const boxLabel: Record<NcuBoxMaterial, string> = {
  resin: "樹脂ボックス",
  concrete: "コンクリート桝",
  metal: "金属ボックス",
  unknown: "ボックス（材質不明）"
};

// アンテナ位置→箱内の高さ比（0=底、1=蓋直下）。
const antennaHeightRatio: Record<NcuAntennaPosition, number> = {
  near_lid: 0.86,
  middle: 0.5,
  bottom: 0.16,
  near_metal: 0.3
};

const view = { width: 720, height: 460 };
// 等角の footprint（iso単位）。代表寸法 400×400×深さ500mm級（ハンドホール/量水器BOX相当）を投影用に正規化。
const W = 150; // x（右奥行き）
const D = 120; // y（左奥行き）
const WALL = 14; // 箱の肉厚（内寸へのインセット）
const ORIGIN = { x: 300, y: 250 };

function p(x: number, y: number, z: number) {
  const pt = isoProject(x, y, z);
  return { x: pt.x + ORIGIN.x, y: pt.y + ORIGIN.y };
}
function poly(points: { x: number; y: number }[]): string {
  return isoPolygonPoints(points);
}

export function NcuIsometricScene({ input, result }: NcuIsometricSceneProps) {
  // 埋設深さ→立体高さ（0.1〜1.5mを見やすい範囲へ）。
  const depthM = Math.max(0.1, Math.min(1.5, input.depthBelowGroundM));
  const H = 70 + depthM * 70; // GL(z=H) ～ 箱底(z=0)
  const floorT = 12; // 底版の厚み表現
  const fl = floorT;

  const cover = coverColor(input.coverMaterial);
  const box = boxColor(input.boxMaterial);
  const soil = diagramMaterial.soil;

  // 箱内寸（インセット）
  const ix0 = WALL;
  const ix1 = W - WALL;
  const iy0 = WALL;
  const iy1 = D - WALL;

  // アンテナ位置
  const antRatio = antennaHeightRatio[input.antennaPosition];
  const antZ = fl + (H - fl) * antRatio;
  const antX = ix0 + (ix1 - ix0) * 0.5;
  const antY = iy0 + (iy1 - iy0) * 0.5;
  const antTip = p(antX, antY, antZ);

  // 判定色（通信成立/不成立で信号色を変える）
  const marginPass = result.linkMarginRangeDb.typical >= 0;
  const signal = marginPass ? diagramPalette.success : diagramPalette.danger;

  // 湿潤（底の水たまり）
  const wet = input.moistureCondition === "wet" || input.moistureCondition === "standing_water";
  const waterZ = fl + (input.moistureCondition === "standing_water" ? 22 : 10);

  // ---- 面の定義 ----
  // 土（外側の切り口2面）: 左(y=D)・右(x=W)
  const soilLeft = poly([p(0, D, 0), p(W, D, 0), p(W, D, H), p(0, D, H)]);
  const soilRight = poly([p(W, 0, 0), p(W, D, 0), p(W, D, H), p(W, 0, H)]);
  // GL 上面（土の地表）
  const glTop = poly([p(0, 0, H), p(W, 0, H), p(W, D, H), p(0, D, H)]);
  // 箱内: 底・奥左壁(y=iy1)・奥右壁(x=ix1)
  const pitFloor = poly([p(ix0, iy0, fl), p(ix1, iy0, fl), p(ix1, iy1, fl), p(ix0, iy1, fl)]);
  const pitBackLeft = poly([p(ix0, iy1, fl), p(ix1, iy1, fl), p(ix1, iy1, H), p(ix0, iy1, H)]);
  const pitBackRight = poly([p(ix1, iy0, fl), p(ix1, iy1, fl), p(ix1, iy1, H), p(ix1, iy0, H)]);
  // 開口リム（GLの土と箱内の境目に肉厚を見せる）
  const rim = poly([p(0, 0, H), p(ix0, iy0, H), p(ix0, iy1, H), p(0, D, H), p(0, 0, H)]);
  // 水面
  const water = poly([p(ix0, iy0, waterZ), p(ix1, iy0, waterZ), p(ix1, iy1, waterZ), p(ix0, iy1, waterZ)]);

  // NCU 機器（小さな等角ボックス）
  const dW = 40;
  const dD = 34;
  const dH = 30;
  const dx = ix0 + 16;
  const dy = iy0 + 14;
  const devTop = poly([p(dx, dy, fl + dH), p(dx + dW, dy, fl + dH), p(dx + dW, dy + dD, fl + dH), p(dx, dy + dD, fl + dH)]);
  const devLeft = poly([p(dx, dy + dD, fl), p(dx + dW, dy + dD, fl), p(dx + dW, dy + dD, fl + dH), p(dx, dy + dD, fl + dH)]);
  const devRight = poly([p(dx + dW, dy, fl), p(dx + dW, dy + dD, fl), p(dx + dW, dy + dD, fl + dH), p(dx + dW, dy, fl + dH)]);

  // アンテナ基部
  const antBase = p(antX, antY, fl + dH);

  // 蓋（外して手前に寝かせて置く。開口は見せる）
  const lidLen = 96;
  const lidWid = 78;
  const lx = -lidLen - 6;
  const ly = D + 40;
  const lidTop = cover
    ? poly([p(lx, ly, H), p(lx + lidLen, ly, H), p(lx + lidLen, ly + lidWid, H), p(lx, ly + lidWid, H)])
    : "";
  const lidSide = cover
    ? poly([p(lx, ly + lidWid, H - 8), p(lx + lidLen, ly + lidWid, H - 8), p(lx + lidLen, ly + lidWid, H), p(lx, ly + lidWid, H)])
    : "";
  const lidCenter = p(lx + lidLen / 2, ly + lidWid / 2, H);

  // ゲートウェイ（地上・右上）と信号
  const gw = { x: view.width - 96, y: 70 };

  // 耐荷重の目安（用途）
  const loadNote =
    input.coverMaterial === "cast_iron" || input.coverMaterial === "steel"
      ? "T-6〜T-25（車道可）"
      : input.coverMaterial === "concrete"
        ? "T-2〜T-14"
        : input.coverMaterial === "resin"
          ? "T-2（非車道）"
          : "";

  return (
    <Card as="figure" padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-staf-dark">立体図（2.5D）</p>
          <p className="mt-1 text-base font-bold text-slate-950">GL以下NCUの設置イメージ</p>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
            蓋・ボックスの材質、埋設深さ、アンテナ位置、湿潤を立体で表します。代表寸法は
            <span className="font-semibold text-slate-900">約400×400×深さ500mm級</span>
            （ハンドホール／量水器ボックス相当）。入力に連動します。
          </p>
        </div>
      </div>

      <DiagramExportButton filenameBase="ncu-isometric-scene">
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50">
          <svg
            role="img"
            aria-label="GL以下に設置したNCUと920MHz信号が地上ゲートウェイへ届く経路の立体図"
            viewBox={`0 0 ${view.width} ${view.height}`}
            style={{ minWidth: 560 }}
            className="h-auto w-full"
          >
            <DiagramDefs />
            <rect width={view.width} height={view.height} fill={diagramPalette.canvas} />

            {/* 土（切り口2面・ハッチ） */}
            <polygon points={soilLeft} fill={shadeColor(soil, -0.3)} />
            <polygon points={soilRight} fill={shadeColor(soil, -0.15)} />
            <polygon points={soilLeft} fill={diagramRef(DIAGRAM_DEF_IDS.hatchGround)} opacity="0.35" />
            <polygon points={soilRight} fill={diagramRef(DIAGRAM_DEF_IDS.hatchGround)} opacity="0.25" />

            {/* GL 上面（地表） */}
            <polygon points={glTop} fill={soil} stroke={shadeColor(soil, -0.3)} strokeWidth={1} />
            {/* 開口リム（箱の肉厚） */}
            <polygon points={rim} fill={shadeColor(box, -0.1)} />

            {/* 箱内（底・奥壁2面） */}
            <polygon points={pitBackLeft} fill={shadeColor(box, -0.3)} />
            <polygon points={pitBackRight} fill={shadeColor(box, -0.15)} />
            <polygon points={pitFloor} fill={shadeColor(box, -0.42)} />

            {/* 湿潤（水面） */}
            {wet ? (
              <>
                <polygon points={water} fill={diagramMaterial.water} opacity="0.55" />
                <polygon points={water} fill="none" stroke={shadeColor(diagramMaterial.water, -0.2)} strokeWidth={1} />
              </>
            ) : null}

            {/* NCU 機器 */}
            <polygon points={devLeft} fill={shadeColor(diagramMaterial.device, -0.3)} />
            <polygon points={devRight} fill={shadeColor(diagramMaterial.device, -0.15)} />
            <polygon points={devTop} fill={diagramMaterial.device} stroke={shadeColor(diagramMaterial.device, 0.2)} strokeWidth={1} />
            <text x={p(dx + dW / 2, dy + dD / 2, fl + dH).x} y={p(dx + dW / 2, dy + dD / 2, fl + dH).y + 3} textAnchor="middle" fill={diagramPalette.white} fontSize={10} fontWeight={700}>
              NCU
            </text>

            {/* アンテナ（機器上端→位置高さ） */}
            <line x1={antBase.x} y1={antBase.y} x2={antTip.x} y2={antTip.y} stroke={diagramPalette.staf} strokeWidth={3} strokeLinecap="round" />
            <circle cx={antTip.x} cy={antTip.y} r={5} fill={diagramPalette.staf} stroke={diagramPalette.white} strokeWidth={1.5} />

            {/* 信号（アンテナ→地上ゲートウェイ・3本の破線アーク） */}
            {[0, 1, 2].map((i) => {
              const cx = antTip.x + (gw.x - antTip.x) * 0.5;
              const cy = Math.min(antTip.y, gw.y) - 30 - i * 26;
              return (
                <path
                  key={i}
                  d={`M ${antTip.x} ${antTip.y} Q ${cx} ${cy} ${gw.x} ${gw.y}`}
                  fill="none"
                  stroke={signal}
                  strokeWidth={1.5}
                  strokeDasharray="5 6"
                  opacity={1 - i * 0.22}
                  style={{ mixBlendMode: "normal" }}
                />
              );
            })}
            <text x={(antTip.x + gw.x) / 2} y={Math.min(antTip.y, gw.y) - 44} textAnchor="middle" fill={signal} fontSize={11} fontWeight={700}>
              {input.frequencyMHz}MHz {marginPass ? "到達" : "余裕不足"}
            </text>

            {/* ゲートウェイ（地上） */}
            <g>
              <line x1={gw.x} y1={gw.y} x2={gw.x} y2={gw.y + 34} stroke={diagramPalette.stafDark} strokeWidth={3} />
              <circle cx={gw.x} cy={gw.y} r={5} fill={diagramPalette.stafDark} />
              <rect x={gw.x - 12} y={gw.y + 34} width={24} height={16} rx={2} fill={diagramPalette.stafDark} />
              <text x={gw.x} y={gw.y + 62} textAnchor="middle" fill={diagramPalette.inkSoft} fontSize={10} fontWeight={700}>
                ゲートウェイ
              </text>
            </g>

            {/* 蓋（外して手前に） */}
            {cover ? (
              <>
                <polygon points={lidSide} fill={shadeColor(cover, -0.2)} />
                <polygon points={lidTop} fill={cover} stroke={shadeColor(cover, -0.25)} strokeWidth={1} />
                <text x={lidCenter.x} y={lidCenter.y + 3} textAnchor="middle" fill={diagramPalette.ink} fontSize={10} fontWeight={700}>
                  {coverLabel[input.coverMaterial]}
                </text>
                {loadNote ? (
                  <text x={lidCenter.x} y={lidCenter.y + 18} textAnchor="middle" fill={diagramPalette.muted} fontSize={9}>
                    {loadNote}
                  </text>
                ) : null}
              </>
            ) : (
              <text x={p(0, D, H).x - 4} y={p(0, D, H).y + 20} textAnchor="start" fill={diagramPalette.muted} fontSize={10} fontWeight={700}>
                開口（蓋なし）
              </text>
            )}

            {/* GL ラベル */}
            <text x={p(W, 0, H).x + 8} y={p(W, 0, H).y - 2} fill={diagramPalette.muted} fontSize={10} fontWeight={700}>
              地表 GL
            </text>

            {/* 埋設深さ寸法（左の切り口に沿って） */}
            <g>
              <line x1={p(0, D, H).x - 16} y1={p(0, D, H).y} x2={p(0, D, fl).x - 16} y2={p(0, D, fl).y} stroke={diagramPalette.ink} strokeWidth={1.25} />
              <line x1={p(0, D, H).x - 20} y1={p(0, D, H).y} x2={p(0, D, H).x - 12} y2={p(0, D, H).y} stroke={diagramPalette.ink} strokeWidth={1.25} />
              <line x1={p(0, D, fl).x - 20} y1={p(0, D, fl).y} x2={p(0, D, fl).x - 12} y2={p(0, D, fl).y} stroke={diagramPalette.ink} strokeWidth={1.25} />
              <text x={p(0, D, (H + fl) / 2).x - 24} y={p(0, D, (H + fl) / 2).y + 3} textAnchor="end" fill={diagramPalette.ink} fontSize={10} fontWeight={700} style={{ fontVariantNumeric: "tabular-nums" }}>
                埋設 {input.depthBelowGroundM.toFixed(2)}m
              </text>
            </g>

            {/* ボックス材質キャプション */}
            <text x={p(W, D, 0).x + 8} y={p(W, D, fl).y + 6} fill={diagramPalette.muted} fontSize={10} fontWeight={700}>
              {boxLabel[input.boxMaterial]}
            </text>
          </svg>
        </div>
      </DiagramExportButton>

      <figcaption className="mt-3 text-xs leading-relaxed text-slate-500">
        代表寸法・耐荷重は日本の量水器ボックス（FCD450ダクタイル鋳鉄蓋・T-2〜T-25）およびハンドホール規格（例:
        C-a型 400×400×深さ500mm）を参考にした模式図です。実機の寸法・設置条件により通信性能は変わります。
      </figcaption>
    </Card>
  );
}

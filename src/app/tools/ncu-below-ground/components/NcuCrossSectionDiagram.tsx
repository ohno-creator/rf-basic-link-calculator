"use client";

import { Card } from "@/components/Card";
import { DiagramExportButton } from "@/components/DiagramExportButton";
import { DiagramDefs } from "@/components/diagrams/DiagramDefs";
import { diagramPalette, DIAGRAM_DEF_IDS, diagramRef, diagramStroke, diagramText } from "@/lib/ui/diagramTheme";
import {
  ncuAntennaPositionOptions,
  ncuBoxMaterialOptions,
  ncuCoverMaterialOptions,
  ncuMoistureOptions,
  ncuOpeningOptions,
  ncuOutdoorModelOptions,
  ncuSurfaceObstructionOptions,
  type NcuBelowGroundInput,
  type NcuBelowGroundResult
} from "@/lib/rf/ncuBelowGround";
import { findOptionLabel, formatDistance, formatSigned } from "./ncuShared";

// 損失[dB]の大きさ→色（緑=小〜赤=支配的）。断面図の損失スタックと凡例で共通言語にする。
function sevHex(typical: number): { fill: string; stroke: string } {
  if (typical >= 18) {
    return { fill: diagramPalette.danger, stroke: diagramPalette.dangerDark };
  }
  if (typical >= 10) {
    return { fill: diagramPalette.warn, stroke: diagramPalette.warnDeep };
  }
  if (typical >= 4) {
    return { fill: diagramPalette.amber, stroke: diagramPalette.amberDeep };
  }
  return { fill: diagramPalette.success, stroke: diagramPalette.successDeep };
}

export function NcuCrossSectionDiagram({
  input,
  result
}: {
  input: NcuBelowGroundInput;
  result: NcuBelowGroundResult;
}) {
  const depthLabel = `GL下 ${input.depthBelowGroundM.toFixed(2)}m`;
  const coverLabel = findOptionLabel(ncuCoverMaterialOptions, input.coverMaterial);
  const boxLabel = findOptionLabel(ncuBoxMaterialOptions, input.boxMaterial);
  const moistureLabel = findOptionLabel(ncuMoistureOptions, input.moistureCondition);
  const antennaLabel = findOptionLabel(ncuAntennaPositionOptions, input.antennaPosition);
  const openingLabel = findOptionLabel(ncuOpeningOptions, input.openingCondition);
  const surfaceLabel = findOptionLabel(ncuSurfaceObstructionOptions, input.surfaceObstruction);
  const modelLabel = findOptionLabel(ncuOutdoorModelOptions, input.outdoorModel);
  const coverRange = result.breakdown.find((item) => item.id === "cover")?.range;
  const boxRange = result.breakdown.find((item) => item.id === "box")?.range;
  const moistureRange = result.breakdown.find((item) => item.id === "moisture")?.range;
  const antennaRange = result.breakdown.find((item) => item.id === "antenna")?.range;
  const openingRange = result.breakdown.find((item) => item.id === "opening")?.range;
  const surfaceRange = result.breakdown.find((item) => item.id === "surface")?.range;
  const depthRange = result.breakdown.find((item) => item.id === "depth")?.range;
  const isMetalCover = input.coverMaterial === "cast_iron" || input.coverMaterial === "steel";
  const isMetalBox = input.boxMaterial === "metal";
  const hasWaterPool = input.moistureCondition === "standing_water";
  const hasVehicle = input.surfaceObstruction === "vehicle" || input.surfaceObstruction === "parked_vehicle";
  const hasPedestrian = input.surfaceObstruction === "pedestrian";
  const lidColor = isMetalCover
    ? diagramRef(DIAGRAM_DEF_IDS.gradientMetal)
    : input.coverMaterial === "resin"
      ? diagramRef(DIAGRAM_DEF_IDS.gradientResin)
      : diagramRef(DIAGRAM_DEF_IDS.gradientConcrete);
  const boxStroke = isMetalBox ? diagramPalette.inkSoft : input.boxMaterial === "resin" ? diagramPalette.skyStroke : diagramPalette.faint;
  const boxFill = isMetalBox
    ? diagramRef(DIAGRAM_DEF_IDS.gradientMetal)
    : input.boxMaterial === "resin"
      ? diagramRef(DIAGRAM_DEF_IDS.gradientResin)
      : diagramRef(DIAGRAM_DEF_IDS.gradientConcrete);
  const marginPass = result.linkMarginRangeDb.typical >= 0;

  // ===== 断面ジオメトリ（深さで伸縮するが両端でクランプし破綻させない）=====
  const GL_Y = 152;
  const BOX_X = 448;
  const BOX_W = 164;
  const BOX_CX = BOX_X + BOX_W / 2;
  const depthM = Math.min(5, Math.max(0, input.depthBelowGroundM));
  const innerTop = GL_Y + 4;
  const boxBottom = Math.min(GL_Y + Math.max(82, depthM * 62), 492);
  const innerBottom = boxBottom - 8;
  const innerH = Math.max(40, innerBottom - innerTop);
  const antennaY = Math.min(
    innerBottom - 18,
    Math.max(
      innerTop + 18,
      input.antennaPosition === "near_lid"
        ? innerTop + 22
        : input.antennaPosition === "bottom"
          ? innerBottom - 24
          : (innerTop + innerBottom) / 2
    )
  );
  const openWByCond: Record<NcuBelowGroundInput["openingCondition"], number> = {
    open: 70,
    narrow_gap: 30,
    sealed: 0,
    metal_frame: 20
  };
  const openW = openWByCond[input.openingCondition];
  const openX = BOX_CX - openW / 2;
  const waterFrac = hasWaterPool ? 0.42 : input.moistureCondition === "wet" ? 0.24 : input.moistureCondition === "damp" ? 0.1 : 0;
  const waterH = waterFrac * innerH;
  const pathOpacity = input.openingCondition === "sealed" || isMetalCover ? 0.45 : 1;
  const rulerX = 636;

  // ===== 右レール：地下追加損失の正規化スタック（重症度色・ラベル衝突回避）=====
  const STK_X = 726;
  const STK_W = 44;
  const STK_TOP = 96;
  const STK_H = 368;
  const stackDefs = [
    { id: "surface", short: "地表", typical: surfaceRange?.typical ?? 0 },
    { id: "cover", short: "蓋", typical: coverRange?.typical ?? 0 },
    { id: "opening", short: "開口", typical: openingRange?.typical ?? 0 },
    { id: "depth", short: "深さ", typical: depthRange?.typical ?? 0 },
    { id: "box", short: "BOX", typical: boxRange?.typical ?? 0 },
    { id: "moisture", short: "水分", typical: moistureRange?.typical ?? 0 },
    { id: "antenna", short: "位置", typical: antennaRange?.typical ?? 0 }
  ].filter((d) => d.typical > 0.05);
  const stackTotal = stackDefs.reduce((sum, d) => sum + d.typical, 0) || 1;
  const dominantTypical = stackDefs.reduce((max, d) => Math.max(max, d.typical), 0);
  let runY = STK_TOP;
  let lastLabelY = STK_TOP - 6;
  const stackSegs = stackDefs.map((d) => {
    const h = Math.max(4, (d.typical / stackTotal) * STK_H);
    const y0 = runY;
    const y1 = runY + h;
    runY = y1;
    const midY = (y0 + y1) / 2;
    const labelY = Math.max(midY, lastLabelY + 15);
    lastLabelY = labelY;
    return { ...d, y0, y1, midY, labelY, tone: sevHex(d.typical), isDominant: d.typical === dominantTypical };
  });

  const parameterChips = [
    { label: "通信方式", value: input.system },
    { label: "周波数", value: `${input.frequencyMHz.toFixed(0)} MHz` },
    { label: "地上距離", value: formatDistance(result.distanceM) },
    { label: "地上モデル", value: modelLabel },
    { label: "蓋", value: `${coverLabel}${coverRange ? ` / ${coverRange.typical.toFixed(1)}dB` : ""}` },
    { label: "BOX", value: `${boxLabel}${boxRange ? ` / ${boxRange.typical.toFixed(1)}dB` : ""}` },
    { label: "深さ", value: `${input.depthBelowGroundM.toFixed(2)} m${depthRange ? ` / ${depthRange.typical.toFixed(1)}dB` : ""}` },
    { label: "水分", value: `${moistureLabel}${moistureRange ? ` / ${moistureRange.typical.toFixed(1)}dB` : ""}` },
    { label: "アンテナ位置", value: `${antennaLabel}${antennaRange ? ` / ${antennaRange.typical.toFixed(1)}dB` : ""}` },
    { label: "開口", value: `${openingLabel}${openingRange ? ` / ${openingRange.typical.toFixed(1)}dB` : ""}` },
    { label: "地表遮蔽", value: `${surfaceLabel}${surfaceRange ? ` / ${surfaceRange.typical.toFixed(1)}dB` : ""}` },
    { label: "実測補正", value: formatSigned(input.measuredCorrectionDb) }
  ];

  return (
    <Card as="section" data-testid="ncu-assumption-diagram">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-staf-dark">シミュレーション結果の2D図</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">NCUが地面より下にある場合の断面図</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            左は電波の通り道（GW→地表GL→蓋→BOX→NCUアンテナ）、右は地下で電波を弱める要因の積み上げです。入力を変えると形・色・損失値が連動します。
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
          地上距離 {formatDistance(result.distanceM)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold">
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-sky-700"
          title="信号経路＝電波の通り道。地上は青い破線（GW→地表）、地中は実線（蓋・開口を通ってNCUアンテナへ）で表します。"
        >
          <span className="h-1.5 w-4 rounded-full bg-sky-500" aria-hidden="true" />
          信号経路
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-rose-700"
          title="深さ寸法＝地表面（GL）からNCUアンテナまでの深さを示す赤い破線の寸法線です。"
        >
          <span className="h-0 w-4 border-t-2 border-dashed border-rose-500" aria-hidden="true" />
          深さ寸法
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700"
          title="緑の丸＝BOX内のNCUアンテナの位置。配置（蓋直下/中央/底面/金属近傍）で図中の位置が動きます。"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
          NCUアンテナ
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-slate-600"
          title="右の積み上げバーの色は、その損失の大きさ（標準dB）を表します。緑=小（〜4dB）／黄=中（4〜10dB）／橙=大（10〜18dB）／赤=支配的（18dB〜）。"
        >
          損失の大きさ
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />小
          <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />中
          <span className="h-2 w-2 rounded-full bg-orange-500" aria-hidden="true" />大
          <span className="h-2 w-2 rounded-full bg-rose-500" aria-hidden="true" />支配的
        </span>
      </div>

      <p className="mt-4 text-[11px] font-medium text-slate-400 sm:hidden">← 横スクロールで全体を表示できます →</p>
      <DiagramExportButton filenameBase="ncu-cross-section">
      <div className="mt-1.5 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 sm:mt-4">
        <svg
          role="img"
          aria-label="GL以下NCU設置の2D断面図と地下追加損失の積み上げ"
          viewBox="0 0 920 520"
          style={{ minWidth: 680 }}
          className="h-auto w-full"
        >
          <DiagramDefs />
          <defs>
            <marker id="ncuArrowSignal" markerHeight="8" markerWidth="8" orient="auto" refX="6" refY="4">
              <path d="M0 0 L8 4 L0 8 Z" fill={diagramPalette.path} />
            </marker>
          </defs>

          {/* 背景：空・土（切り口ハッチ重ね）・GL */}
          <rect x="0" y="0" width="690" height={GL_Y} fill={diagramRef(DIAGRAM_DEF_IDS.gradientSky)} />
          <rect x="0" y={GL_Y} width="690" height={520 - GL_Y} fill={diagramRef(DIAGRAM_DEF_IDS.gradientSoil)} />
          <rect x="0" y={GL_Y} width="690" height={520 - GL_Y} fill={diagramRef(DIAGRAM_DEF_IDS.hatchGround)} opacity="0.25" />
          <line x1="0" x2="690" y1={GL_Y} y2={GL_Y} stroke={diagramPalette.muted} strokeWidth={diagramStroke.emphasis} />
          <text x="14" y={GL_Y - 8} fill={diagramPalette.inkMuted} fontSize="13" fontWeight="700">
            地表面 GL
          </text>

          {/* GW / 基地局 */}
          <g transform="translate(36 44)">
            <path d="M36 108 V30" stroke={diagramPalette.stafDark} strokeWidth="4" />
            <circle cx="36" cy="22" r="6" fill={diagramPalette.staf} />
            <path d="M22 30 Q36 8 50 30" fill="none" stroke={diagramPalette.staf} strokeWidth="2.5" opacity="0.55" />
            <path d="M14 38 Q36 4 58 38" fill="none" stroke={diagramPalette.staf} strokeWidth="2" opacity="0.35" />
            <text x="36" y="124" textAnchor="middle" fill={diagramPalette.stafDark} fontSize="11" fontWeight="700">
              GW/基地局
            </text>
            <text x="36" y="139" textAnchor="middle" {...diagramText.label}>
              送信 {input.txPowerDbm.toFixed(0)}dBm
            </text>
          </g>

          {/* 地上伝搬（青破線の弧）→ 開口で実線に切替えBOX内アンテナへ：1本の信号経路 */}
          <path
            d={`M78 70 C240 48 410 70 ${BOX_CX} ${GL_Y - 10}`}
            fill="none"
            stroke={diagramPalette.path}
            strokeWidth="3.5"
            strokeDasharray="9 8"
          />
          <path
            d={`M${BOX_CX} ${GL_Y - 2} L${BOX_CX} ${antennaY - 16}`}
            fill="none"
            stroke={diagramPalette.path}
            strokeWidth="3"
            markerEnd="url(#ncuArrowSignal)"
            opacity={pathOpacity}
          />
          <g>
            <rect x="232" y="44" width="190" height="24" rx="8" fill={diagramPalette.white} stroke={diagramPalette.skyFill} />
            <text x="240" y="60" fill={diagramPalette.stafDeep} fontSize="12" fontWeight="700">
              地上伝搬 {result.outdoorPathLossDb.toFixed(0)}dB・{modelLabel}
            </text>
          </g>

          {/* 地表上の遮蔽（車両・人） */}
          {hasVehicle ? (
            <g transform={`translate(${BOX_CX - 66} ${GL_Y - 42})`}>
              <rect x="0" y="18" width="120" height="26" rx="9" fill={diagramPalette.inkSoft} />
              <path d="M20 18 L38 2 H84 L102 18 Z" fill={diagramPalette.inkMuted} />
              <circle cx="28" cy="46" r="8" fill={diagramPalette.ink} />
              <circle cx="92" cy="46" r="8" fill={diagramPalette.ink} />
              <text x="60" y="12" textAnchor="middle" fill={diagramPalette.inkSoft} fontSize="11" fontWeight="700">
                {surfaceLabel}
              </text>
            </g>
          ) : null}
          {hasPedestrian ? (
            <g transform={`translate(${BOX_CX - 8} ${GL_Y - 52})`}>
              <circle cx="6" cy="6" r="7" fill={diagramPalette.muted} />
              <path d="M6 14 V40 M-7 24 H19 M6 40 L-5 56 M6 40 L17 56" stroke={diagramPalette.muted} strokeWidth="5" strokeLinecap="round" />
              <text x="6" y="-6" textAnchor="middle" fill={diagramPalette.inkSoft} fontSize="11" fontWeight="700">
                {surfaceLabel}
              </text>
            </g>
          ) : null}

          {/* BOX / ピット */}
          <g filter={diagramRef(DIAGRAM_DEF_IDS.softShadow)}>
            <rect x={BOX_X} y={GL_Y} width={BOX_W} height={boxBottom - GL_Y} rx="12" fill={boxFill} stroke={boxStroke} strokeWidth={isMetalBox ? 5 : 3} />
            {/* 内部空洞 */}
            <rect x={BOX_X + 12} y={innerTop} width={BOX_W - 24} height={innerBottom - innerTop} rx="8" fill={diagramPalette.white} stroke={diagramPalette.grid} strokeWidth={diagramStroke.main} />
            {/* 水たまり */}
            {waterH > 1 ? (
              <rect x={BOX_X + 13} y={innerBottom - waterH} width={BOX_W - 26} height={waterH} rx="4" fill={diagramRef(DIAGRAM_DEF_IDS.gradientWater)} opacity={hasWaterPool ? 0.85 : 0.55} />
            ) : null}
            {/* 金属近接板 */}
            {input.antennaPosition === "near_metal" ? (
              <rect x={BOX_X + 13} y={antennaY - 26} width="9" height="52" rx="3" fill={diagramRef(DIAGRAM_DEF_IDS.gradientMetal)} opacity="0.85" />
            ) : null}
            {/* NCUアンテナ */}
            <circle cx={BOX_CX} cy={antennaY} r="13" fill={diagramPalette.success} />
            <path d={`M${BOX_CX} ${antennaY} v-34`} stroke={diagramPalette.success} strokeWidth="5" strokeLinecap="round" />
            <path d={`M${BOX_CX} ${antennaY - 34} Q${BOX_CX - 12} ${antennaY - 48} ${BOX_CX - 24} ${antennaY - 34}`} fill="none" stroke={diagramPalette.success} strokeWidth="2.5" strokeLinecap="round" />
            <path d={`M${BOX_CX} ${antennaY - 34} Q${BOX_CX + 12} ${antennaY - 48} ${BOX_CX + 24} ${antennaY - 34}`} fill="none" stroke={diagramPalette.success} strokeWidth="2.5" strokeLinecap="round" />
            {/* 蓋（材質で色・縁、金属は太枠）。開口は中央の隙間。密閉は×印 */}
            <rect x={BOX_X - 28} y={GL_Y - 11} width={BOX_W + 56} height="22" rx="6" fill={lidColor} stroke={isMetalCover ? diagramPalette.ink : diagramPalette.faint} strokeWidth={isMetalCover ? 3 : 2} />
            {openW > 0 ? (
              <rect x={openX} y={GL_Y - 11} width={openW} height="22" rx="4" fill={diagramPalette.skyPale} stroke={diagramPalette.skyStroke} strokeWidth="2" />
            ) : (
              <path d={`M${BOX_CX - 9} ${GL_Y - 6} L${BOX_CX + 9} ${GL_Y + 6} M${BOX_CX + 9} ${GL_Y - 6} L${BOX_CX - 9} ${GL_Y + 6}`} stroke={diagramPalette.dangerDark} strokeWidth="2.5" />
            )}
            {input.openingCondition === "metal_frame" ? (
              <rect x={openX - 6} y={GL_Y - 15} width={openW + 12} height="30" rx="6" fill="none" stroke={diagramPalette.inkSoft} strokeWidth="3.5" />
            ) : null}
          </g>

          {/* 深さ寸法（赤破線、GL→アンテナ）。極端値でも線が短くなりすぎない */}
          <line x1={rulerX} x2={rulerX} y1={GL_Y} y2={antennaY} stroke={diagramPalette.danger} strokeWidth={diagramStroke.emphasis} strokeDasharray="6 5" />
          <line x1={rulerX - 7} x2={rulerX + 7} y1={GL_Y} y2={GL_Y} stroke={diagramPalette.danger} strokeWidth={diagramStroke.emphasis} />
          <line x1={rulerX - 7} x2={rulerX + 7} y1={antennaY} y2={antennaY} stroke={diagramPalette.danger} strokeWidth={diagramStroke.emphasis} />
          <text x={rulerX - 12} y={(GL_Y + antennaY) / 2 - 4} textAnchor="end" fill={diagramPalette.dangerDeep} fontSize="12.5" fontWeight="700">
            {depthLabel}
          </text>
          <text x={rulerX - 12} y={(GL_Y + antennaY) / 2 + 13} textAnchor="end" {...diagramText.label}>
            深さ {formatSigned(-(depthRange?.typical ?? 0), "dB")}
          </text>

          {/* NCUアンテナ利得の小ラベル */}
          <text x={BOX_CX} y={Math.min(boxBottom + 20, 512)} textAnchor="middle" fill={diagramPalette.successDark} fontSize="11.5" fontWeight="700">
            NCU {input.ncuAntennaGainDbi.toFixed(0)}dBi・{antennaLabel}
          </text>

          {/* ===== 右レール：地下追加損失スタック ===== */}
          <line x1="694" x2="694" y1="20" y2="500" stroke={diagramPalette.grid} strokeWidth={diagramStroke.main} />
          <text x={STK_X} y="46" fill={diagramPalette.ink} fontSize="13" fontWeight="700">
            地下の追加損失
          </text>
          <text x={STK_X} y="66" fill={diagramPalette.dangerDeep} fontSize="14" fontWeight="700">
            合計 {result.belowGroundLossRangeDb.typical.toFixed(1)}dB
          </text>
          <rect x={STK_X - 4} y={STK_TOP - 4} width={STK_W + 8} height={STK_H + 8} rx="6" fill={diagramPalette.white} stroke={diagramPalette.grid} />
          {stackSegs.map((seg) => (
            <g key={seg.id}>
              <rect
                x={STK_X}
                y={seg.y0}
                width={STK_W}
                height={Math.max(2, seg.y1 - seg.y0 - 1.5)}
                fill={seg.tone.fill}
                stroke={seg.tone.stroke}
                strokeWidth={seg.isDominant ? 2.5 : 1}
              />
              <line x1={STK_X + STK_W} x2={STK_X + STK_W + 10} y1={seg.midY} y2={seg.labelY} stroke={diagramPalette.line} strokeWidth={diagramStroke.support} />
              {seg.isDominant ? (
                <g>
                  <rect x={STK_X + STK_W + 12} y={seg.labelY - 11} width="30" height="14" rx="7" fill={diagramPalette.danger} />
                  <text x={STK_X + STK_W + 27} y={seg.labelY} textAnchor="middle" fill={diagramPalette.white} fontSize="9" fontWeight="700">
                    主因
                  </text>
                </g>
              ) : null}
              <text
                x={STK_X + STK_W + (seg.isDominant ? 48 : 12)}
                y={seg.labelY}
                fill={diagramText.value.fill}
                fontSize={diagramText.value.fontSize}
                fontWeight={diagramText.value.fontWeight}
                style={{ fontVariantNumeric: diagramText.value.fontVariantNumeric }}
              >
                {seg.short} {seg.typical.toFixed(1)}dB
              </text>
            </g>
          ))}
          {stackSegs.length === 0 ? (
            <text x={STK_X} y={STK_TOP + 30} {...diagramText.label}>
              地下の追加損失はほぼありません
            </text>
          ) : null}
        </svg>
      </div>
      </DiagramExportButton>

      {/* 結果ストリップ */}
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
        <span className="text-slate-600">
          受信電力 <span className="font-bold text-slate-900">{result.receivedPowerRangeDbm.typical.toFixed(1)} dBm</span>
        </span>
        <span className="text-slate-600">
          リンクマージン{" "}
          <span className={`font-bold ${marginPass ? "text-emerald-700" : "text-rose-700"}`}>
            {formatSigned(result.linkMarginRangeDb.typical)} dB
          </span>
        </span>
        <span className="text-slate-500">受信感度 {input.receiverSensitivityDbm.toFixed(1)} dBm</span>
      </div>

      {/* 図に反映しているパラメータ（コンパクト） */}
      <div className="mt-3 flex flex-wrap gap-2">
        {parameterChips.map((chip) => (
          <span key={chip.label} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
            <span className="font-bold text-slate-500">{chip.label}</span>
            <span className="font-semibold text-slate-900">{chip.value}</span>
          </span>
        ))}
      </div>

      <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="font-bold text-slate-900">高さの扱い</p>
          <p className="mt-1 text-slate-600">GL以下はアンテナ高の負値ではなく、蓋・BOX・開口の損失として加算します。</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="font-bold text-slate-900">実測の役割</p>
          <p className="mt-1 text-slate-600">RSSI/RSRPを1点でも入れると、現場固有のズレを補正できます。</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="font-bold text-slate-900">レンジ表示</p>
          <p className="mt-1 text-slate-600">材質・水分・配置の不確かさを、楽観・標準・厳しめで見ます。</p>
        </div>
      </div>
    </Card>
  );
}


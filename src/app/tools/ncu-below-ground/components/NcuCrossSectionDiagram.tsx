"use client";

import { Card } from "@/components/Card";
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
    return { fill: "#e11d48", stroke: "#9f1239" };
  }
  if (typical >= 10) {
    return { fill: "#f97316", stroke: "#c2410c" };
  }
  if (typical >= 4) {
    return { fill: "#f59e0b", stroke: "#b45309" };
  }
  return { fill: "#10b981", stroke: "#047857" };
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
  const lidColor = isMetalCover ? "#475569" : input.coverMaterial === "resin" ? "#bae6fd" : "#cbd5e1";
  const boxStroke = isMetalBox ? "#334155" : input.boxMaterial === "resin" ? "#0ea5e9" : "#94a3b8";
  const boxFill = isMetalBox ? "#e2e8f0" : input.boxMaterial === "resin" ? "#eff6ff" : "#f8fafc";
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
      <div className="mt-1.5 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 sm:mt-4">
        <svg
          role="img"
          aria-label="GL以下NCU設置の2D断面図と地下追加損失の積み上げ"
          viewBox="0 0 920 520"
          style={{ minWidth: 680 }}
          className="h-auto w-full"
        >
          <defs>
            <linearGradient id="ncuSky" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#eff6ff" />
              <stop offset="100%" stopColor="#dbeafe" />
            </linearGradient>
            <linearGradient id="ncuSoilGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <pattern id="ncuSoil" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect width="16" height="16" fill="url(#ncuSoilGrad)" />
              <path d="M0 16 L16 0" stroke="#cbd5e1" strokeWidth="1" opacity="0.5" />
              <circle cx="4" cy="6" r="0.9" fill="#cbd5e1" opacity="0.6" />
              <circle cx="11" cy="12" r="0.9" fill="#cbd5e1" opacity="0.6" />
            </pattern>
            <filter id="softShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.14" />
            </filter>
            <marker id="ncuArrowSignal" markerHeight="8" markerWidth="8" orient="auto" refX="6" refY="4">
              <path d="M0 0 L8 4 L0 8 Z" fill="#0284c7" />
            </marker>
          </defs>

          {/* 背景：空・土・GL */}
          <rect x="0" y="0" width="690" height={GL_Y} fill="url(#ncuSky)" />
          <rect x="0" y={GL_Y} width="690" height={520 - GL_Y} fill="url(#ncuSoil)" />
          <line x1="0" x2="690" y1={GL_Y} y2={GL_Y} stroke="#64748b" strokeWidth="3" />
          <text x="14" y={GL_Y - 8} fill="#475569" fontSize="13" fontWeight="700">
            地表面 GL
          </text>

          {/* GW / 基地局 */}
          <g transform="translate(36 44)">
            <path d="M36 108 V30" stroke="#005A95" strokeWidth="4" />
            <circle cx="36" cy="22" r="6" fill="#0071BD" />
            <path d="M22 30 Q36 8 50 30" fill="none" stroke="#0071BD" strokeWidth="2.5" opacity="0.55" />
            <path d="M14 38 Q36 4 58 38" fill="none" stroke="#0071BD" strokeWidth="2" opacity="0.35" />
            <text x="36" y="124" textAnchor="middle" fill="#005A95" fontSize="11" fontWeight="700">
              GW/基地局
            </text>
            <text x="36" y="139" textAnchor="middle" fill="#64748b" fontSize="10">
              送信 {input.txPowerDbm.toFixed(0)}dBm
            </text>
          </g>

          {/* 地上伝搬（青破線の弧）→ 開口で実線に切替えBOX内アンテナへ：1本の信号経路 */}
          <path
            d={`M78 70 C240 48 410 70 ${BOX_CX} ${GL_Y - 10}`}
            fill="none"
            stroke="#0284c7"
            strokeWidth="3.5"
            strokeDasharray="9 8"
          />
          <path
            d={`M${BOX_CX} ${GL_Y - 2} L${BOX_CX} ${antennaY - 16}`}
            fill="none"
            stroke="#0284c7"
            strokeWidth="3"
            markerEnd="url(#ncuArrowSignal)"
            opacity={pathOpacity}
          />
          <g>
            <rect x="232" y="44" width="190" height="24" rx="8" fill="#ffffff" stroke="#bae6fd" />
            <text x="240" y="60" fill="#0369a1" fontSize="12" fontWeight="700">
              地上伝搬 {result.outdoorPathLossDb.toFixed(0)}dB・{modelLabel}
            </text>
          </g>

          {/* 地表上の遮蔽（車両・人） */}
          {hasVehicle ? (
            <g transform={`translate(${BOX_CX - 66} ${GL_Y - 42})`}>
              <rect x="0" y="18" width="120" height="26" rx="9" fill="#334155" />
              <path d="M20 18 L38 2 H84 L102 18 Z" fill="#475569" />
              <circle cx="28" cy="46" r="8" fill="#0f172a" />
              <circle cx="92" cy="46" r="8" fill="#0f172a" />
              <text x="60" y="12" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="700">
                {surfaceLabel}
              </text>
            </g>
          ) : null}
          {hasPedestrian ? (
            <g transform={`translate(${BOX_CX - 8} ${GL_Y - 52})`}>
              <circle cx="6" cy="6" r="7" fill="#64748b" />
              <path d="M6 14 V40 M-7 24 H19 M6 40 L-5 56 M6 40 L17 56" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
              <text x="6" y="-6" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="700">
                {surfaceLabel}
              </text>
            </g>
          ) : null}

          {/* BOX / ピット */}
          <g filter="url(#softShadow)">
            <rect x={BOX_X} y={GL_Y} width={BOX_W} height={boxBottom - GL_Y} rx="12" fill={boxFill} stroke={boxStroke} strokeWidth={isMetalBox ? 5 : 3} />
            {/* 内部空洞 */}
            <rect x={BOX_X + 12} y={innerTop} width={BOX_W - 24} height={innerBottom - innerTop} rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
            {/* 水たまり */}
            {waterH > 1 ? (
              <rect x={BOX_X + 13} y={innerBottom - waterH} width={BOX_W - 26} height={waterH} rx="4" fill="#7dd3fc" opacity={hasWaterPool ? 0.85 : 0.55} />
            ) : null}
            {/* 金属近接板 */}
            {input.antennaPosition === "near_metal" ? (
              <rect x={BOX_X + 13} y={antennaY - 26} width="9" height="52" rx="3" fill="#475569" opacity="0.85" />
            ) : null}
            {/* NCUアンテナ */}
            <circle cx={BOX_CX} cy={antennaY} r="13" fill="#10b981" />
            <path d={`M${BOX_CX} ${antennaY} v-34`} stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
            <path d={`M${BOX_CX} ${antennaY - 34} Q${BOX_CX - 12} ${antennaY - 48} ${BOX_CX - 24} ${antennaY - 34}`} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            <path d={`M${BOX_CX} ${antennaY - 34} Q${BOX_CX + 12} ${antennaY - 48} ${BOX_CX + 24} ${antennaY - 34}`} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            {/* 蓋（材質で色・縁、金属は太枠）。開口は中央の隙間。密閉は×印 */}
            <rect x={BOX_X - 28} y={GL_Y - 11} width={BOX_W + 56} height="22" rx="6" fill={lidColor} stroke={isMetalCover ? "#0f172a" : "#94a3b8"} strokeWidth={isMetalCover ? 3 : 2} />
            {openW > 0 ? (
              <rect x={openX} y={GL_Y - 11} width={openW} height="22" rx="4" fill="#eff6ff" stroke="#38bdf8" strokeWidth="2" />
            ) : (
              <path d={`M${BOX_CX - 9} ${GL_Y - 6} L${BOX_CX + 9} ${GL_Y + 6} M${BOX_CX + 9} ${GL_Y - 6} L${BOX_CX - 9} ${GL_Y + 6}`} stroke="#9f1239" strokeWidth="2.5" />
            )}
            {input.openingCondition === "metal_frame" ? (
              <rect x={openX - 6} y={GL_Y - 15} width={openW + 12} height="30" rx="6" fill="none" stroke="#334155" strokeWidth="3.5" />
            ) : null}
          </g>

          {/* 深さ寸法（赤破線、GL→アンテナ）。極端値でも線が短くなりすぎない */}
          <line x1={rulerX} x2={rulerX} y1={GL_Y} y2={antennaY} stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6 5" />
          <line x1={rulerX - 7} x2={rulerX + 7} y1={GL_Y} y2={GL_Y} stroke="#ef4444" strokeWidth="2.5" />
          <line x1={rulerX - 7} x2={rulerX + 7} y1={antennaY} y2={antennaY} stroke="#ef4444" strokeWidth="2.5" />
          <text x={rulerX - 12} y={(GL_Y + antennaY) / 2 - 4} textAnchor="end" fill="#b91c1c" fontSize="12.5" fontWeight="700">
            {depthLabel}
          </text>
          <text x={rulerX - 12} y={(GL_Y + antennaY) / 2 + 13} textAnchor="end" fill="#64748b" fontSize="11">
            深さ {formatSigned(-(depthRange?.typical ?? 0), "dB")}
          </text>

          {/* NCUアンテナ利得の小ラベル */}
          <text x={BOX_CX} y={Math.min(boxBottom + 20, 512)} textAnchor="middle" fill="#064e3b" fontSize="11.5" fontWeight="700">
            NCU {input.ncuAntennaGainDbi.toFixed(0)}dBi・{antennaLabel}
          </text>

          {/* ===== 右レール：地下追加損失スタック ===== */}
          <line x1="694" x2="694" y1="20" y2="500" stroke="#e2e8f0" strokeWidth="1.5" />
          <text x={STK_X} y="46" fill="#0f172a" fontSize="13" fontWeight="700">
            地下の追加損失
          </text>
          <text x={STK_X} y="66" fill="#be123c" fontSize="14" fontWeight="700">
            合計 {result.belowGroundLossRangeDb.typical.toFixed(1)}dB
          </text>
          <rect x={STK_X - 4} y={STK_TOP - 4} width={STK_W + 8} height={STK_H + 8} rx="6" fill="#ffffff" stroke="#e2e8f0" />
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
              <line x1={STK_X + STK_W} x2={STK_X + STK_W + 10} y1={seg.midY} y2={seg.labelY} stroke="#cbd5e1" strokeWidth="1" />
              {seg.isDominant ? (
                <g>
                  <rect x={STK_X + STK_W + 12} y={seg.labelY - 11} width="30" height="14" rx="7" fill="#e11d48" />
                  <text x={STK_X + STK_W + 27} y={seg.labelY} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">
                    主因
                  </text>
                </g>
              ) : null}
              <text x={STK_X + STK_W + (seg.isDominant ? 48 : 12)} y={seg.labelY} fill="#0f172a" fontSize="11.5" fontWeight="700">
                {seg.short} {seg.typical.toFixed(1)}dB
              </text>
            </g>
          ))}
          {stackSegs.length === 0 ? (
            <text x={STK_X} y={STK_TOP + 30} fill="#64748b" fontSize="12">
              地下の追加損失はほぼありません
            </text>
          ) : null}
        </svg>
      </div>

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
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-bold text-slate-900">高さの扱い</p>
          <p className="mt-1 text-slate-600">GL以下はアンテナ高の負値ではなく、蓋・BOX・開口の損失として加算します。</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-bold text-slate-900">実測の役割</p>
          <p className="mt-1 text-slate-600">RSSI/RSRPを1点でも入れると、現場固有のズレを補正できます。</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-bold text-slate-900">レンジ表示</p>
          <p className="mt-1 text-slate-600">材質・水分・配置の不確かさを、楽観・標準・厳しめで見ます。</p>
        </div>
      </div>
    </Card>
  );
}


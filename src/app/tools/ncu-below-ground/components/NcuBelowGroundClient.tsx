"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Box,
  Car,
  CheckCircle2,
  ClipboardList,
  CloudRain,
  Compass,
  ExternalLink,
  Gauge,
  Info,
  Layers,
  type LucideIcon,
  MapPin,
  MoveHorizontal,
  RadioTower,
  RotateCcw,
  Ruler,
  Search,
  Target,
  Wrench,
  Waves
} from "lucide-react";
import {
  calculateNcuFieldAnalysis,
  calculateNcuBelowGround,
  calculateNcuRadioMetricsDiagnosis,
  defaultNcuFieldMeasurements,
  defaultNcuBelowGroundInput,
  defaultNcuRadioMetrics,
  formatDbRange,
  ncuAntennaPositionOptions,
  ncuBoxMaterialOptions,
  ncuCoverMaterialOptions,
  ncuMoistureOptions,
  ncuOpeningOptions,
  ncuOutdoorModelOptions,
  ncuSurfaceObstructionOptions,
  type DbRange,
  type NcuBelowGroundInput,
  type NcuBelowGroundResult,
  type NcuFieldAnalysisResult,
  type NcuFieldFindingSeverity,
  type NcuFieldMeasurementsInput,
  type NcuRadioMetricDiagnosisItem,
  type NcuRadioMetricSeverity,
  type NcuRadioMetricsDiagnosisResult,
  type NcuRadioMetricsInput
} from "@/lib/rf/ncuBelowGround";
import type { LinkJudgementLevel } from "@/lib/rf/judgement";

const scenarioPresets: Array<{
  label: string;
  category: string;
  description: string;
  operatorHint: string;
  values: Partial<NcuBelowGroundInput>;
}> = [
  {
    label: "水道BOX標準",
    category: "迷ったら",
    description: "コンクリート蓋・湿り気あり・浅めのGL下設置",
    operatorHint: "まずはこの条件から始め、蓋材質と水分だけ現場写真に合わせます。",
    values: {
      distance: 300,
      distanceUnit: "m",
      depthBelowGroundM: 0.4,
      coverMaterial: "concrete",
      boxMaterial: "concrete",
      moistureCondition: "damp",
      antennaPosition: "middle",
      openingCondition: "narrow_gap",
      surfaceObstruction: "none"
    }
  },
  {
    label: "鋳鉄蓋マンホール",
    category: "厳しめ",
    description: "金属蓋・深め・開口が小さい厳しめ条件",
    operatorHint: "金属蓋や道路上のマンホールで、通信が不安定になりやすい想定です。",
    values: {
      distance: 200,
      distanceUnit: "m",
      depthBelowGroundM: 0.8,
      coverMaterial: "cast_iron",
      boxMaterial: "concrete",
      moistureCondition: "damp",
      antennaPosition: "bottom",
      openingCondition: "metal_frame",
      surfaceObstruction: "vehicle"
    }
  },
  {
    label: "樹脂蓋の浅いBOX",
    category: "有利",
    description: "蓋直下にアンテナを寄せた比較的有利な条件",
    operatorHint: "樹脂蓋・浅いBOX・蓋直下配置など、改善後の目標条件としても使えます。",
    values: {
      distance: 500,
      distanceUnit: "m",
      depthBelowGroundM: 0.2,
      coverMaterial: "resin",
      boxMaterial: "resin",
      moistureCondition: "dry",
      antennaPosition: "near_lid",
      openingCondition: "open",
      surfaceObstruction: "none"
    }
  },
  {
    label: "水溜まり・底面設置",
    category: "雨天後",
    description: "水分・底面配置・車両遮蔽が重なる要注意条件",
    operatorHint: "雨天後だけ悪い、底面付近で濡れる、といった現場の再現に使います。",
    values: {
      distance: 150,
      distanceUnit: "m",
      depthBelowGroundM: 0.6,
      coverMaterial: "concrete",
      boxMaterial: "concrete",
      moistureCondition: "standing_water",
      antennaPosition: "bottom",
      openingCondition: "sealed",
      surfaceObstruction: "parked_vehicle"
    }
  },
  {
    label: "駐車車両で覆われる",
    category: "一時遮蔽",
    description: "BOX上に車両が来る・金属体で覆われる条件",
    operatorHint: "日中・夜間・駐車有無でRSSIが変わる現場の切り分けに向きます。",
    values: {
      distance: 250,
      distanceUnit: "m",
      depthBelowGroundM: 0.35,
      coverMaterial: "concrete",
      boxMaterial: "concrete",
      moistureCondition: "damp",
      antennaPosition: "middle",
      openingCondition: "narrow_gap",
      surfaceObstruction: "parked_vehicle"
    }
  },
  {
    label: "金属BOX・金属近傍",
    category: "アンテナ",
    description: "BOXや取付金具の近くでアンテナ効率が落ちる条件",
    operatorHint: "蓋を開けても悪い場合に、アンテナ近傍・整合ずれを疑う想定です。",
    values: {
      distance: 200,
      distanceUnit: "m",
      depthBelowGroundM: 0.45,
      coverMaterial: "resin",
      boxMaterial: "metal",
      moistureCondition: "dry",
      antennaPosition: "near_metal",
      openingCondition: "narrow_gap",
      surfaceObstruction: "none"
    }
  },
  {
    label: "遠距離・地上側遮蔽あり",
    category: "地上側",
    description: "BOX以前に地上側リンクが苦しい条件",
    operatorHint: "BOX外でもRSSIが悪い場合に、距離・地形・建物側を疑う想定です。",
    values: {
      distance: 1.2,
      distanceUnit: "km",
      pathLossExponent: 3.3,
      aboveGroundClutterLossDb: 14,
      depthBelowGroundM: 0.3,
      coverMaterial: "resin",
      boxMaterial: "resin",
      moistureCondition: "dry",
      antennaPosition: "near_lid",
      openingCondition: "open",
      surfaceObstruction: "none"
    }
  }
];

const judgementTone: Record<LinkJudgementLevel, string> = {
  excellent: "border-emerald-200 bg-emerald-50 text-emerald-800",
  good: "border-sky-200 bg-sky-50 text-sky-800",
  caution: "border-amber-200 bg-amber-50 text-amber-800",
  unstable: "border-orange-200 bg-orange-50 text-orange-800",
  poor: "border-rose-200 bg-rose-50 text-rose-800"
};

function formatSigned(value: number, unit = "dB") {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)} ${unit}`;
}

function formatDistance(distanceM: number) {
  if (distanceM >= 1000) {
    return `${(distanceM / 1000).toFixed(distanceM >= 10_000 ? 0 : 2)} km`;
  }

  return `${distanceM.toFixed(distanceM >= 100 ? 0 : 1)} m`;
}

function updateNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function updateOptionalNumber(value: string) {
  if (value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function FieldHint({ text }: { text: string }) {
  return (
    <span
      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-[11px] font-bold text-sky-700"
      title={text}
      aria-label={text}
    >
      ?
    </span>
  );
}

function OptionalNumberField({
  id,
  label,
  help,
  unit,
  value,
  placeholder,
  min,
  max,
  step,
  onChange
}: {
  id: string;
  label: string;
  help: string;
  unit: string;
  value: number | null;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number | null) => void;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
        {label}
        <FieldHint text={help} />
      </span>
      <span className="mt-1 block text-xs leading-relaxed text-slate-500">{help}</span>
      <span className="mt-2 flex overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-staf/70 focus-within:ring-2 focus-within:ring-staf/15">
        <input
          id={id}
          className="min-w-0 flex-1 px-3 py-2.5 text-base font-semibold text-slate-950 outline-none"
          type="number"
          value={value ?? ""}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(updateOptionalNumber(event.target.value))}
        />
        <span className="flex min-w-20 items-center justify-center bg-slate-50 px-3 text-sm font-semibold text-slate-600">
          {unit}
        </span>
      </span>
    </label>
  );
}

const purposeCards = [
  {
    id: "estimate",
    label: "現場前に見積もる",
    description: "写真・図面・距離から、危険因子と通信余裕レンジを先に見る。"
  },
  {
    id: "field",
    label: "現場で原因を追い込む",
    description: "RSSI/RSRPの差分から、蓋・水分・配置・車両・反射を切り分ける。"
  }
] as const;

type WorkMode = (typeof purposeCards)[number]["id"];

function NumberField({
  id,
  label,
  help,
  unit,
  value,
  min,
  max,
  step,
  onChange
}: {
  id: string;
  label: string;
  help: string;
  unit: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
        {label}
        <FieldHint text={help} />
      </span>
      <span className="mt-1 block text-xs leading-relaxed text-slate-500">{help}</span>
      <span className="mt-2 flex overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-staf/70 focus-within:ring-2 focus-within:ring-staf/15">
        <input
          id={id}
          className="min-w-0 flex-1 px-3 py-2.5 text-base font-semibold text-slate-950 outline-none"
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(updateNumber(event.target.value))}
        />
        <span className="flex min-w-20 items-center justify-center bg-slate-50 px-3 text-sm font-semibold text-slate-600">
          {unit}
        </span>
      </span>
    </label>
  );
}

function SelectField<T extends string>({
  id,
  label,
  help,
  value,
  options,
  onChange
}: {
  id: string;
  label: string;
  help: string;
  value: T;
  options: Array<{ value: T; label: string; description: string }>;
  onChange: (value: T) => void;
}) {
  const selected = options.find((option) => option.value === value);

  return (
    <label className="block" htmlFor={id}>
      <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
        {label}
        <FieldHint text={help} />
      </span>
      <select
        id={id}
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base font-semibold text-slate-950 outline-none transition focus:border-staf/70 focus:ring-2 focus:ring-staf/15"
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="mt-1 block text-xs leading-relaxed text-slate-500">
        {selected?.description ?? help}
      </span>
    </label>
  );
}

function SectionTitle({
  icon: Icon,
  eyebrow,
  title,
  children
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-staf/10 text-staf">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-staf">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{children}</p>
      </div>
    </div>
  );
}

function findOptionLabel<T extends string>(options: Array<{ value: T; label: string }>, value: T): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

function NcuCrossSectionDiagram({
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
  const isWet = input.moistureCondition === "wet" || input.moistureCondition === "standing_water";
  const hasWaterPool = input.moistureCondition === "standing_water";
  const hasVehicle = input.surfaceObstruction === "vehicle" || input.surfaceObstruction === "parked_vehicle";
  const hasPedestrian = input.surfaceObstruction === "pedestrian";
  const boxTopY = 234;
  const boxHeight = 134 + Math.min(92, input.depthBelowGroundM * 58);
  const antennaY =
    input.antennaPosition === "near_lid"
      ? boxTopY + 36
      : input.antennaPosition === "bottom"
        ? boxTopY + boxHeight - 34
        : input.antennaPosition === "near_metal"
          ? boxTopY + Math.max(48, boxHeight * 0.36)
          : boxTopY + boxHeight * 0.56;
  const openingWidthByCondition: Record<NcuBelowGroundInput["openingCondition"], number> = {
    open: 76,
    narrow_gap: 34,
    sealed: 8,
    metal_frame: 22
  };
  const openingWidth = openingWidthByCondition[input.openingCondition];
  const openingX = 686 - openingWidth / 2;
  const lidColor = isMetalCover ? "#475569" : input.coverMaterial === "resin" ? "#bae6fd" : "#cbd5e1";
  const boxStroke = isMetalBox ? "#334155" : input.boxMaterial === "resin" ? "#0ea5e9" : "#94a3b8";
  const boxFill = isMetalBox ? "#cbd5e1" : input.boxMaterial === "resin" ? "#eff6ff" : "#f8fafc";
  const ncuLinkColor = result.linkMarginRangeDb.typical >= 0 ? "#059669" : "#e11d48";
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
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" data-testid="ncu-assumption-diagram">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-staf">シミュレーション結果の2D図</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">NCUが地面より下にある場合の設定パラメータ図</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            距離、周波数、蓋、BOX、深さ、水分、開口、地表遮蔽、損失レンジを同じ図に重ねています。入力を変えると、図中の形状・ラベル・損失値も連動します。
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
          地上距離 {formatDistance(result.distanceM)}
        </span>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.42fr] xl:items-stretch">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <svg
            className="h-auto min-h-[380px] w-full"
            viewBox="0 0 980 540"
            role="img"
            aria-label="GL以下NCU設置の2D断面図"
          >
            <defs>
              <linearGradient id="ncuSky" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#eff6ff" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
              <pattern id="ncuSoil" width="14" height="14" patternUnits="userSpaceOnUse">
                <path d="M0 14 L14 0" stroke="#cbd5e1" strokeWidth="1" opacity="0.45" />
              </pattern>
              <filter id="softShadow">
                <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.16" />
              </filter>
              <marker id="arrowHeadBlue" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
                <path d="M0 0 L8 4 L0 8 Z" fill="#0284c7" />
              </marker>
              <marker id="arrowHeadOrange" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
                <path d="M0 0 L8 4 L0 8 Z" fill="#f97316" />
              </marker>
            </defs>
            <rect width="980" height="540" fill="url(#ncuSky)" />
            <rect x="0" y="210" width="980" height="330" fill="#f8fafc" />
            <rect x="0" y="210" width="980" height="330" fill="url(#ncuSoil)" />
            <path d="M0 210 H980" stroke="#64748b" strokeWidth="4" />
            <text x="28" y="192" fill="#334155" fontSize="17" fontWeight="700">
              GL（地表面）
            </text>

            <g transform="translate(82 62)">
              <path d="M42 125 V38" stroke="#0f766e" strokeWidth="9" strokeLinecap="round" />
              <path d="M18 125 H66" stroke="#0f766e" strokeWidth="11" strokeLinecap="round" />
              <circle cx="42" cy="28" r="12" fill="#0ea5e9" />
              <path d="M20 25 Q42 2 64 25" fill="none" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" />
              <path d="M8 14 Q42 -18 76 14" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" opacity="0.68" />
              <rect x="-30" y="146" width="146" height="54" rx="10" fill="#ffffff" stroke="#cbd5e1" />
              <text x="-14" y="168" fill="#0f172a" fontSize="14" fontWeight="700">
                地上側GW/基地局
              </text>
              <text x="-14" y="190" fill="#475569" fontSize="12">
                Tx {input.txPowerDbm.toFixed(1)}dBm / Ant {input.gatewayAntennaGainDbi.toFixed(1)}dBi
              </text>
            </g>

            <path
              d="M170 92 C320 80 508 116 662 191"
              fill="none"
              markerEnd="url(#arrowHeadBlue)"
              stroke="#0284c7"
              strokeWidth="4"
              strokeDasharray="9 9"
            />
            <path
              d={`M174 106 C336 150 482 206 ${676 - openingWidth / 3} ${boxTopY + 34}`}
              fill="none"
              markerEnd="url(#arrowHeadOrange)"
              stroke="#f97316"
              strokeWidth="4"
              opacity="0.88"
            />
            <rect x="312" y="46" width="290" height="76" rx="12" fill="#ffffff" stroke="#bae6fd" />
            <text x="330" y="72" fill="#0369a1" fontSize="14" fontWeight="700">
              地上側伝搬 {result.outdoorPathLossDb.toFixed(1)} dB
            </text>
            <text x="330" y="96" fill="#475569" fontSize="12">
              {modelLabel} / 距離 {formatDistance(result.distanceM)}
            </text>

            {hasVehicle ? (
              <g transform="translate(616 154)">
                <rect x="0" y="20" width="132" height="34" rx="12" fill="#334155" />
                <path d="M22 20 L42 0 H92 L112 20 Z" fill="#475569" />
                <circle cx="30" cy="58" r="10" fill="#0f172a" />
                <circle cx="102" cy="58" r="10" fill="#0f172a" />
                <text x="6" y="-10" fill="#334155" fontSize="13" fontWeight="700">
                  {surfaceLabel}
                </text>
              </g>
            ) : null}

            {hasPedestrian ? (
              <g transform="translate(664 150)">
                <circle cx="24" cy="8" r="9" fill="#64748b" />
                <path d="M24 18 V52 M8 32 H40 M24 52 L10 76 M24 52 L42 76" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
                <text x="-10" y="-10" fill="#334155" fontSize="13" fontWeight="700">
                  {surfaceLabel}
                </text>
              </g>
            ) : null}

            <g filter="url(#softShadow)">
              <rect x="598" y={boxTopY} width="176" height={boxHeight} rx="14" fill={boxFill} stroke={boxStroke} strokeWidth={isMetalBox ? 5 : 3} />
              <rect x="558" y="192" width="256" height="28" rx="10" fill={lidColor} stroke={isMetalCover ? "#0f172a" : "#94a3b8"} strokeWidth={isMetalCover ? 3 : 2} />
              <rect x={openingX} y="192" width={openingWidth} height="28" rx="7" fill={input.openingCondition === "sealed" ? "#94a3b8" : "#f8fafc"} stroke="#0ea5e9" strokeWidth="2" />
              {input.openingCondition === "metal_frame" ? (
                <rect x={openingX - 6} y="188" width={openingWidth + 12} height="36" rx="8" fill="none" stroke="#334155" strokeWidth="4" />
              ) : null}
              <rect x="616" y={boxTopY + 22} width="140" height={boxHeight - 44} rx="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
              {isWet ? (
                <path
                  d={`M617 ${boxTopY + boxHeight - (hasWaterPool ? 64 : 42)} C650 ${boxTopY + boxHeight - 78} 702 ${boxTopY + boxHeight - 48} 756 ${boxTopY + boxHeight - 62} V${boxTopY + boxHeight - 22} H617 Z`}
                  fill="#7dd3fc"
                  opacity={hasWaterPool ? 0.86 : 0.58}
                />
              ) : null}
              {input.antennaPosition === "near_metal" ? (
                <rect x="604" y={antennaY - 40} width="18" height="92" rx="5" fill="#475569" opacity="0.85" />
              ) : null}
              <circle cx="686" cy={antennaY} r="15" fill="#10b981" />
              <path d={`M686 ${antennaY} v-42`} stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
              <path d={`M686 ${antennaY - 42} Q672 ${antennaY - 58} 658 ${antennaY - 42}`} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
              <path d={`M686 ${antennaY - 42} Q701 ${antennaY - 58} 716 ${antennaY - 42}`} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
            </g>

            <path d={`M828 210 V${antennaY}`} stroke="#ef4444" strokeWidth="3" strokeDasharray="6 6" />
            <path d={`M818 210 H838 M818 ${antennaY} H838`} stroke="#ef4444" strokeWidth="3" />
            <text x="842" y={(210 + antennaY) / 2 - 6} fill="#b91c1c" fontSize="15" fontWeight="700">
              {depthLabel}
            </text>
            <text x="842" y={(210 + antennaY) / 2 + 16} fill="#64748b" fontSize="12">
              深さ損失 {depthRange?.typical.toFixed(1) ?? "0.0"}dB
            </text>

            <rect x="590" y="128" width="270" height="52" rx="12" fill="#ffffff" stroke="#fecdd3" />
            <text x="608" y="152" fill="#be123c" fontSize="14" fontWeight="700">
              BOX・地下追加損失 {formatDbRange(result.belowGroundLossRangeDb)}
            </text>
            <text x="608" y="172" fill="#475569" fontSize="12">
              蓋 {coverRange?.typical.toFixed(1) ?? "0.0"}dB / BOX {boxRange?.typical.toFixed(1) ?? "0.0"}dB / 開口 {openingRange?.typical.toFixed(1) ?? "0.0"}dB
            </text>

            <rect x="594" y={boxTopY + boxHeight + 12} width="184" height="54" rx="10" fill="#ffffff" stroke="#bbf7d0" />
            <text x="610" y={boxTopY + boxHeight + 35} fill="#064e3b" fontSize="14" fontWeight="700">
              NCUアンテナ {input.ncuAntennaGainDbi.toFixed(1)}dBi
            </text>
            <text x="610" y={boxTopY + boxHeight + 55} fill="#475569" fontSize="12">
              {antennaLabel}
            </text>

            <rect x="30" y="420" width="280" height="80" rx="14" fill="#ffffff" stroke="#cbd5e1" />
            <text x="50" y="448" fill="#0f172a" fontSize="15" fontWeight="700">
              受信電力 {result.receivedPowerRangeDbm.typical.toFixed(1)} dBm
            </text>
            <text x="50" y="474" fill={ncuLinkColor} fontSize="15" fontWeight="700">
              リンクマージン {formatSigned(result.linkMarginRangeDb.typical)}
            </text>
            <text x="50" y="496" fill="#64748b" fontSize="12">
              受信感度 {input.receiverSensitivityDbm.toFixed(1)} dBm / 実測補正 {formatSigned(input.measuredCorrectionDb)}
            </text>
          </svg>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-bold text-staf">設定サマリ</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">図に反映しているパラメータ</h3>
          <div className="mt-3 grid gap-2">
            {parameterChips.map((chip) => (
              <div key={chip.label} className="flex items-start justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2">
                <span className="text-xs font-bold text-slate-500">{chip.label}</span>
                <span className="max-w-[12rem] text-right text-sm font-bold leading-snug text-slate-950">{chip.value}</span>
              </div>
            ))}
          </div>
        </aside>
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
    </section>
  );
}

function MetricCard({
  label,
  value,
  sub,
  tone = "slate"
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "slate" | "sky" | "rose" | "emerald";
}) {
  const toneClass = {
    slate: "border-slate-200 bg-white text-slate-950",
    sky: "border-sky-200 bg-sky-50 text-sky-950",
    rose: "border-rose-200 bg-rose-50 text-rose-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950"
  }[tone];

  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs leading-relaxed opacity-80">{sub}</p>
    </div>
  );
}

function RangeTriplet({
  title,
  range,
  unit,
  higherIsBetter = true
}: {
  title: string;
  range: DbRange;
  unit: string;
  higherIsBetter?: boolean;
}) {
  const optimistic = higherIsBetter ? range.max : range.min;
  const severe = higherIsBetter ? range.min : range.max;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-bold text-slate-900">{title}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-emerald-50 p-2">
          <p className="text-[11px] font-bold text-emerald-700">楽観</p>
          <p className="text-sm font-bold text-emerald-950">{optimistic.toFixed(1)} {unit}</p>
        </div>
        <div className="rounded-lg bg-sky-50 p-2">
          <p className="text-[11px] font-bold text-sky-700">標準</p>
          <p className="text-sm font-bold text-sky-950">{range.typical.toFixed(1)} {unit}</p>
        </div>
        <div className="rounded-lg bg-rose-50 p-2">
          <p className="text-[11px] font-bold text-rose-700">厳しめ</p>
          <p className="text-sm font-bold text-rose-950">{severe.toFixed(1)} {unit}</p>
        </div>
      </div>
    </div>
  );
}

function LossBreakdown({ result }: { result: NcuBelowGroundResult }) {
  const max = Math.max(...result.breakdown.map((item) => item.range.max), 1);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <SectionTitle icon={Layers} eyebrow="Loss decomposition" title="BOX・地下まわりの追加損失を分解">
        どの条件がどれくらい効いているかを、項目別レンジで確認します。改善余地の大きい項目から現場で潰すと効率的です。
      </SectionTitle>

      <div className="space-y-3">
        {result.breakdown.map((item) => (
          <details key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-950">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.valueLabel}</p>
                </div>
                <p className="text-sm font-bold text-slate-950">{formatDbRange(item.range)}</p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-staf"
                  style={{ width: `${Math.max(3, (item.range.typical / max) * 100)}%` }}
                />
              </div>
            </summary>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">{item.note}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function ResultPanel({ input, result }: { input: NcuBelowGroundInput; result: NcuBelowGroundResult }) {
  const totalFixedLossDb = result.outdoorPathLossDb + input.cableLossDb + input.aboveGroundClutterLossDb;

  return (
    <aside className="space-y-4 lg:sticky lg:top-6">
      <section className={`rounded-lg border p-5 shadow-sm ${judgementTone[result.judgement.level]}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold opacity-80">標準条件の判定</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight">{result.judgement.label}</h2>
          </div>
          {result.judgement.level === "poor" ? (
            <AlertTriangle aria-hidden="true" className="h-8 w-8" />
          ) : (
            <CheckCircle2 aria-hidden="true" className="h-8 w-8" />
          )}
        </div>
        <p className="mt-3 text-sm leading-relaxed">{result.judgement.summary}</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <MetricCard
          label="標準リンクマージン"
          value={formatSigned(result.linkMarginRangeDb.typical)}
          sub={`楽観 ${formatSigned(result.linkMarginRangeDb.max)} / 厳しめ ${formatSigned(result.linkMarginRangeDb.min)}`}
          tone={result.linkMarginRangeDb.typical >= 0 ? "emerald" : "rose"}
        />
        <MetricCard
          label="標準受信電力"
          value={`${result.receivedPowerRangeDbm.typical.toFixed(1)} dBm`}
          sub={`受信感度 ${input.receiverSensitivityDbm.toFixed(1)} dBm との比較`}
          tone="sky"
        />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">計算の流れ</h2>
        <div className="mt-4 space-y-2 text-sm">
          <Row label="送信電力 + アンテナ利得" value={`${(input.txPowerDbm + input.gatewayAntennaGainDbi + input.ncuAntennaGainDbi).toFixed(1)} dBm`} />
          <Row label="地上側伝搬損失" value={`-${result.outdoorPathLossDb.toFixed(1)} dB`} />
          <Row label="ケーブル・地上クラッタ" value={`-${(input.cableLossDb + input.aboveGroundClutterLossDb).toFixed(1)} dB`} />
          <Row label="BOX・地下追加損失" value={`-${result.belowGroundLossRangeDb.typical.toFixed(1)} dB`} />
          <Row label="実測補正" value={formatSigned(input.measuredCorrectionDb)} />
          <Row label="合計損失レンジ" value={formatDbRange(result.totalLossRangeDb)} strong />
          <Row label="地上側固定損失" value={`${totalFixedLossDb.toFixed(1)} dB`} />
        </div>
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle aria-hidden="true" className="h-5 w-5 text-amber-700" />
          <h2 className="font-bold text-amber-950">注意と次の確認</h2>
        </div>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-amber-950/90">
          {result.warnings.map((warning) => (
            <li key={warning.id}>{warning.message}</li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 border-b border-slate-100 py-2 ${strong ? "font-bold text-slate-950" : "text-slate-700"}`}>
      <span>{label}</span>
      <span className="text-right tabular-nums">{value}</span>
    </div>
  );
}

function ResearchColumn() {
  return (
    <section className="rounded-lg border border-sky-200 bg-sky-50 p-5">
      <div className="flex items-center gap-2">
        <BookOpen aria-hidden="true" className="h-5 w-5 text-sky-700" />
        <h2 className="text-lg font-bold text-sky-950">コラム：世界の研究ではどう扱っているか</h2>
      </div>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-sky-950/90">
        <p>
          GL以下NCUに対して、奥村・秦モデルのアンテナ高へマイナス値を入れる、という扱いは主流ではありません。
          近い研究・標準では、地上側の伝搬、侵入損失、内部深さ、周辺構造、実測補正を分けて扱います。
        </p>
        <ul className="space-y-2">
          <li>
            <a
              className="font-bold text-sky-800 underline-offset-2 hover:underline"
              href="https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=3173"
              target="_blank"
              rel="noreferrer"
            >
              3GPP TR 38.901
              <ExternalLink aria-hidden="true" className="ml-1 inline h-3 w-3" />
            </a>
            は0.5〜100GHzのチャネルモデル体系で、屋外・屋内・侵入損失・ばらつきを分けて考える土台になります。
          </li>
          <li>
            <a
              className="font-bold text-sky-800 underline-offset-2 hover:underline"
              href="https://arxiv.org/abs/2006.00880"
              target="_blank"
              rel="noreferrer"
            >
              深部屋内NB-IoT実測研究
              <ExternalLink aria-hidden="true" className="ml-1 inline h-3 w-3" />
            </a>
            では、距離や深さだけでは減衰を十分説明できず、近傍通路・構造条件が効くことが示されています。
          </li>
          <li>
            <a
              className="font-bold text-sky-800 underline-offset-2 hover:underline"
              href="https://arxiv.org/abs/2605.23483"
              target="_blank"
              rel="noreferrer"
            >
              2026年のLPWAN深部屋内比較
              <ExternalLink aria-hidden="true" className="ml-1 inline h-3 w-3" />
            </a>
            は、スマートメーターの地下空間でmioty、LoRaWAN、Sigfox、NB-IoT、LTE-Mを実測比較しています。
          </li>
          <li>
            <a
              className="font-bold text-sky-800 underline-offset-2 hover:underline"
              href="https://arxiv.org/abs/2508.19350"
              target="_blank"
              rel="noreferrer"
            >
              地下センサー向けLoRaWAN研究
              <ExternalLink aria-hidden="true" className="ml-1 inline h-3 w-3" />
            </a>
            では、埋設深さや土壌含水率が接続確率に大きく効くことが扱われています。
          </li>
        </ul>
        <p className="rounded-lg border border-sky-200 bg-white/70 p-3 text-xs">
          実務上の落としどころは、万能な「地下距離式」を探すことではなく、蓋・BOX・水分・開口・アンテナ位置を分解し、現地測定で補正することです。
        </p>
      </div>
    </section>
  );
}

const measurementItems: Array<{
  key: keyof NcuFieldMeasurementsInput;
  label: string;
  unit: string;
  icon: LucideIcon;
  help: string;
  aim: string;
}> = [
  {
    key: "outsideBoxDbm",
    label: "1. BOX外・地表付近",
    unit: "dBm",
    icon: MapPin,
    help: "蓋やBOXの影響を受けにくい、地表面付近の基準RSSI/RSRPです。",
    aim: "ここで悪い場合は、BOXではなく地上側距離・遮蔽・基地局/GW側を疑います。"
  },
  {
    key: "boxOpenDbm",
    label: "2. BOX内・蓋開け",
    unit: "dBm",
    icon: Box,
    help: "NCUをBOX内に置き、蓋を開けた状態のRSSI/RSRPです。",
    aim: "BOX外との差で、深さ・BOX壁・アンテナ位置・金属近接を切り分けます。"
  },
  {
    key: "boxClosedDryDbm",
    label: "3. 蓋閉め・乾燥時",
    unit: "dBm",
    icon: ClipboardList,
    help: "通常運用に最も近い、乾燥時の蓋閉めRSSI/RSRPです。",
    aim: "この値を標準条件の実測代表値として、計算値との差分も見ます。"
  },
  {
    key: "boxClosedWetDbm",
    label: "4. 雨天後・湿潤時",
    unit: "dBm",
    icon: CloudRain,
    help: "雨天後、結露、水溜まりなど、湿った条件の蓋閉めRSSI/RSRPです。",
    aim: "乾燥時との差で、水分・水膜・アンテナ整合ずれの影響を見ます。"
  },
  {
    key: "antennaImprovedDbm",
    label: "5. アンテナ改善後",
    unit: "dBm",
    icon: Wrench,
    help: "蓋直下、非金属部近く、金属から離すなど改善後のRSSI/RSRPです。",
    aim: "改善量が大きい場合、距離よりアンテナ配置の対策が効きます。"
  },
  {
    key: "vehicleCoveredDbm",
    label: "6. 車両・金属体あり",
    unit: "dBm",
    icon: Car,
    help: "BOX上に車両や金属体がある状態のRSSI/RSRPです。",
    aim: "駐車車両や一時遮蔽が通信断の主因になるかを確認します。"
  },
  {
    key: "nearbyShiftedDbm",
    label: "7. 30cm移動・向き変更",
    unit: "dBm",
    icon: MoveHorizontal,
    help: "NCU位置を少し動かす、またはアンテナ向きを変えたときのRSSI/RSRPです。",
    aim: "数十cmで変わる場合、地面反射・BOX内反射・偏波・近傍フェージングを疑います。"
  }
];

const radioMetricItems: Array<{
  key: keyof NcuRadioMetricsInput;
  label: string;
  unit: string;
  help: string;
  placeholder: string;
  min?: number;
  max?: number;
  step?: number;
}> = [
  {
    key: "rsrpDbm",
    label: "RSRP",
    unit: "dBm",
    help: "LTE-M/NB-IoTなどの基準信号受信電力です。RSSIより通信路の強さを見やすい場合があります。",
    placeholder: "-110",
    step: 0.5
  },
  {
    key: "rssiDbm",
    label: "RSSI",
    unit: "dBm",
    help: "受信帯域内の総受信電力です。干渉も含むため、RSSI単独で通信可否を断定しません。",
    placeholder: "-95",
    step: 0.5
  },
  {
    key: "rsrqDb",
    label: "RSRQ",
    unit: "dB",
    help: "LTE系の品質指標です。負のdBで表示され、一般に0に近いほど良好です。",
    placeholder: "-12",
    step: 0.5
  },
  {
    key: "sinrDb",
    label: "SINR",
    unit: "dB",
    help: "信号対干渉雑音比です。RSRPが悪くないのに低い場合は、干渉や反射を疑います。",
    placeholder: "3",
    step: 0.5
  },
  {
    key: "snrDb",
    label: "SNR",
    unit: "dB",
    help: "信号対雑音比です。LoRaなどではマイナス値でも成立する場合があり、方式設定とセットで見ます。",
    placeholder: "-6",
    step: 0.5
  },
  {
    key: "packetSuccessPercent",
    label: "パケット成功率",
    unit: "%",
    help: "送信試行に対してACKや受信成功が返った割合です。短時間ではなく複数回の平均で見ます。",
    placeholder: "95",
    min: 0,
    max: 100,
    step: 0.1
  },
  {
    key: "retryCount",
    label: "再送回数",
    unit: "回",
    help: "機器ログで取れる場合の再送回数です。方式で定義が違うため、同一機器内の比較に向きます。",
    placeholder: "2",
    min: 0,
    step: 1
  }
];

function severityLabel(severity: NcuFieldFindingSeverity) {
  switch (severity) {
    case "high":
      return "主因級";
    case "medium":
      return "要確認";
    case "low":
      return "軽微";
    case "none":
      return "小さい";
  }
}

function metricSeverityLabel(severity: NcuRadioMetricSeverity) {
  switch (severity) {
    case "poor":
      return "要対策";
    case "caution":
      return "注意";
    case "good":
      return "良好";
    case "unknown":
      return "未入力";
  }
}

function metricSeverityClass(severity: NcuRadioMetricSeverity) {
  switch (severity) {
    case "poor":
      return "border-rose-200 bg-rose-50 text-rose-900";
    case "caution":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "good":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "unknown":
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function severityClass(severity: NcuFieldFindingSeverity) {
  switch (severity) {
    case "high":
      return "border-rose-200 bg-rose-50 text-rose-900";
    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "low":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "none":
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function WorkflowGuide({ mode }: { mode: WorkMode }) {
  const estimateSteps = [
    { icon: Target, title: "近い現場プリセット", text: "まずは写真や記憶に一番近い条件を選びます。" },
    { icon: Waves, title: "地上側リンク", text: "周波数、距離、送信電力、受信感度だけ先に合わせます。" },
    { icon: Box, title: "BOXまわり", text: "蓋、深さ、水分、アンテナ位置、車両遮蔽を選びます。" },
    { icon: Gauge, title: "余裕レンジ", text: "楽観・標準・厳しめで、現場前の危険因子を見ます。" }
  ];
  const fieldSteps = [
    { icon: MapPin, title: "BOX外で基準測定", text: "まずBOX外の地上側リンクが悪くないか見ます。" },
    { icon: Box, title: "蓋開け/閉め差分", text: "BOX内配置と蓋損失を分けます。" },
    { icon: CloudRain, title: "雨天後・水分差", text: "湿潤時だけ悪いかを切り分けます。" },
    { icon: Search, title: "原因ランキング", text: "一番大きい差分から対策を決めます。" }
  ];
  const steps = mode === "estimate" ? estimateSteps : fieldSteps;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Compass aria-hidden="true" className="h-5 w-5 text-staf" />
        <h2 className="text-lg font-bold text-slate-950">迷わない入力順</h2>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-staf text-xs font-bold text-white">
                  {index + 1}
                </span>
                <Icon aria-hidden="true" className="h-4 w-4 text-staf" />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-950">{step.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{step.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PurposeSwitch({
  activeMode,
  onChange
}: {
  activeMode: WorkMode;
  onChange: (mode: WorkMode) => void;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
      <div className="grid gap-2 md:grid-cols-2" role="tablist" aria-label="GL以下NCU診断の目的">
        {purposeCards.map((card) => {
          const selected = activeMode === card.id;
          return (
            <button
              key={card.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`rounded-md p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-staf/20 ${
                selected ? "bg-staf text-white shadow-sm" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
              onClick={() => onChange(card.id)}
            >
              <span className="block text-base font-bold">{card.label}</span>
              <span className={`mt-1 block text-sm leading-relaxed ${selected ? "text-white/85" : "text-slate-500"}`}>
                {card.description}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FindingCard({ finding, rank }: { finding: NcuFieldAnalysisResult["findings"][number]; rank: number }) {
  return (
    <details className={`rounded-lg border p-4 ${severityClass(finding.severity)}`} open={rank <= 2}>
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold opacity-70">#{rank} {severityLabel(finding.severity)}</p>
            <p className="text-base font-bold">{finding.label}</p>
          </div>
          <p className="text-xl font-bold tabular-nums">{finding.valueDb >= 0 ? "+" : ""}{finding.valueDb.toFixed(1)} dB</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/70">
          <div className="h-full rounded-full bg-current" style={{ width: `${Math.min(100, Math.max(4, finding.impactDb * 4))}%` }} />
        </div>
      </summary>
      <p className="mt-3 text-sm leading-relaxed">{finding.summary}</p>
      <p className="mt-2 rounded-md bg-white/65 p-3 text-xs leading-relaxed">
        <span className="font-bold">次の一手：</span>{finding.nextAction}
      </p>
    </details>
  );
}

function MetricDiagnosisCard({ item }: { item: NcuRadioMetricDiagnosisItem }) {
  return (
    <details className={`rounded-lg border p-3 ${metricSeverityClass(item.severity)}`} open={item.severity !== "unknown"}>
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold opacity-70">{metricSeverityLabel(item.severity)}</p>
            <p className="text-sm font-bold">{item.label}</p>
          </div>
          <p className="text-right text-sm font-bold tabular-nums">
            {item.value === null ? "未入力" : `${item.value.toFixed(item.id === "retryCount" ? 0 : 1)} ${item.unit}`}
          </p>
        </div>
        <p className="mt-2 text-sm font-bold">{item.summary}</p>
      </summary>
      <p className="mt-2 text-xs leading-relaxed">{item.detail}</p>
      <p className="mt-2 rounded-md bg-white/65 p-2 text-xs leading-relaxed">
        <span className="font-bold">次の一手：</span>{item.nextAction}
      </p>
    </details>
  );
}

function RadioMetricsDiagnosisPanel({
  metrics,
  diagnosis,
  onMetricChange
}: {
  metrics: NcuRadioMetricsInput;
  diagnosis: NcuRadioMetricsDiagnosisResult;
  onMetricChange: <K extends keyof NcuRadioMetricsInput>(key: K, value: NcuRadioMetricsInput[K]) => void;
}) {
  const summaryTone = metricSeverityClass(diagnosis.overallSeverity);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <SectionTitle icon={Gauge} eyebrow="Radio metrics" title="RSRQ・SNRなど通信品質指標の簡易診断">
        機器ログで分かる項目だけ入力してください。電界不足、品質劣化、実通信成功率のどこが怪しいかを簡易的に切り分けます。
      </SectionTitle>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {radioMetricItems.map((item) => (
              <OptionalNumberField
                key={item.key}
                id={`metric-${item.key}`}
                label={item.label}
                help={item.help}
                unit={item.unit}
                value={metrics[item.key]}
                placeholder={item.placeholder}
                min={item.min}
                max={item.max}
                step={item.step}
                onChange={(value) => onMetricChange(item.key, value)}
              />
            ))}
          </div>
          <details className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <summary className="cursor-pointer text-sm font-bold text-slate-950">
              指標の読み方と注意点
            </summary>
            <div className="mt-2 space-y-2 text-xs leading-relaxed text-slate-600">
              <p>RSRP/RSSIは「電波の強さ」、RSRQ/SINR/SNRは「電波の品質」、成功率/再送回数は「実通信の結果」を見るためのメモです。</p>
              <p>方式やモジュールによってログ名や閾値が違うため、絶対値だけで断定せず、同じ機器・同じ測り方での相対比較を優先してください。</p>
            </div>
          </details>
        </div>

        <aside className="space-y-3">
          <div className={`rounded-lg border p-4 ${summaryTone}`}>
            <div className="flex items-center gap-2">
              {diagnosis.overallSeverity === "good" ? (
                <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
              ) : (
                <AlertTriangle aria-hidden="true" className="h-5 w-5" />
              )}
              <p className="font-bold">総合メモ：{metricSeverityLabel(diagnosis.overallSeverity)}</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed">{diagnosis.summary}</p>
            <p className="mt-2 text-xs font-bold opacity-75">
              入力済み指標：{diagnosis.availableCount}/{radioMetricItems.length}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-950">推奨する次アクション</p>
            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-slate-600">
              {diagnosis.recommendedActions.map((action) => (
                <li key={action}>・{action}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
            <p className="text-sm font-bold text-sky-950">簡易診断の前提</p>
            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-sky-950/90">
              {diagnosis.caveats.map((caveat) => (
                <li key={caveat}>・{caveat}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {diagnosis.items.map((item) => (
          <MetricDiagnosisCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function FieldAnalysisPanel({
  measurements,
  analysis,
  radioMetrics,
  metricsDiagnosis,
  predictedReceivedPowerDbm,
  frequencyMHz,
  onMeasurementChange,
  onRadioMetricChange,
  onApplyCorrection
}: {
  measurements: NcuFieldMeasurementsInput;
  analysis: NcuFieldAnalysisResult;
  radioMetrics: NcuRadioMetricsInput;
  metricsDiagnosis: NcuRadioMetricsDiagnosisResult;
  predictedReceivedPowerDbm: number;
  frequencyMHz: number;
  onMeasurementChange: <K extends keyof NcuFieldMeasurementsInput>(
    key: K,
    value: NcuFieldMeasurementsInput[K]
  ) => void;
  onRadioMetricChange: <K extends keyof NcuRadioMetricsInput>(
    key: K,
    value: NcuRadioMetricsInput[K]
  ) => void;
  onApplyCorrection: () => void;
}) {
  const wavelengthM = 299.792458 / Math.max(1, frequencyMHz);
  const localFadingFinding = analysis.findings.find((finding) => finding.id === "local-fading");

  return (
    <section className="space-y-5" data-testid="ncu-field-analysis">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle icon={Search} eyebrow="Field analysis" title="現場RSSI/RSRPから原因を追い込む">
          すべてを完璧に測らなくても大丈夫です。まずはBOX外、蓋開け、蓋閉めの3点だけで、地上側・BOX内・蓋のどこが怪しいか見えます。
        </SectionTitle>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {measurementItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-start gap-2">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-staf">
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-950">{item.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.aim}</p>
                    </div>
                  </div>
                  <NumberField
                    id={`field-${item.key}`}
                    label="測定値"
                    help={item.help}
                    unit={item.unit}
                    value={measurements[item.key]}
                    step={0.5}
                    onChange={(value) => onMeasurementChange(item.key, value)}
                  />
                </div>
              );
            })}
          </div>

          <aside className="space-y-3">
            <div className="rounded-lg border border-staf/20 bg-staf/5 p-4">
              <p className="text-sm font-bold text-staf">計算値との照合</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                現在の見積もりでは、蓋閉め・乾燥時の標準受信電力を
                <span className="font-bold text-slate-950"> {predictedReceivedPowerDbm.toFixed(1)} dBm </span>
                と見ています。
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                実測との差分は
                <span className="font-bold text-slate-950"> {formatSigned(analysis.recommendedCorrectionDb)} </span>
                です。
              </p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-staf px-3 py-2 text-xs font-bold text-white transition hover:bg-staf-dark"
                onClick={onApplyCorrection}
              >
                実測補正値に反映
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
              <div className="flex items-center gap-2">
                <Waves aria-hidden="true" className="h-5 w-5 text-sky-700" />
                <p className="font-bold text-sky-950">反射・2波を見る目安</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-sky-950/90">
                {frequencyMHz.toFixed(0)}MHzの波長は約{(wavelengthM * 100).toFixed(1)}cmです。30cm程度の移動や向き変更で
                {localFadingFinding ? ` ${localFadingFinding.impactDb.toFixed(1)}dB ` : " 数dB "}
                変わるなら、地面反射・BOX内反射・偏波の影響を強く疑います。
              </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-bold text-amber-950">測定品質チェック</p>
              <ul className="mt-2 space-y-2 text-sm leading-relaxed text-amber-950/90">
                {analysis.measurementQualityNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <RadioMetricsDiagnosisPanel
        metrics={radioMetrics}
        diagnosis={metricsDiagnosis}
        onMetricChange={onRadioMetricChange}
      />

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle icon={Target} eyebrow="Root cause ranking" title="原因候補ランキング">
          値が大きい順に見れば、現場で何から潰すべきかが分かります。差分が小さい項目は、主因ではない可能性が高いです。
        </SectionTitle>
        <div className="grid gap-3 lg:grid-cols-2">
          {analysis.findings.map((finding, index) => (
            <FindingCard key={finding.id} finding={finding} rank={index + 1} />
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ClipboardList aria-hidden="true" className="h-5 w-5 text-staf" />
          <h2 className="text-lg font-bold text-slate-950">現場で使う簡易チェックシート</h2>
        </div>
        <div className="mt-3 grid gap-3 text-sm leading-relaxed text-slate-600 md:grid-cols-3">
          <details className="rounded-lg border border-slate-200 bg-slate-50 p-3" open>
            <summary className="cursor-pointer font-bold text-slate-950">最小3点で始める</summary>
            <p className="mt-2">BOX外、蓋開け、蓋閉めだけで、地上側・BOX内・蓋損失の大まかな切り分けができます。</p>
          </details>
          <details className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <summary className="cursor-pointer font-bold text-slate-950">雨天後に再測する</summary>
            <p className="mt-2">水分が原因なら乾燥時との差が出ます。水が溜まるBOXでは、アンテナ整合ずれも疑います。</p>
          </details>
          <details className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <summary className="cursor-pointer font-bold text-slate-950">位置を少し動かす</summary>
            <p className="mt-2">30cm前後は920MHz帯の約1波長に近く、反射や偏波でRSSIが変わることがあります。</p>
          </details>
        </div>
      </section>
    </section>
  );
}

export function NcuBelowGroundClient() {
  const [input, setInput] = useState<NcuBelowGroundInput>(defaultNcuBelowGroundInput);
  const [activeMode, setActiveMode] = useState<WorkMode>("estimate");
  const [fieldMeasurements, setFieldMeasurements] = useState<NcuFieldMeasurementsInput>(
    defaultNcuFieldMeasurements
  );
  const [radioMetrics, setRadioMetrics] = useState<NcuRadioMetricsInput>(defaultNcuRadioMetrics);
  const result = useMemo(() => calculateNcuBelowGround(input), [input]);
  const fieldAnalysis = useMemo(
    () => calculateNcuFieldAnalysis(fieldMeasurements, result.receivedPowerRangeDbm.typical),
    [fieldMeasurements, result.receivedPowerRangeDbm.typical]
  );
  const metricsDiagnosis = useMemo(
    () => calculateNcuRadioMetricsDiagnosis(radioMetrics),
    [radioMetrics]
  );

  function update<K extends keyof NcuBelowGroundInput>(key: K, value: NcuBelowGroundInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function updateFieldMeasurement<K extends keyof NcuFieldMeasurementsInput>(
    key: K,
    value: NcuFieldMeasurementsInput[K]
  ) {
    setFieldMeasurements((current) => ({ ...current, [key]: value }));
  }

  function updateRadioMetric<K extends keyof NcuRadioMetricsInput>(
    key: K,
    value: NcuRadioMetricsInput[K]
  ) {
    setRadioMetrics((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-bold text-staf">GL以下NCU専用</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              事前見積もりと現場原因解析をつなげて評価します
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              水道BOX、メーターボックス、マンホール、地下ピット内のNCUは、奥村・秦モデルの移動局高を負値にして扱うのではなく、地上側の伝搬と、蓋・BOX・水分・アンテナ配置の追加損失に分けます。現場ではRSSI/RSRPの差分から、何が主因かを追い込みます。
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-950">
            <p className="font-bold">このページの狙い</p>
            <p className="mt-1">
              現場の「距離・障害物・高低差でおおざっぱ何dB」を、事前の危険因子と現場の差分測定に分けて、説明可能な解析にします。
            </p>
          </div>
        </div>
      </section>

      <PurposeSwitch activeMode={activeMode} onChange={setActiveMode} />
      <WorkflowGuide mode={activeMode} />

      {activeMode === "field" ? (
        <FieldAnalysisPanel
          measurements={fieldMeasurements}
          analysis={fieldAnalysis}
          radioMetrics={radioMetrics}
          metricsDiagnosis={metricsDiagnosis}
          predictedReceivedPowerDbm={result.receivedPowerRangeDbm.typical}
          frequencyMHz={input.frequencyMHz}
          onMeasurementChange={updateFieldMeasurement}
          onRadioMetricChange={updateRadioMetric}
          onApplyCorrection={() => update("measuredCorrectionDb", Number(fieldAnalysis.recommendedCorrectionDb.toFixed(1)))}
        />
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={RadioTower} eyebrow="Preset" title="現場条件プリセット">
              最初は近い条件を選び、写真・図面・実測値が分かったら細かく調整してください。
            </SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              {scenarioPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-staf/50 hover:bg-white"
                  onClick={() => setInput((current) => ({ ...current, ...preset.values }))}
                >
                  <span className="inline-flex rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-staf">
                    {preset.category}
                  </span>
                  <span className="mt-2 block text-sm font-bold text-slate-950">{preset.label}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-500">{preset.description}</span>
                  <span className="mt-2 block rounded-md bg-white/80 p-2 text-[11px] leading-relaxed text-slate-600">
                    {preset.operatorHint}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-staf/40 hover:text-staf"
              onClick={() => setInput(defaultNcuBelowGroundInput)}
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              初期値に戻す
            </button>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={Waves} eyebrow="Ground link" title="地上側の無線リンク">
              地上側の距離減衰を計算したうえで、GL以下の追加損失を積み上げます。
            </SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="ncu-frequencyMHz"
                label="周波数"
                help="NCUの通信周波数です。920MHz帯、LTE-M/NB-IoTなどに合わせます。"
                unit="MHz"
                value={input.frequencyMHz}
                min={1}
                step={1}
                onChange={(value) => update("frequencyMHz", value)}
              />
              <label className="block">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  地上側距離
                  <FieldHint text="地上側のゲートウェイ・基地局から、BOX付近までの水平距離です。" />
                </span>
                <span className="mt-2 flex overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-staf/70 focus-within:ring-2 focus-within:ring-staf/15">
                  <input
                    id="ncu-distance"
                    className="min-w-0 flex-1 px-3 py-2.5 text-base font-semibold text-slate-950 outline-none"
                    type="number"
                    min={0.001}
                    step={input.distanceUnit === "km" ? 0.01 : 1}
                    value={input.distance}
                    onChange={(event) => update("distance", updateNumber(event.target.value))}
                  />
                  <select
                    id="ncu-distanceUnit"
                    className="bg-slate-50 px-3 text-sm font-semibold text-slate-600 outline-none"
                    value={input.distanceUnit}
                    onChange={(event) => update("distanceUnit", event.target.value as NcuBelowGroundInput["distanceUnit"])}
                    aria-label="地上側距離の単位"
                  >
                    <option value="m">m</option>
                    <option value="km">km</option>
                  </select>
                </span>
              </label>
              <SelectField
                id="ncu-outdoorModel"
                label="地上側伝搬モデル"
                help="GL以下の追加損失とは別に、地上側の距離減衰をどう見るかを選びます。"
                value={input.outdoorModel}
                options={ncuOutdoorModelOptions}
                onChange={(value) => update("outdoorModel", value)}
              />
              <NumberField
                id="ncu-pathLossExponent"
                label="距離損失指数 n"
                help="Log-distanceモデルのnです。開放地で2前後、市街地・遮蔽ありで3以上になりやすい値です。"
                unit="n"
                value={input.pathLossExponent}
                min={1}
                max={6}
                step={0.1}
                onChange={(value) => update("pathLossExponent", value)}
              />
              <NumberField
                id="ncu-txPowerDbm"
                label="送信電力"
                help="地上側からNCUへ送る向きの送信電力です。上り評価ではNCU側送信電力に置き換えてください。"
                unit="dBm"
                value={input.txPowerDbm}
                step={0.1}
                onChange={(value) => update("txPowerDbm", value)}
              />
              <NumberField
                id="ncu-gatewayGain"
                label="地上側アンテナ利得"
                help="ゲートウェイ・基地局側アンテナの利得です。ケーブル損は別項目に入れます。"
                unit="dBi"
                value={input.gatewayAntennaGainDbi}
                step={0.1}
                onChange={(value) => update("gatewayAntennaGainDbi", value)}
              />
              <NumberField
                id="ncu-ncuGain"
                label="NCUアンテナ利得"
                help="BOX内アンテナの実効利得です。小型・筐体内・金属近傍ではマイナスになりやすい値です。"
                unit="dBi"
                value={input.ncuAntennaGainDbi}
                step={0.1}
                onChange={(value) => update("ncuAntennaGainDbi", value)}
              />
              <NumberField
                id="ncu-sensitivity"
                label="受信感度"
                help="通信方式・データレート・帯域幅で決まる受信側の限界値です。"
                unit="dBm"
                value={input.receiverSensitivityDbm}
                step={0.1}
                onChange={(value) => update("receiverSensitivityDbm", value)}
              />
              <NumberField
                id="ncu-cableLoss"
                label="ケーブル・コネクタ損失"
                help="地上側・端末側の給電系で失う電力です。"
                unit="dB"
                value={input.cableLossDb}
                min={0}
                step={0.1}
                onChange={(value) => update("cableLossDb", value)}
              />
              <NumberField
                id="ncu-clutterLoss"
                label="地上側クラッタ損失"
                help="BOXとは別に、建物・樹木・地形・車両など地上側の遮蔽を入れます。"
                unit="dB"
                value={input.aboveGroundClutterLossDb}
                min={0}
                step={0.5}
                onChange={(value) => update("aboveGroundClutterLossDb", value)}
              />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={Box} eyebrow="Below ground" title="GL以下・BOXまわりの条件">
              蓋、BOX、深さ、水分、アンテナ位置、地表上の遮蔽を、端末近傍損失として分けて入力します。
            </SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="ncu-depth"
                label="GL下深さ"
                help="地表面からNCUアンテナ付近までの深さです。負のアンテナ高ではなく追加損失として扱います。"
                unit="m"
                value={input.depthBelowGroundM}
                min={0}
                max={5}
                step={0.05}
                onChange={(value) => update("depthBelowGroundM", value)}
              />
              <SelectField
                id="ncu-coverMaterial"
                label="蓋・地表面"
                help="NCUの上にある蓋・地表面の主な材質です。"
                value={input.coverMaterial}
                options={ncuCoverMaterialOptions}
                onChange={(value) => update("coverMaterial", value)}
              />
              <SelectField
                id="ncu-boxMaterial"
                label="BOX・ピット材質"
                help="NCUが入っているBOXやピットの主な材質です。"
                value={input.boxMaterial}
                options={ncuBoxMaterialOptions}
                onChange={(value) => update("boxMaterial", value)}
              />
              <SelectField
                id="ncu-moisture"
                label="水分・湿潤状態"
                help="雨天後、結露、水溜まりなどの状態を選びます。"
                value={input.moistureCondition}
                options={ncuMoistureOptions}
                onChange={(value) => update("moistureCondition", value)}
              />
              <SelectField
                id="ncu-antennaPosition"
                label="アンテナ位置"
                help="BOX内でアンテナがどこにあるかを選びます。"
                value={input.antennaPosition}
                options={ncuAntennaPositionOptions}
                onChange={(value) => update("antennaPosition", value)}
              />
              <SelectField
                id="ncu-opening"
                label="開口・隙間"
                help="地表側へ電波が抜ける経路の有無です。"
                value={input.openingCondition}
                options={ncuOpeningOptions}
                onChange={(value) => update("openingCondition", value)}
              />
              <SelectField
                id="ncu-surfaceObstruction"
                label="地表上の遮蔽"
                help="BOXの上に人や車両が来る可能性を見ます。"
                value={input.surfaceObstruction}
                options={ncuSurfaceObstructionOptions}
                onChange={(value) => update("surfaceObstruction", value)}
              />
              <NumberField
                id="ncu-measuredCorrection"
                label="実測補正値"
                help="現地RSSI/RSRPと計算値との差分です。+なら計算より良い、-なら悪い条件として補正します。"
                unit="dB"
                value={input.measuredCorrectionDb}
                min={-60}
                max={60}
                step={0.5}
                onChange={(value) => update("measuredCorrectionDb", value)}
              />
            </div>
          </section>
        </div>

        <ResultPanel input={input} result={result} />
      </div>

      <NcuCrossSectionDiagram input={input} result={result} />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <LossBreakdown result={result} />
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle icon={Gauge} eyebrow="Range result" title="レンジで見る通信余裕">
            GL以下の条件は一点値で断言しにくいため、楽観・標準・厳しめを並べて確認します。
          </SectionTitle>
          <div className="grid gap-3">
            <RangeTriplet title="受信電力レンジ" range={result.receivedPowerRangeDbm} unit="dBm" />
            <RangeTriplet title="リンクマージンレンジ" range={result.linkMarginRangeDb} unit="dB" />
            <RangeTriplet title="総損失レンジ" range={result.totalLossRangeDb} unit="dB" higherIsBetter={false} />
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Info aria-hidden="true" className="h-5 w-5 text-staf" />
          <h2 className="text-lg font-bold text-slate-950">入力の前提をどう説明するか</h2>
        </div>
        <div className="mt-3 grid gap-3 text-sm leading-relaxed text-slate-600 md:grid-cols-3">
          <details className="rounded-lg border border-slate-200 bg-slate-50 p-3" open>
            <summary className="cursor-pointer font-bold text-slate-950">高さ入力の考え方</summary>
            <p className="mt-2">
              GL以下の深さは、Hataの移動局高や2波モデルのアンテナ高に負値として入れません。地表までの抜け道、蓋、BOX、湿潤、配置による追加損失として扱います。
            </p>
          </details>
          <details className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <summary className="cursor-pointer font-bold text-slate-950">実測補正の入れ方</summary>
            <p className="mt-2">
              現地RSSI/RSRPから、計算受信電力との差を入力します。同じ場所で乾燥時・雨天後・車両ありを比べると、損失レンジを狭められます。
            </p>
          </details>
          <details className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <summary className="cursor-pointer font-bold text-slate-950">改善の優先順位</summary>
            <p className="mt-2">
              金属蓋、底面設置、水溜まり、密閉、駐車車両の順に疑います。蓋直下・非金属部・開口部へアンテナを寄せる改善が効くことがあります。
            </p>
          </details>
        </div>
      </section>

      <ResearchColumn />

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">通常のリンクバジェットへつなぐ</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              このページで得た標準BOX追加損失 {result.belowGroundLossRangeDb.typical.toFixed(1)} dB は、総合診断の端末近傍損失・環境損失として転記できます。
            </p>
          </div>
          <Link
            href="/tools/rf-basic-link-calculator"
            className="inline-flex items-center gap-2 rounded-lg bg-staf px-4 py-2.5 text-sm font-bold text-white transition hover:bg-staf-dark"
          >
            リンクバジェット診断を開く
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Ruler aria-hidden="true" className="h-5 w-5 text-staf" />
          <h2 className="text-lg font-bold text-slate-950">現地で最低限メモしたい項目</h2>
        </div>
        <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-slate-600 md:grid-cols-2">
          <li>BOX写真：蓋、枠、アンテナ位置、周囲の車両・建物が分かるもの</li>
          <li>GL下深さ：地表面からNCUアンテナ位置まで</li>
          <li>蓋材質：樹脂、コンクリート、鋳鉄、鋼板、不明</li>
          <li>水分状態：乾燥、湿り気、雨天後、水溜まり</li>
          <li>RSSI/RSRP：乾燥時と雨天後、蓋あり/なしで比較</li>
          <li>通信方向：下り評価か上り評価か、送信電力と受信感度を確認</li>
        </ul>
      </section>
    </div>
  );
}

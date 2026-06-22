"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NcuBudgetWaterfall } from "./NcuBudgetWaterfall";
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
  const [draft, setDraft] = useState(() => (value === null ? "" : String(value)));
  const committedRef = useRef<number | null>(value);
  useEffect(() => {
    if (value !== committedRef.current) {
      committedRef.current = value;
      setDraft(value === null ? "" : String(value));
    }
  }, [value]);

  const handleChange = (raw: string) => {
    setDraft(raw);
    if (raw.trim() === "") {
      committedRef.current = null;
      onChange(null);
      return;
    }
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      committedRef.current = parsed;
      onChange(parsed);
    }
  };

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
          type="text"
          inputMode={typeof min === "number" && min >= 0 ? "decimal" : "text"}
          step={step}
          max={max}
          value={draft}
          placeholder={placeholder}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={() => setDraft(committedRef.current === null ? "" : String(committedRef.current))}
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
  // 文字列ドラフトで保持し、クリア・「-」・「1.」など編集途中でも0に戻らずキーボード直接入力できるようにする。
  const [draft, setDraft] = useState(() => String(value));
  const committedRef = useRef(value);
  useEffect(() => {
    if (value !== committedRef.current) {
      committedRef.current = value;
      setDraft(String(value));
    }
  }, [value]);

  const handleChange = (raw: string) => {
    setDraft(raw);
    const parsed = Number(raw);
    if (raw.trim() !== "" && Number.isFinite(parsed)) {
      committedRef.current = parsed;
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    let next = committedRef.current;
    if (typeof min === "number" && next < min) {
      next = min;
    }
    if (typeof max === "number" && next > max) {
      next = max;
    }
    if (next !== committedRef.current) {
      committedRef.current = next;
      onChange(next);
    }
    setDraft(String(next));
  };

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
          type="text"
          inputMode={typeof min === "number" && min >= 0 ? "decimal" : "text"}
          step={step}
          value={draft}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={handleBlur}
        />
        <span className="flex min-w-20 items-center justify-center bg-slate-50 px-3 text-sm font-semibold text-slate-600">
          {unit}
        </span>
      </span>
    </label>
  );
}

// 距離は単位選択つき。NumberFieldと同じくドラフトでキーボード直接入力に対応。
function DistanceField({
  value,
  unit,
  onValueChange,
  onUnitChange
}: {
  value: number;
  unit: NcuBelowGroundInput["distanceUnit"];
  onValueChange: (value: number) => void;
  onUnitChange: (unit: NcuBelowGroundInput["distanceUnit"]) => void;
}) {
  const [draft, setDraft] = useState(() => String(value));
  const committedRef = useRef(value);
  useEffect(() => {
    if (value !== committedRef.current) {
      committedRef.current = value;
      setDraft(String(value));
    }
  }, [value]);

  const handleChange = (raw: string) => {
    setDraft(raw);
    const parsed = Number(raw);
    if (raw.trim() !== "" && Number.isFinite(parsed) && parsed > 0) {
      committedRef.current = parsed;
      onValueChange(parsed);
    }
  };

  return (
    <label className="block" htmlFor="ncu-distance">
      <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
        地上側距離
        <FieldHint text="地上側のゲートウェイ・基地局から、BOX付近までの水平距離です。" />
      </span>
      <span className="mt-1 block text-xs leading-relaxed text-slate-500">
        GW・基地局からBOX付近までの水平距離。数値はキーボードで直接入力できます。
      </span>
      <span className="mt-2 flex overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-staf/70 focus-within:ring-2 focus-within:ring-staf/15">
        <input
          id="ncu-distance"
          className="min-w-0 flex-1 px-3 py-2.5 text-base font-semibold text-slate-950 outline-none"
          type="text"
          inputMode="decimal"
          value={draft}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={() => setDraft(String(committedRef.current))}
        />
        <select
          id="ncu-distanceUnit"
          className="bg-slate-50 px-3 text-sm font-semibold text-slate-600 outline-none"
          value={unit}
          onChange={(event) => onUnitChange(event.target.value as NcuBelowGroundInput["distanceUnit"])}
          aria-label="地上側距離の単位"
        >
          <option value="m">m</option>
          <option value="km">km</option>
        </select>
      </span>
    </label>
  );
}

// 通信方式・メモなどの自由入力。
function TextField({
  id,
  label,
  help,
  value,
  placeholder,
  onChange
}: {
  id: string;
  label: string;
  help: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
        {label}
        <FieldHint text={help} />
      </span>
      <span className="mt-1 block text-xs leading-relaxed text-slate-500">{help}</span>
      <input
        id={id}
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base font-semibold text-slate-950 outline-none transition focus:border-staf/70 focus:ring-2 focus:ring-staf/15"
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
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

type ChipSeverity = "ok" | "warn" | "bad" | "severe";

// 各選択肢の「効きやすさ」目安。選択UIの色とドットに使う（数値計算はlib側が担当）。
const chipSeverityByValue: Record<string, ChipSeverity> = {
  open: "ok",
  resin: "ok",
  concrete: "warn",
  cast_iron: "bad",
  steel: "severe",
  metal: "bad",
  unknown: "warn",
  dry: "ok",
  damp: "warn",
  wet: "bad",
  standing_water: "severe",
  near_lid: "ok",
  middle: "warn",
  bottom: "bad",
  near_metal: "severe",
  narrow_gap: "warn",
  sealed: "bad",
  metal_frame: "severe",
  none: "ok",
  pedestrian: "warn",
  vehicle: "bad",
  parked_vehicle: "severe"
};

const chipToneClass: Record<ChipSeverity, { selected: string; dot: string }> = {
  ok: { selected: "border-emerald-300 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200", dot: "bg-emerald-500" },
  warn: { selected: "border-amber-300 bg-amber-50 text-amber-900 ring-1 ring-amber-200", dot: "bg-amber-500" },
  bad: { selected: "border-orange-300 bg-orange-50 text-orange-900 ring-1 ring-orange-200", dot: "bg-orange-500" },
  severe: { selected: "border-rose-300 bg-rose-50 text-rose-900 ring-1 ring-rose-200", dot: "bg-rose-500" }
};

// ドロップダウンより速くタップで選べる、重症度カラー付きのチップ選択UI。
function ChoiceChips<T extends string>({
  label,
  help,
  value,
  options,
  onChange
}: {
  label: string;
  help: string;
  value: T;
  options: Array<{ value: T; label: string; description: string }>;
  onChange: (value: T) => void;
}) {
  const selected = options.find((option) => option.value === value);

  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
        {label}
        <FieldHint text={help} />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = option.value === value;
          const tone = chipToneClass[chipSeverityByValue[option.value] ?? "warn"];
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                isSelected
                  ? tone.selected
                  : "border-slate-200 bg-white text-slate-600 hover:border-staf/40 hover:text-slate-900"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${tone.dot}`} aria-hidden="true" />
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
        {selected ? (
          <>
            <span className="font-bold text-slate-800">{selected.label}：</span>
            {selected.description}
          </>
        ) : (
          help
        )}
      </p>
    </div>
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
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" data-testid="ncu-assumption-diagram">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-staf">シミュレーション結果の2D図</p>
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
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">
          <span className="h-1.5 w-4 rounded-full bg-sky-500" aria-hidden="true" />
          信号経路
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-rose-700">
          <span className="h-0 w-4 border-t-2 border-dashed border-rose-500" aria-hidden="true" />
          深さ寸法
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
          NCUアンテナ
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-slate-600">
          損失の大きさ
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />小
          <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />中
          <span className="h-2 w-2 rounded-full bg-orange-500" aria-hidden="true" />大
          <span className="h-2 w-2 rounded-full bg-rose-500" aria-hidden="true" />支配的
        </span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50">
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

// 標準損失[dB]の大きさで色分け。どの項目が支配的かを一目で分かるようにする。
function lossBarSeverity(typicalDb: number): { bar: string; chip: string; label: string } {
  if (typicalDb >= 18) {
    return { bar: "bg-rose-500", chip: "bg-rose-100 text-rose-700", label: "支配的" };
  }
  if (typicalDb >= 10) {
    return { bar: "bg-orange-500", chip: "bg-orange-100 text-orange-700", label: "大きい" };
  }
  if (typicalDb >= 4) {
    return { bar: "bg-amber-500", chip: "bg-amber-100 text-amber-700", label: "中くらい" };
  }
  return { bar: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-700", label: "小さい" };
}

// 主因ごとの「まず何をすると効くか」の一言。結果パネルと内訳の両方で使う。
const bottleneckHintById: Record<string, string> = {
  cover: "蓋を樹脂・複合材へ替える、または蓋直下・非金属部へアンテナを寄せると効きやすいです。",
  box: "金属BOXは外部アンテナ化を検討し、アンテナを壁・取付金具から離します。",
  depth: "アンテナを地表開口の近くまで引き上げる、または外部アンテナを地上へ出します。",
  moisture: "排水・防水を行い、アンテナを想定水位より高く保ち、乾燥時と雨天後の両方で実測します。",
  antenna: "アンテナを蓋直下・非金属部へ移し、金属から離して整合を確認します。",
  opening: "樹脂窓・開口部・隙間の近くへアンテナを寄せ、地表側への抜け道をつくります。",
  surface: "設置位置をずらし、駐車車両や金属体に覆われにくい場所を選びます。"
};

function LossBreakdown({ result }: { result: NcuBelowGroundResult }) {
  const items = [...result.breakdown].sort((a, b) => b.range.typical - a.range.typical);
  const max = Math.max(...items.map((item) => item.range.max), 1);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <SectionTitle icon={Layers} eyebrow="Loss decomposition" title="BOX・地下まわりの追加損失を分解">
        効いている順に並べています。いちばん上（主因）から現場で潰すと、いちばん少ない手間で通信余裕を稼げます。
      </SectionTitle>

      <div className="space-y-3">
        {items.map((item, index) => {
          const severity = lossBarSeverity(item.range.typical);
          const hint = bottleneckHintById[item.id];
          return (
            <details
              key={item.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              open={index === 0}
            >
              <summary className="cursor-pointer list-none">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {index === 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        <Target aria-hidden="true" className="h-3 w-3" />
                        主因
                      </span>
                    ) : (
                      <span className="inline-flex w-5 justify-center text-xs font-bold text-slate-400">
                        {index + 1}
                      </span>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-950">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.valueLabel}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-950">{formatDbRange(item.range)}</p>
                    <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${severity.chip}`}>
                      標準 {item.range.typical.toFixed(1)}dB・{severity.label}
                    </span>
                  </div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className={`h-full rounded-full ${severity.bar}`}
                    style={{ width: `${Math.max(3, (item.range.typical / max) * 100)}%` }}
                  />
                </div>
              </summary>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">{item.note}</p>
              {hint ? (
                <p className="mt-2 flex items-start gap-1.5 rounded-md bg-white p-2 text-xs leading-relaxed text-slate-700">
                  <Wrench aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-staf" />
                  <span>
                    <span className="font-bold">改善案：</span>
                    {hint}
                  </span>
                </p>
              ) : null}
            </details>
          );
        })}
      </div>
    </section>
  );
}

function ResultPanel({ input, result }: { input: NcuBelowGroundInput; result: NcuBelowGroundResult }) {
  const totalFixedLossDb = result.outdoorPathLossDb + input.cableLossDb + input.aboveGroundClutterLossDb;
  const dominant = [...result.breakdown].sort((a, b) => b.range.typical - a.range.typical)[0];
  const dominantHint = bottleneckHintById[dominant.id];

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

      <section className="rounded-lg border border-rose-200 bg-rose-50 p-4">
        <div className="flex items-center gap-2 text-rose-700">
          <Target aria-hidden="true" className="h-4 w-4" />
          <p className="text-xs font-bold uppercase tracking-wider">いちばん効いている損失（主因）</p>
        </div>
        <p className="mt-1 text-xl font-bold text-rose-950">
          {dominant.label}
          <span className="ml-2 text-base font-bold">標準 {dominant.range.typical.toFixed(1)} dB</span>
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-rose-900/80">
          {dominant.valueLabel}（{formatDbRange(dominant.range)}）
        </p>
        {dominantHint ? (
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-rose-900">
            <Wrench aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              <span className="font-bold">まずここから：</span>
              {dominantHint}
            </span>
          </p>
        ) : null}
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
              <TextField
                id="ncu-system"
                label="通信方式・メモ"
                help="920MHz NCU、LTE-M、NB-IoT、LoRaWANなど。図・記録用のラベルです（計算には影響しません）。"
                value={input.system}
                placeholder="例：920MHz NCU / LPWA"
                onChange={(value) => update("system", value)}
              />
              <NumberField
                id="ncu-frequencyMHz"
                label="周波数"
                help="NCUの通信周波数です。920MHz帯、LTE-M/NB-IoTなどに合わせます。キーボードで直接入力できます。"
                unit="MHz"
                value={input.frequencyMHz}
                min={1}
                step={1}
                onChange={(value) => update("frequencyMHz", value)}
              />
              <DistanceField
                value={input.distance}
                unit={input.distanceUnit}
                onValueChange={(value) => update("distance", value)}
                onUnitChange={(unit) => update("distanceUnit", unit)}
              />
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
            </div>

            <div className="mt-5">
              <p className="text-sm font-bold text-slate-900">送信・受信パラメータ（リンクバジェット）</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                通信モジュール出力・送受信アンテナ利得・受信感度・ケーブル損・地上クラッタ。各欄ともキーボードで直接入力できます。機器仕様が分かるときに合わせると精度が上がります。
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <NumberField
                  id="ncu-txPowerDbm"
                  label="送信出力（通信モジュール）"
                  help="送信機・通信モジュールの空中線端での出力です。下り（GW→NCU）はGW送信出力、上り（NCU→GW）評価ではNCUモジュール出力に置き換えます。"
                  unit="dBm"
                  value={input.txPowerDbm}
                  step={0.1}
                  onChange={(value) => update("txPowerDbm", value)}
                />
                <NumberField
                  id="ncu-sensitivity"
                  label="受信感度"
                  help="受信側の最小受信電力です。通信方式・データレート・帯域幅で決まります（例：NB-IoTで-120〜-135dBm前後）。"
                  unit="dBm"
                  value={input.receiverSensitivityDbm}
                  step={0.1}
                  onChange={(value) => update("receiverSensitivityDbm", value)}
                />
                <NumberField
                  id="ncu-gatewayGain"
                  label="送信アンテナ利得（GW/基地局側）"
                  help="送信側アンテナの利得です。ケーブル損は別項目に入れます。上り評価ではNCU側アンテナ利得に読み替えます。"
                  unit="dBi"
                  value={input.gatewayAntennaGainDbi}
                  step={0.1}
                  onChange={(value) => update("gatewayAntennaGainDbi", value)}
                />
                <NumberField
                  id="ncu-ncuGain"
                  label="受信アンテナ利得（NCU側）"
                  help="BOX内アンテナの実効利得です。小型・筐体内・金属近傍ではマイナスになりやすい値です。上り評価ではGW側アンテナ利得に読み替えます。"
                  unit="dBi"
                  value={input.ncuAntennaGainDbi}
                  step={0.1}
                  onChange={(value) => update("ncuAntennaGainDbi", value)}
                />
                <NumberField
                  id="ncu-cableLoss"
                  label="ケーブル・コネクタ損失"
                  help="送信側・受信側の給電系（同軸ケーブル・コネクタ）で失う電力の合計です。"
                  unit="dB"
                  value={input.cableLossDb}
                  min={0}
                  step={0.1}
                  onChange={(value) => update("cableLossDb", value)}
                />
                <NumberField
                  id="ncu-clutterLoss"
                  label="地上側クラッタ損失（障害物）"
                  help="BOXとは別に、建物・樹木・地形・車両など地上側の遮蔽を入れます。『障害物ぶんの何dB』はここに入れます。"
                  unit="dB"
                  value={input.aboveGroundClutterLossDb}
                  min={0}
                  step={0.5}
                  onChange={(value) => update("aboveGroundClutterLossDb", value)}
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={Box} eyebrow="Below ground" title="GL以下・BOXまわりの条件">
              蓋、BOX、深さ、水分、アンテナ位置、地表上の遮蔽を、端末近傍損失として分けて入力します。
            </SectionTitle>
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs leading-relaxed text-amber-900">
              <Target aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <span>
                ここがこのツールの肝です。まず<span className="font-bold">「深さ」と「蓋」</span>を現場写真に合わせ、続けて水分・アンテナ位置を選ぶと、結果パネルに主因が出ます。
              </span>
            </div>
            <div className="space-y-5">
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
              <ChoiceChips
                label="蓋・地表面"
                help="NCUの上にある蓋・地表面の主な材質です。金属（鋳鉄・鋼板）ほど遮蔽が強くなります。"
                value={input.coverMaterial}
                options={ncuCoverMaterialOptions}
                onChange={(value) => update("coverMaterial", value)}
              />
              <ChoiceChips
                label="BOX・ピット材質"
                help="NCUが入っているBOXやピットの主な材質です。"
                value={input.boxMaterial}
                options={ncuBoxMaterialOptions}
                onChange={(value) => update("boxMaterial", value)}
              />
              <ChoiceChips
                label="水分・湿潤状態"
                help="雨天後、結露、水溜まりなどの状態を選びます。"
                value={input.moistureCondition}
                options={ncuMoistureOptions}
                onChange={(value) => update("moistureCondition", value)}
              />
              <ChoiceChips
                label="アンテナ位置"
                help="BOX内でアンテナがどこにあるかを選びます。蓋直下が比較的有利です。"
                value={input.antennaPosition}
                options={ncuAntennaPositionOptions}
                onChange={(value) => update("antennaPosition", value)}
              />
              <ChoiceChips
                label="開口・隙間"
                help="地表側へ電波が抜ける経路の有無です。"
                value={input.openingCondition}
                options={ncuOpeningOptions}
                onChange={(value) => update("openingCondition", value)}
              />
              <ChoiceChips
                label="地表上の遮蔽"
                help="BOXの上に人や車両が来る可能性を見ます。"
                value={input.surfaceObstruction}
                options={ncuSurfaceObstructionOptions}
                onChange={(value) => update("surfaceObstruction", value)}
              />
            </div>
          </section>
        </div>

        <ResultPanel input={input} result={result} />
      </div>

      <NcuBudgetWaterfall input={input} result={result} />

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

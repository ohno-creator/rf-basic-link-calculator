"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { ChoiceChips } from "@/components/ChoiceChips";
import { HelpHint as FieldHint } from "@/components/HelpHint";
import { NumberField } from "@/components/NumberField";
import { NcuBudgetWaterfall } from "./NcuBudgetWaterfall";
import {
  ArrowRight,
  Box,
  Gauge,
  Info,
  RadioTower,
  RotateCcw,
  Ruler,
  Target,
  Waves
} from "lucide-react";
import {
  applyMeasuredCorrectionDb,
  calculateNcuFieldAnalysis,
  calculateNcuBelowGround,
  calculateNcuRadioMetricsDiagnosis,
  defaultNcuFieldMeasurements,
  defaultNcuBelowGroundInput,
  defaultNcuRadioMetrics,
  ncuAntennaPositionOptions,
  ncuBoxMaterialOptions,
  ncuCoverMaterialOptions,
  ncuMoistureOptions,
  ncuOpeningOptions,
  ncuOutdoorModelOptions,
  ncuSurfaceObstructionOptions,
  type NcuBelowGroundInput,
  type NcuFieldMeasurementsInput,
  type NcuRadioMetricsInput
} from "@/lib/rf/ncuBelowGround";
import type { ChoiceChipSeverity } from "@/lib/ui/kit";
import { NcuCrossSectionDiagram } from "./NcuCrossSectionDiagram";
import { NcuIsometricScene } from "./NcuIsometricScene";
import { LossBreakdown, RangeTriplet, ResultPanel } from "./NcuResultPanel";
import { ResearchColumn } from "./NcuResearchColumn";
import { FieldAnalysisPanel, PurposeSwitch, WorkflowGuide } from "./NcuFieldAnalysisPanel";
import { SectionTitle, type WorkMode } from "./ncuShared";

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


// FieldHint は共通の HelpHint（@/components/HelpHint）に統合。冒頭で別名インポートしている。



// NumberField は共通の @/components/NumberField に統合（このファイル冒頭でインポート）。

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
        地上側距離＝GW・基地局からBOX付近までの水平の直線距離。距離が伸びるほど電波は弱まります（自由空間では距離2倍で約6dB増）。右で単位（m/km）を切替。数値はキーボードで直接入力できます。
      </span>
      <span className="mt-2 flex overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-staf/70 focus-within:ring-2 focus-within:ring-staf/40">
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
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base font-semibold text-slate-950 outline-none transition focus:border-staf/70 focus:ring-2 focus:ring-staf/40"
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

// 代表的な通信方式プリセット（選ぶと周波数も連動）。電力NCU・水道テレメータでよく使う帯を中心に。
const systemPresets: Array<{ system: string; frequencyMHz: number }> = [
  { system: "Wi-SUN（920MHz帯・スマートメーター標準）", frequencyMHz: 920 },
  { system: "920MHz帯 LPWA（LoRaWAN／特定小電力）", frequencyMHz: 920 },
  { system: "Sigfox（923MHz帯）", frequencyMHz: 923 },
  { system: "LTE-M（Band18/26・約800〜900MHz）", frequencyMHz: 800 },
  { system: "NB-IoT（Band18等・約800MHz）", frequencyMHz: 800 },
  { system: "特定小電力 429MHz帯（テレメータ／テレコントロール）", frequencyMHz: 429 },
  { system: "426MHz帯 特定小電力", frequencyMHz: 426 },
  { system: "2.4GHz帯（Wi-Fi／BLE／Zigbee）", frequencyMHz: 2400 }
];

const commonFrequencies: Array<{ value: number; label: string }> = [
  { value: 426, label: "426 MHz（特定小電力）" },
  { value: 429, label: "429 MHz（テレメータ）" },
  { value: 800, label: "800 MHz（LTE-M／NB-IoT Band18等）" },
  { value: 868, label: "868 MHz（欧州LPWA）" },
  { value: 920, label: "920 MHz（Wi-SUN／LoRa／特定小電力）" },
  { value: 923, label: "923 MHz（Sigfox）" },
  { value: 2400, label: "2400 MHz（2.4GHz帯）" }
];

const selectClass =
  "mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base font-semibold text-slate-950 outline-none transition focus:border-staf/70 focus:ring-2 focus:ring-staf/40";

// 通信方式・周波数をプリセットのプルダウンで選べる。正確な値は手入力欄でキーボード入力も可能。
function CommPresetFields({
  system,
  frequencyMHz,
  onSystemChange,
  onFrequencyChange
}: {
  system: string;
  frequencyMHz: number;
  onSystemChange: (value: string) => void;
  onFrequencyChange: (value: number) => void;
}) {
  const isCustomSystem = !systemPresets.some((preset) => preset.system === system);
  const isCommonFreq = commonFrequencies.some((freq) => freq.value === frequencyMHz);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block" htmlFor="ncu-system-preset">
          <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
            通信方式（プリセット）
            <FieldHint text="使う無線方式を選ぶと、代表的な周波数も自動でセットされます。電力NCU・水道テレメータでは429MHz帯やWi-SUN／LPWA（920MHz）、LTE-M／NB-IoTが代表例。一覧にない場合は『その他（手入力）』を選んで自由に入力できます。" />
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-slate-500">
            代表的な通信方式から選ぶと、周波数も連動してセットされます。
          </span>
          <select
            id="ncu-system-preset"
            className={selectClass}
            value={isCustomSystem ? "__custom__" : system}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "__custom__") {
                if (!isCustomSystem) {
                  onSystemChange("");
                }
                return;
              }
              const preset = systemPresets.find((item) => item.system === value);
              if (preset) {
                onSystemChange(preset.system);
                onFrequencyChange(preset.frequencyMHz);
              }
            }}
          >
            {systemPresets.map((preset) => (
              <option key={preset.system} value={preset.system}>
                {preset.system}
              </option>
            ))}
            <option value="__custom__">その他（手入力）</option>
          </select>
        </label>

        <label className="block" htmlFor="ncu-freq-preset">
          <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
            周波数（よく使う帯）
            <FieldHint text="よく使う周波数帯をプルダウンで選べます。正確な値は下の『周波数（手入力）』にキーボードで入力できます。周波数が高いほど直進しやすく、障害物には弱めになります。" />
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-slate-500">
            代表帯を選択。細かい値は下の手入力欄で調整できます。
          </span>
          <select
            id="ncu-freq-preset"
            className={selectClass}
            value={isCommonFreq ? String(frequencyMHz) : "__custom__"}
            onChange={(event) => {
              const value = event.target.value;
              if (value !== "__custom__") {
                onFrequencyChange(Number(value));
              }
            }}
          >
            {commonFrequencies.map((freq) => (
              <option key={freq.value} value={freq.value}>
                {freq.label}
              </option>
            ))}
            <option value="__custom__">その他（手入力）</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {isCustomSystem ? (
          <TextField
            id="ncu-system"
            label="通信方式（手入力）"
            help="プリセットにない方式名・現場名を自由に入力できます（例：920MHz NCU、自営無線）。図・記録用のラベルで、計算には影響しません。"
            value={system}
            placeholder="例：920MHz NCU / LPWA"
            onChange={onSystemChange}
          />
        ) : null}
        <NumberField
          id="ncu-frequencyMHz"
          label="周波数（手入力・正確な値）"
          help="周波数＝1秒間に電波が振動する回数（MHz＝百万回/秒）。プルダウンの代表値でよければそのまま、機器仕様の正確な値があればここに半角で入力します。高いほど直進しやすく障害物に弱め。"
          unit="MHz"
          value={frequencyMHz}
          min={1}
          step={1}
          onChange={onFrequencyChange}
        />
      </div>
    </div>
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
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base font-semibold text-slate-950 outline-none transition focus:border-staf/70 focus:ring-2 focus:ring-staf/40"
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

// 各選択肢の「効きやすさ」目安。選択UIの色とドットに使う（数値計算はlib側が担当）。
const chipSeverityByValue: Record<string, ChoiceChipSeverity> = {
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

// options に severity を注入し、共有 ChoiceChips（@/components/ChoiceChips）へ渡す。
// 数値計算は lib/rf 側が担い、severity は選択UIの色分けのための目安。
function withChipSeverity<T extends string>(
  options: Array<{ value: T; label: string; description: string }>
): Array<{ value: T; label: string; description: string; severity: ChoiceChipSeverity }> {
  return options.map((option) => ({ ...option, severity: chipSeverityByValue[option.value] ?? "warn" }));
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
      <Card as="section">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-bold text-staf-dark">GL以下NCU専用</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              事前見積もりと現場原因解析をつなげて評価します
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              水道BOX、メーターボックス、マンホール、地下ピット内のNCUは、奥村・秦モデルの移動局高を負値にして扱うのではなく、地上側の伝搬と、蓋・BOX・水分・アンテナ配置の追加損失に分けます。現場ではRSSI/RSRPの差分から、何が主因かを追い込みます。
            </p>
          </div>
          <Callout tone="success" size="md">
            <p className="font-bold">このページの狙い</p>
            <p className="mt-1">
              現場の「距離・障害物・高低差でおおざっぱ何dB」を、事前の危険因子と現場の差分測定に分けて、説明可能な解析にします。
            </p>
          </Callout>
        </div>
      </Card>

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
          onApplyCorrection={() =>
            update(
              "measuredCorrectionDb",
              Number(
                applyMeasuredCorrectionDb(
                  input.measuredCorrectionDb,
                  fieldAnalysis.recommendedCorrectionDb
                ).toFixed(1)
              )
            )
          }
        />
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="space-y-4">
          <Card as="section">
            <SectionTitle icon={RadioTower} eyebrow="Preset" title="現場条件プリセット">
              最初は近い条件を選び、写真・図面・実測値が分かったら細かく調整してください。
            </SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              {scenarioPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  title={`${preset.description}｜${preset.operatorHint} クリックすると、この典型条件が各入力欄に一括セットされます（あとから個別に微調整できます）。`}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-staf/50 hover:bg-white"
                  onClick={() =>
                    // プリセットは「既定値 → プリセット」で適用し、順番に依存しない確定状態にする。
                    // 通信モジュール/アンテナのスペックは現場条件プリセットでは変えず、現在値を保持する。
                    setInput((current) => ({
                      ...defaultNcuBelowGroundInput,
                      ...preset.values,
                      system: current.system,
                      frequencyMHz: current.frequencyMHz,
                      txPowerDbm: current.txPowerDbm,
                      gatewayAntennaGainDbi: current.gatewayAntennaGainDbi,
                      ncuAntennaGainDbi: current.ncuAntennaGainDbi,
                      receiverSensitivityDbm: current.receiverSensitivityDbm,
                      cableLossDb: current.cableLossDb
                    }))
                  }
                >
                  <span className="inline-flex rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-staf-dark">
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
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-staf/40 hover:text-staf-dark"
              onClick={() => setInput(defaultNcuBelowGroundInput)}
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              初期値に戻す
            </button>
          </Card>

          <Card as="section">
            <SectionTitle icon={Waves} eyebrow="Ground link" title="地上側の無線リンク">
              地上側の距離減衰を計算したうえで、GL以下の追加損失を積み上げます。
            </SectionTitle>
            <CommPresetFields
              system={input.system}
              frequencyMHz={input.frequencyMHz}
              onSystemChange={(value) => update("system", value)}
              onFrequencyChange={(value) => update("frequencyMHz", value)}
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                help="距離損失指数 n＝距離が2倍になるごとに電波がどれだけ弱まるかの『効き具合』。自由空間はn=2、市街地・遮蔽が多いほどn=3〜4が目安。大きいほど距離で急に弱まります。現地RSSI実測に合わせて微調整します。"
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
                  help="送信出力＝送信機・モジュールがアンテナ端に出す電波の強さ（dBm＝電力の単位。0dBm=1mW、+10dBmで10倍、+3dBmで約2倍）。機器仕様の『送信出力』を入力。下り（GW→NCU）はGW出力、上り（NCU→GW）評価ではNCUモジュール出力に置き換えます。"
                  unit="dBm"
                  value={input.txPowerDbm}
                  step={0.1}
                  onChange={(value) => update("txPowerDbm", value)}
                />
                <NumberField
                  id="ncu-sensitivity"
                  label="受信感度"
                  help="受信感度＝受信機がぎりぎり受け取れる最小の電波の強さ（dBm。−の数字が大きいほど高性能）。受信電力がこの値より上なら通信成立。通信方式・速度・帯域で決まり、例としてNB-IoTで−120〜−135dBm前後。仕様書の値を入力します。"
                  unit="dBm"
                  value={input.receiverSensitivityDbm}
                  step={0.1}
                  onChange={(value) => update("receiverSensitivityDbm", value)}
                />
                <NumberField
                  id="ncu-gatewayGain"
                  label="送信アンテナ利得（GW/基地局側）"
                  help="アンテナ利得＝電波を特定方向に集める強さ（dBi＝全方向に均一に出す理想点波源との比較）。大きいほど遠くへ届きます。ケーブル損はここに含めず別欄へ。上り評価ではNCU側アンテナ利得に読み替えます。"
                  unit="dBi"
                  value={input.gatewayAntennaGainDbi}
                  step={0.1}
                  onChange={(value) => update("gatewayAntennaGainDbi", value)}
                />
                <NumberField
                  id="ncu-ncuGain"
                  label="受信アンテナ利得（NCU側）"
                  help="受信アンテナ利得＝BOX内アンテナが実装後に実際に出せる利得（dBi）。小型・筐体内・金属の近くでは効率が落ち、マイナス（−数dBi）になりがち。カタログ値より実装後は下がる点に注意。上り評価ではGW側アンテナ利得に読み替えます。"
                  unit="dBi"
                  value={input.ncuAntennaGainDbi}
                  step={0.1}
                  onChange={(value) => update("ncuAntennaGainDbi", value)}
                />
                <NumberField
                  id="ncu-cableLoss"
                  label="ケーブル・コネクタ損失"
                  help="ケーブル・コネクタ損失＝同軸ケーブルやコネクタを通る間に失う電力（dB）。長いほど・周波数が高いほど大きくなります。送信側＋受信側の合計を入力。短い配線なら数dB程度が目安です。"
                  unit="dB"
                  value={input.cableLossDb}
                  min={0}
                  step={0.1}
                  onChange={(value) => update("cableLossDb", value)}
                />
                <NumberField
                  id="ncu-clutterLoss"
                  label="地上側クラッタ損失（障害物）"
                  help="地上側クラッタ損失（dB）＝BOX以外の地上の遮蔽（建物・樹木・地形・車など）でどれだけ弱まるか。『障害物ぶんで大体何dB』という職人の目分量はここに入れます。見通しが悪いほど大きく。"
                  unit="dB"
                  value={input.aboveGroundClutterLossDb}
                  min={0}
                  step={0.5}
                  onChange={(value) => update("aboveGroundClutterLossDb", value)}
                />
              </div>
            </div>
          </Card>

          <Card as="section">
            <SectionTitle icon={Box} eyebrow="Below ground" title="GL以下・BOXまわりの条件">
              蓋、BOX、深さ、水分、アンテナ位置、地表上の遮蔽を、端末近傍損失として分けて入力します。
            </SectionTitle>
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-900">
              <Target aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <span>
                ここがこのツールの肝です。まず<span className="font-bold">「深さ」と「蓋」</span>を現場写真に合わせ、続けて水分・アンテナ位置を選ぶと、結果パネルに主因が出ます。
              </span>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  id="ncu-depth"
                  label="GL下深さ"
                  help="GL下深さ（m）＝地表面（GL）からNCUアンテナまでの深さ。マイナスのアンテナ高としては入れず、地表へ抜けるまでの追加損失として扱います。0=地表設置、水道BOXは0.3〜1m程度が一般的です。"
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
                  help="実測補正値（dB）＝現地で測ったRSSI/RSRPと、この計算値との差。+なら計算より良い、−なら悪い現場として全体を補正します。1地点でも実測を入れると一気に精度が上がります。"
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
                options={withChipSeverity(ncuCoverMaterialOptions)}
                onChange={(value) => update("coverMaterial", value)}
              />
              <ChoiceChips
                label="BOX・ピット材質"
                help="NCUが入っているBOXやピットの主な材質です。"
                value={input.boxMaterial}
                options={withChipSeverity(ncuBoxMaterialOptions)}
                onChange={(value) => update("boxMaterial", value)}
              />
              <ChoiceChips
                label="水分・湿潤状態"
                help="雨天後、結露、水溜まりなどの状態を選びます。"
                value={input.moistureCondition}
                options={withChipSeverity(ncuMoistureOptions)}
                onChange={(value) => update("moistureCondition", value)}
              />
              <ChoiceChips
                label="アンテナ位置"
                help="BOX内でアンテナがどこにあるかを選びます。蓋直下が比較的有利です。"
                value={input.antennaPosition}
                options={withChipSeverity(ncuAntennaPositionOptions)}
                onChange={(value) => update("antennaPosition", value)}
              />
              <ChoiceChips
                label="開口・隙間"
                help="地表側へ電波が抜ける経路の有無です。"
                value={input.openingCondition}
                options={withChipSeverity(ncuOpeningOptions)}
                onChange={(value) => update("openingCondition", value)}
              />
              <ChoiceChips
                label="地表上の遮蔽"
                help="BOXの上に人や車両が来る可能性を見ます。"
                value={input.surfaceObstruction}
                options={withChipSeverity(ncuSurfaceObstructionOptions)}
                onChange={(value) => update("surfaceObstruction", value)}
              />
            </div>
          </Card>
        </div>

        <ResultPanel input={input} result={result} />
      </div>

      <NcuBudgetWaterfall input={input} result={result} />

      <NcuCrossSectionDiagram input={input} result={result} />

      <NcuIsometricScene input={input} result={result} />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <LossBreakdown result={result} />
        <Card as="section">
          <SectionTitle icon={Gauge} eyebrow="Range result" title="レンジで見る通信余裕">
            GL以下の条件は一点値で断言しにくいため、楽観・標準・厳しめを並べて確認します。
          </SectionTitle>
          <div className="grid gap-3">
            <RangeTriplet title="受信電力レンジ" range={result.receivedPowerRangeDbm} unit="dBm" />
            <RangeTriplet title="リンクマージンレンジ" range={result.linkMarginRangeDb} unit="dB" />
            <RangeTriplet title="総損失レンジ" range={result.totalLossRangeDb} unit="dB" higherIsBetter={false} />
          </div>
        </Card>
      </div>

      <Card as="section">
        <div className="flex items-center gap-2">
          <Info aria-hidden="true" className="h-5 w-5 text-staf-dark" />
          <h2 className="text-base font-bold text-slate-950">入力の前提をどう説明するか</h2>
        </div>
        <div className="mt-3 grid gap-3 text-sm leading-relaxed text-slate-600 md:grid-cols-3">
          <details className="rounded-lg border border-slate-200 bg-slate-50 p-4" open>
            <summary className="cursor-pointer font-bold text-slate-950">高さ入力の考え方</summary>
            <p className="mt-2">
              GL以下の深さは、Hataの移動局高や2波モデルのアンテナ高に負値として入れません。地表までの抜け道、蓋、BOX、湿潤、配置による追加損失として扱います。
            </p>
          </details>
          <details className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <summary className="cursor-pointer font-bold text-slate-950">実測補正の入れ方</summary>
            <p className="mt-2">
              現地RSSI/RSRPから、計算受信電力との差を入力します。同じ場所で乾燥時・雨天後・車両ありを比べると、損失レンジを狭められます。
            </p>
          </details>
          <details className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <summary className="cursor-pointer font-bold text-slate-950">改善の優先順位</summary>
            <p className="mt-2">
              金属蓋、底面設置、水溜まり、密閉、駐車車両の順に疑います。蓋直下・非金属部・開口部へアンテナを寄せる改善が効くことがあります。
            </p>
          </details>
        </div>
      </Card>

      <ResearchColumn />

      <Card as="section" variant="slate" padding="lg" shadow={false}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-950">通常のリンクバジェットへつなぐ</h2>
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
      </Card>

      <Card as="section">
        <div className="flex items-center gap-2">
          <Ruler aria-hidden="true" className="h-5 w-5 text-staf-dark" />
          <h2 className="text-base font-bold text-slate-950">現地で最低限メモしたい項目</h2>
        </div>
        <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-slate-600 md:grid-cols-2">
          <li>BOX写真：蓋、枠、アンテナ位置、周囲の車両・建物が分かるもの</li>
          <li>GL下深さ：地表面からNCUアンテナ位置まで</li>
          <li>蓋材質：樹脂、コンクリート、鋳鉄、鋼板、不明</li>
          <li>水分状態：乾燥、湿り気、雨天後、水溜まり</li>
          <li>RSSI/RSRP：乾燥時と雨天後、蓋あり/なしで比較</li>
          <li>通信方向：下り評価か上り評価か、送信電力と受信感度を確認</li>
        </ul>
      </Card>
    </div>
  );
}

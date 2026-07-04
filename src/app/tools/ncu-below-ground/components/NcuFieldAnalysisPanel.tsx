"use client";

import { useEffect, useRef, useState } from "react";
import { Callout } from "@/components/Callout";
import { Card } from "@/components/Card";
import { HelpHint as FieldHint } from "@/components/HelpHint";
import { NumberField } from "@/components/NumberField";
import {
  AlertTriangle,
  ArrowRight,
  Box,
  Car,
  CheckCircle2,
  ClipboardList,
  CloudRain,
  Compass,
  Gauge,
  type LucideIcon,
  MapPin,
  MoveHorizontal,
  Search,
  Target,
  Wrench,
  Waves
} from "lucide-react";
import {
  type NcuFieldAnalysisResult,
  type NcuFieldFindingSeverity,
  type NcuFieldMeasurementsInput,
  type NcuRadioMetricDiagnosisItem,
  type NcuRadioMetricSeverity,
  type NcuRadioMetricsDiagnosisResult,
  type NcuRadioMetricsInput
} from "@/lib/rf/ncuBelowGround";
import { formatSigned, purposeCards, SectionTitle, type WorkMode } from "./ncuShared";

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
      <span className="mt-2 flex overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-staf/70 focus-within:ring-2 focus-within:ring-staf/40">
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

export function WorkflowGuide({ mode }: { mode: WorkMode }) {
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
    <Card as="section">
      <div className="flex items-center gap-2">
        <Compass aria-hidden="true" className="h-5 w-5 text-staf-dark" />
        <h2 className="text-lg font-bold text-slate-950">迷わない入力順</h2>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card key={step.title} variant="slate" padding="sm" shadow={false}>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-staf text-xs font-bold text-white">
                  {index + 1}
                </span>
                <Icon aria-hidden="true" className="h-4 w-4 text-staf-dark" />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-950">{step.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{step.text}</p>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}

export function PurposeSwitch({
  activeMode,
  onChange
}: {
  activeMode: WorkMode;
  onChange: (mode: WorkMode) => void;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-2 shadow-card">
      <div className="grid gap-2 md:grid-cols-2" role="group" aria-label="GL以下NCU診断の目的">
        {purposeCards.map((card) => {
          const selected = activeMode === card.id;
          return (
            <button
              key={card.id}
              type="button"
              aria-pressed={selected}
              title={card.description}
              className={`rounded-md p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-staf/40 ${
                selected ? "bg-staf text-white shadow-card" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
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
    <Card as="section">
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

          <Card variant="slate" padding="md" shadow={false}>
            <p className="text-sm font-bold text-slate-950">推奨する次アクション</p>
            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-slate-600">
              {diagnosis.recommendedActions.map((action) => (
                <li key={action}>・{action}</li>
              ))}
            </ul>
          </Card>

          <Callout tone="info" size="md" title="簡易診断の前提">
            <ul className="mt-2 space-y-2 text-xs leading-relaxed">
              {diagnosis.caveats.map((caveat) => (
                <li key={caveat}>・{caveat}</li>
              ))}
            </ul>
          </Callout>
        </aside>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {diagnosis.items.map((item) => (
          <MetricDiagnosisCard key={item.id} item={item} />
        ))}
      </div>
    </Card>
  );
}

export function FieldAnalysisPanel({
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
      <Card as="section">
        <SectionTitle icon={Search} eyebrow="Field analysis" title="現場RSSI/RSRPから原因を追い込む">
          すべてを完璧に測らなくても大丈夫です。まずはBOX外、蓋開け、蓋閉めの3点だけで、地上側・BOX内・蓋のどこが怪しいか見えます。
        </SectionTitle>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {measurementItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.key} variant="slate" padding="sm" shadow={false}>
                  <div className="mb-2 flex items-start gap-2">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-staf-dark">
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
                </Card>
              );
            })}
          </div>

          <aside className="space-y-3">
            <div className="rounded-lg border border-staf/20 bg-staf/5 p-4">
              <p className="text-sm font-bold text-staf-dark">計算値との照合</p>
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

            <Callout tone="info" size="md" icon={<Waves aria-hidden="true" className="h-5 w-5 text-sky-700" />}>
              <p className="font-bold">反射・2波を見る目安</p>
              <p className="mt-2 text-sm leading-relaxed">
                {frequencyMHz.toFixed(0)}MHzの波長は約{(wavelengthM * 100).toFixed(1)}cmです。30cm程度の移動や向き変更で
                {localFadingFinding ? ` ${localFadingFinding.impactDb.toFixed(1)}dB ` : " 数dB "}
                変わるなら、地面反射・BOX内反射・偏波の影響を強く疑います。
              </p>
            </Callout>

            <Callout tone="caution" size="md">
              <p className="font-bold">測定品質チェック</p>
              <ul className="mt-2 space-y-2 text-sm leading-relaxed">
                {analysis.measurementQualityNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </Callout>
          </aside>
        </div>
      </Card>

      <RadioMetricsDiagnosisPanel
        metrics={radioMetrics}
        diagnosis={metricsDiagnosis}
        onMetricChange={onRadioMetricChange}
      />

      <Card as="section">
        <SectionTitle icon={Target} eyebrow="Root cause ranking" title="原因候補ランキング">
          値が大きい順に見れば、現場で何から潰すべきかが分かります。差分が小さい項目は、主因ではない可能性が高いです。
        </SectionTitle>
        <div className="grid gap-3 lg:grid-cols-2">
          {analysis.findings.map((finding, index) => (
            <FindingCard key={finding.id} finding={finding} rank={index + 1} />
          ))}
        </div>
      </Card>

      <Card as="section">
        <div className="flex items-center gap-2">
          <ClipboardList aria-hidden="true" className="h-5 w-5 text-staf-dark" />
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
      </Card>
    </section>
  );
}

